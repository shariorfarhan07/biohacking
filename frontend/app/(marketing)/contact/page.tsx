"use client";

import { useState } from "react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { GlowBackground } from "@/components/ui/GlowBackground";
import { contactApi, ApiError } from "@/lib/api-client";

interface FormState {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const EMPTY_FORM: FormState = { name: "", email: "", subject: "", message: "" };

export default function ContactPage() {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function validate(): boolean {
    const nextErrors: Partial<FormState> = {};
    if (!form.name.trim()) nextErrors.name = "Please enter your name.";
    if (!form.email.trim()) {
      nextErrors.email = "Please enter your email.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nextErrors.email = "Please enter a valid email address.";
    }
    if (!form.subject.trim()) nextErrors.subject = "Please enter a subject.";
    if (!form.message.trim()) {
      nextErrors.message = "Please enter a message.";
    } else if (form.message.trim().length < 10) {
      nextErrors.message = "Please provide a little more detail (at least 10 characters).";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setStatus("submitting");
    setErrorMessage(null);
    try {
      await contactApi.send(form);
      setStatus("success");
      setForm(EMPTY_FORM);
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof ApiError
          ? err.message
          : "We couldn't send your message right now. Please try again in a moment, or email us directly."
      );
    }
  }

  if (status === "success") {
    return (
      <section className="relative overflow-hidden px-5 py-24 sm:px-8">
        <GlowBackground variant="cyan" className="opacity-50" />
        <div className="mx-auto max-w-content">
          <GlassPanel className="mx-auto max-w-lg text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success/10 text-success">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M5 13l4 4L19 7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h1 className="mt-5 font-display text-2xl font-bold text-fog-100">
              Message sent
            </h1>
            <p className="mt-3 text-fog-300">
              Thanks for reaching out. Our team will get back to you at the email address you
              provided, usually within one business day.
            </p>
            <Button className="mt-6" variant="secondary" onClick={() => setStatus("idle")}>
              Send another message
            </Button>
          </GlassPanel>
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden px-5 py-16 sm:px-8 sm:py-20">
      <GlowBackground variant="blue" className="opacity-50" />
      <div className="mx-auto max-w-content">
        <div className="mx-auto max-w-xl text-center">
          <h1 className="font-display text-4xl font-bold text-fog-100 sm:text-5xl">
            Get in touch
          </h1>
          <p className="mt-5 text-lg text-fog-300">
            Questions about programmes, pricing, or whether coaching is right for you? Send us a
            message and a real person will reply.
          </p>
        </div>

        <GlassPanel className="mx-auto mt-12 max-w-xl">
          {status === "error" && errorMessage && (
            <div
              role="alert"
              className="mb-6 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger"
            >
              {errorMessage}
            </div>
          )}
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
            <Input
              label="Name"
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              error={errors.name}
              autoComplete="name"
            />
            <Input
              label="Email"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              error={errors.email}
              autoComplete="email"
            />
            <Input
              label="Subject"
              required
              value={form.subject}
              onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
              error={errors.subject}
            />
            <Textarea
              label="Message"
              required
              value={form.message}
              onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
              error={errors.message}
            />
            <Button type="submit" loading={status === "submitting"} fullWidth size="lg">
              Send Message
            </Button>
          </form>
        </GlassPanel>
      </div>
    </section>
  );
}
