import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";

// Local disk storage for dev. Swap for Cloudflare R2 in Phase 7.
const STORAGE_DIR = path.join(process.cwd(), "storage");

export async function saveFile(
  file: File
): Promise<{ key: string; size: number; mime: string }> {
  await fs.mkdir(STORAGE_DIR, { recursive: true });
  const ext = path.extname(file.name) || "";
  const key = `${randomUUID()}${ext}`;
  const buf = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(STORAGE_DIR, key), buf);
  return {
    key,
    size: buf.length,
    mime: file.type || "application/octet-stream",
  };
}

export async function readFile(key: string): Promise<Buffer> {
  const safe = path.basename(key); // guard against path traversal
  return fs.readFile(path.join(STORAGE_DIR, safe));
}

export async function deleteFile(key: string): Promise<void> {
  const safe = path.basename(key);
  await fs.rm(path.join(STORAGE_DIR, safe), { force: true });
}
