// layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "../app/components/Sidebar";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "../app/components/AuthContext"; // Use only AuthProvider here
import LayoutContent from "../app/components/layoutContent"; // Import the client component

export const metadata: Metadata = {
  title: "Admin Panel",
  description: "Admin Panel for Flutter Frontend",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <LayoutContent>{children}</LayoutContent>
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </AuthProvider>
      </body>
    </html>
  );
}
