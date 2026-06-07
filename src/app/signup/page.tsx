import Link from "next/link";
import { SignupForm } from "./signup-form";

export default function SignupPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center p-6">
      <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold">Create your account</h1>
        <p className="mt-1 text-sm text-gray-500">
          After signup an admin reviews and approves your access.
        </p>
        <div className="mt-6">
          <SignupForm />
        </div>
        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link className="font-medium text-blue-600" href="/login">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
