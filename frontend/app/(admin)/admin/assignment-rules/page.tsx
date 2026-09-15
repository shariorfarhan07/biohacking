"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { StormButton } from "@/components/admin/StormButton";
import { StormIcon } from "@/components/admin/StormIcon";
import { StormPageHead, StormSection } from "@/components/admin/StormLayout";
import { StormRoster, type StormColumn } from "@/components/admin/StormRoster";
import { StormFailure } from "@/components/admin/StormStates";
import { StormDialog, StormConfirmDialog } from "@/components/admin/StormDialog";
import { StormInput, StormSelect } from "@/components/admin/StormField";
import { useToast } from "@/components/admin/StormToast";
import { adminAssignmentRulesApi, adminProgrammesApi, ApiError } from "@/lib/api-client";
import { titleCase } from "@/lib/utils";
import type {
  AssignmentRule,
  AssignmentRuleCondition,
  AssignmentRuleTestResult,
  Programme,
  RuleOperator,
} from "@/lib/types";

/*
 * The engine's own vocabulary. Field names map 1:1 to the onboarding columns the
 * backend evaluates, so what is built here is exactly what runs.
 */
type FieldKind = "enum" | "number" | "list";

const FIELDS: {
  key: string;
  label: string;
  kind: FieldKind;
  choices?: { value: string; label: string }[];
}[] = [
  {
    key: "goal",
    label: "Goal",
    kind: "enum",
    choices: [
      { value: "fat_loss", label: "Fat loss" },
      { value: "muscle_building", label: "Muscle building" },
      { value: "recomposition", label: "Recomposition" },
      { value: "performance", label: "Performance" },
      { value: "general_health", label: "General health" },
    ],
  },
  {
    key: "training_location",
    label: "Training location",
    kind: "enum",
    choices: [
      { value: "gym", label: "Gym" },
      { value: "home", label: "Home" },
      { value: "hybrid", label: "Hybrid" },
    ],
  },
  { key: "training_days_per_week", label: "Training days per week", kind: "number" },
  {
    key: "training_experience",
    label: "Training experience",
    kind: "enum",
    choices: [
      { value: "beginner", label: "Beginner" },
      { value: "intermediate", label: "Intermediate" },
      { value: "advanced", label: "Advanced" },
    ],
  },
  { key: "age", label: "Age", kind: "number" },
  { key: "equipment", label: "Equipment", kind: "list" },
];

const OPERATORS: Record<FieldKind, { value: RuleOperator; label: string }[]> = {
  enum: [
    { value: "eq", label: "is" },
    { value: "ne", label: "is not" },
    { value: "in", label: "is one of" },
    { value: "not_in", label: "is none of" },
  ],
  number: [
    { value: "eq", label: "equals" },
    { value: "ne", label: "does not equal" },
    { value: "in", label: "is one of" },
    { value: "gte", label: "is at least" },
    { value: "lte", label: "is at most" },
    { value: "gt", label: "is more than" },
    { value: "lt", label: "is less than" },
    { value: "between", label: "is between" },
  ],
  list: [{ value: "contains", label: "includes" }],
};

interface DraftCondition {
  field: string;
  op: RuleOperator;
  value: string;
  valueTo: string;
}

const BLANK_CONDITION: DraftCondition = {
  field: "goal",
  op: "eq",
  value: "fat_loss",
  valueTo: "",
};

function fieldKind(key: string): FieldKind {
  return FIELDS.find((f) => f.key === key)?.kind ?? "enum";
}

/** Draft rows -> the engine's predicate tree. */
function toConditions(match: "all" | "any", rows: DraftCondition[]) {
  const leaves: AssignmentRuleCondition[] = rows.map((row) => {
    const kind = fieldKind(row.field);
    let value: AssignmentRuleCondition["value"];
    if (row.op === "between") {
      value = [Number(row.value), Number(row.valueTo)];
    } else if (row.op === "in" || row.op === "not_in") {
      value = row.value
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean)
        .map((part) => (kind === "number" ? Number(part) : part));
    } else if (kind === "number") {
      value = Number(row.value);
    } else {
      value = row.value;
    }
    return { field: row.field, op: row.op, value };
  });
  return match === "all" ? { all: leaves } : { any: leaves };
}

