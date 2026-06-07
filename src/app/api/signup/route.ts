import { NextResponse } from "next/server";
import { signupSchema } from "@/modules/auth/validation";
import { createPendingStudent, emailExists } from "@/modules/auth/service";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Invalid input";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  if (await emailExists(parsed.data.email)) {
    return NextResponse.json(
      { error: "An account with this email already exists" },
      { status: 409 }
    );
  }

  await createPendingStudent(parsed.data);
  return NextResponse.json({ ok: true }, { status: 201 });
}
