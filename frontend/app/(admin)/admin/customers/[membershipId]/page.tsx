"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { StormButton } from "@/components/admin/StormButton";
import { StormIcon } from "@/components/admin/StormIcon";
import { StormFacts, StormPageHead, StormSection } from "@/components/admin/StormLayout";
import { StormState } from "@/components/admin/StormState";
import { StormFailure, StormLoadingBlock } from "@/components/admin/StormStates";
import { StormDialog, StormConfirmDialog } from "@/components/admin/StormDialog";
import { StormSelect, StormTextarea, StormCheckbox } from "@/components/admin/StormField";
import { useToast } from "@/components/admin/StormToast";
import { adminCustomersApi, adminProgrammesApi, ApiError } from "@/lib/api-client";
import { formatDate, formatDateTime, titleCase } from "@/lib/utils";
import { MEMBERSHIP_STATUS_LABELS } from "@/lib/constants";
import type { AdminCustomerDetail, Programme } from "@/lib/types";

export default function AdminCustomerDetailPage({
  params,
}: {
  params: { membershipId: string };
}) {
  const { showToast } = useToast();
  const [detail, setDetail] = useState<AdminCustomerDetail | null>(null);
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [refundOpen, setRefundOpen] = useState(false);
  const [refundReason, setRefundReason] = useState("");
  const [cancelSubscription, setCancelSubscription] = useState(false);
  const [refunding, setRefunding] = useState(false);

  const [overrideOpen, setOverrideOpen] = useState(false);
  const [overrideProgrammeId, setOverrideProgrammeId] = useState("");
  const [overrideReason, setOverrideReason] = useState("");
  const [overriding, setOverriding] = useState(false);

  const [statusOpen, setStatusOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [statusReason, setStatusReason] = useState("");
  const [savingStatus, setSavingStatus] = useState(false);

  const [retrying, setRetrying] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [detailResult, programmesResult] = await Promise.all([
        adminCustomersApi.get(params.membershipId),
        adminProgrammesApi.list().catch(() => [] as Programme[]),
      ]);
      setDetail(detailResult);
      setProgrammes(programmesResult);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "We couldn't load this customer.");
    } finally {
      setLoading(false);
    }
  }, [params.membershipId]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleRefund() {
    if (!refundReason.trim()) {
      showToast("A reason is required — it goes into the audit trail.", "error");
      return;
    }
    setRefunding(true);
    try {
      await adminCustomersApi.refund(params.membershipId, {
        reason: refundReason,
        cancel_subscription: cancelSubscription,
      });
      showToast("Refund issued.");
      setRefundOpen(false);
      setRefundReason("");
      setCancelSubscription(false);
      load();
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "We couldn't issue the refund.", "error");
    } finally {
      setRefunding(false);
    }
  }

  async function handleOverride() {
    if (!overrideProgrammeId || !overrideReason.trim()) {
      showToast("Pick a programme and give a reason.", "error");
      return;
    }
    setOverriding(true);
    try {
      await adminCustomersApi.overrideProgramme(params.membershipId, {
        programme_id: overrideProgrammeId,
        reason: overrideReason,
      });
      showToast("Programme overridden.");
      setOverrideOpen(false);
      setOverrideReason("");
      setOverrideProgrammeId("");
      load();
    } catch (err) {
      showToast(
        err instanceof ApiError ? err.message : "We couldn't override the programme.",
        "error"
      );
    } finally {
      setOverriding(false);
    }
  }

  async function handleCorrectStatus() {
    if (!newStatus || !statusReason.trim()) {
      showToast("Pick a status and give a reason.", "error");
      return;
    }
    setSavingStatus(true);
    try {
      await adminCustomersApi.correctStatus(params.membershipId, {
        status: newStatus,
        reason: statusReason,
      });
      showToast("Status corrected.");
      setStatusOpen(false);
      setStatusReason("");
      setNewStatus("");
      load();
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "We couldn't update the status.", "error");
    } finally {
      setSavingStatus(false);
    }
  }

  async function handleRetry() {
    setRetrying(true);
    try {
      await adminCustomersApi.retryEverfit(params.membershipId);
      showToast("Provisioning retried.");
      load();
    } catch (err) {
      showToast(
        err instanceof ApiError ? err.message : "We couldn't retry provisioning.",
        "error"
      );
    } finally {
      setRetrying(false);
    }
  }

  if (loading) return <StormLoadingBlock />;
  if (error || !detail) return <StormFailure line={error ?? undefined} onRetry={load} />;

  const o = detail.onboarding;
  const screening = Object.entries(o?.health_screening_answers ?? {});
  const canRetry =
    detail.everfit_status === "failed" ||
    (detail.membership_status === "provisioning_failed" && detail.everfit_status !== "activated");

  return (
    <div className="flex flex-col gap-14">
      <StormPageHead
        title={detail.customer_name}
        line={detail.email}
        above={
          <Link
            href="/admin/customers"
            className="storm-legend inline-flex items-center gap-1.5 text-rain transition-colors hover:text-ink"
          >
            <StormIcon name="left" size={13} />
            Roster
          </Link>
        }
        actions={
          <>
            <StormButton variant="quiet" onClick={() => setStatusOpen(true)}>
              Correct status
            </StormButton>
            <StormButton variant="outline" onClick={() => setOverrideOpen(true)}>
              Override programme
            </StormButton>
            <StormButton variant="destructive" onClick={() => setRefundOpen(true)}>
              Refund
            </StormButton>
          </>
        }
      />

      {/* The record states its own condition. Membership leads because it is
          the fact that decides what you do next; the rest are its supporting
          reads, all on the one coloured state register. */}
      <section className="rounded-xl border border-mist bg-paper p-6 shadow-storm-xs sm:p-7">
        <div className="flex flex-wrap items-baseline gap-x-12 gap-y-5">
          <div className="mr-4">
            <p className="storm-legend text-rain">Membership</p>
            <p className="mt-2">
              <StormState
                status={detail.membership_status}
                kind="membership"
                className="text-sm"
              />
            </p>
          </div>
          <div>
            <p className="storm-legend text-rain">Everfit</p>
            <p className="mt-2">
              <StormState status={detail.everfit_status} kind="everfit" />
            </p>
          </div>
          <div>
            <p className="storm-legend text-rain">Programme</p>
            <p className="mt-2">
              {detail.everfit_programme_name ? (
                <span className="storm-state storm-state--settled">
                  {detail.everfit_programme_name}
                </span>
              ) : (
                // An absence is set as prose, not as a pill — nothing emitted this.
                <span className="storm-data text-quiet">Not assigned yet</span>
              )}
            </p>
          </div>
          <div>
            <p className="storm-legend text-rain">Onboarding</p>
            <p className="mt-2">
              <StormState
                status={o?.completed_at ? "complete" : o ? "in_progress" : "not_started"}
                kind="onboarding"
              />
            </p>
          </div>
        </div>
      </section>

      {detail.everfit_last_error && (
        <section className="rounded-xl border border-signal/25 bg-signal-soft p-6">
          <h2 className="storm-legend font-semibold text-signal">Provisioning stopped here</h2>
          <p className="storm-data mt-3 text-ink">{detail.everfit_last_error}</p>
          <p className="storm-micro mt-2 text-rain">
            Attempt <span className="tnum">{detail.everfit_attempt_count}</span>. The customer sees
            only a neutral &ldquo;setting up your account&rdquo; message.
          </p>
          {canRetry && (
            <StormButton className="mt-5" variant="solid" loading={retrying} onClick={handleRetry}>
              <StormIcon name="retry" size={14} />
              Retry provisioning
            </StormButton>
          )}
        </section>
      )}

      <div className="grid gap-14 lg:grid-cols-2">
        <StormSection heading="Membership">
          <StormFacts
            items={[
              { label: "Package", value: detail.package?.name },
              { label: "Joined", value: formatDate(detail.created_at) },
              { label: "Activated", value: detail.activated_at ? formatDateTime(detail.activated_at) : null },
              { label: "Next billing", value: detail.next_billing_date ? formatDate(detail.next_billing_date) : null },
              { label: "Cancelled", value: detail.canceled_at ? formatDateTime(detail.canceled_at) : null },
              { label: "Stripe subscription", value: detail.stripe_subscription_id },
            ]}
          />
        </StormSection>

        <StormSection
          heading="Everfit account"
          actions={
            canRetry &&
            !detail.everfit_last_error && (
              <StormButton variant="quiet" size="sm" loading={retrying} onClick={handleRetry}>
                Retry
              </StormButton>
            )
          }
        >
          <StormFacts
            items={[
              { label: "Client ID", value: detail.everfit_client_id },
              { label: "Programme", value: detail.everfit_programme_name },
              { label: "Attempts", value: detail.everfit_attempt_count },
              {
                label: "Access",
                value: detail.everfit_access_url ? (
                  <a
                    href={detail.everfit_access_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 underline decoration-mist underline-offset-4 hover:decoration-ink"
                  >
                    Open in Everfit
                    <StormIcon name="external" size={13} />
                  </a>
                ) : null,
              },
            ]}
          />
        </StormSection>
      </div>

      <StormSection heading="Onboarding answers">
        {!o ? (
          <p className="storm-prose text-rain">
            This customer hasn&rsquo;t started their assessment yet. Nothing here until they do.
          </p>
        ) : (
          <div className="grid gap-x-14 gap-y-10 lg:grid-cols-2">
            <div>
              <h3 className="storm-legend border-b border-mist pb-2 text-rain">Goals</h3>
              <StormFacts
                className="pt-1"
                items={[
                  { label: "Primary goal", value: o.goal && titleCase(o.goal) },
                  {
                    label: "Target weight",
                    value: o.target_weight_kg ? `${o.target_weight_kg} kg` : null,
                  },
                  { label: "Body composition", value: o.body_composition_goal },
                ]}
              />
            </div>
            <div>
              <h3 className="storm-legend border-b border-mist pb-2 text-rain">Personal</h3>
              <StormFacts
                className="pt-1"
                items={[
                  { label: "Age", value: o.age },
                  { label: "Height", value: o.height_cm ? `${o.height_cm} cm` : null },
                  { label: "Weight", value: o.weight_kg ? `${o.weight_kg} kg` : null },
                  { label: "Body fat", value: o.body_fat_range },
                ]}
              />
            </div>
            <div>
              <h3 className="storm-legend border-b border-mist pb-2 text-rain">Training</h3>
              <StormFacts
                className="pt-1"
                items={[
                  {
                    label: "Experience",
                    value: o.training_experience && titleCase(o.training_experience),
                  },
                  { label: "Days per week", value: o.training_days_per_week },
                  { label: "Preferred days", value: o.preferred_training_days?.join(", ") },
                  {
                    label: "Location",
                    value: o.training_location && titleCase(o.training_location),
                  },
                  { label: "Equipment", value: o.equipment?.join(", ") },
                  {
                    label: "Session length",
                    value: o.session_duration_minutes ? `${o.session_duration_minutes} min` : null,
                  },
                ]}
              />
            </div>
            <div>
              <h3 className="storm-legend border-b border-mist pb-2 text-rain">Lifestyle</h3>
              <StormFacts
                className="pt-1"
                items={[
                  { label: "Occupation", value: o.occupation },
                  {
                    label: "Activity level",
                    value: o.activity_level && titleCase(o.activity_level),
                  },
                  { label: "Daily steps", value: o.daily_steps },
                  { label: "Sleep", value: o.sleep_hours ? `${o.sleep_hours} hrs` : null },
                  { label: "Sleep quality", value: o.sleep_quality && titleCase(o.sleep_quality) },
                  { label: "Stress", value: o.stress_level && titleCase(o.stress_level) },
                ]}
              />
            </div>
            <div>
              <h3 className="storm-legend border-b border-mist pb-2 text-rain">Nutrition</h3>
              <StormFacts
                className="pt-1"
                items={[
                  { label: "Calories", value: o.current_calorie_intake },
                  { label: "Preferences", value: o.food_preferences?.join(", ") },
                  { label: "Allergies", value: o.allergies },
                  { label: "Intolerances", value: o.intolerances },
                  { label: "Meals per day", value: o.meals_per_day },
                  {
                    label: "Cooking ability",
                    value: o.cooking_ability && titleCase(o.cooking_ability),
                  },
                  { label: "Budget", value: o.food_budget && titleCase(o.food_budget) },
                ]}
              />
            </div>
            <div>
              <h3 className="storm-legend border-b border-mist pb-2 text-rain">
                Health &amp; limitations
              </h3>
              <StormFacts
                className="pt-1"
                items={[
                  { label: "Injuries", value: o.injuries },
                  { label: "Limitations", value: o.physical_limitations },
                  ...screening.map(([key, value]) => ({
                    label: titleCase(key),
                    value: value ? "Yes" : "No",
                  })),
                  { label: "Progress photos", value: o.progress_photos_provided ? "Yes" : "No" },
                ]}
              />
            </div>
          </div>
        )}
      </StormSection>

      <StormConfirmDialog
        open={refundOpen}
        onClose={() => setRefundOpen(false)}
        onConfirm={handleRefund}
        title="Issue refund"
        description="This refunds the customer's most recent payment through Stripe. It cannot be undone, and it is recorded against your account."
        confirmLabel="Issue refund"
        destructive
        loading={refunding}
      >
        <StormTextarea
          label="Reason"
          required
          hint="Recorded in the audit trail."
          value={refundReason}
          onChange={(event) => setRefundReason(event.target.value)}
        />
        <StormCheckbox
          label="Also cancel their subscription"
          hint="Leave off to refund this payment but keep the subscription running."
          checked={cancelSubscription}
          onChange={(event) => setCancelSubscription(event.target.checked)}
        />
      </StormConfirmDialog>

      <StormDialog
        open={overrideOpen}
        onClose={() => setOverrideOpen(false)}
        title="Override programme"
        description="Replaces the programme the rules engine assigned, and reassigns it in Everfit."
        footer={
          <>
            <StormButton variant="quiet" onClick={() => setOverrideOpen(false)}>
              Cancel
            </StormButton>
            <StormButton loading={overriding} onClick={handleOverride}>
              Save override
            </StormButton>
          </>
        }
      >
        <StormSelect
          label="New programme"
          required
          placeholder="Select a programme"
          options={programmes.map((p) => ({ value: p.id, label: p.name }))}
          value={overrideProgrammeId}
          onChange={(event) => setOverrideProgrammeId(event.target.value)}
        />
        <StormTextarea
          label="Reason"
          required
          hint="Recorded in the audit trail."
          value={overrideReason}
          onChange={(event) => setOverrideReason(event.target.value)}
        />
      </StormDialog>

      <StormDialog
        open={statusOpen}
        onClose={() => setStatusOpen(false)}
        title="Correct membership status"
        description="Use this only to fix a status that drifted from reality. It does not touch Stripe or Everfit."
        footer={
          <>
            <StormButton variant="quiet" onClick={() => setStatusOpen(false)}>
              Cancel
            </StormButton>
            <StormButton loading={savingStatus} onClick={handleCorrectStatus}>
              Save status
            </StormButton>
          </>
        }
      >
        <StormSelect
          label="New status"
          required
          placeholder="Select a status"
          options={Object.entries(MEMBERSHIP_STATUS_LABELS).map(([value, meta]) => ({
            value,
            label: meta.label,
          }))}
          value={newStatus}
          onChange={(event) => setNewStatus(event.target.value)}
        />
        <StormTextarea
          label="Reason"
          required
          hint="Required — this is recorded in the audit trail."
          value={statusReason}
          onChange={(event) => setStatusReason(event.target.value)}
        />
      </StormDialog>
    </div>
  );
}
