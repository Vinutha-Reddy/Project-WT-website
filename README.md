# WT Website

Unified SvelteKit application that captures daily mood signals, stores responses in a JSON data file, and surfaces similarity insights in a polished survey flow.

## Getting started

```powershell
npm install
npm run dev       # launches the full stack on http://localhost:5173
# npm run build   # optional production build
# npm run preview # serve the production build locally
```

The SvelteKit dev server handles both the UI and the API routes, so no extra backend process is required.

## API endpoints

- `GET /api/responses` – list all stored survey submissions
- `POST /api/responses` – persist a new response; expects all 10 category answers plus optional `note`
- `GET /api/summary` – compute similarity statistics for a set of answers supplied via query parameters

All API handlers read from and write to `data/data.json`.

## Key files

- `src/routes/+page.svelte` – survey experience, submission flow, and results view
- `src/routes/api/*` – SvelteKit server endpoints for storing responses and building summaries
- `src/lib/questionData.js` – question metadata shared by the UI and endpoints
- `src/app.css` – global theme styling loaded through the root layout
- `data/data.json` – persisted responses (JSON document)

Extend the project by swapping the data store for a database, enriching analytics, or layering on authentication.