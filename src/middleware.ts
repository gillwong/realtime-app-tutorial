import { auth } from "./lib/auth";

const sensitiveRoutes = ["/dashboard"];

export default auth((req) => {
  const pathname = req.nextUrl.pathname;

  if (pathname.startsWith("/login") && req.auth) {
    return Response.redirect(new URL("/dashboard", req.url));
  }

  if (
    sensitiveRoutes.some((route) => pathname.startsWith(route)) &&
    !req.auth
  ) {
    return Response.redirect(new URL("/login", req.url));
  }

  if (pathname === "/") {
    return Response.redirect(new URL("/dashboard", req.url));
  }
});

export const config = {
  matcher: ["/", "/login", "/dashboard/:path*"],
};
