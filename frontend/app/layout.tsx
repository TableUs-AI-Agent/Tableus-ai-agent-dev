import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "./components/sidebar";
import { UserProvider } from "./context/user-context";
import { AppProviders } from "./providers";

export const metadata: Metadata = {
  title: "TableUs",
  description: "AI-powered restaurant discovery for friends planning the next table together.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="flex h-full bg-[var(--background)] text-[var(--foreground)]">
        <AppProviders>
          <UserProvider>
            <Sidebar />
            <main className="flex-1 overflow-y-auto">{children}</main>
          </UserProvider>
        </AppProviders>
      </body>
    </html>
  );
}
