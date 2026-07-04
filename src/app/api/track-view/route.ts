import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pageViews } from "@/lib/db/schema";

// This endpoint is called fire-and-forget from proxy.ts on every
// authenticated page load. It must never block the user's request.
// Security: validates the internal secret header so external callers
// can't inflate view counts.
export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-internal-secret");
  if (secret !== process.env.INTERNAL_SECRET) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { userId, userName, page, sessionId } = body;

    if (!page || !sessionId || !userName) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    await db.insert(pageViews).values({
      userId: userId ? Number(userId) : null,
      userName,
      page,
      sessionId,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[track-view] Failed:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
