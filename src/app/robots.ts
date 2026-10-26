import type { MetadataRoute } from "next";

const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://getdecidia.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/analysis/", "/journal", "/settings", "/decision/"] }],
    sitemap: `${base}/sitemap.xml`,
  };
}
