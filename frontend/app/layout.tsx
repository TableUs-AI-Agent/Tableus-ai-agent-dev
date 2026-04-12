import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "./components/sidebar";
import { UserProvider } from "./context/user-context";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TableUs",
  description: "AI-powered restaurant discovery for friends planning the next table together.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full`}>
      <body className="flex h-full bg-[var(--background)] text-[var(--foreground)]">
        <UserProvider>
          <Sidebar />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </UserProvider>
      </body>
    </html>
  );
}

