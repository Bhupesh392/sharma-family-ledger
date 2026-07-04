import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isLoginPage = req.nextUrl.pathname.startsWith("/login");
  const isApiRoute = req.nextUrl.pathname.startsWith("/api");

  if (!isLoggedIn && !isLoginPage) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoggedIn && isLoginPage) {
    const homeUrl = new URL("/", req.nextUrl.origin);
    return NextResponse.redirect(homeUrl);
  }

  // Track page views for authenticated, non-API, non-static page loads.
  // Fire-and-forget: we never await this, so it never blocks the response.
  if (isLoggedIn && !isApiRoute && req.method === "GET") {
    const user = req.auth?.user;
    const sessionId = req.cookies.get("next-auth.session-token")?.value
      ?? req.cookies.get("__Secure-next-auth.session-token")?.value
      ?? "unknown";

    const body = JSON.stringify({
      userId: user?.id ?? null,
      userName: user?.name ?? "Unknown",
      page: req.nextUrl.pathname,
      sessionId,
    });

    // Non-blocking — deliberately not awaited.
    fetch(new URL("/api/track-view", req.nextUrl.origin).toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-internal-secret": process.env.INTERNAL_SECRET ?? "",
      },
      body,
    }).catch(() => {
      // Silently ignore tracking failures — never affect the user's request.
    });
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
