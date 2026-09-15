"use client";

import { useCallback, useEffect, useState } from "react";
import { StormButton } from "@/components/admin/StormButton";
import { StormPageHead } from "@/components/admin/StormLayout";
import { StormRoster, type StormColumn } from "@/components/admin/StormRoster";
import { StormFailure } from "@/components/admin/StormStates";
import { StormDialog } from "@/components/admin/StormDialog";
import { StormInput, StormTextarea, StormCheckbox } from "@/components/admin/StormField";
import { useToast } from "@/components/admin/StormToast";
import { adminProgrammesApi, ApiError } from "@/lib/api-client";
import type { Programme } from "@/lib/types";

interface FormState {
  name: string;
  slug: string;
  description: string;
  everfit_programme_id: string;
  is_active: boolean;
}

const EMPTY: FormState = {
  name: "",
  slug: "",
  description: "",
  everfit_programme_id: "",
  is_active: true,
};

export default function AdminProgrammesPage() {
  const { showToast } = useToast();
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Programme | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setProgrammes(await adminProgrammesApi.list());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "We couldn't load programmes right now.");
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

  function openEdit(programme: Programme) {
    setEditing(programme);
    setForm({
      name: programme.name,
      slug: programme.slug,
      description: programme.description ?? "",
      everfit_programme_id: programme.everfit_programme_id ?? "",
      is_active: programme.is_active,
    });
    setErrors({});
    setOpen(true);
  }

  async function handleSave() {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) next.name = "Give the programme a name.";
    if (!editing && !form.slug.trim()) next.slug = "A slug is required.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSaving(true);
    try {
      if (editing) {
        await adminProgrammesApi.update(editing.id, {
          name: form.name.trim(),
          description: form.description.trim(),
          everfit_programme_id: form.everfit_programme_id.trim(),
          is_active: form.is_active,
        });
        showToast("Programme saved.");
      } else {
        await adminProgrammesApi.create({
          name: form.name.trim(),
          slug: form.slug.trim(),
          description: form.description.trim(),
          everfit_programme_id: form.everfit_programme_id.trim(),
          is_active: form.is_active,
        });
        showToast("Programme created.");
      }
      setOpen(false);
      load();
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "We couldn't save this programme.", "error");
    } finally {
      setSaving(false);
    }
  }

  const columns: StormColumn<Programme>[] = [
    {
      key: "name",
      header: "Programme",
      mobile: "lead",
      sortValue: (row) => row.name.toLowerCase(),
      render: (row) => (
        <button
          type="button"
          onClick={() => openEdit(row)}
          className="text-left font-semibold text-ink underline decoration-mist underline-offset-4 transition-colors hover:decoration-ink"
        >
          {row.name}
        </button>
      ),
    },
    { key: "slug", header: "Slug", mobile: "meta", render: (row) => <span className="text-rain">{row.slug}</span> },
    {
      key: "everfit_programme_id",
      header: "Everfit ID",
      mobile: "meta",
      render: (row) =>
        row.everfit_programme_id ? (
          <span className="text-rain">{row.everfit_programme_id}</span>
        ) : (
          // Without this, provisioning fails for anyone the rules send here.
          <span className="storm-state storm-state--attention">Missing</span>
        ),
    },
    {
      key: "is_active",
      header: "Assignable",
      mobile: "trail",
      render: (row) => (
        <span className={row.is_active ? "storm-state storm-state--settled" : "storm-state storm-state--spent"}>
          {row.is_active ? "Yes" : "Retired"}
        </span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-9">
      <StormPageHead
        title="Programmes"
        line="The Everfit programmes the rules engine can assign a customer to."
        actions={<StormButton onClick={openCreate}>New programme</StormButton>}
      />

      {error ? (
        <StormFailure line={error} onRetry={load} />
      ) : (
        <StormRoster
          caption="Everfit programmes"
          columns={columns}
          rows={programmes}
          keyExtractor={(row) => row.id}
          loading={loading}
          emptyWord="None"
          emptyLine="No programmes yet. Assignment rules need at least one to point at."
          emptyAction={<StormButton variant="outline" onClick={openCreate}>New programme</StormButton>}
        />
      )}

      <StormDialog
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit programme" : "New programme"}
        description="A programme mirrors one training plan inside Everfit. The Everfit ID is what provisioning actually assigns."
        footer={
          <>
            <StormButton variant="quiet" onClick={() => setOpen(false)}>
              Cancel
            </StormButton>
            <StormButton loading={saving} onClick={handleSave}>
              {editing ? "Save programme" : "Create programme"}
            </StormButton>
          </>
        }
      >
        <StormInput
          label="Name"
          required
          value={form.name}
          error={errors.name}
          onChange={(event) => setForm((f) => ({ ...f, name: event.target.value }))}
        />
        <StormInput
          label="Slug"
          required={!editing}
          disabled={Boolean(editing)}
          hint={editing ? "Slugs are fixed once created." : "Lower case, hyphenated."}
          value={form.slug}
          error={errors.slug}
          onChange={(event) => setForm((f) => ({ ...f, slug: event.target.value }))}
        />
        <StormTextarea
          label="Description"
          rows={3}
          value={form.description}
          onChange={(event) => setForm((f) => ({ ...f, description: event.target.value }))}
        />
        <StormInput
          label="Everfit programme ID"
          hint="Provisioning fails for anyone assigned here while this is empty."
          value={form.everfit_programme_id}
          onChange={(event) =>
            setForm((f) => ({ ...f, everfit_programme_id: event.target.value }))
          }
        />
        <StormCheckbox
          label="Available to the rules engine"
          hint="Turn off to retire a programme without breaking customers already on it."
          checked={form.is_active}
          onChange={(event) => setForm((f) => ({ ...f, is_active: event.target.checked }))}
        />
      </StormDialog>
    </div>
  );
}
