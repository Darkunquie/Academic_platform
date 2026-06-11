import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { UpstreamError } from "./errors";

/**
 * Storage adapter. Backs onto Cloudflare R2 in production (S3-compatible) and
 * falls back to local disk for development when R2 env vars are absent.
 *
 * Callers see one shape: { key, size, mime } for saveFile, Buffer for readFile.
 * Swap of provider (R2 → S3 → GCS) is mechanical from here.
 */

type R2Config = {
  endpoint: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
};

const STORAGE_DIR = path.join(process.cwd(), "storage");

let cachedClient: S3Client | null = null;

function r2Config(): R2Config | null {
  const endpoint = process.env.R2_ENDPOINT;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET;
  if (!endpoint || !accessKeyId || !secretAccessKey || !bucket) return null;
  return { endpoint, accessKeyId, secretAccessKey, bucket };
}

function r2Client(cfg: R2Config): S3Client {
  if (cachedClient) return cachedClient;
  cachedClient = new S3Client({
    region: "auto",
    endpoint: cfg.endpoint,
    credentials: {
      accessKeyId: cfg.accessKeyId,
      secretAccessKey: cfg.secretAccessKey,
    },
  });
  return cachedClient;
}

async function streamToBuffer(
  body: AsyncIterable<Uint8Array> | ReadableStream<Uint8Array>
): Promise<Buffer> {
  const chunks: Uint8Array[] = [];
  if (Symbol.asyncIterator in body) {
    for await (const chunk of body as AsyncIterable<Uint8Array>) {
      chunks.push(chunk);
    }
  } else {
    const reader = (body as ReadableStream<Uint8Array>).getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) chunks.push(value);
    }
  }
  return Buffer.concat(chunks);
}

export async function saveFile(
  file: File
): Promise<{ key: string; size: number; mime: string }> {
  const ext = path.extname(file.name) || "";
  const key = `${randomUUID()}${ext}`;
  const buf = Buffer.from(await file.arrayBuffer());
  const mime = file.type || "application/octet-stream";

  const cfg = r2Config();
  if (cfg) {
    try {
      await r2Client(cfg).send(
        new PutObjectCommand({
          Bucket: cfg.bucket,
          Key: key,
          Body: buf,
          ContentType: mime,
        })
      );
      return { key, size: buf.length, mime };
    } catch (e) {
      throw new UpstreamError(
        "r2",
        0,
        "File upload failed. Please retry.",
        (e as Error).message.slice(0, 1000)
      );
    }
  }

  await fs.mkdir(STORAGE_DIR, { recursive: true });
  await fs.writeFile(path.join(STORAGE_DIR, key), buf);
  return { key, size: buf.length, mime };
}

export async function readFile(key: string): Promise<Buffer> {
  const safe = path.basename(key);
  const cfg = r2Config();
  if (cfg) {
    try {
      const res = await r2Client(cfg).send(
        new GetObjectCommand({ Bucket: cfg.bucket, Key: safe })
      );
      if (!res.Body) throw new Error("R2 returned empty body");
      return streamToBuffer(
        res.Body as AsyncIterable<Uint8Array> | ReadableStream<Uint8Array>
      );
    } catch (e) {
      throw new UpstreamError(
        "r2",
        0,
        "Asset unavailable. Please retry.",
        (e as Error).message.slice(0, 1000)
      );
    }
  }
  return fs.readFile(path.join(STORAGE_DIR, safe));
}

export async function deleteFile(key: string): Promise<void> {
  const safe = path.basename(key);
  const cfg = r2Config();
  if (cfg) {
    try {
      await r2Client(cfg).send(
        new DeleteObjectCommand({ Bucket: cfg.bucket, Key: safe })
      );
    } catch (e) {
      throw new UpstreamError(
        "r2",
        0,
        "File delete failed.",
        (e as Error).message.slice(0, 1000)
      );
    }
    return;
  }
  await fs.rm(path.join(STORAGE_DIR, safe), { force: true });
}

/** True if R2 is configured. Used by health checks and admin diagnostics. */
export function storageProvider(): "r2" | "local" {
  return r2Config() ? "r2" : "local";
}
