import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "VigiReal | Biohazard Intelligence Map",
  description:
    "A real-time biohazard mapping prototype for outbreaks, contaminated water, algal blooms, tick-borne illness, NCD burden, and allergy signals.",
  keywords: [
    "VigiReal",
    "biohazard mapping",
    "CDC NNDSS",
    "water contamination",
    "algal blooms",
    "tick-borne illness",
    "NCD surveillance",
    "allergy surveillance",
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
