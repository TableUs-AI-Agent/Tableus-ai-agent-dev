import type { Metadata } from "next";
import "./globals.css";
import { AccountLifecycleGate } from "./components/account-lifecycle-gate";
import { UserProvider } from "./context/user-context";
import { AppProviders } from "./providers";

export const metadata: Metadata = {
  title: "TableUs",
  description: "Choose where to eat together with a shared dinner plan.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="flex h-full bg-[var(--background)] text-[var(--foreground)]">
        <AppProviders>
          <UserProvider>
            <AccountLifecycleGate>{children}</AccountLifecycleGate>
          </UserProvider>
        </AppProviders>
      </body>
    </html>
  );
}
