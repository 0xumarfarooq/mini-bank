import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Banking System Demo",
  description: "Simple simulated banking system with Next.js + MongoDB",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
