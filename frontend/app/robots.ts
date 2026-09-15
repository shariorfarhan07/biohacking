import type { MetadataRoute } from "next";

const SITE_URL = "https://biohacking.example.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/dashboard", "/onboarding", "/checkout"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
