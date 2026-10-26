import type { MetadataRoute } from "next";

const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://getdecidia.com";
const paths = ["", "/exemple", "/new", "/login", "/privacy", "/terms", "/legal"];

export default function sitemap(): MetadataRoute.Sitemap {
  return paths.flatMap((p) => [
    { url: `${base}${p}`, alternates: { languages: { fr: `${base}${p}`, en: `${base}/en${p}` } } },
    { url: `${base}/en${p}` },
  ]);
}
