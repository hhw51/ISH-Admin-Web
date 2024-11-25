// AuthWrapper.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { auth } from "../../utils/firebaseClient";

const AuthWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setIsAuthenticated(true);

        // Redirect logged-in users away from the login page
        if (pathname === "/login") {
          router.push("/");
        }
      } else {
        setIsAuthenticated(false);

        // Redirect unauthenticated users to the login page
        if (pathname !== "/login") {
          router.push("/login");
        }
      }
    });

    return () => unsubscribe();
  }, [router, pathname]);

  // Show a loading spinner while the authentication state is being determined
  if (isAuthenticated === null) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        Loading...
      </div>
    );
  }

  // Allow login page to render even if the user is not authenticated
  if (pathname === "/login") {
    return <>{children}</>;
  }

  // For authenticated users, render the children (e.g., dashboard pages)
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Render nothing while redirecting unauthenticated users
  return null;
};

export default AuthWrapper;
