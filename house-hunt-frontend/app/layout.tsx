// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "HouseHunt Kenya — Find Your Next Rental Home",
    template: "%s — HouseHunt Kenya",
  },
  description: "Browse verified rental listings across Kenya. Connect directly with landlords.",
  metadataBase: new URL("https://househunt.co.ke"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      {/* Browser extensions (Grammarly, password managers) inject attributes
          onto <body> before React hydrates, which React reports as a mismatch.
          Suppressing here covers only this element's own attributes — mismatches
          in the app's own markup are still reported normally. */}
      <body className={inter.className} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
