/**
 * Integration tests require a running MongoDB instance.
 * Default: mongodb://127.0.0.1:27017/task_management_jest
 * Override: set MONGODB_TEST_URI (e.g. MongoDB Atlas or Docker).
 */

const mongoose = require('mongoose');
const request = require('supertest');
const path = require('path');
const fs = require('fs/promises');

const { connectDatabase } = require('../src/config/db');
const User = require('../src/models/User');

let app;
let mongoConnected = false;

function requireMongo() {
  if (!mongoConnected) {
    throw new Error(
      'Integration tests require MongoDB. Start mongod locally, or set MONGODB_TEST_URI to a reachable URI. See backend/README.md.'
    );
  }
}

beforeAll(async () => {
  const uri = process.env.MONGODB_TEST_URI || 'mongodb://127.0.0.1:27017/task_management_jest';
  process.env.MONGODB_URI = uri;
  try {
    await connectDatabase(uri);
    mongoConnected = true;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[tests] MongoDB unavailable — integration tests will fail until a database is reachable.', err.message);
    mongoConnected = false;
    return;
  }
  app = require('../src/app');
});

afterAll(async () => {
  if (!mongoConnected) return;
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  }
});

afterEach(async () => {
  if (!mongoConnected) return;
  const collections = mongoose.connection.collections;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
});

async function registerAndLogin(email = 'u@test.com', password = 'secret12') {
  const agent = request(app);
  await agent.post('/api/auth/register').send({ email, password }).expect(201);
  const login = await agent.post('/api/auth/login').send({ email, password }).expect(200);
  return { token: login.body.token, user: login.body.user, agent };
}

describe('Auth', () => {
  it('registers and returns token', async () => {
    requireMongo();
    const res = await request(app).post('/api/auth/register').send({ email: 'a@b.com', password: 'secret12' });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('a@b.com');
    expect(res.body.user.role).toBe('user');
  });

  it('rejects weak password', async () => {
    requireMongo();
    const res = await request(app).post('/api/auth/register').send({ email: 'x@y.com', password: '123' });
    expect(res.status).toBe(400);
  });

  it('logs in', async () => {
    requireMongo();
    await request(app).post('/api/auth/register').send({ email: 'login@test.com', password: 'secret12' });
    const res = await request(app).post('/api/auth/login').send({ email: 'login@test.com', password: 'secret12' });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });
});

describe('Users (admin)', () => {
  it('returns 403 for non-admin', async () => {
    requireMongo();
    const { token, agent } = await registerAndLogin();
    const res = await agent.get('/api/users').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  it('returns users for admin', async () => {
    requireMongo();
    await registerAndLogin('plain@test.com', 'secret12');
    const admin = await User.findOne({ email: 'plain@test.com' });
    admin.role = 'admin';
    await admin.save();

    const login = await request(app).post('/api/auth/login').send({ email: 'plain@test.com', password: 'secret12' });
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${login.body.token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });
});

describe('Tasks', () => {
  it('creates and lists tasks', async () => {
    requireMongo();
    const { token, agent } = await registerAndLogin();

    const created = await agent
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'First task',
        description: 'Desc',
        status: 'todo',
        priority: 'high',
      })
      .expect(201);

    expect(created.body.title).toBe('First task');

    const list = await agent
      .get('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .query({ status: 'todo', sort: 'createdAt', order: 'desc', page: 1, limit: 10 })
      .expect(200);

    expect(list.body.total).toBe(1);
    expect(list.body.data).toHaveLength(1);
  });

  it('rejects task routes without token', async () => {
    requireMongo();
    const res = await request(app).get('/api/tasks');
    expect(res.status).toBe(401);
  });

  it('rejects more than 3 PDFs on create', async () => {
    requireMongo();
    const { token, agent } = await registerAndLogin();
    const tmp = path.join(__dirname, 'fixtures');
    await fs.mkdir(tmp, { recursive: true });
    const p1 = path.join(tmp, 'a.pdf');
    const p2 = path.join(tmp, 'b.pdf');
    const p3 = path.join(tmp, 'c.pdf');
    const p4 = path.join(tmp, 'd.pdf');
    await fs.writeFile(p1, '%PDF-1.4 fake');
    await fs.writeFile(p2, '%PDF-1.4 fake');
    await fs.writeFile(p3, '%PDF-1.4 fake');
    await fs.writeFile(p4, '%PDF-1.4 fake');

    const res = await agent
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .field('title', 'With files')
      .attach('attachments', p1)
      .attach('attachments', p2)
      .attach('attachments', p3)
      .attach('attachments', p4);

    expect(res.status).toBe(400);
  });
});
