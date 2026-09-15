import type { Metadata } from "next";
import Link from "next/link";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { GlowBackground } from "@/components/ui/GlowBackground";
import { EmptyState } from "@/components/ui/EmptyState";
import { serverFetch } from "@/lib/server-api";
import { formatDate } from "@/lib/utils";
import type { BlogPost } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Training, nutrition and performance guidance from the Biohacking coaching team.",
};

export default async function BlogIndexPage() {
  let posts: BlogPost[] = [];
  try {
    posts = await serverFetch<BlogPost[]>("/blog");
  } catch {
    posts = [];
  }

  return (
    <section className="relative overflow-hidden px-5 pb-24 pt-16 sm:px-8 sm:pt-20">
      <GlowBackground variant="mixed" className="opacity-50" />
      <div className="mx-auto max-w-content">
        <div className="max-w-2xl">
          <h1 className="font-display text-4xl font-bold text-fog-100 sm:text-5xl">
            The Biohacking Blog
          </h1>
          <p className="mt-5 text-lg text-fog-300">
            Training, nutrition and performance guidance from the coaching team — no fads, no
            dosing advice, just what actually works.
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="mt-14">
            <EmptyState
              title="Nothing published yet"
              description="Check back soon — new articles are on the way."
            />
          </div>
        ) : (
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`} className="group block">
                <GlassPanel hover padded={false} className="flex h-full flex-col overflow-hidden">
                  {post.cover_image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={post.cover_image_url}
                      alt=""
                      className="aspect-[16/9] w-full object-cover"
                    />
                  )}
                  <div className="flex flex-1 flex-col p-6">
                    <p className="text-xs text-fog-500">{formatDate(post.published_at)}</p>
                    <h2 className="mt-2 font-display text-lg font-semibold text-fog-100 group-hover:text-cyan-300">
                      {post.title}
                    </h2>
                    <p className="mt-2 flex-1 text-sm text-fog-400">{post.excerpt}</p>
                  </div>
                </GlassPanel>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
