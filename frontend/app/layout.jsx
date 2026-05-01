import "./globals.css";
import { Inter } from "next/font/google";
import { AuthProvider } from "./lib/auth";

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

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
