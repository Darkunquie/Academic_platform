import { NextResponse } from "next/server";
import { getGradesByProvider } from "@/modules/curriculum/queries";

export async function GET(req: Request) {
  const providerId = new URL(req.url).searchParams.get("providerId");
  if (!providerId) return NextResponse.json([]);
  return NextResponse.json(await getGradesByProvider(providerId));
}
