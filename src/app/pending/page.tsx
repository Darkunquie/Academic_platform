import { LogoutButton } from "@/components/logout-button";

export default function PendingPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center p-6 text-center">
      <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-2xl">
          ⏳
        </div>
        <h1 className="text-xl font-bold">Awaiting approval</h1>
        <p className="mt-2 text-sm text-gray-500">
          Your account is pending review by an administrator. You will be able
          to access your dashboard once approved. Log in again after approval.
        </p>
        <div className="mt-6">
          <LogoutButton />
        </div>
      </div>
    </main>
  );
}
