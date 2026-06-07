import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LogoutButton } from "@/components/logout-button";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const role = session?.user?.role;
  if (role !== "admin" && role !== "super_admin") redirect("/login");

  return (
    <div className="min-h-screen">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between p-4">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="font-semibold">
              Admin
            </Link>
            <nav className="flex gap-4 text-sm text-gray-600">
              <Link href="/admin/approvals" className="hover:text-gray-900">
                Approvals
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <span className="rounded bg-gray-100 px-2 py-1">{role}</span>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl p-6">{children}</main>
    </div>
  );
}
