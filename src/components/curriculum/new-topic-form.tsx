"use client";

import { useRef, useState, useTransition } from "react";
import { createTopicFullAction } from "@/modules/curriculum/actions";

export function NewTopicForm({
  chapterId,
  revalidate,
}: Readonly<{ chapterId: string; revalidate: string }>) {
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [pending, start] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  function handleFiles(list: FileList | null) {
    if (!list) return;
    setFiles((prev) => [...prev, ...Array.from(list)]);
  }
  function removeFile(i: number) {
    setFiles((prev) => prev.filter((_, j) => j !== i));
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    // override file input with our state (drag-drop)
    fd.delete("files");
    for (const f of files) fd.append("files", f);
    start(async () => {
      await createTopicFullAction(fd);
      form.reset();
      setFiles([]);
      setOpen(false);
    });
  }

  return (
    <form
      ref={formRef}
      onSubmit={submit}
      className="rounded-[20px] border border-ink-200 bg-white soft-shadow"
    >
      <input type="hidden" name="chapterId" value={chapterId} />
      <input type="hidden" name="revalidate" value={revalidate} />

      <div className="flex items-center gap-3 p-5">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-primary-100 text-primary-700"
          aria-hidden
        >
          <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
            add
          </span>
        </span>
        <input
          name="name"
          required
          placeholder="New topic name — e.g. Tenses"
          className="h-12 flex-1 rounded-[14px] border-[1.5px] border-ink-200 bg-white px-4 text-[15px] text-ink-900 outline-none transition-all placeholder:text-ink-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
        />
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="hidden h-10 items-center gap-1.5 rounded-[12px] border border-ink-200 px-3 text-[13px] font-medium text-ink-700 transition-colors hover:bg-paper md:inline-flex"
        >
          <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
            {open ? "expand_less" : "edit_note"}
          </span>
          {open ? "Hide content" : "Add content + files"}
        </button>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-10 items-center gap-1.5 rounded-[12px] bg-primary-700 px-4 text-[13px] font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-primary-900 hover:pop-shadow disabled:opacity-60"
        >
          {pending ? "Saving…" : "Add topic"}
          {!pending && (
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "16px" }}
            >
              arrow_forward
            </span>
          )}
        </button>
      </div>

      {open && (
        <div className="border-t border-ink-200 p-5">
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label
                className="text-[11px] font-medium text-ink-700"
                style={{ fontFamily: "var(--font-mono)", }}
              >
                Content (Markdown · optional)
              </label>
              <textarea
                name="body"
                rows={12}
                placeholder={"# Tenses\n\nA tense shows the time of an action…"}
                className="w-full rounded-[14px] border-[1.5px] border-ink-200 bg-paper p-3 font-mono text-[13px] text-ink-900 outline-none transition-all focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
              />
              <p className="text-[12px] text-ink-500">
                Students read this. Text-to-speech reads it aloud.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <label
                className="text-[11px] font-medium text-ink-700"
                style={{ fontFamily: "var(--font-mono)", }}
              >
                Attach files (optional)
              </label>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  handleFiles(e.dataTransfer?.files ?? null);
                }}
                className={`flex h-32 w-full flex-col items-center justify-center gap-1.5 rounded-[14px] border-2 border-dashed transition-colors ${
                  dragOver
                    ? "border-primary-500 bg-primary-50"
                    : "border-ink-300 bg-paper hover:border-primary-500 hover:bg-primary-50/40"
                }`}
              >
                <span
                  className="material-symbols-outlined text-primary-700"
                  style={{ fontSize: "28px" }}
                >
                  upload_file
                </span>
                <span className="text-[13px] font-medium text-ink-900">
                  Drop files or click to pick
                </span>
                <span className="text-[11px] text-ink-500">
                  PDF, images, audio
                </span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,image/*,audio/*"
                className="hidden"
                onChange={(e) => {
                  handleFiles(e.target.files);
                  e.target.value = "";
                }}
              />

              {files.length > 0 && (
                <ul className="flex flex-col gap-1.5 rounded-[14px] border border-ink-200 bg-white p-2">
                  {files.map((f, i) => (
                    <li
                      key={`${f.name}-${i}`}
                      className="flex items-center justify-between gap-2 rounded-[10px] bg-paper px-3 py-2 text-[13px]"
                    >
                      <span className="flex items-center gap-2 truncate">
                        <span
                          className="material-symbols-outlined text-primary-700"
                          style={{ fontSize: "16px" }}
                        >
                          {f.type.startsWith("image/")
                            ? "image"
                            : f.type.startsWith("audio/")
                              ? "graphic_eq"
                              : "picture_as_pdf"}
                        </span>
                        <span className="truncate text-ink-900">{f.name}</span>
                      </span>
                      <span className="flex items-center gap-2">
                        <span
                          className="text-[11px] text-ink-500"
                          style={{ fontFamily: "var(--font-mono)" }}
                        >
                          {(f.size / 1024).toFixed(0)} KB
                        </span>
                        <button
                          type="button"
                          onClick={() => removeFile(i)}
                          className="text-ink-500 transition-colors hover:text-coral-700"
                          aria-label="Remove"
                        >
                          <span
                            className="material-symbols-outlined"
                            style={{ fontSize: "16px" }}
                          >
                            close
                          </span>
                        </button>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
