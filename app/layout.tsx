import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const metadata: Metadata = {
  title: "loop — Never lose a connection again.",
  description:
    "Loop remembers everyone you coffee chat with, tracks what's happening in their world, and writes the perfect follow-up.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="font-sans min-h-screen bg-[#FAFAFA] text-[#0A0A0F]">{children}</body>
    </html>
  );
}
