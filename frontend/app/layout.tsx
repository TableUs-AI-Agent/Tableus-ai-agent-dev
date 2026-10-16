import type { Metadata, Viewport } from "next";
import { Darker_Grotesque, Figtree } from "next/font/google";

import "./globals.css";
import { Providers } from "./providers";

const display = Darker_Grotesque({
  subsets: ["latin"],
  weight: ["700", "800", "900"],
  variable: "--font-darker-grotesque",
});
const body = Figtree({ subsets: ["latin"], variable: "--font-figtree" });

export const metadata: Metadata = {
  title: "TableUs: dinner, decided together",
  description:
    "Start a plan, share the link, and everyone says what they want. TableUs picks four nearby places that work for the whole group, then you vote.",
};

export const viewport: Viewport = { themeColor: "#17301f" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
