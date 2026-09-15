"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { useToast } from "@/components/ui/Toast";
import { PortalPageHeader } from "@/components/dashboard/PortalPageHeader";
import { ticketsApi, ApiError } from "@/lib/api-client";
import { cn, formatDateTime } from "@/lib/utils";
import type { TicketDetail } from "@/lib/types";

export default function TicketDetailPage({ params }: { params: { ticketId: string } }) {
  const { showToast } = useToast();
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [resolving, setResolving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setTicket(await ticketsApi.get(params.ticketId));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "We couldn't load this ticket.");
    } finally {
      setLoading(false);
    }
  }, [params.ticketId]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleReply(event: React.FormEvent) {
    event.preventDefault();
    if (!reply.trim()) return;
    setSending(true);
    try {
      const updated = await ticketsApi.reply(params.ticketId, reply.trim());
      setTicket(updated);
      setReply("");
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "We couldn't send that. Please try again.", "error");
    } finally {
      setSending(false);
    }
  }

  async function handleResolve() {
    setResolving(true);
    try {
      const updated = await ticketsApi.resolve(params.ticketId);
      setTicket(updated);
      showToast("Ticket marked resolved.", "success");
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "We couldn't update this ticket.", "error");
    } finally {
      setResolving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (error || !ticket) {
    return <ErrorState description={error ?? undefined} onRetry={load} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <PortalPageHeader
        title={ticket.subject}
        back={{ href: "/dashboard/support", label: "Support" }}
        badge={<StatusBadge status={ticket.status} kind="ticket" />}
        actions={
          ticket.status === "open" ? (
            <Button variant="secondary" size="sm" loading={resolving} onClick={handleResolve}>
              Mark resolved
            </Button>
          ) : undefined
        }
      />

      <div className="flex flex-col gap-3">
        {ticket.messages.map((message) => {
          const isCustomer = message.author_type === "customer";
          return (
            <div
              key={message.id}
              className={cn("flex", isCustomer ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-xl border px-4 py-3 sm:max-w-[70%]",
                  isCustomer
                    ? "border-cyan-400/20 bg-cyan-400/[0.06]"
                    : "border-white/10 bg-white/[0.04]"
                )}
              >
                <div className="flex items-baseline justify-between gap-4">
                  <span className="text-xs font-medium text-fog-300">{message.author_name}</span>
                  <span className="tnum whitespace-nowrap text-[11px] text-fog-500">
                    {formatDateTime(message.created_at)}
                  </span>
                </div>
                <p className="mt-1.5 whitespace-pre-wrap text-sm text-fog-100">{message.body}</p>
              </div>
            </div>
          );
        })}
      </div>

      <GlassPanel>
        {ticket.status === "resolved" && (
          <p className="mb-3 text-xs text-fog-400">
            This ticket is marked resolved. Sending a message will reopen it.
          </p>
        )}
        <form onSubmit={handleReply} className="flex flex-col gap-3">
          <Textarea
            label="Reply"
            rows={4}
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="Type your message…"
          />
          <div>
            <Button type="submit" loading={sending} disabled={!reply.trim()}>
              Send
            </Button>
          </div>
        </form>
      </GlassPanel>
    </div>
  );
}
