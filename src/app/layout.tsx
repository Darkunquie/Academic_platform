import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Academic Success Platform",
  description: "Learn, practice, assess — School to Professional.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
