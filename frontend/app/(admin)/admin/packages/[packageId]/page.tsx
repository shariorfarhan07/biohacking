"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { StormButton } from "@/components/admin/StormButton";
import { StormIcon } from "@/components/admin/StormIcon";
import { StormPageHead, StormSection } from "@/components/admin/StormLayout";
import { StormInput, StormSelect, StormTextarea, StormCheckbox } from "@/components/admin/StormField";
import { StormFailure, StormLoadingBlock } from "@/components/admin/StormStates";
import { useToast } from "@/components/admin/StormToast";
import { adminPackagesApi, ApiError } from "@/lib/api-client";
import { BILLING_INTERVAL_LABELS } from "@/lib/constants";
import type { BillingInterval, Package } from "@/lib/types";

const INTERVAL_OPTIONS = Object.entries(BILLING_INTERVAL_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const CURRENCY_OPTIONS = [
  { value: "gbp", label: "GBP (£)" },
  { value: "usd", label: "USD ($)" },
  { value: "eur", label: "EUR (€)" },
];

interface FormState {
  slug: string;
  name: string;
  description: string;
  price: string;
  currency: string;
  billing_interval: BillingInterval;
  stripe_price_id: string;
  features: string;
  sort_order: string;
  is_active: boolean;
}

const EMPTY: FormState = {
  slug: "",
  name: "",
  description: "",
  price: "",
  currency: "gbp",
  billing_interval: "monthly",
  stripe_price_id: "",
  features: "",
  sort_order: "0",
  is_active: true,
};

export default function AdminPackageEditorPage({ params }: { params: { packageId: string } }) {
  const router = useRouter();
  const { showToast } = useToast();
  const isNew = params.packageId === "new";

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
      const pkg = await adminPackagesApi.get(params.packageId);
      setForm({
        slug: pkg.slug,
        name: pkg.name,
        description: pkg.description ?? "",
        price: (pkg.price_cents / 100).toFixed(2),
        currency: pkg.currency,
        billing_interval: pkg.billing_interval,
        stripe_price_id: pkg.stripe_price_id ?? "",
        features: (pkg.features ?? []).join("\n"),
        sort_order: String(pkg.sort_order ?? 0),
        is_active: pkg.is_active,
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "We couldn't load this package.");
    } finally {
      setLoading(false);
    }
  }, [isNew, params.packageId]);

  useEffect(() => {
    load();
  }, [load]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) next.name = "Give the package a name.";
    if (!form.slug.trim()) next.slug = "A slug is required — it appears in the checkout URL.";
    const priceValue = Number(form.price);
    if (!form.price.trim() || Number.isNaN(priceValue) || priceValue < 0) {
      next.price = "Enter the price as a number, e.g. 149.00";
    }
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const payload: Partial<Package> = {
      name: form.name.trim(),
      description: form.description.trim(),
      price_cents: Math.round(priceValue * 100),
      currency: form.currency,
      billing_interval: form.billing_interval,
      stripe_price_id: form.stripe_price_id.trim() || undefined,
      features: form.features
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
      sort_order: Number(form.sort_order) || 0,
      is_active: form.is_active,
    };

    setSaving(true);
    try {
      if (isNew) {
        await adminPackagesApi.create({ ...payload, slug: form.slug.trim() });
        showToast("Package created.");
      } else {
        await adminPackagesApi.update(params.packageId, payload);
        showToast("Package saved.");
      }
      router.push("/admin/packages");
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "We couldn't save this package.", "error");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <StormLoadingBlock />;
  if (error) return <StormFailure line={error} onRetry={load} />;

  return (
    <div className="flex flex-col gap-10">
      <StormPageHead
        title={isNew ? "New package" : form.name || "Package"}
        line={
          isNew
            ? "This becomes a card on the public pricing page as soon as it is active."
            : "Changes go live on the public pricing page immediately."
        }
        above={
          <Link
            href="/admin/packages"
            className="storm-legend inline-flex items-center gap-1.5 text-rain transition-colors hover:text-ink"
          >
            <StormIcon name="left" size={13} />
            Packages
          </Link>
        }
      />

      <form onSubmit={handleSubmit} noValidate className="flex max-w-2xl flex-col gap-12">
        <StormSection heading="What it is">
          <div className="flex flex-col gap-7">
            <StormInput
              label="Name"
              required
              value={form.name}
              error={errors.name}
              onChange={(event) => set("name", event.target.value)}
            />
            <StormInput
              label="Slug"
              required
              hint="Lower case, hyphenated. Used in the checkout URL."
              value={form.slug}
              error={errors.slug}
              disabled={!isNew}
              onChange={(event) => set("slug", event.target.value)}
            />
            <StormTextarea
              label="Description"
              rows={4}
              value={form.description}
              onChange={(event) => set("description", event.target.value)}
            />
            <StormTextarea
              label="Features"
              rows={6}
              hint="One per line. These become the bullet list on the pricing card."
              value={form.features}
              onChange={(event) => set("features", event.target.value)}
            />
          </div>
        </StormSection>

        <StormSection heading="What it costs">
          <div className="flex flex-col gap-7">
            <div className="grid gap-7 sm:grid-cols-2">
              <StormInput
                label="Price"
                required
                inputMode="decimal"
                hint="The total charged each billing cycle."
                value={form.price}
                error={errors.price}
                onChange={(event) => set("price", event.target.value)}
              />
              <StormSelect
                label="Currency"
                options={CURRENCY_OPTIONS}
                value={form.currency}
                onChange={(event) => set("currency", event.target.value)}
              />
            </div>
            <StormSelect
              label="Billing interval"
              options={INTERVAL_OPTIONS}
              value={form.billing_interval}
              onChange={(event) => set("billing_interval", event.target.value as BillingInterval)}
            />

            <div className="rounded-xl border border-mist bg-paper-lift p-5">
              <h3 className="storm-legend font-semibold text-ink">Stripe price ID</h3>
              <p className="storm-prose mt-2 text-rain">
                Stripe Prices are immutable. To change what a customer is charged, create a new
                Price in Stripe and paste its ID here — editing the number above changes only what
                this page displays, never what Stripe bills.
              </p>
              <div className="mt-5">
                <StormInput
                  label="Price ID"
                  placeholder="price_..."
                  value={form.stripe_price_id}
                  onChange={(event) => set("stripe_price_id", event.target.value)}
                />
              </div>
            </div>
          </div>
        </StormSection>

        <StormSection heading="Where it appears">
          <div className="flex flex-col gap-7">
            <StormInput
              label="Sort order"
              inputMode="numeric"
              hint="Lower numbers appear first on the pricing page."
              value={form.sort_order}
              onChange={(event) => set("sort_order", event.target.value)}
            />
            <StormCheckbox
              label="Show on the public pricing page"
              hint="Turn this off to retire a package without deleting it or breaking existing subscriptions."
              checked={form.is_active}
              onChange={(event) => set("is_active", event.target.checked)}
            />
          </div>
        </StormSection>

        <div className="flex flex-wrap gap-3 border-t border-mist pt-7">
          <StormButton type="submit" loading={saving}>
            {isNew ? "Create package" : "Save changes"}
          </StormButton>
          <Link href="/admin/packages">
            <StormButton type="button" variant="quiet">
              Cancel
            </StormButton>
          </Link>
        </div>
      </form>
    </div>
  );
}
