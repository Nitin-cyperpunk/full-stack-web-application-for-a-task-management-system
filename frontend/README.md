# Task Manager (React)

Vite + React client for the [task management API](../backend/README.md).

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Environment:

   ```bash
   cp .env.example .env
   ```

   Set **`VITE_SERVER_URL`** to your backend origin **without a trailing slash**, e.g. `http://localhost:5000`.

   - REST API calls go to `${VITE_SERVER_URL}/api`.
   - PDF attachments are loaded from `${VITE_SERVER_URL}/uploads/...`.

## Run

Start the backend first (see backend README), then:

```bash
npm run dev
```

Open the URL shown in the terminal (usually `http://localhost:5173`).

## Build

```bash
npm run build
npm run preview
```

## Assignee dropdown

`GET /api/users` is **admin-only** on the backend. Admins get a full assignee dropdown on create/edit. Other users see the current assignee’s email as read-only when editing a task.

## CORS

The backend uses permissive CORS in development. For production, configure allowed origins on the Express app to match your deployed frontend URL.