/** Predicate tree -> draft rows, for editing an existing rule. */
function fromConditions(conditions: AssignmentRule["conditions"]) {
  const match: "all" | "any" = "any" in conditions ? "any" : "all";
  const leaves = ("all" in conditions ? conditions.all : conditions.any) ?? [];
  const rows: DraftCondition[] = leaves.map((leaf) => ({
    field: leaf.field,
    op: leaf.op,
    value: Array.isArray(leaf.value)
      ? leaf.op === "between"
        ? String(leaf.value[0] ?? "")
        : leaf.value.join(", ")
      : String(leaf.value ?? ""),
    valueTo: Array.isArray(leaf.value) && leaf.op === "between" ? String(leaf.value[1] ?? "") : "",
  }));
  return { match, rows: rows.length > 0 ? rows : [BLANK_CONDITION] };
}

function describe(conditions: AssignmentRule["conditions"]) {
  const joiner = "any" in conditions ? " or " : " and ";
  const leaves = ("all" in conditions ? conditions.all : conditions.any) ?? [];
  if (leaves.length === 0) return "No conditions";
  return leaves
    .map((leaf) => {
      const field = FIELDS.find((f) => f.key === leaf.field);
      const kind = field?.kind ?? "enum";
      const opLabel =
        OPERATORS[kind].find((o) => o.value === leaf.op)?.label ?? leaf.op;
      const value = Array.isArray(leaf.value)
        ? leaf.op === "between"
          ? `${leaf.value[0]}–${leaf.value[1]}`
          : leaf.value.map((v) => titleCase(String(v))).join(", ")
        : titleCase(String(leaf.value));
      return `${field?.label ?? leaf.field} ${opLabel} ${value}`;
    })
    .join(joiner);
}

