"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  getCheckExpressionsAction,
  submitWebAction,
} from "@/modules/web/actions";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-[#0E1014] text-[12px] text-ink-300">
      Loading editor…
    </div>
  ),
});

type Tab = "html" | "css" | "js";

type CheckRow = { id: string; label: string; weight: number };

type RunOutcome = {
  passed: number;
  total: number;
  score: number;
  status: "accepted" | "wrong" | "error";
  perCheck: { id: string; label: string; ok: boolean; error?: string }[];
};

export function WebRunner({
  questionId,
  htmlStarter,
  cssStarter,
  jsStarter,
  checks,
}: Readonly<{
  questionId: string;
  htmlStarter: string;
  cssStarter: string;
  jsStarter: string;
  checks: CheckRow[];
}>) {
  const [tab, setTab] = useState<Tab>("html");
  const [html, setHtml] = useState(htmlStarter);
  const [css, setCss] = useState(cssStarter);
  const [js, setJs] = useState(jsStarter);
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [outcome, setOutcome] = useState<RunOutcome | null>(null);
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [autoReload, setAutoReload] = useState(true);

  const srcDoc = useMemo(
    () => buildDoc(html, css, js),
    [html, css, js]
  );

  // Debounced preview update.
  const [previewSrc, setPreviewSrc] = useState(srcDoc);
  useEffect(() => {
    if (!autoReload) return;
    const id = setTimeout(() => setPreviewSrc(srcDoc), 500);
    return () => clearTimeout(id);
  }, [srcDoc, autoReload]);

  async function runChecks(): Promise<RunOutcome> {
    const fetched = await getCheckExpressionsAction(questionId);
    if (!fetched.ok) throw new Error(fetched.error);
    const expressions = fetched.checks;

    // Render the preview with a check harness appended.
    const harness = buildHarness(
      expressions.map((c) => ({ id: c.id, expression: c.expression }))
    );
    const docWithHarness = buildDoc(html, css, js, harness);

    return new Promise<RunOutcome>((resolve, reject) => {
      const channel = `web-check-${Math.random().toString(36).slice(2)}`;
      const handler = (e: MessageEvent) => {
        if (!e.data || e.data.channel !== channel) return;
        window.removeEventListener("message", handler);
        clearTimeout(timeout);
        const list = (e.data.results ?? []) as {
          id: string;
          ok: boolean;
          error?: string;
        }[];
        const perCheck = expressions.map((c) => {
          const r = list.find((x) => x.id === c.id);
          return {
            id: c.id,
            label: c.label,
            ok: !!r?.ok,
            error: r?.error,
          };
        });
        const passed = perCheck.filter((c) => c.ok).length;
        const total = perCheck.length;
        const totalWeight = expressions.reduce((s, c) => s + c.weight, 0);
        const wp = expressions.reduce(
          (s, c) => s + (perCheck.find((p) => p.id === c.id)?.ok ? c.weight : 0),
          0
        );
        const score = totalWeight ? Math.round((wp / totalWeight) * 100) : 0;
        const status: RunOutcome["status"] =
          total > 0 && passed === total ? "accepted" : "wrong";
        resolve({ passed, total, score, status, perCheck });
      };
      const timeout = setTimeout(() => {
        window.removeEventListener("message", handler);
        reject(new Error("Checks timed out"));
      }, 8000);
      window.addEventListener("message", handler);

      const sandbox = document.createElement("iframe");
      sandbox.sandbox.add("allow-scripts");
      sandbox.style.position = "fixed";
      sandbox.style.width = "0";
      sandbox.style.height = "0";
      sandbox.style.border = "0";
      sandbox.style.left = "-9999px";
      sandbox.srcdoc = docWithHarness.replace("__CHANNEL__", channel);
      document.body.appendChild(sandbox);
      // Cleanup after a delay.
      setTimeout(() => sandbox.remove(), 8500);
    });
  }

  async function onRun() {
    setError(null);
    setRunning(true);
    setOutcome(null);
    try {
      const o = await runChecks();
      setOutcome(o);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setRunning(false);
    }
  }

  async function onSubmit() {
    setError(null);
    setSubmitting(true);
    setOutcome(null);
    try {
      const o = await runChecks();
      setOutcome(o);
      const res = await submitWebAction({
        questionId,
        html,
        css,
        js,
        results: o.perCheck.map((c) => ({ checkId: c.id, ok: c.ok })),
      });
      if (!res.ok) setError(res.error);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  const editorValue = tab === "html" ? html : tab === "css" ? css : js;
  const setEditorValue = (v: string) => {
    if (tab === "html") setHtml(v);
    else if (tab === "css") setCss(v);
    else setJs(v);
  };
  const editorLang =
    tab === "html" ? "html" : tab === "css" ? "css" : "javascript";

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[16px] border border-ink-200 bg-[#0E1014]">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 border-b border-[#262B35] bg-[#161A21] px-4 py-2.5">
        <div className="flex items-center gap-1">
          <TabBtn label="HTML" icon="code" active={tab === "html"} onClick={() => setTab("html")} />
          <TabBtn label="CSS" icon="palette" active={tab === "css"} onClick={() => setTab("css")} />
          <TabBtn label="JS" icon="javascript" active={tab === "js"} onClick={() => setTab("js")} />
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1 text-[11px] text-ink-500">
            <input
              type="checkbox"
              checked={autoReload}
              onChange={(e) => setAutoReload(e.target.checked)}
            />
            Live preview
          </label>
          <button
            type="button"
            onClick={() => setPreviewSrc(srcDoc)}
            className="inline-flex h-8 items-center gap-1.5 rounded-[8px] border border-[#262B35] bg-[#0E1014] px-3 text-[12px] font-semibold text-[#E8EAED] transition-colors hover:border-coral-300 hover:text-coral-300"
          >
            <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>refresh</span>
            Reload
          </button>
          <button
            type="button"
            onClick={onRun}
            disabled={running || submitting}
            className="inline-flex h-8 items-center gap-1.5 rounded-[8px] border border-[#262B35] bg-[#0E1014] px-3 text-[12px] font-semibold text-[#E8EAED] transition-colors hover:border-coral-300 hover:text-coral-300 disabled:opacity-60"
          >
            <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>play_arrow</span>
            {running ? "Running…" : "Run checks"}
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={running || submitting}
            className="inline-flex h-8 items-center gap-1.5 rounded-[8px] bg-primary-700 px-3 text-[12px] font-semibold text-white transition-colors hover:bg-primary-500 disabled:opacity-60"
          >
            <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>cloud_upload</span>
            {submitting ? "Submitting…" : "Submit"}
          </button>
        </div>
      </div>

      {/* Editor + preview split */}
      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-2">
        <div className="min-h-0 border-r border-[#262B35]">
          <MonacoEditor
            value={editorValue}
            language={editorLang}
            theme="vs-dark"
            onChange={(v) => setEditorValue(v ?? "")}
            options={{
              fontFamily: "'Geist Mono', 'JetBrains Mono', Consolas, monospace",
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
        <div className="min-h-0 bg-white">
          <iframe
            ref={iframeRef}
            title="Preview"
            sandbox="allow-scripts"
            srcDoc={previewSrc}
            className="h-full w-full"
          />
        </div>
      </div>

      {/* Results panel */}
      <div className="max-h-[40%] min-h-[160px] overflow-hidden border-t border-[#262B35] bg-[#161A21]">
        <div className="flex items-center gap-2 border-b border-[#262B35] px-3 py-1.5">
          <span
            className="text-[10px] text-ink-500"
            style={{ fontFamily: "var(--font-mono)", }}
          >
            Checks ({checks.length})
          </span>
          {outcome && (
            <span
              className={`ml-auto inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                outcome.status === "accepted"
                  ? "bg-primary-700/20 text-primary-200"
                  : "bg-coral-700/20 text-coral-300"
              }`}
              style={{ fontFamily: "var(--font-mono)" }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "12px" }}>
                {outcome.status === "accepted" ? "check_circle" : "cancel"}
              </span>
              {outcome.passed}/{outcome.total} passed · {outcome.score}%
            </span>
          )}
        </div>
        <div className="max-h-[260px] overflow-y-auto p-3 text-[12px]">
          {error && (
            <div className="mb-2 rounded-[8px] border border-coral-700/40 bg-coral-700/10 px-3 py-2 text-coral-300">
              {error}
            </div>
          )}
          {!outcome && !running && (
            <ul className="flex flex-col gap-2">
              {checks.map((c) => (
                <li
                  key={c.id}
                  className="rounded-[8px] border border-[#262B35] bg-[#0E1014] px-3 py-2 text-ink-300"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "14px", marginRight: 6 }}>
                    radio_button_unchecked
                  </span>
                  {c.label}
                  <span className="ml-2 text-[10px] text-ink-500">weight {c.weight}</span>
                </li>
              ))}
              {checks.length === 0 && (
                <li className="text-ink-500">No checks defined yet.</li>
              )}
            </ul>
          )}
          {outcome && (
            <ul className="flex flex-col gap-2">
              {outcome.perCheck.map((c) => (
                <li
                  key={c.id}
                  className={`rounded-[8px] border px-3 py-2 ${
                    c.ok
                      ? "border-primary-700/40 bg-primary-700/10 text-primary-200"
                      : "border-coral-700/40 bg-coral-700/10 text-coral-300"
                  }`}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "14px", marginRight: 6 }}>
                    {c.ok ? "check_circle" : "cancel"}
                  </span>
                  {c.label}
                  {c.error && (
                    <pre
                      className="mt-1 whitespace-pre-wrap break-all text-[11px] text-ink-300"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {c.error}
                    </pre>
                  )}
                </li>
              ))}
            </ul>
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
      className={`inline-flex h-8 items-center gap-1.5 rounded-[6px] px-2.5 text-[12px] font-medium transition-colors ${
        active ? "bg-[#0E1014] text-[#E8EAED]" : "text-ink-500 hover:text-ink-200"
      }`}
    >
      <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>
        {icon}
      </span>
      {label}
    </button>
  );
}

function buildDoc(html: string, css: string, js: string, harness?: string): string {
  // CSP blocks network exfil (fetch/XHR/WebSocket/beacon) and external resources
  // from inside the sandboxed preview. Inline script/style still allowed so
  // student demos + harness can run. Defense-in-depth on top of admin-authored
  // expression validation in addWebCheckAction.
  const csp =
    "default-src 'none'; " +
    "script-src 'unsafe-inline'; " +
    "style-src 'unsafe-inline'; " +
    "img-src data: blob:; " +
    "font-src data:; " +
    "connect-src 'none'; " +
    "frame-src 'none'; " +
    "base-uri 'none'; " +
    "form-action 'none'";
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta http-equiv="Content-Security-Policy" content="${csp}" />
<style>${css}</style>
</head>
<body>
${html}
<script>
try {
${js}
} catch (e) { document.body.appendChild(Object.assign(document.createElement('pre'),{textContent:'JS error: '+e.message,style:'color:red;font-family:monospace;padding:8px;'})); }
</script>
${harness ?? ""}
</body>
</html>`;
}

function buildHarness(
  checks: { id: string; expression: string }[]
): string {
  const payload = JSON.stringify(checks);
  // Harness waits up to 2000ms for student JS to call window.__ready().
  // Falls back to 250ms grace period if no signal. Each expression may be
  // async (return a Promise); we await it before recording the result.
  return `<script>
(function(){
  var CHECKS = ${payload};
  var done = false;
  async function runOne(expr) {
    try {
      var fn = new Function('return (async function(){ return (' + expr + '); })()');
      var v = await fn();
      return { ok: !!v };
    } catch (e) {
      return { ok: false, error: String(e && e.message || e) };
    }
  }
  async function go() {
    if (done) return;
    done = true;
    var results = [];
    for (var i = 0; i < CHECKS.length; i++) {
      var c = CHECKS[i];
      var r = await runOne(c.expression);
      results.push({ id: c.id, ok: r.ok, error: r.error });
    }
    parent.postMessage({ channel: '__CHANNEL__', results: results }, '*');
  }
  // Student JS opts into precise timing by calling window.__ready().
  window.__ready = function(){ setTimeout(go, 0); };
  // Fallback: run shortly after DOM is interactive.
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(go, 250);
  } else {
    document.addEventListener('DOMContentLoaded', function(){ setTimeout(go, 250); });
  }
  // Hard ceiling so we always post something.
  setTimeout(go, 2000);
})();
</script>`;
}
