import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Academic Platform",
  description: "Learn, practice, assess — School to Professional.",
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
