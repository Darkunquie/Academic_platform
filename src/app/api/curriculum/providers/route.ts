import { NextResponse } from "next/server";
import { getProvidersBySection } from "@/modules/curriculum/queries";

export async function GET(req: Request) {
  const sectionId = new URL(req.url).searchParams.get("sectionId");
  if (!sectionId) return NextResponse.json([]);
  return NextResponse.json(await getProvidersBySection(sectionId));
}
