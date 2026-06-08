import { NextResponse } from "next/server";
import { getProvidersBySection } from "@/modules/curriculum/queries";

export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const sectionId = sp.get("sectionId");
  const state = sp.get("state") ?? undefined;
  if (!sectionId) return NextResponse.json([]);
  return NextResponse.json(await getProvidersBySection(sectionId, state));
}
