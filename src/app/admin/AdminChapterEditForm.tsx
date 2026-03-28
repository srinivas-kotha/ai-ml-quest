"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Chapter {
  id: number;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  sortOrder: number;
  isPublished: boolean | null;
}

interface Props {
  chapter: Chapter;
}

export default function AdminChapterEditForm({ chapter }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    title: chapter.title,
    subtitle: chapter.subtitle ?? "",
    description: chapter.description ?? "",
    sort_order: String(chapter.sortOrder),
    is_published: chapter.isPublished ? "true" : "false",
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
      const res = await fetch(`/api/admin/chapters/${chapter.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          subtitle: form.subtitle || null,
          description: form.description || null,
          sort_order: parseInt(form.sort_order, 10),
          is_published: form.is_published === "true",
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
        Edit Chapter: {chapter.title}
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

        <Field label="Sort Order">
          <Input
            name="sort_order"
            type="number"
            value={form.sort_order}
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
      </div>

      <Field label="Description">
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={3}
          className="w-full px-3 py-2 rounded text-sm resize-none"
          style={{
            backgroundColor: "var(--card)",
            border: "1px solid var(--border)",
            color: "var(--text-primary)",
          }}
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

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="text-sm px-4 py-1.5 rounded font-medium disabled:opacity-50"
          style={{ backgroundColor: "var(--rag)", color: "#fff" }}
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>
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
