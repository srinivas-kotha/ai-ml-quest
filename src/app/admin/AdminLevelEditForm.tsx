"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const GAME_TYPES = [
  "SpeedQuiz",
  "PipelineBuilder",
  "CodeDebugger",
  "ConceptMatcher",
  "ParameterTuner",
  "DiagnosisLab",
  "CostOptimizer",
  "ArchitectureBattle",
];

interface Chapter {
  id: number;
  title: string;
}

interface Level {
  id: number;
  chapterId: number | null;
  slug: string;
  levelNumber: number;
  title: string;
  gameType: string;
  xpReward: number | null;
  isPublished: boolean | null;
}

interface Props {
  level: Level;
  chapters: Chapter[];
}

export default function AdminLevelEditForm({ level, chapters }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    title: level.title,
    subtitle: "",
    hook: "",
    key_insight: "",
    xp_reward: String(level.xpReward ?? 100),
    is_published: level.isPublished ? "true" : "false",
    chapter_id: String(level.chapterId ?? ""),
    game_type: level.gameType,
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch(`/api/admin/levels/${level.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          subtitle: form.subtitle || null,
          hook: form.hook || null,
          key_insight: form.key_insight || null,
          xp_reward: parseInt(form.xp_reward, 10),
          is_published: form.is_published === "true",
          game_type: form.game_type,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Save failed");
      }

      setSuccess(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-md p-5 space-y-4"
      style={{
        backgroundColor: "var(--surface)",
        border: "1px solid var(--border)",
      }}
    >
      <h3
        className="text-base font-semibold"
        style={{ color: "var(--text-primary)" }}
      >
        Edit Level: {level.title}
      </h3>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Title">
          <Input
            name="title"
            value={form.title}
            onChange={handleChange}
            required
          />
        </Field>

        <Field label="Subtitle">
          <Input
            name="subtitle"
            value={form.subtitle}
            onChange={handleChange}
          />
        </Field>

        <Field label="Game Type">
          <select
            name="game_type"
            value={form.game_type}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded text-sm"
            style={{
              backgroundColor: "var(--card)",
              border: "1px solid var(--border)",
              color: "var(--text-primary)",
            }}
          >
            {GAME_TYPES.map((gt) => (
              <option key={gt} value={gt}>
                {gt}
              </option>
            ))}
          </select>
        </Field>

        <Field label="XP Reward">
          <Input
            name="xp_reward"
            type="number"
            value={form.xp_reward}
            onChange={handleChange}
            required
          />
        </Field>

        <Field label="Published">
          <select
            name="is_published"
            value={form.is_published}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded text-sm"
            style={{
              backgroundColor: "var(--card)",
              border: "1px solid var(--border)",
              color: "var(--text-primary)",
            }}
          >
            <option value="false">Draft</option>
            <option value="true">Published</option>
          </select>
        </Field>

        <Field label="Chapter">
          <select
            name="chapter_id"
            value={form.chapter_id}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded text-sm"
            style={{
              backgroundColor: "var(--card)",
              border: "1px solid var(--border)",
              color: "var(--text-primary)",
            }}
          >
            <option value="">— Select —</option>
            {chapters.map((ch) => (
              <option key={ch.id} value={String(ch.id)}>
                {ch.title}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Hook (enterprise pain point)">
        <textarea
          name="hook"
          value={form.hook}
          onChange={handleChange}
          rows={2}
          className="w-full px-3 py-2 rounded text-sm resize-none"
          style={{
            backgroundColor: "var(--card)",
            border: "1px solid var(--border)",
            color: "var(--text-primary)",
          }}
        />
      </Field>

      <Field label="Key Insight (interview-ready takeaway)">
        <Input
          name="key_insight"
          value={form.key_insight}
          onChange={handleChange}
        />
      </Field>

      {error && (
        <p className="text-xs" style={{ color: "var(--error)" }}>
          {error}
        </p>
      )}
      {success && (
        <p className="text-xs" style={{ color: "#10b981" }}>
          Saved successfully.
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="text-sm px-4 py-1.5 rounded font-medium disabled:opacity-50"
        style={{ backgroundColor: "var(--rag)", color: "#fff" }}
      >
        {saving ? "Saving…" : "Save Changes"}
      </button>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label
        className="text-xs font-medium"
        style={{ color: "var(--text-muted)" }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function Input({
  name,
  value,
  onChange,
  required,
  type = "text",
}: {
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  type?: string;
}) {
  return (
    <input
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      required={required}
      className="w-full px-3 py-2 rounded text-sm"
      style={{
        backgroundColor: "var(--card)",
        border: "1px solid var(--border)",
        color: "var(--text-primary)",
      }}
    />
  );
}
