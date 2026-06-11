import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Preplyfly — Prep. Fly.",
  description: "Prepare yourself — learn, practice, and assess from School to Professional.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
