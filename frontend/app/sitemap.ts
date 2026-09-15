import type { MetadataRoute } from "next";
import { serverFetch } from "@/lib/server-api";
import type { BlogPost } from "@/lib/types";

const SITE_URL = "https://biohacking.example.com";

// Fetches live blog slugs from the backend, which isn't reachable at Docker
// build time (see frontend/Dockerfile) — defer this to request time rather
// than have `next build` try to statically prerender it.
export const dynamic = "force-dynamic";

const STATIC_ROUTES = [
  "",
  "/how-it-works",
  "/programmes",
  "/pricing",
  "/results",
  "/blog",
  "/about",
  "/faq",
  "/contact",
  "/advanced-performance-support",
  "/legal/terms",
  "/legal/privacy",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
  }));

  let posts: BlogPost[] = [];
  try {
    posts = await serverFetch<BlogPost[]>("/blog");
  } catch {
    posts = [];
  }

  const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.updated_at),
  }));

  return [...staticEntries, ...postEntries];
}
