import { NextRequest, NextResponse } from "next/server";

const publicRoutes = ["/", "/login", "/register", "/forgot-password"];
const maxAge = 7 * 24 * 60 * 60;

function getToken(request: NextRequest): string | undefined {
  return (
    request.headers.get("authorization")?.replace("Bearer ", "") ||
    request.cookies.get("auth-token")?.value
  );
}

function getUserRole(request: NextRequest): string | undefined {
  const authRole = request.cookies.get("auth-role")?.value;
  if (authRole) return authRole;

  const authStorage = request.cookies.get("auth-storage")?.value;
  if (!authStorage) return undefined;

  try {
    const parsedAuth = JSON.parse(authStorage);
    return parsedAuth.state?.user?.role;
  } catch {
    return undefined;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/api/auth/") ||
    pathname.startsWith("/api/profile")
  ) {
    return NextResponse.next();
  }

  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  if (isPublicRoute) {
    return NextResponse.next();
  }

  const token = getToken(request);

  if (!token) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { success: false, message: "Brak autoryzacji" },
        { status: 401 },
      );
    }

    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const userRole = getUserRole(request);

  if (pathname === "/dashboard" && userRole === "doctor") {
    return NextResponse.redirect(new URL("/doctor/dashboard", request.url));
  }

  if (pathname.startsWith("/doctor") && userRole && userRole !== "doctor") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (pathname.startsWith("/dashboard") && userRole === "doctor") {
    return NextResponse.redirect(new URL("/doctor/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)"],
};
