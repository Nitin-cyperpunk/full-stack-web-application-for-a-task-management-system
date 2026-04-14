# Task management (full stack)

Monorepo with an **Express + MongoDB** API in [`backend/`](backend/) and a **React (Vite)** app in [`frontend/`](frontend/).

## Run with Docker (recommended for one-command setup)

See **[DOCKER.md](DOCKER.md)** for:

- `docker compose up --build`
- Ports **3000** (frontend) and **5000** (API)
- `.env` with `JWT_SECRET`
- MongoDB persistence and backend upload volume

## Run locally (without Docker)

- **Backend:** [`backend/README.md`](backend/README.md) — MongoDB on the host, `npm run dev`, port `5000`.
- **Frontend:** [`frontend/README.md`](frontend/README.md) — `npm run dev`, set `VITE_SERVER_URL` in `.env`.
