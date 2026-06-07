import { auth } from "@/auth";
import { LogoutButton } from "@/components/logout-button";

export default async function DashboardPage() {
  const session = await auth();
  const user = session?.user;

  return (
    <main className="mx-auto max-w-4xl p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Student Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Welcome, {user?.name ?? "student"}.
          </p>
        </div>
        <LogoutButton />
      </div>

      <div className="mt-8 rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center text-gray-500">
        Your subjects will appear here in Phase 3 (content + learning).
      </div>
    </main>
  );
}
