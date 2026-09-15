"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { marked } from "marked";
import { StormButton } from "@/components/admin/StormButton";
import { StormIcon } from "@/components/admin/StormIcon";
import { StormPageHead, StormSection } from "@/components/admin/StormLayout";
import { StormInput, StormSelect, StormTextarea } from "@/components/admin/StormField";
import { StormFailure, StormLoadingBlock } from "@/components/admin/StormStates";
import { useToast } from "@/components/admin/StormToast";
import { adminBlogApi, ApiError } from "@/lib/api-client";
import type { BlogPost, PostStatus } from "@/lib/types";

const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
];

interface FormState {
  slug: string;
  title: string;
  excerpt: string;
  body_markdown: string;
  cover_image_url: string;
  author_name: string;
  status: PostStatus;
  seo_title: string;
  seo_description: string;
}

const EMPTY: FormState = {
  slug: "",
  title: "",
  excerpt: "",
  body_markdown: "",
  cover_image_url: "",
  author_name: "",
  status: "draft",
  seo_title: "",
  seo_description: "",
};

export default function AdminBlogEditorPage({ params }: { params: { postId: string } }) {
  const { showToast } = useToast();
  const isNew = params.postId === "new";

  const [form, setForm] = useState<FormState>(EMPTY);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  const load = useCallback(async () => {
    if (isNew) return;
    setLoading(true);
    setError(null);
    try {
      const post = await adminBlogApi.get(params.postId);
      setForm({
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        body_markdown: post.body_markdown,
        cover_image_url: post.cover_image_url ?? "",
        author_name: post.author_name,
        status: post.status,
        seo_title: post.seo_title ?? "",
        seo_description: post.seo_description ?? "",
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "We couldn't load this post.");
    } finally {
      setLoading(false);
    }
  }, [isNew, params.postId]);

  useEffect(() => {
    load();
  }, [load]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  const previewHtml = useMemo(() => {
    if (!form.body_markdown.trim()) return "";
    try {
      return marked.parse(form.body_markdown, { async: false }) as string;
    } catch {
      return "";
    }
  }, [form.body_markdown]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.title.trim()) next.title = "Give the post a title.";
    if (!form.slug.trim()) next.slug = "A slug is required — it appears in the post URL.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const payload: Partial<BlogPost> = {
      title: form.title.trim(),
      excerpt: form.excerpt.trim(),
      body_markdown: form.body_markdown,
      cover_image_url: form.cover_image_url.trim() || null,
      author_name: form.author_name.trim(),
      status: form.status,
      seo_title: form.seo_title.trim() || null,
      seo_description: form.seo_description.trim() || null,
    };

    setSaving(true);
    try {
      if (isNew) {
        const created = await adminBlogApi.create({ ...payload, slug: form.slug.trim() });
        showToast("Post created.");
        window.location.href = `/admin/blog/${created.id}`;
        return;
      }
      await adminBlogApi.update(params.postId, payload);
      showToast("Post saved.");
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "We couldn't save this post.", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (isNew) return;
    if (!window.confirm("Delete this post? This can't be undone.")) return;
    try {
      await adminBlogApi.remove(params.postId);
      showToast("Post deleted.");
      window.location.href = "/admin/blog";
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "We couldn't delete this post.", "error");
    }
  }

  if (loading) return <StormLoadingBlock />;
  if (error) return <StormFailure line={error} onRetry={load} />;

  return (
    <div className="flex flex-col gap-10">
      <StormPageHead
        title={isNew ? "New post" : form.title || "Post"}
        line={
          isNew
            ? "Stays a draft — invisible on /blog — until you set status to Published."
            : "Changes go live on /blog immediately once the post is published."
        }
        above={
          <Link
            href="/admin/blog"
            className="storm-legend inline-flex items-center gap-1.5 text-rain transition-colors hover:text-ink"
          >
            <StormIcon name="left" size={13} />
            Blog
          </Link>
        }
      />

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-12">
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="flex flex-col gap-10">
            <StormSection heading="Content">
              <div className="flex flex-col gap-7">
                <StormInput
                  label="Title"
                  required
                  value={form.title}
                  error={errors.title}
                  onChange={(event) => set("title", event.target.value)}
                />
                <StormInput
                  label="Slug"
                  required
                  hint="Lower case, hyphenated. Used in the post URL: /blog/your-slug."
                  value={form.slug}
                  error={errors.slug}
                  disabled={!isNew}
                  onChange={(event) => set("slug", event.target.value)}
                />
                <StormTextarea
                  label="Excerpt"
                  rows={3}
                  hint="Shown on the blog index and used as the fallback meta description."
                  value={form.excerpt}
                  onChange={(event) => set("excerpt", event.target.value)}
                />
                <StormTextarea
                  label="Body (Markdown)"
                  rows={18}
                  value={form.body_markdown}
                  onChange={(event) => set("body_markdown", event.target.value)}
                />
              </div>
            </StormSection>
          </div>

          <div className="flex flex-col gap-10">
            <StormSection heading="Preview">
              <div className="max-h-[28rem] overflow-y-auto rounded-xl border border-mist bg-paper-lift p-5">
                {previewHtml ? (
                  <div
                    className="blog-prose"
                    // Same trust boundary as the public page: admin-authored
                    // Markdown, rendered client-side for a live preview only.
                    dangerouslySetInnerHTML={{ __html: previewHtml }}
                  />
                ) : (
                  <p className="storm-prose text-quiet">Start writing to see a preview.</p>
                )}
              </div>
            </StormSection>

            <StormSection heading="Publishing">
              <div className="flex flex-col gap-7">
                <StormSelect
                  label="Status"
                  options={STATUS_OPTIONS}
                  value={form.status}
                  onChange={(event) => set("status", event.target.value as PostStatus)}
                />
                <StormInput
                  label="Author"
                  value={form.author_name}
                  onChange={(event) => set("author_name", event.target.value)}
                />
                <StormInput
                  label="Cover image URL"
                  hint="Shown on the blog index, the post header, and social share previews."
                  value={form.cover_image_url}
                  onChange={(event) => set("cover_image_url", event.target.value)}
                />
              </div>
            </StormSection>

            <StormSection heading="SEO">
              <div className="flex flex-col gap-7">
                <StormInput
                  label="SEO title"
                  hint="Falls back to the post title when left blank."
                  value={form.seo_title}
                  onChange={(event) => set("seo_title", event.target.value)}
                />
                <StormTextarea
                  label="SEO description"
                  rows={3}
                  hint="Falls back to the excerpt when left blank."
                  value={form.seo_description}
                  onChange={(event) => set("seo_description", event.target.value)}
                />
              </div>
            </StormSection>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-mist pt-7">
          <div className="flex flex-wrap gap-3">
            <StormButton type="submit" loading={saving}>
              {isNew ? "Create post" : "Save changes"}
            </StormButton>
            <Link href="/admin/blog">
              <StormButton type="button" variant="quiet">
                Cancel
              </StormButton>
            </Link>
          </div>
          {!isNew && (
            <StormButton type="button" variant="quiet" onClick={handleDelete}>
              Delete post
            </StormButton>
          )}
        </div>
      </form>
    </div>
  );
}
