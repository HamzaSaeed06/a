import "./globals.css";
import { Inter } from "next/font/google";
import { AuthProvider } from "./lib/auth";
import SmoothScroll from "./components/SmoothScroll";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata = {
  title: "Auction OS — Cricket Auction Platform",
  description: "Live auction operations for super admins, admins, and franchise users.",
};

import { Toaster } from "react-hot-toast";

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="antialiased text-slate-900 bg-white" suppressHydrationWarning>
        <Toaster 
          position="top-center" 
          toastOptions={{
            style: {
              background: '#334155',
              color: '#fff',
              fontSize: '14px',
              borderRadius: '8px',
            },
          }} 
        />
        <SmoothScroll>
          <AuthProvider>{children}</AuthProvider>
        </SmoothScroll>
      </body>
    </html>
  );
}
