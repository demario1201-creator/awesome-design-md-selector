import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Frontend Style Selector - 74 Design Systems, One Click Preview",
  description:
    "Browse 74 brand design styles, preview in 4 page types, apply 5 animations, and export DESIGN.md files. Optional AI-powered rewriting with DeepSeek.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
