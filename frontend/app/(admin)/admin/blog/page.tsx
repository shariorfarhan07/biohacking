"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { StormButton } from "@/components/admin/StormButton";
import { StormPageHead } from "@/components/admin/StormLayout";
import { StormRoster, type StormColumn } from "@/components/admin/StormRoster";
import { StormFailure } from "@/components/admin/StormStates";
import { adminBlogApi, ApiError } from "@/lib/api-client";
import { formatDate } from "@/lib/utils";
import type { BlogPost } from "@/lib/types";

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setPosts(await adminBlogApi.list());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "We couldn't load posts right now.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const columns: StormColumn<BlogPost>[] = [
    {
      key: "title",
      header: "Post",
      mobile: "lead",
      sortValue: (row) => row.title.toLowerCase(),
      render: (row) => (
        <Link
          href={`/admin/blog/${row.id}`}
          className="font-semibold text-ink underline decoration-mist underline-offset-4 transition-colors hover:decoration-ink"
        >
          {row.title || "Untitled"}
        </Link>
      ),
    },
    {
      key: "author_name",
      header: "Author",
      mobile: "meta",
      render: (row) => row.author_name || <span className="text-quiet">—</span>,
    },
    {
      key: "status",
      header: "Status",
      mobile: "trail",
      render: (row) => (
        <span
          className={
            row.status === "published" ? "storm-state storm-state--settled" : "storm-state storm-state--flight"
          }
        >
          {row.status === "published" ? "Published" : "Draft"}
        </span>
      ),
    },
    {
      key: "published_at",
      header: "Published",
      mobile: "meta",
      align: "right",
      render: (row) => formatDate(row.published_at),
    },
  ];

  return (
    <div className="flex flex-col gap-9">
      <StormPageHead
        title="Blog"
        line="Posts here appear on the public /blog page as soon as they're published."
        actions={
          <Link href="/admin/blog/new">
            <StormButton>New post</StormButton>
          </Link>
        }
      />

      {error ? (
        <StormFailure line={error} onRetry={load} />
      ) : (
        <StormRoster
          caption="Blog posts"
          columns={columns}
          rows={posts}
          keyExtractor={(row) => row.id}
          rowHref={(row) => `/admin/blog/${row.id}`}
          loading={loading}
          emptyWord="None"
          emptyLine="No posts yet. Create one — it stays a draft until you publish it."
          emptyAction={
            <Link href="/admin/blog/new">
              <StormButton variant="outline">New post</StormButton>
            </Link>
          }
        />
      )}
    </div>
  );
}