export default function AdminAssignmentRulesPage() {
  const { showToast } = useToast();
  const [rules, setRules] = useState<AssignmentRule[]>([]);
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AssignmentRule | null>(null);
  const [name, setName] = useState("");
  const [priority, setPriority] = useState("100");
  const [match, setMatch] = useState<"all" | "any">("all");
  const [rows, setRows] = useState<DraftCondition[]>([BLANK_CONDITION]);
  const [programmeId, setProgrammeId] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [retiring, setRetiring] = useState<AssignmentRule | null>(null);
  const [retireBusy, setRetireBusy] = useState(false);

  const [sample, setSample] = useState<Record<string, string>>({
    goal: "fat_loss",
    training_location: "home",
    training_days_per_week: "3",
  });
  const [testResult, setTestResult] = useState<AssignmentRuleTestResult | null>(null);
  const [testing, setTesting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [ruleList, programmeList] = await Promise.all([
        adminAssignmentRulesApi.list(),
        adminProgrammesApi.list().catch(() => [] as Programme[]),
      ]);
      setRules(ruleList);
      setProgrammes(programmeList);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "We couldn't load the rules right now.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const programmeName = useMemo(() => {
    const map = new Map(programmes.map((p) => [p.id, p.name]));
    return (id: string) => map.get(id) ?? "Unknown programme";
  }, [programmes]);

  function openCreate() {
    setEditing(null);
    setName("");
    setPriority("100");
    setMatch("all");
    setRows([BLANK_CONDITION]);
    setProgrammeId(programmes[0]?.id ?? "");
    setFormError(null);
    setOpen(true);
  }

  function openEdit(rule: AssignmentRule) {
    const parsed = fromConditions(rule.conditions);
    setEditing(rule);
    setName(rule.name);
    setPriority(String(rule.priority));
    setMatch(parsed.match);
    setRows(parsed.rows);
    setProgrammeId(rule.programme_id);
    setFormError(null);
    setOpen(true);
  }

  function updateRow(index: number, patch: Partial<DraftCondition>) {
    setRows((current) =>
      current.map((row, i) => {
        if (i !== index) return row;
        const next = { ...row, ...patch };
        if (patch.field && patch.field !== row.field) {
          const kind = fieldKind(patch.field);
          next.op = OPERATORS[kind][0].value;
          const field = FIELDS.find((f) => f.key === patch.field);
          next.value = field?.choices?.[0]?.value ?? "";
          next.valueTo = "";
        }
        return next;
      })
    );
  }

  async function handleSave() {
    if (!name.trim()) {
      setFormError("Give the rule a name so the next person knows what it is for.");
      return;
    }
    if (!programmeId) {
      setFormError("Pick the programme this rule assigns.");
      return;
    }
    if (rows.some((row) => row.value === "" || (row.op === "between" && row.valueTo === ""))) {
      setFormError("Every condition needs a value.");
      return;
    }

    setFormError(null);
    setSaving(true);
    const payload = {
      name: name.trim(),
      priority: Number(priority) || 100,
      conditions: toConditions(match, rows),
      programme_id: programmeId,
      is_active: true,
    };
    try {
      if (editing) {
        await adminAssignmentRulesApi.update(editing.id, payload);
        showToast("Rule saved.");
      } else {
        await adminAssignmentRulesApi.create(payload);
        showToast("Rule created.");
      }
      setOpen(false);
      load();
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "We couldn't save this rule.", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleRetire() {
    if (!retiring) return;
    setRetireBusy(true);
    try {
      await adminAssignmentRulesApi.remove(retiring.id);
      showToast("Rule retired.");
      setRetiring(null);
      load();
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "We couldn't retire this rule.", "error");
    } finally {
      setRetireBusy(false);
    }
  }

  async function handleTest() {
    setTesting(true);
    setTestResult(null);
    try {
      const answers: Record<string, unknown> = {};
      Object.entries(sample).forEach(([key, value]) => {
        if (value === "") return;
        answers[key] = fieldKind(key) === "number" ? Number(value) : value;
      });
      setTestResult(await adminAssignmentRulesApi.test({ answers }));
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "The dry run failed.", "error");
    } finally {
      setTesting(false);
    }
  }

  const columns: StormColumn<AssignmentRule>[] = [
    {
      key: "priority",
      header: "Order",
      width: "5rem",
      mobile: "meta",
      sortValue: (row) => row.priority,
      render: (row) => <span className="tnum font-semibold text-ink">{row.priority}</span>,
    },
    {
      key: "name",
      header: "Rule",
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
    {
      key: "conditions",
      header: "When",
      mobile: "meta",
      render: (row) => <span className="text-rain">{describe(row.conditions)}</span>,
    },
    {
      key: "programme_id",
      header: "Assigns",
      mobile: "meta",
      render: (row) => programmeName(row.programme_id),
    },
    {
      key: "is_active",
      header: "State",
      mobile: "trail",
      render: (row) => (
        <span className={row.is_active ? "storm-state storm-state--settled" : "storm-state storm-state--spent"}>
          {row.is_active ? "Live" : "Retired"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      mobile: "hide",
      render: (row) =>
        row.is_active ? (
          <button
            type="button"
            onClick={() => setRetiring(row)}
            className="storm-legend text-rain underline decoration-mist underline-offset-4 transition-colors hover:text-signal hover:decoration-signal"
          >
            Retire
          </button>
        ) : null,
    },
  ];

  return (
    <div className="flex flex-col gap-12">
      <StormPageHead
        title="Rules"
        line="Onboarding answers run down this list in order. The first rule that matches assigns the programme."
        actions={<StormButton onClick={openCreate}>New rule</StormButton>}
      />

      {error ? (
        <StormFailure line={error} onRetry={load} />
      ) : (
        <StormRoster
          caption="Programme assignment rules"
          columns={columns}
          rows={rules}
          keyExtractor={(row) => row.id}
          loading={loading}
          emptyWord="None"
          emptyLine="No rules yet. Until one exists, every customer falls through to the default programme."
          emptyAction={<StormButton variant="outline" onClick={openCreate}>New rule</StormButton>}
        />
      )}

      {/* Dry run: check a change before it touches real customers. */}
      <StormSection heading="Dry run">
        <p className="storm-prose text-rain">
          Try a set of answers against the live rules. Nothing is saved and no customer is touched.
        </p>
        <div className="mt-6 grid gap-7 sm:grid-cols-3">
          {FIELDS.filter((f) => f.kind !== "list").map((field) => (
            <div key={field.key}>
              {field.choices ? (
                <StormSelect
                  label={field.label}
                  placeholder="Any"
                  options={field.choices}
                  value={sample[field.key] ?? ""}
                  onChange={(event) =>
                    setSample((s) => ({ ...s, [field.key]: event.target.value }))
                  }
                />
              ) : (
                <StormInput
                  label={field.label}
                  inputMode="numeric"
                  placeholder="Any"
                  value={sample[field.key] ?? ""}
                  onChange={(event) =>
                    setSample((s) => ({ ...s, [field.key]: event.target.value }))
                  }
                />
              )}
            </div>
          ))}
        </div>
        <div className="mt-7 flex flex-wrap items-center gap-5">
          <StormButton variant="outline" loading={testing} onClick={handleTest}>
            Run it
          </StormButton>
          {testResult && (
            <p className="storm-data text-ink">
              {testResult.used_default_fallback ? (
                <>
                  No rule matched. Falls back to{" "}
                  <span className="font-semibold">
                    {testResult.programme?.name ?? "the default programme"}
                  </span>
                  .
                </>
              ) : (
                <>
                  Matched <span className="font-semibold">{testResult.matched_rule_name}</span>{" "}
                  &rarr; assigns{" "}
                  <span className="font-semibold">{testResult.programme?.name}</span>.
                </>
              )}
            </p>
          )}
        </div>
      </StormSection>

      <StormDialog
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit rule" : "New rule"}
        description="Rules are evaluated from the lowest order number upwards. The first full match wins."
        className="sm:max-w-2xl"
        footer={
          <>
            <StormButton variant="quiet" onClick={() => setOpen(false)}>
              Cancel
            </StormButton>
            <StormButton loading={saving} onClick={handleSave}>
              {editing ? "Save rule" : "Create rule"}
            </StormButton>
          </>
        }
      >
        <div className="grid gap-7 sm:grid-cols-[1fr_8rem]">
          <StormInput
            label="Name"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <StormInput
            label="Order"
            inputMode="numeric"
            hint="Lower runs first."
            value={priority}
            onChange={(event) => setPriority(event.target.value)}
          />
        </div>

        <div>
          <div className="flex items-center justify-between gap-4 border-b border-mist pb-2">
            <h3 className="storm-legend text-ink">Conditions</h3>
            <StormSelect
              aria-label="Match mode"
              options={[
                { value: "all", label: "Match all" },
                { value: "any", label: "Match any" },
              ]}
              value={match}
              onChange={(event) => setMatch(event.target.value as "all" | "any")}
            />
          </div>

          <div className="flex flex-col gap-5 pt-5">
            {rows.map((row, index) => {
              const kind = fieldKind(row.field);
              const field = FIELDS.find((f) => f.key === row.field);
              const needsList = row.op === "in" || row.op === "not_in";
              return (
                <div key={index} className="flex flex-col gap-3 border-b border-mist pb-5">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <StormSelect
                      aria-label="Field"
                      options={FIELDS.map((f) => ({ value: f.key, label: f.label }))}
                      value={row.field}
                      onChange={(event) => updateRow(index, { field: event.target.value })}
                    />
                    <StormSelect
                      aria-label="Operator"
                      options={OPERATORS[kind]}
                      value={row.op}
                      onChange={(event) =>
                        updateRow(index, { op: event.target.value as RuleOperator })
                      }
                    />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {field?.choices && !needsList ? (
                      <StormSelect
                        aria-label="Value"
                        options={field.choices}
                        value={row.value}
                        onChange={(event) => updateRow(index, { value: event.target.value })}
                      />
                    ) : (
                      <StormInput
                        aria-label="Value"
                        placeholder={needsList ? "Comma separated" : "Value"}
                        value={row.value}
                        onChange={(event) => updateRow(index, { value: event.target.value })}
                      />
                    )}
                    {row.op === "between" && (
                      <StormInput
                        aria-label="Upper value"
                        placeholder="Upper bound"
                        value={row.valueTo}
                        onChange={(event) => updateRow(index, { valueTo: event.target.value })}
                      />
                    )}
                  </div>
                  {rows.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setRows((current) => current.filter((_, i) => i !== index))}
                      className="storm-legend self-start text-rain transition-colors hover:text-signal"
                    >
                      Remove condition
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setRows((current) => [...current, { ...BLANK_CONDITION }])}
            className="storm-legend mt-4 inline-flex items-center gap-1.5 text-rain transition-colors hover:text-ink"
          >
            <StormIcon name="plus" size={13} />
            Add condition
          </button>
        </div>

        <StormSelect
          label="Assign this programme"
          required
          placeholder="Select a programme"
          options={programmes.map((p) => ({ value: p.id, label: p.name }))}
          value={programmeId}
          onChange={(event) => setProgrammeId(event.target.value)}
        />

        {formError && (
          <p role="alert" className="storm-data rounded-lg bg-signal-soft px-3 py-2.5 text-signal">
            {formError}
          </p>
        )}
      </StormDialog>

      <StormConfirmDialog
        open={Boolean(retiring)}
        onClose={() => setRetiring(null)}
        onConfirm={handleRetire}
        title={`Retire ${retiring?.name ?? "rule"}?`}
        description="The rule stops being evaluated for new customers. Anyone already assigned by it keeps their programme."
        confirmLabel="Retire rule"
        destructive
        loading={retireBusy}
      />
    </div>
  );
}
