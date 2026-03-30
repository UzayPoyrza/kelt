import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://incraft.io", lastModified: new Date("2026-03-30") },
    { url: "https://incraft.io/create", lastModified: new Date("2026-03-30") },
    { url: "https://incraft.io/upgrade", lastModified: new Date("2026-03-30") },
    { url: "https://incraft.io/login", lastModified: new Date("2026-03-30") },
    { url: "https://incraft.io/contact", lastModified: new Date("2026-03-27") },
    { url: "https://incraft.io/privacy", lastModified: new Date("2026-03-30") },
    { url: "https://incraft.io/terms", lastModified: new Date("2026-03-30") },
  ];
}
