import Link from "next/link";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center p-6">
      <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold">Log in</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back. Enter your credentials.
        </p>
        <div className="mt-6">
          <LoginForm />
        </div>
        <p className="mt-6 text-center text-sm text-gray-500">
          No account?{" "}
          <Link className="font-medium text-blue-600" href="/signup">
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}
