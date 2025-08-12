// middleware.ts
export { auth as middleware } from "next-auth/middleware";

export const config = {
  matcher: [
    // protect everything except these paths
    "/((?!api|login|_next/static|_next/image|favicon.ico).*)",
  ],
};