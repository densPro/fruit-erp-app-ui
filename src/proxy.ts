import { NextResponse, type NextRequest } from "next/server";

const PUBLIC = ["/login"];

/** Optimistic check only: real authorization happens in the backends. */
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasSession = req.cookies.has("erp_access") || req.cookies.has("erp_refresh");
  const isPublic = PUBLIC.some((p) => pathname.startsWith(p));
  if (!hasSession && !isPublic) {
    const url = new URL("/login", req.url);
    if (pathname !== "/") url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  if (hasSession && isPublic) return NextResponse.redirect(new URL("/", req.url));
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
