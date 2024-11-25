// _middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyIdToken } from "./utils/firebaseAdmin"; // Adjust path as needed

export async function middleware(request: NextRequest) {
  const authToken = request.cookies.get("authToken")?.value;
  const isLoginPage = request.nextUrl.pathname === "/login";

  if (!authToken) {
    if (!isLoginPage) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  try {
    await verifyIdToken(authToken);

    if (isLoginPage) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Token verification failed:", error);
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/((?!api|_next|static|favicon.ico).*)"],
};
