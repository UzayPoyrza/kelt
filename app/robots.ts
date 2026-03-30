import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/create", "/upgrade", "/login", "/contact"],
        disallow: [
          "/studio",
          "/session",
          "/api/",
          "/auth/",
          "/audio-test",
          "/script-preview",
          "/signup",
        ],
      },
    ],
    sitemap: "https://incraft.io/sitemap.xml",
  };
}
