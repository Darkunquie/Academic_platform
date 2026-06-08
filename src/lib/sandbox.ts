// Engine-agnostic code sandbox. Supports Piston (PISTON_URL) — reliable on
// Docker Desktop — or Judge0 (JUDGE0_URL / RapidAPI). Piston wins if both set.
import { runOne as judge0Run } from "./judge0";
import { languageId } from "@/modules/coding/languages";

export type SandboxRun = {
  stdout: string;
  stderr: string;
  compileOutput: string | null;
};

const PISTON = process.env.PISTON_URL?.replace(/\/$/, "");

const EXT: Record<string, string> = {
  python: "py",
  javascript: "js",
  cpp: "cpp",
  c: "c",
  java: "java",
};

function pistonLang(key: string): string {
  return key === "cpp" ? "c++" : key;
}

let runtimeCache: Record<string, string> | null = null;
async function pistonVersion(language: string): Promise<string> {
  if (!runtimeCache) {
    const res = await fetch(`${PISTON}/api/v2/runtimes`);
    const list = (await res.json()) as {
      language: string;
      version: string;
      aliases?: string[];
    }[];
    runtimeCache = {};
    for (const r of list) {
      runtimeCache[r.language] = r.version;
      for (const a of r.aliases ?? []) runtimeCache[a] = r.version;
    }
  }
  return runtimeCache[language] ?? "*";
}

export async function runCode(args: {
  language: string;
  source: string;
  stdin?: string;
}): Promise<SandboxRun> {
  if (PISTON) {
    const lang = pistonLang(args.language);
    const version = await pistonVersion(lang);
    const res = await fetch(`${PISTON}/api/v2/execute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language: lang,
        version,
        files: [
          { name: `main.${EXT[args.language] ?? "txt"}`, content: args.source },
        ],
        stdin: args.stdin ?? "",
        run_timeout: 3000,
      }),
    });
    if (!res.ok) {
      throw new Error(`Piston ${res.status}: ${(await res.text()).slice(0, 200)}`);
    }
    const d = await res.json();
    return {
      stdout: d.run?.stdout ?? "",
      stderr: d.run?.stderr ?? "",
      compileOutput: d.compile?.stderr || null,
    };
  }

  if (process.env.JUDGE0_URL) {
    const id = languageId(args.language);
    if (!id) throw new Error("Unsupported language");
    const r = await judge0Run({
      languageId: id,
      source: args.source,
      stdin: args.stdin,
    });
    return {
      stdout: r.stdout ?? "",
      stderr: r.stderr ?? "",
      compileOutput: r.compile_output || null,
    };
  }

  throw new Error("No sandbox configured. Set PISTON_URL or JUDGE0_URL in .env");
}

export function sandboxConfigured(): boolean {
  return !!(PISTON || process.env.JUDGE0_URL);
}
