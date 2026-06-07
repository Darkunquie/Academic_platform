import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center gap-6 p-8 text-center">
      <h1 className="text-4xl font-bold tracking-tight">
        Academic Success Platform
      </h1>
      <p className="text-lg text-gray-600">
        Learn, practice, and assess — from School to Professional.
      </p>
      <div className="flex gap-3">
        <Link
          href="/signup"
          className="rounded-md bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          Get started
        </Link>
        <Link
          href="/login"
          className="rounded-md border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-50"
        >
          Log in
        </Link>
      </div>
    </main>
  );
}
