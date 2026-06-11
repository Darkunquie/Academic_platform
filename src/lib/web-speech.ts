"use client";

type SpeechRecognitionResult = {
  transcript: string;
  isFinal: boolean;
};

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: ArrayLike<ArrayLike<SpeechRecognitionResult>>;
};

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onerror: ((e: { error?: string }) => void) | null;
  onend: (() => void) | null;
};

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  }
}

/** True if the browser exposes the Web Speech API (Chrome / Edge / Safari). */
export function webSpeechAvailable(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
}

export type WebSpeechSession = {
  stop: () => void;
  abort: () => void;
};

/**
 * Start an on-device speech recognition session. Calls onTranscript with the
 * accumulated final transcript each time a chunk finalizes. Returns control
 * handles to stop / abort.
 *
 * Returns null if the browser does not support Web Speech (caller should fall
 * back to MediaRecorder + server-side Whisper).
 */
export function startWebSpeech(opts: {
  onTranscript: (text: string) => void;
  onError?: (err: string) => void;
  onEnd?: () => void;
  lang?: string;
}): WebSpeechSession | null {
  if (typeof window === "undefined") return null;
  const Ctor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
  if (!Ctor) return null;

  const rec = new Ctor();
  rec.continuous = true;
  rec.interimResults = false;
  rec.lang = opts.lang ?? "en-US";

  let finalText = "";

  rec.onresult = (e) => {
    for (let i = e.resultIndex; i < e.results.length; i += 1) {
      const result = e.results[i];
      const alt = result[0];
      if (alt && result[0] && (result as unknown as { isFinal?: boolean }).isFinal !== false) {
        finalText += (finalText ? " " : "") + alt.transcript.trim();
      }
    }
    opts.onTranscript(finalText);
  };

  rec.onerror = (e) => {
    if (opts.onError) opts.onError(e.error ?? "speech recognition error");
  };

  rec.onend = () => {
    if (opts.onEnd) opts.onEnd();
  };

  try {
    rec.start();
  } catch (e) {
    if (opts.onError) opts.onError((e as Error).message);
    return null;
  }

  return {
    stop: () => {
      try {
        rec.stop();
      } catch {
        /* noop */
      }
    },
    abort: () => {
      try {
        rec.abort();
      } catch {
        /* noop */
      }
    },
  };
}
