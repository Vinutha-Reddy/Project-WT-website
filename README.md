# WT Website

Modern mood-tracking experience with a Node.js API and a Svelte-powered UI.

## Backend (Express + JSON storage)

```powershell
cd backend
npm install
npm start        # launches on http://localhost:5000
```

Data is persisted to `backend/data.json`.

## Frontend (Svelte + Vite)

```powershell
cd frontend
npm install      # installs Svelte & Vite toolchain
npm run dev      # http://localhost:5173, proxies API calls to port 5000
# npm run build  # optional production build in dist/
```

### Project layout

- `frontend/src/App.svelte` – full survey + results flow
- `frontend/src/questionData.js` – question/option definitions
- `frontend/styles.css` – shared light/dark theme styling
- `backend/index.js` – Express API with response storage & summary

From here you can extend the project with authentication, richer analytics, or a database backend.