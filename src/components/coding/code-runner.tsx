"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { LANGUAGES, type LangKey } from "@/modules/coding/languages";
import { runCodeAction } from "@/modules/coding/actions";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-[#0E1014] text-[12px] text-ink-300">
      Loading editor…
    </div>
  ),
});

type RunResult = Extract<
  Awaited<ReturnType<typeof runCodeAction>>,
  { ok: true }
>["result"];

const MONACO_LANG: Record<LangKey, string> = {
  python: "python",
  javascript: "javascript",
  cpp: "cpp",
  c: "c",
  java: "java",
};

const SNIPPET: Partial<Record<LangKey, string>> = {
  python: "# read from input(), print the answer\n",
  javascript:
    "const data = require('fs').readFileSync(0,'utf8').trim().split(/\\s+/);\n// your code here\n",
  cpp: "#include <bits/stdc++.h>\nusing namespace std;\nint main(){\n  // your code here\n}\n",
  c: "#include <stdio.h>\nint main(){\n  // your code here\n  return 0;\n}\n",
  java: "import java.util.*;\npublic class Main {\n  public static void main(String[] a){\n    // your code here\n  }\n}\n",
};

export function CodeRunner({
  questionId,
  languages,
  starterCode,
}: Readonly<{
  questionId: string;
  languages: string[];
  starterCode?: Record<string, string> | null;
}>) {
  const langs = languages.filter((l) => l in LANGUAGES) as LangKey[];
  const first = langs[0] ?? "python";
  const [language, setLanguage] = useState<LangKey>(first);
  const [source, setSource] = useState(
    starterCode?.[first] ?? SNIPPET[first] ?? ""
  );
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<RunResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"console" | "tests">("tests");

  function changeLang(k: LangKey) {
    setLanguage(k);
    setSource(starterCode?.[k] ?? SNIPPET[k] ?? "");
  }

  async function run() {
    setError(null);
    setRunning(true);
    setResult(null);
    setActiveTab("tests");
    const res = await runCodeAction({ questionId, language, source });
    setRunning(false);
    if (res.ok) setResult(res.result);
    else setError(res.error);
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[16px] border border-ink-200 bg-[#0E1014]">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 border-b border-[#262B35] bg-[#161A21] px-4 py-2.5">
        <div className="flex items-center gap-2">
          <select
            value={language}
            onChange={(e) => changeLang(e.target.value as LangKey)}
            className="h-8 rounded-[8px] border border-[#262B35] bg-[#0E1014] px-2.5 text-[12px] font-medium text-[#E8EAED] outline-none focus:border-primary-500"
          >
            {langs.map((k) => (
              <option key={k} value={k}>
                {LANGUAGES[k].label}
              </option>
            ))}
          </select>
          <span
            className="text-[10px] uppercase text-ink-500"
            style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.12em" }}
          >
            Auto-saved locally
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={run}
            disabled={running}
            className="inline-flex h-8 items-center gap-1.5 rounded-[8px] border border-[#262B35] bg-[#0E1014] px-3 text-[12px] font-semibold text-[#E8EAED] transition-colors hover:border-coral-300 hover:text-coral-300 disabled:opacity-60"
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "14px" }}
            >
              play_arrow
            </span>
            {running ? "Running…" : "Run"}
          </button>
          <button
            type="button"
            onClick={run}
            disabled={running}
            className="inline-flex h-8 items-center gap-1.5 rounded-[8px] bg-primary-700 px-3 text-[12px] font-semibold text-white transition-colors hover:bg-primary-500 disabled:opacity-60"
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "14px" }}
            >
              cloud_upload
            </span>
            Submit
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="min-h-0 flex-1">
        <MonacoEditor
          value={source}
          language={MONACO_LANG[language]}
          theme="vs-dark"
          onChange={(v) => setSource(v ?? "")}
          options={{
            fontFamily:
              "'Geist Mono', 'JetBrains Mono', Consolas, monospace",
            fontSize: 13,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: "on",
            padding: { top: 12, bottom: 12 },
          }}
        />
      </div>

      {/* Console / Results panel */}
      <div className="max-h-[40%] min-h-[180px] overflow-hidden border-t border-[#262B35] bg-[#161A21]">
        <div className="flex items-center gap-1 border-b border-[#262B35] px-2 py-1.5">
          <TabBtn
            active={activeTab === "tests"}
            onClick={() => setActiveTab("tests")}
            label="Test cases"
            icon="check_circle"
          />
          <TabBtn
            active={activeTab === "console"}
            onClick={() => setActiveTab("console")}
            label="Console"
            icon="terminal"
          />
          {result && (
            <span
              className={`ml-auto inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                result.status === "accepted"
                  ? "bg-primary-700/20 text-primary-200"
                  : "bg-coral-700/20 text-coral-300"
              }`}
              style={{ fontFamily: "var(--font-mono)" }}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "12px" }}
              >
                {result.status === "accepted" ? "check_circle" : "cancel"}
              </span>
              {result.passed}/{result.total} passed
            </span>
          )}
        </div>

        <div className="max-h-[280px] overflow-y-auto p-3 text-[12px]">
          {error && (
            <div className="rounded-[8px] border border-coral-700/40 bg-coral-700/10 px-3 py-2 text-coral-300">
              {error}
            </div>
          )}

          {activeTab === "tests" && !result && !running && (
            <p className="text-ink-500">
              Click <b>Run</b> to test your code against sample cases.
            </p>
          )}

          {running && (
            <p className="text-ink-300">Executing in sandbox…</p>
          )}

          {activeTab === "tests" && result && (
            <div className="flex flex-col gap-2">
              {result.samples.map((s, i) => (
                <div
                  key={i}
                  className={`rounded-[10px] border p-3 ${
                    s.ok
                      ? "border-primary-700/40 bg-primary-700/10"
                      : "border-coral-700/40 bg-coral-700/10"
                  }`}
                >
                  <div className="mb-2 flex items-center gap-2 text-[12px] font-semibold text-[#E8EAED]">
                    <span
                      className="material-symbols-outlined"
                      style={{
                        fontSize: "14px",
                        color: s.ok ? "#90d5b5" : "#F6A488",
                      }}
                    >
                      {s.ok ? "check_circle" : "cancel"}
                    </span>
                    Case {i + 1}
                  </div>
                  <div className="grid gap-2 sm:grid-cols-3">
                    <Cell label="Input" value={s.stdin || "(empty)"} />
                    <Cell label="Expected" value={s.expected} />
                    <Cell label="Output" value={s.got || "(no output)"} bad={!s.ok} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "console" && (
            <pre
              className="whitespace-pre-wrap text-[12px] text-ink-200"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {result?.compileError ||
                (result
                  ? `${result.status.toUpperCase()} — ${result.passed}/${result.total} passed`
                  : "Console is empty. Run your code first.")}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  label,
  icon,
}: Readonly<{ active: boolean; onClick: () => void; label: string; icon: string }>) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-7 items-center gap-1.5 rounded-[6px] px-2.5 text-[12px] font-medium transition-colors ${
        active
          ? "bg-[#0E1014] text-[#E8EAED]"
          : "text-ink-500 hover:text-ink-200"
      }`}
    >
      <span
        className="material-symbols-outlined"
        style={{ fontSize: "14px" }}
      >
        {icon}
      </span>
      {label}
    </button>
  );
}

function Cell({
  label,
  value,
  bad,
}: Readonly<{ label: string; value: string; bad?: boolean }>) {
  return (
    <div className="rounded-[8px] bg-[#0E1014] p-2">
      <div
        className="mb-1 text-[10px] uppercase text-ink-500"
        style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.1em" }}
      >
        {label}
      </div>
      <pre
        className={`whitespace-pre-wrap break-all text-[11px] ${bad ? "text-coral-300" : "text-[#E8EAED]"}`}
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {value}
      </pre>
    </div>
  );
}
