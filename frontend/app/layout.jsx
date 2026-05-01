import "./globals.css";
import { AuthProvider } from "./lib/auth";

export const metadata = {
  title: "Cricket Auction Command Center",
  description: "Formal live auction operations suite for super admins, admins, and franchises.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
