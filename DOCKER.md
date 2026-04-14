# Docker setup

This stack runs **MongoDB**, the **Express API** (port **5000**), and the **Vite-built React app** served by nginx (port **3000**).

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose v2 (`docker compose`)

## Quick start

1. From the **repository root** (`full stack assesmnt/`), create a `.env` file for Compose variable substitution:

   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and set a strong **`JWT_SECRET`** (used by the backend to sign JWTs). Docker Compose reads this file automatically.

3. Build and start all services:

   ```bash
   docker compose up --build
   ```

   Or in the background:

   ```bash
   docker compose up --build -d
   ```

4. Open the app:

   - **Frontend:** [http://localhost:3000](http://localhost:3000)
   - **API:** [http://localhost:5000/api](http://localhost:5000/api)
   - **Swagger:** [http://localhost:5000/api-docs](http://localhost:5000/api-docs)
   - **Health:** [http://localhost:5000/health](http://localhost:5000/health)

## How it works

| Service    | Image / build | Ports | Notes |
|------------|---------------|-------|--------|
| `mongo`    | `mongo:7`     | (internal only) | Data in Docker volume `mongo_data` |
| `backend`  | `./backend`   | **5000** → 5000 | `MONGODB_URI=mongodb://mongo:27017/taskapp`; uploads in volume `backend_uploads` |
| `frontend` | `./frontend`  | **3000** → 3000 | Static build; API URL baked as `VITE_SERVER_URL=http://localhost:5000` |

- **MongoDB readiness:** The backend `depends_on` MongoDB with a **healthcheck** (`mongosh` ping). The API container starts only after MongoDB is healthy.
- **JWT / env:** `JWT_SECRET` is passed into the backend container from your **`.env`** file (same folder as `docker-compose.yml`).
- **Browser API URL:** The frontend is built with `VITE_SERVER_URL=http://localhost:5000` so the browser talks to the API on your host. If you deploy behind other hostnames or TLS, rebuild the frontend with the appropriate `VITE_SERVER_URL` build arg.

## Useful commands

```bash
# Stop containers
docker compose down

# Stop and remove volumes (wipes MongoDB data and named upload volume)
docker compose down -v

# View logs
docker compose logs -f backend
```

## Files added

- [`backend/Dockerfile`](backend/Dockerfile) — Node 22 Alpine, production deps
- [`backend/.dockerignore`](backend/.dockerignore)
- [`frontend/Dockerfile`](frontend/Dockerfile) — multi-stage build + nginx on port 3000
- [`frontend/nginx.conf`](frontend/nginx.conf)
- [`frontend/.dockerignore`](frontend/.dockerignore)
- [`docker-compose.yml`](docker-compose.yml) — services, volumes, healthcheck, depends_on
