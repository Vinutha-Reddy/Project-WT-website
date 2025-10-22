import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "data.json");
async function ensureDataFile() {
  try {
    await mkdir(DATA_DIR, { recursive: true });
    await readFile(DATA_FILE, "utf-8");
  } catch (error) {
    if (error.code === "ENOENT") {
      const payload = { responses: [] };
      await writeFile(DATA_FILE, JSON.stringify(payload, null, 2), "utf-8");
    } else {
      throw error;
    }
  }
}
async function readData() {
  await ensureDataFile();
  try {
    const raw = await readFile(DATA_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (error) {
    if (error.code === "ENOENT") {
      return { responses: [] };
    }
    throw error;
  }
}
async function writeData(payload) {
  await ensureDataFile();
  const json = JSON.stringify(payload, null, 2);
  await writeFile(DATA_FILE, json, "utf-8");
}
export {
  readData as r,
  writeData as w
};
