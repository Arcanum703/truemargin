import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TrueMargin — Etsy profit without spreadsheet fragility",
  description: "Import Etsy exports and see true product margin after every fee.",
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
