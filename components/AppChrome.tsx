"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";

interface AppChromeProps {
  children: React.ReactNode;
}

export default function AppChrome({ children }: AppChromeProps) {
  const pathname = usePathname();
  const isStorefront = pathname.startsWith("/store/");
  const isAdminSurface = pathname.startsWith("/login") || pathname.startsWith("/dashboard");

  if (isStorefront || isAdminSurface) {
    return <main>{children}</main>;
  }

  return (
    <>
      <Navbar />
      <main className="pt-16">{children}</main>
      <footer className="mt-20 border-t border-primary/20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-zinc-500">
          <span>&copy; {new Date().getFullYear()} MarktPlace. All rights reserved.</span>
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
