require('./config/env');
const path = require('path');
const { port, uploadDir, nodeEnv, jwtSecret } = require('./config/env');

if (nodeEnv !== 'test') {
  try {
    jwtSecret();
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e.message);
    // eslint-disable-next-line no-console
    console.error('Create a .env file from .env.example and set JWT_SECRET.');
    process.exit(1);
  }
}
const { connectDatabase } = require('./config/db');
const { ensureDir } = require('./utils/fileUtils');

async function start() {
  await ensureDir(uploadDir);
  await ensureDir(path.join(uploadDir, 'tmp'));
  await ensureDir(path.join(uploadDir, 'tasks'));

  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/taskapp';
  await connectDatabase(mongoUri);

  const app = require('./app');

  const server = app.listen(port, () => {
    if (nodeEnv !== 'test') {
      // eslint-disable-next-line no-console
      console.log(`Server listening on port ${port}`);
      // eslint-disable-next-line no-console
      console.log(`API: http://localhost:${port}/api`);
      // eslint-disable-next-line no-console
      console.log(`Swagger: http://localhost:${port}/api-docs`);
    }
  });

  return server;
}

if (require.main === module) {
  start().catch((err) => {
    // eslint-disable-next-line no-console
    console.error('Failed to start server', err);
    process.exit(1);
  });
}

module.exports = { start };
