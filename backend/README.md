# Task Management API

Production-oriented Express.js REST API with MongoDB (Mongoose), JWT authentication, role-based access, task CRUD with filtering/sorting/pagination, and PDF attachments (multer, max 3 per task).

## Prerequisites

- Node.js 18+
- MongoDB 6+ (local install, Docker, or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))

## Setup

1. Copy environment file and edit secrets:

   ```bash
   cp .env.example .env
   ```

   Set `MONGODB_URI` to your database connection string and `JWT_SECRET` to a long random string (required for signing tokens).

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start MongoDB if it runs locally (example with Docker):

   ```bash
   docker run -d -p 27017:27017 --name mongo mongo:7
   ```

## Run

**Development (with auto-restart):**

```bash
npm run dev
```

**Production:**

```bash
npm start
```

- API base URL: `http://localhost:<PORT>/api` (default port `5000`).
- Interactive docs: `http://localhost:<PORT>/api-docs`
- Health check: `GET http://localhost:<PORT>/health`
- Uploaded files are served at `http://localhost:<PORT>/uploads/...` (paths stored on each task).

## API overview

| Method | Path | Auth | Description |
|--------|------|------|---------------|
| POST | `/api/auth/register` | Public | Register (`role` is always `user`) |
| POST | `/api/auth/login` | Public | Login, returns JWT |
| GET | `/api/users` | JWT + admin | List users (assignee dropdown) |
| GET | `/api/tasks` | JWT | List with `status`, `priority`, `assignedTo`, `sort`, `order`, `page`, `limit` |
| GET | `/api/tasks/:id` | JWT | Get one task |
| POST | `/api/tasks` | JWT | Create (JSON or `multipart/form-data`, field `attachments` for PDFs) |
| PUT/PATCH | `/api/tasks/:id` | JWT | Partial update; new PDFs append if total attachments stay ≤ 3 |
| DELETE | `/api/tasks/:id` | JWT | Delete task and remove files from disk |

Send `Authorization: Bearer <token>` on protected routes.

## Tests

Integration tests need a **reachable MongoDB**. By default they use `mongodb://127.0.0.1:27017/task_management_jest` and drop that database when finished.

```bash
# Optional: use another URI (e.g. Atlas or a dedicated test DB)
set MONGODB_TEST_URI=mongodb://127.0.0.1:27017/task_management_jest
npm test
```

On Windows PowerShell:

```powershell
$env:MONGODB_TEST_URI="mongodb://127.0.0.1:27017/task_management_jest"; npm test
```

If MongoDB is not running, tests will fail with a clear error until a database is available.

## Admin users

Registration always creates users with role `user`. To grant admin (e.g. for `GET /api/users`), update the user in MongoDB:

```js
db.users.updateOne({ email: "you@example.com" }, { $set: { role: "admin" } })
```

## Project layout

- `src/config` — database, env, Swagger spec
- `src/controllers` — request handlers
- `src/middleware` — JWT auth, roles, validation, multer, errors
- `src/models` — Mongoose schemas
- `src/routes` — route definitions
- `src/utils` — helpers
- `tests/` — Jest + Supertest integration tests
