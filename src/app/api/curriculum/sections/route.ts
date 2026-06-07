import { NextResponse } from "next/server";
import { getSections } from "@/modules/curriculum/queries";

export async function GET() {
  return NextResponse.json(await getSections());
}
