// Judge0 CE language IDs.
export const LANGUAGES = {
  python: { id: 71, label: "Python 3" },
  cpp: { id: 54, label: "C++ (GCC 9)" },
  c: { id: 50, label: "C (GCC 9)" },
  java: { id: 62, label: "Java" },
  javascript: { id: 63, label: "JavaScript (Node)" },
  csharp: { id: 51, label: "C# (.NET)" },
  sql: { id: 82, label: "SQL (SQLite)" },
} as const;

export type LangKey = keyof typeof LANGUAGES;

export const LANG_KEYS = Object.keys(LANGUAGES) as LangKey[];

export function languageId(key: string): number | null {
  return (LANGUAGES as Record<string, { id: number }>)[key]?.id ?? null;
}
