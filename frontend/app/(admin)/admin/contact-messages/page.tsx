"use client";

import { useCallback, useEffect, useState } from "react";
import { StormPageHead } from "@/components/admin/StormLayout";
import { StormState } from "@/components/admin/StormState";
import {
  StormEmpty,
  StormFailure,
  StormLoadingAnnouncement,
  StormLoadingRows,
} from "@/components/admin/StormStates";
import { adminContactMessagesApi, ApiError } from "@/lib/api-client";
import { formatDateTime } from "@/lib/utils";
import type { ContactMessage } from "@/lib/types";

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setMessages(await adminContactMessagesApi.list());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "We couldn't load messages right now.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="flex flex-col gap-9">
      <StormPageHead
        title="Messages"
        line="Everything sent through the public contact form, newest first."
      />

      {loading ? (
        <>
          <StormLoadingAnnouncement label="Loading messages" />
          <StormLoadingRows rows={4} />
        </>
      ) : error ? (
        <StormFailure line={error} onRetry={load} />
      ) : messages.length === 0 ? (
        <StormEmpty
          word="Quiet"
          line="No one has written in yet. Messages from the contact form land here."
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {messages.map((message) => (
            <li key={message.id} className="rounded-xl border border-mist bg-paper p-5 shadow-storm-xs">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8">
                <div className="min-w-0">
                  <h2 className="text-sm font-semibold text-ink">{message.subject}</h2>
                  <p className="storm-micro mt-1 text-quiet">
                    {message.name} &middot;{" "}
                    <a
                      href={`mailto:${message.email}`}
                      className="text-accent underline decoration-accent/30 underline-offset-4 hover:decoration-accent"
                    >
                      {message.email}
                    </a>
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-4">
                  <StormState status={message.status} kind="contact" />
                  <span className="storm-micro tnum text-quiet">
                    {formatDateTime(message.created_at)}
                  </span>
                </div>
              </div>
              <p className="storm-prose mt-3 whitespace-pre-wrap text-rain">{message.message}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
