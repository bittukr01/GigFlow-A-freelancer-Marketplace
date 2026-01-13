# GigFlow

GigFlow is a professional freelance marketplace (MERN stack) scaffold with a polished UI built with React + Vite + Tailwind on the frontend and Express + MongoDB + Socket.io on the backend.

Quick start

1. Install dependencies (requires Node.js and Yarn):

```bash
cd c:/Users/BITTU/Desktop/Gigfreelancer
yarn install
```

2. Create env file for server: copy `server/.env.example` to `server/.env` and update values.

3. Start server and client:

```bash
yarn workspace server dev
# in another terminal
yarn workspace client dev
```

Notes

- Backend runs on port 4000 by default; client on 5173.
- Auth uses HttpOnly JWT cookie; ensure `CLIENT_URL` matches your dev server.
- Socket.io is used for real-time 'hired' notifications.