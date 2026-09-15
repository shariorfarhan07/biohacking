"use client";

import { useCallback, useEffect, useState } from "react";
import { StormButton } from "@/components/admin/StormButton";
import { StormPageHead } from "@/components/admin/StormLayout";
import { StormRoster, type StormColumn } from "@/components/admin/StormRoster";
import { StormFailure } from "@/components/admin/StormStates";
import { StormDialog } from "@/components/admin/StormDialog";
import { StormInput, StormSelect, StormCheckbox } from "@/components/admin/StormField";
import { useToast } from "@/components/admin/StormToast";
import { adminDiscountCodesApi, ApiError } from "@/lib/api-client";
import { formatDate } from "@/lib/utils";
import type { DiscountCode } from "@/lib/types";

type DiscountKind = "percent" | "amount";

interface FormState {
  code: string;
  kind: DiscountKind;
  percent_off: string;
  amount_off: string;
  expires_at: string;
  max_redemptions: string;
  is_active: boolean;
}

const EMPTY: FormState = {
  code: "",
  kind: "percent",
  percent_off: "",
  amount_off: "",
  expires_at: "",
  max_redemptions: "",
  is_active: true,
};

export default function AdminDiscountCodesPage() {
  const { showToast } = useToast();
  const [codes, setCodes] = useState<DiscountCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<DiscountCode | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setCodes(await adminDiscountCodesApi.list());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "We couldn't load discount codes.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY);
    setErrors({});
    setOpen(true);
  }

  function openEdit(code: DiscountCode) {
    setEditing(code);
    setForm({
      code: code.code,
      kind: code.amount_off_cents != null ? "amount" : "percent",
      percent_off: code.percent_off != null ? String(code.percent_off) : "",
      amount_off: code.amount_off_cents != null ? (code.amount_off_cents / 100).toFixed(2) : "",
      expires_at: code.expires_at ? code.expires_at.slice(0, 10) : "",
      max_redemptions: code.max_redemptions != null ? String(code.max_redemptions) : "",
      is_active: code.is_active,
    });
    setErrors({});
    setOpen(true);
  }

  async function handleSave() {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!editing && !form.code.trim()) next.code = "Enter the code customers will type.";
    if (form.kind === "percent") {
      const value = Number(form.percent_off);
      if (!form.percent_off.trim() || Number.isNaN(value) || value <= 0 || value > 100) {
        next.percent_off = "Enter a percentage between 1 and 100.";
      }
    } else {
      const value = Number(form.amount_off);
      if (!form.amount_off.trim() || Number.isNaN(value) || value <= 0) {
        next.amount_off = "Enter an amount greater than zero.";
      }
    }
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const payload: Partial<DiscountCode> = {
      percent_off: form.kind === "percent" ? Number(form.percent_off) : null,
      amount_off_cents: form.kind === "amount" ? Math.round(Number(form.amount_off) * 100) : null,
      expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
      max_redemptions: form.max_redemptions ? Number(form.max_redemptions) : null,
      is_active: form.is_active,
    };

    setSaving(true);
    try {
      if (editing) {
        await adminDiscountCodesApi.update(editing.id, payload);
        showToast("Discount code saved.");
      } else {
        await adminDiscountCodesApi.create({ ...payload, code: form.code.trim().toUpperCase() });
        showToast("Discount code created.");
      }
      setOpen(false);
      load();
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "We couldn't save this code.", "error");
    } finally {
      setSaving(false);
    }
  }

  const columns: StormColumn<DiscountCode>[] = [
    {
      key: "code",
      header: "Code",
      mobile: "lead",
      sortValue: (row) => row.code,
      render: (row) => (
        <button
          type="button"
          onClick={() => openEdit(row)}
          className="text-left font-semibold uppercase tracking-[0.08em] text-ink underline decoration-mist underline-offset-4 transition-colors hover:decoration-ink"
        >
          {row.code}
        </button>
      ),
    },
    {
      key: "value",
      header: "Discount",
      mobile: "meta",
      render: (row) =>
        row.percent_off != null ? (
          <span className="tnum">{row.percent_off}% off</span>
        ) : row.amount_off_cents != null ? (
          <span className="tnum">{(row.amount_off_cents / 100).toFixed(2)} off</span>
        ) : (
          <span className="text-rain">Not set</span>
        ),
    },
    {
      key: "max_redemptions",
      header: "Limit",
      align: "right",
      mobile: "meta",
      render: (row) =>
        row.max_redemptions != null ? (
          <span className="tnum">{row.max_redemptions}</span>
        ) : (
          <span className="text-rain">Unlimited</span>
        ),
    },
    {
      key: "expires_at",
      header: "Expires",
      align: "right",
      mobile: "meta",
      sortValue: (row) => row.expires_at ?? "9999",
      render: (row) =>
        row.expires_at ? (
          <span className="tnum text-rain">{formatDate(row.expires_at)}</span>
        ) : (
          <span className="text-rain">Never</span>
        ),
    },
    {
      key: "is_active",
      header: "Status",
      mobile: "trail",
      render: (row) => (
        <span className={row.is_active ? "storm-state storm-state--settled" : "storm-state storm-state--spent"}>
          {row.is_active ? "Live" : "Off"}
        </span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-9">
      <StormPageHead
        title="Discounts"
        line="Codes customers can enter at checkout."
        actions={<StormButton onClick={openCreate}>New code</StormButton>}
      />

      {error ? (
        <StormFailure line={error} onRetry={load} />
      ) : (
        <StormRoster
          caption="Discount codes"
          columns={columns}
          rows={codes}
          keyExtractor={(row) => row.id}
          loading={loading}
          emptyWord="None"
          emptyLine="No discount codes exist. Checkout accepts none until you create one."
          emptyAction={<StormButton variant="outline" onClick={openCreate}>New code</StormButton>}
        />
      )}

      <StormDialog
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? `Edit ${editing.code}` : "New discount code"}
        footer={
          <>
            <StormButton variant="quiet" onClick={() => setOpen(false)}>
              Cancel
            </StormButton>
            <StormButton loading={saving} onClick={handleSave}>
              {editing ? "Save code" : "Create code"}
            </StormButton>
          </>
        }
      >
        <StormInput
          label="Code"
          required={!editing}
          disabled={Boolean(editing)}
          hint={editing ? "Codes cannot be renamed." : "Stored and matched in upper case."}
          value={form.code}
          error={errors.code}
          onChange={(event) => setForm((f) => ({ ...f, code: event.target.value }))}
        />
        <StormSelect
          label="Discount type"
          options={[
            { value: "percent", label: "Percentage off" },
            { value: "amount", label: "Fixed amount off" },
          ]}
          value={form.kind}
          onChange={(event) => setForm((f) => ({ ...f, kind: event.target.value as DiscountKind }))}
        />
        {form.kind === "percent" ? (
          <StormInput
            label="Percent off"
            required
            inputMode="numeric"
            value={form.percent_off}
            error={errors.percent_off}
            onChange={(event) => setForm((f) => ({ ...f, percent_off: event.target.value }))}
          />
        ) : (
          <StormInput
            label="Amount off"
            required
            inputMode="decimal"
            hint="In the package's own currency."
            value={form.amount_off}
            error={errors.amount_off}
            onChange={(event) => setForm((f) => ({ ...f, amount_off: event.target.value }))}
          />
        )}
        <StormInput
          label="Expires on"
          type="date"
          hint="Leave empty for a code that never expires."
          value={form.expires_at}
          onChange={(event) => setForm((f) => ({ ...f, expires_at: event.target.value }))}
        />
        <StormInput
          label="Maximum redemptions"
          inputMode="numeric"
          hint="Leave empty for unlimited."
          value={form.max_redemptions}
          onChange={(event) => setForm((f) => ({ ...f, max_redemptions: event.target.value }))}
        />
        <StormCheckbox
          label="Accept this code at checkout"
          checked={form.is_active}
          onChange={(event) => setForm((f) => ({ ...f, is_active: event.target.checked }))}
        />
      </StormDialog>
    </div>
  );
}
