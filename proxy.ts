import { NextRequest, NextResponse } from "next/server";

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "kombomart.com";
const RESERVED_SUBDOMAINS = new Set(["www", "api", "admin", "app"]);

function storeSlugFromHost(host: string) {
  const hostname = host.split(":")[0]?.toLowerCase() || "";
  if (!hostname.endsWith(`.${ROOT_DOMAIN}`)) return "";

  const subdomain = hostname.slice(0, -ROOT_DOMAIN.length - 1);
  const parts = subdomain.split(".").filter(Boolean);
  const slug = parts[0] === "www" ? parts[1] : parts[0];

  if (!slug || RESERVED_SUBDOMAINS.has(slug)) return "";
  return slug;
}

export function proxy(request: NextRequest) {
  const slug = storeSlugFromHost(request.headers.get("host") || "");
  if (!slug) return NextResponse.next();

  const url = request.nextUrl.clone();
  const pathname = url.pathname;

  if (pathname === "/") {
    url.pathname = `/store/${slug}`;
    return NextResponse.rewrite(url);
  }

  if (pathname.startsWith("/products/")) {
    url.pathname = `/store/${slug}${pathname}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|logoo.png|marketplace.png|.*\\..*).*)"],
};
