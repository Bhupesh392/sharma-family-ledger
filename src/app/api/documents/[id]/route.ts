import { NextRequest, NextResponse } from "next/server";
import { getDocumentUrl } from "@/lib/actions/documents";

// GET /api/documents/[id]
// Decrypts the document URL server-side and redirects the browser to it.
// Authentication is enforced inside getDocumentUrl via the session.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const url = await getDocumentUrl(Number(id));
    return NextResponse.redirect(url);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Not found";
    return NextResponse.json({ error: message }, { status: 403 });
  }
}
