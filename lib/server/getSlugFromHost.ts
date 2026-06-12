import { headers } from "next/headers";

export async function getStoreSlugFromHost() {
  const headersList = await headers();
  const host = headersList.get("host") || "";
  return host.split(":")[0].split(".")[0];
}