export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center gap-6 p-8 text-center">
      <h1 className="text-4xl font-bold tracking-tight">
        Academic Success Platform
      </h1>
      <p className="text-lg text-gray-600">
        Phase 0 scaffold is live. Next.js + Drizzle + Postgres ready.
      </p>
      <div className="rounded-lg border border-gray-200 bg-white px-5 py-3 text-sm text-gray-500">
        Health check:{" "}
        <a className="font-medium text-blue-600 underline" href="/api/health">
          /api/health
        </a>
      </div>
    </main>
  );
}
