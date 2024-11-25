// LayoutContent.tsx
"use client"; // Mark this as a client component

import React from "react";
import Sidebar from "./Sidebar"; // Adjust path if necessary
import { useAuth } from "./AuthContext";

const LayoutContent = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth(); // Use authentication state

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Render Sidebar only if authenticated */}
      {isAuthenticated && <Sidebar />}
      <div
        style={{
          flex: 1,
          padding: "20px",
          backgroundColor: "#f5f5f5",
          overflowY: "auto",
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default LayoutContent;
