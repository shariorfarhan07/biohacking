"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { PortalPageHeader } from "@/components/dashboard/PortalPageHeader";
import { ticketsApi, ApiError } from "@/lib/api-client";

export default function NewTicketPage() {
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<{ subject?: string; message?: string }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const next: { subject?: string; message?: string } = {};
    if (!subject.trim()) next.subject = "Give your ticket a short subject.";
    if (!message.trim()) next.message = "Tell us what's going on.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitError(null);
    setSaving(true);
    try {
      const ticket = await ticketsApi.create({ subject: subject.trim(), message: message.trim() });
      router.push(`/dashboard/support/${ticket.id}`);
    } catch (err) {
      setSubmitError(
        err instanceof ApiError ? err.message : "We couldn't open your ticket. Please try again."
      );
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PortalPageHeader
        title="New ticket"
        description="Tell us what's going on — a real person will reply here."
        back={{ href: "/dashboard/support", label: "Support" }}
      />

      <GlassPanel className="max-w-2xl">
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
          {submitError && (
            <div role="alert" className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
              {submitError}
            </div>
          )}
          <Input
            label="Subject"
            required
            placeholder="e.g. I was charged twice this month"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            error={errors.subject}
          />
          <Textarea
            label="Message"
            required
            rows={7}
            placeholder="Give us as much detail as you can."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            error={errors.message}
          />
          <div className="flex gap-3">
            <Button type="submit" loading={saving}>
              Submit ticket
            </Button>
            <Link href="/dashboard/support">
              <Button type="button" variant="ghost">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </GlassPanel>
    </div>
  );
}
