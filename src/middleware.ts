import { NextRequest, NextResponse } from "next/server";

/**
 * Middleware for the Next.js client.
 * Currently simplified. Add role-based access control (RBAC) here if needed.
 */
export default async function middleware(req: NextRequest) {
  // Logic for authentication checks can be restored here 
  // when the session management strategy is finalized.
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/auth/:path*",
    "/dashboard/:path*",
    "/admin/:path*",
    "/log/:path*",
    "/blocked",
  ],
};
