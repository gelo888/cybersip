import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { DocsSidebar } from "@/components/docs-sidebar";
import { CodeBlockWrapper } from "@/components/copy-button";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | CyberSIP Docs",
    default: "CyberSIP Documentation",
  },
  description:
    "Technical documentation for CyberSIP — Cybersecurity Sales Intelligence Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="flex min-h-screen">
          <DocsSidebar />
          <main className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-4xl px-8 py-12">
              <CodeBlockWrapper>{children}</CodeBlockWrapper>
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
