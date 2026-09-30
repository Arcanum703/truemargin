import type { MetadataRoute } from "next";
import { env } from "@/lib/env";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${env.APP_URL}/`, lastModified: now, priority: 1 },
    { url: `${env.APP_URL}/tools/etsy-fee-calculator`, lastModified: now, priority: 0.9 },
    { url: `${env.APP_URL}/signup`, lastModified: now, priority: 0.6 },
    { url: `${env.APP_URL}/privacy`, lastModified: now, priority: 0.2 },
    { url: `${env.APP_URL}/terms`, lastModified: now, priority: 0.2 },
    { url: `${env.APP_URL}/security`, lastModified: now, priority: 0.2 },
  ];
}
