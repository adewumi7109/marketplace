"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useCurrentLocation } from "@/lib/userLocation";

interface AppChromeProps {
  children: React.ReactNode;
}

function SilentLocationCapture() {
  useCurrentLocation();
  return null;
}

export default function AppChrome({ children }: AppChromeProps) {
  const pathname = usePathname();
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "kombomart.com";
  const hostname = typeof window === "undefined" ? "" : window.location.hostname.toLowerCase();
  const isStoreSubdomain =
    hostname.endsWith(`.${rootDomain}`) &&
    hostname !== rootDomain &&
    hostname !== `www.${rootDomain}`;
  const isStorefront = pathname.startsWith("/store/") || isStoreSubdomain;
  const isAdminSurface = pathname.startsWith("/login") || pathname.startsWith("/dashboard");

  if (isStorefront || isAdminSurface) {
    return <main>{children}</main>;
  }

  return (
    <>
      <SilentLocationCapture />
      <Navbar />
      <main className="pt-16">{children}</main>
      <footer className="mt-20 border-t border-primary/20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-zinc-500">
          <span>&copy; {new Date().getFullYear()} Kombomart. All rights reserved.</span>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-primary transition-colors">Terms</a>
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </>
  );
}
