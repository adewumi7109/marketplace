import type { Metadata } from "next";
import { Syne, DM_Sans } from "next/font/google";
import "./globals.css";
import AppChrome from "@/components/AppChrome";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "600", "700", "800"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: "MarktPlace - Discover Local Stores",
  description:
    "Browse and order from the best local stores near you. Fashion, food, electronics, and more.",
  keywords: ["marketplace", "stores", "local", "Nigeria", "shopping", "WhatsApp"],
  openGraph: {
    title: "MarktPlace",
    description: "Discover and shop from local stores",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        suppressHydrationWarning
        className={`${syne.variable} ${dmSans.variable} font-body bg-white text-zinc-950 antialiased`}
      >
        <AppChrome>{children}</AppChrome>
      </body>
    </html>
  );
}
