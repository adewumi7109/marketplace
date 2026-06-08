import { headers } from "next/headers";
import AppChromeClient from "@/components/AppChromeClient";

interface AppChromeProps {
  children: React.ReactNode;
}

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "kombomart.com";
const RESERVED_SUBDOMAINS = new Set(["www", "api", "admin", "app"]);

function isStoreSubdomainHost(host: string) {
  const hostname = host.split(":")[0]?.toLowerCase() || "";
  if (!hostname.endsWith(`.${ROOT_DOMAIN}`)) return false;

  const subdomain = hostname.slice(0, -ROOT_DOMAIN.length - 1);
  const parts = subdomain.split(".").filter(Boolean);
  const slug = parts[0] === "www" ? parts[1] : parts[0];

  return Boolean(slug && !RESERVED_SUBDOMAINS.has(slug));
}

export default async function AppChrome({ children }: AppChromeProps) {
  const headersList = await headers();
  const host = headersList.get("x-forwarded-host") || headersList.get("host") || "";
  const forceStorefront = isStoreSubdomainHost(host);

  return (
    <AppChromeClient forceStorefront={forceStorefront}>
      {children}
    </AppChromeClient>
  );
}
