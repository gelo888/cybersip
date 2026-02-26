import type { Metadata } from "next";
import { Inter, Lexend, Lexend_Exa } from "next/font/google";
import "./globals.css";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

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
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
              <SidebarTrigger className="-ml-1" />
            </header>
            <main className="flex-1">{children}</main>
          </SidebarInset>
        </SidebarProvider>
      </body>
    </html>
  );
}
