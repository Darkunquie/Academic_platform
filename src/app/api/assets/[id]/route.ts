import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getAsset } from "@/modules/content/service";
import { getTopicChain } from "@/modules/curriculum/admin";
import { readFile } from "@/lib/storage";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const url = new URL(req.url);
  const wantDownload = url.searchParams.get("download") === "1";

  const session = await auth();
  const user = session?.user;
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const asset = await getAsset(id);
  if (!asset) return new NextResponse("Not found", { status: 404 });

  // Board scope: students may only fetch assets within their own grade.
  if (user.role === "student") {
    const chain = await getTopicChain(asset.topicId);
    if (!chain || chain.gradeId !== user.gradeId) {
      return new NextResponse("Forbidden", { status: 403 });
    }
  }

  try {
    const buf = await readFile(asset.r2Key);
    const disposition = wantDownload ? "attachment" : "inline";
    return new NextResponse(new Uint8Array(buf), {
      headers: {
        "Content-Type": asset.mime ?? "application/octet-stream",
        "Content-Disposition": `${disposition}; filename="${asset.filename}"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return new NextResponse("File missing", { status: 404 });
  }
}
