import { json, error } from "@sveltejs/kit";
import { r as readData, w as writeData } from "../../../../chunks/dataStore.js";
const REQUIRED_FIELDS = [
  "mood",
  "energy",
  "stress",
  "productivity",
  "sleep",
  "social",
  "health",
  "motivation",
  "focus",
  "overall"
];
async function GET() {
  const data = await readData();
  return json(data.responses ?? []);
}
async function POST({ request }) {
  const body = await request.json();
  const missing = REQUIRED_FIELDS.filter((field) => !body[field]);
  if (missing.length > 0) {
    throw error(400, `${missing[0]} is required`);
  }
  const data = await readData();
  const response = {
    id: Date.now().toString(),
    userId: body.userId ?? null,
    mood: body.mood,
    energy: body.energy,
    stress: body.stress,
    productivity: body.productivity,
    sleep: body.sleep,
    social: body.social,
    health: body.health,
    motivation: body.motivation,
    focus: body.focus,
    overall: body.overall,
    note: body.note ?? null,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  };
  data.responses = data.responses ?? [];
  data.responses.push(response);
  await writeData(data);
  return json({ success: true, response }, { status: 201 });
}
export {
  GET,
  POST
};
