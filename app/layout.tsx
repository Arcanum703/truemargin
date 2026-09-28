import type { Metadata } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import "./globals.css";

const sans = DM_Sans({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const display = Fraunces({ subsets: ["latin"], variable: "--font-display", display: "swap", axes: ["opsz", "SOFT"] });

export const metadata: Metadata = {
  title: "TrueMargin — real profit for Etsy sellers",
  description: "Import the CSVs Etsy already gives you and see what you actually keep on every listing after fees, shipping, materials, and ads.",
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className={`${sans.variable} ${display.variable}`}><body className="font-sans">{children}</body></html>;
}
