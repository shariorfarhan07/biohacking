import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { marked } from "marked";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { serverFetch } from "@/lib/server-api";
import { ApiError } from "@/lib/api-client";
import { formatDate } from "@/lib/utils";
import { SITE_NAME } from "@/lib/constants";
import type { BlogPost } from "@/lib/types";

export const dynamic = "force-dynamic";

async function loadPost(slug: string): Promise<BlogPost | null> {
  try {
    return await serverFetch<BlogPost>(`/blog/${slug}`);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = await loadPost(params.slug);
  if (!post) return { title: "Post not found" };

  const title = post.seo_title || post.title;
  const description = post.seo_description || post.excerpt;

  return {
    title,
    description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: post.published_at ?? undefined,
      images: post.cover_image_url ? [{ url: post.cover_image_url }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: post.cover_image_url ? [post.cover_image_url] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await loadPost(params.slug);
  if (!post) notFound();

  const bodyHtml = marked.parse(post.body_markdown, { async: false }) as string;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.seo_description || post.excerpt,
    datePublished: post.published_at ?? undefined,
    dateModified: post.updated_at,
    author: post.author_name ? { "@type": "Person", name: post.author_name } : undefined,
    publisher: { "@type": "Organization", name: SITE_NAME },
    image: post.cover_image_url ?? undefined,
    mainEntityOfPage: { "@type": "WebPage", "@id": `/blog/${post.slug}` },
  };

  return (
    <article className="px-5 pb-24 pt-16 sm:px-8 sm:pt-20">
      {/* eslint-disable-next-line react/no-danger */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-3xl">
        <p className="text-sm text-fog-500">
          {formatDate(post.published_at)}
          {post.author_name && <> · {post.author_name}</>}
        </p>
        <h1 className="mt-3 font-display text-3xl font-bold text-fog-100 sm:text-4xl">
          {post.title}
        </h1>

        {post.cover_image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.cover_image_url}
            alt=""
            className="mt-8 aspect-[16/9] w-full rounded-2xl object-cover"
          />
        )}

        <GlassPanel className="mt-10">
          <div
            className="blog-prose"
            // Content is authored exclusively by admins via the admin panel
            // (not user-submitted), so rendering the Markdown-to-HTML output
            // here carries the same trust level as any other admin-edited copy.
            dangerouslySetInnerHTML={{ __html: bodyHtml }}
          />
        </GlassPanel>
      </div>
    </article>
  );
}
