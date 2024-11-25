import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyIdToken } from "./utils/firebaseAdmin"; // Adjust path as needed

export async function middleware(request: NextRequest) {
  const authToken = request.cookies.get("authToken")?.value; // Get the Firebase token from cookies
  const isLoginPage = request.nextUrl.pathname === "/login"; // Check if the current page is the login page

  // If no token is found, redirect to login page (unless already on login page)
  if (!authToken) {
    if (!isLoginPage) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next(); // Allow access to login page
  }

  // If token is present, verify it
  try {
    await verifyIdToken(authToken); // Verify Firebase token

    // Redirect authenticated users away from the login page
    if (isLoginPage) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next(); // Allow access to other pages for authenticated users
  } catch (error) {
    console.error("Token verification failed:", error);
    return NextResponse.redirect(new URL("/login", request.url)); // Redirect to login if token verification fails
  }
}

export const config = {
  matcher: ["/((?!api|_next|static|favicon.ico).*)"], // Protect all routes except API and static assets
};
