"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { StormButton } from "@/components/admin/StormButton";
import { StormIcon } from "@/components/admin/StormIcon";
import { StormPageHead, StormSection } from "@/components/admin/StormLayout";
import { StormTextarea, StormSelect } from "@/components/admin/StormField";
import { StormState } from "@/components/admin/StormState";
import { StormFailure, StormLoadingBlock } from "@/components/admin/StormStates";
import { useToast } from "@/components/admin/StormToast";
import { cn, formatDateTime } from "@/lib/utils";
import { adminTicketsApi, ApiError } from "@/lib/api-client";
import type { TicketDetail, TicketStatus } from "@/lib/types";

const STATUS_OPTIONS = [
  { value: "open", label: "Open" },
  { value: "resolved", label: "Resolved" },
];

export default function AdminTicketDetailPage({ params }: { params: { ticketId: string } }) {
  const { showToast } = useToast();
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setTicket(await adminTicketsApi.get(params.ticketId));
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
      const updated = await adminTicketsApi.reply(params.ticketId, reply.trim());
      setTicket(updated);
      setReply("");
      showToast("Reply sent.");
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "We couldn't send that reply.", "error");
    } finally {
      setSending(false);
    }
  }

  async function handleStatusChange(status: TicketStatus) {
    if (!ticket) return;
    setUpdatingStatus(true);
    try {
      const updated = await adminTicketsApi.updateStatus(params.ticketId, status);
      setTicket(updated);
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "We couldn't update this ticket.", "error");
    } finally {
      setUpdatingStatus(false);
    }
  }

  if (loading) return <StormLoadingBlock />;
  if (error || !ticket) return <StormFailure line={error ?? "Ticket not found"} onRetry={load} />;

  return (
    <div className="flex flex-col gap-10">
      <StormPageHead
        title={ticket.subject}
        line={`Opened by ${ticket.customer_name}`}
        above={
          <Link
            href="/admin/tickets"
            className="storm-legend inline-flex items-center gap-1.5 text-rain transition-colors hover:text-ink"
          >
            <StormIcon name="left" size={13} />
            Tickets
          </Link>
        }
      />

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            {ticket.messages.map((message) => {
              const isAdmin = message.author_type === "admin";
              return (
                <div
                  key={message.id}
                  className={cn(
                    "rounded-xl border px-4 py-3",
                    isAdmin ? "border-accent/25 bg-accent-soft" : "border-mist bg-paper-lift"
                  )}
                >
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="text-sm font-medium text-ink">{message.author_name}</span>
                    <span className="storm-micro whitespace-nowrap text-quiet">
                      {formatDateTime(message.created_at)}
                    </span>
                  </div>
                  <p className="mt-1.5 whitespace-pre-wrap text-sm text-ink">{message.body}</p>
                </div>
              );
            })}
          </div>

          <StormSection heading="Reply">
            <form onSubmit={handleReply} className="flex flex-col gap-4">
              <StormTextarea
                label="Message"
                rows={5}
                value={reply}
                onChange={(event) => setReply(event.target.value)}
                placeholder="Type your reply…"
              />
              <div>
                <StormButton type="submit" loading={sending} disabled={!reply.trim()}>
                  Send reply
                </StormButton>
              </div>
            </form>
          </StormSection>
        </div>

        <div className="flex flex-col gap-10">
          <StormSection heading="Ticket">
            <div className="flex flex-col gap-5">
              <div>
                <p className="storm-micro font-medium uppercase tracking-wide text-quiet">Status</p>
                <div className="mt-1.5">
                  <StormState status={ticket.status} kind="ticket" />
                </div>
              </div>
              <StormSelect
                label="Update status"
                options={STATUS_OPTIONS}
                value={ticket.status}
                disabled={updatingStatus}
                onChange={(event) => handleStatusChange(event.target.value as TicketStatus)}
              />
              <div>
                <p className="storm-micro font-medium uppercase tracking-wide text-quiet">Customer</p>
                <p className="mt-1.5 text-sm text-ink">{ticket.customer_name}</p>
                <p className="storm-micro text-quiet">{ticket.customer_email}</p>
              </div>
            </div>
          </StormSection>
        </div>
      </div>
    </div>
  );
}
