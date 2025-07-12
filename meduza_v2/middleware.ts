import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for public routes
  const publicRoutes = ["/", "/login", "/register", "/forgot-password"];

  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  // Skip middleware for API auth routes
  if (pathname.startsWith("/api/auth/")) {
    return NextResponse.next();
  }

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Check for authentication token
  const token =
    request.headers.get("authorization")?.replace("Bearer ", "") ||
    request.cookies.get("auth-token")?.value;

  if (!token) {
    // Redirect to login if no token
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Role-based route protection
  const authRole = request.cookies.get("auth-role")?.value;
  const authStorage = request.cookies.get("auth-storage")?.value;
  let userRole = authRole; // First try the simple cookie

  // Fallback to parsing the auth storage
  if (!userRole && authStorage) {
    try {
      const parsedAuth = JSON.parse(authStorage);
      userRole = parsedAuth.state?.user?.role;
    } catch (error) {
      console.error("Failed to parse auth storage:", error);
    }
  }

  console.log("Middleware - User role:", userRole, "Path:", pathname);

  // Redirect based on role for dashboard access
  if (pathname === "/dashboard" && userRole === "doctor") {
    return NextResponse.redirect(new URL("/doctor/dashboard", request.url));
  }

  // Protect doctor routes
  if (pathname.startsWith("/doctor") && userRole !== "doctor") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Protect patient routes
  if (pathname.startsWith("/dashboard") && userRole === "doctor") {
    return NextResponse.redirect(new URL("/doctor/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)"],
};
