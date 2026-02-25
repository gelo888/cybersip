import type { Metadata } from "next";
import { Inter, Lexend, Lexend_Exa } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const lexend = Lexend({
  variable: "--font-lexend",
  subsets: ["latin"],
  weight: "400",
});

const lexendExa = Lexend_Exa({
  variable: "--font-lexend-exa",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "CyberSIP",
  description: "Cybersecurity Sales Intelligence Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${lexend.variable} ${lexendExa.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
