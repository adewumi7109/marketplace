import type { Metadata } from "next";
import "./globals.css";
import AppChrome from "@/components/AppChrome";

export const metadata: Metadata = {
  title: "MarktPlace - Discover Local Stores",
  description:
    "Browse and order from the best local stores near you. Fashion, food, electronics, and more.",
  keywords: ["marketplace", "stores", "local", "Nigeria", "shopping"],
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
        className="font-body bg-white text-zinc-950 antialiased"
      >
        <AppChrome>{children}</AppChrome>
      </body>
    </html>
  );
}
