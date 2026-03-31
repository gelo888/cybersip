import type { Metadata } from "next";
import { Inter, Lexend, Lexend_Exa } from "next/font/google";
import "./globals.css";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { PageHeader } from "@/components/page-header";
import { Providers } from "@/components/providers";

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
        <html lang="en" suppressHydrationWarning>
            <body
                className={`${inter.variable} ${lexend.variable} ${lexendExa.variable} antialiased`}
            >
                <Providers>
                    <SidebarProvider>
                        <AppSidebar />
                        <SidebarInset className="min-w-0">
                            <PageHeader />
                            <div className="flex-1 overflow-auto">
                                {children}
                            </div>
                        </SidebarInset>
                    </SidebarProvider>
                </Providers>
            </body>
        </html>
    );
}
