import { promises as fs } from "fs";
import path from "path";
import { initialVideos } from "./data";

const DIR = path.join(process.cwd(), "data");
const f   = (name: string) => path.join(DIR, `${name}.json`);

async function ensure() { await fs.mkdir(DIR, { recursive: true }); }

export async function readJSON<T>(name: string, fallback: T): Promise<T> {
  try { return JSON.parse(await fs.readFile(f(name), "utf-8")); }
  catch { return fallback; }
}

export async function writeJSON(name: string, data: unknown) {
  await ensure();
  await fs.writeFile(f(name), JSON.stringify(data, null, 2));
}

// Seed videos on first run
export async function getVideos() {
  const vids = await readJSON("videos", null as unknown);
  if (!vids) { await writeJSON("videos", initialVideos); return initialVideos; }
  return vids;
}
