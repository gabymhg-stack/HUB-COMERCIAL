"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function NewTaskForm({ areas, types, devs, projects, people, currentUserId, defaultProjectId, defaultOpen }) {
  const router = useRouter();
  const [open, setOpen] = useState(!!defaultOpen);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    area_id: areas[0]?.id || "",
    type_id: types[0]?.id || "",
    dev_id: "",
    project_id: defaultProjectId || "",
    priority: "media",
    due_date: "",
    blocked_by_enrique: false,
    owners: currentUserId ? [currentUserId] : [],
  });

  function toggleOwner(id) {
    setForm((f) => ({
      ...f,
      owners: f.owners.includes(id) ? f.owners.filter((x) => x !== id) : [...f.owners, id],
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.area_id) {
      setError("Título y área son obligatorios.");
      return;
    }
    setSaving(true);
    setError("");
    const supabase = createClient();

    const { data: task, error: insertError } = await supabase
      .from("tasks")
      .insert({
        title: form.title.trim(),
        area_id: form.area_id,
        type_id: form.type_id || null,
        dev_id: form.dev_id || null,
        project_id: form.project_id || null,
        priority: form.priority,
        due_date: form.due_date || null,
        blocked_by_enrique: form.blocked_by_enrique,
        created_by: currentUserId,
      })
      .select()
      .single();

    if (insertError) {
      setSaving(false);
      setError(insertError.message);
      return;
    }

    if (form.owners.length) {
      const rows = form.owners.map((person_id) => ({ task_id: task.id, person_id }));
      const { error: ownersError } = await supabase.from("task_owners").insert(rows);
      if (ownersError) {
        setSaving(false);
        setError(ownersError.message);
        return;
      }
    }

    setSaving(false);
    setOpen(!!defaultOpen);
    setForm({
      title: "",
      area_id: areas[0]?.id || "",
      type_id: types[0]?.id || "",
      dev_id: "",
      project_id: defaultProjectId || "",
      priority: "media",
      due_date: "",
      blocked_by_enrique: false,
      owners: currentUserId ? [currentUserId] : [],
    });
    router.refresh();
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} style={btnPrimary}>
        + Nuevo pendiente
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border-strong)",
        borderRadius: 12,
        padding: 18,
        marginBottom: 18,
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <input
        placeholder="Título del pendiente"
        value={form.title}
        onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
        style={input}
        autoFocus
      />

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <select value={form.area_id} onChange={(e) => setForm((f) => ({ ...f, area_id: e.target.value }))} style={select}>
          {areas.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
        <select value={form.type_id} onChange={(e) => setForm((f) => ({ ...f, type_id: e.target.value }))} style={select}>
          {types.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        <select value={form.priority} onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))} style={select}>
          <option value="alta">Prioridad alta</option>
          <option value="media">Prioridad media</option>
          <option value="baja">Prioridad baja</option>
        </select>
        <input
          type="date"
          value={form.due_date}
          onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))}
          style={select}
        />
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <select value={form.dev_id} onChange={(e) => setForm((f) => ({ ...f, dev_id: e.target.value }))} style={select}>
          <option value="">Sin desarrollo</option>
          {devs.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
        <select value={form.project_id} onChange={(e) => setForm((f) => ({ ...f, project_id: e.target.value }))} style={select}>
          <option value="">Sin proyecto</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
          <input
            type="checkbox"
            checked={form.blocked_by_enrique}
            onChange={(e) => setForm((f) => ({ ...f, blocked_by_enrique: e.target.checked }))}
          />
          Parado por Enrique
        </label>
      </div>

      <div>
        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, color: "var(--ink-muted)" }}>
          Responsables
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {people.map((p) => (
            <label
              key={p.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                fontSize: 12.5,
                border: "1px solid var(--border)",
                borderRadius: 20,
                padding: "4px 10px",
                background: form.owners.includes(p.id) ? "var(--surface-2)" : "transparent",
              }}
            >
              <input type="checkbox" checked={form.owners.includes(p.id)} onChange={() => toggleOwner(p.id)} />
              {p.name}
            </label>
          ))}
        </div>
      </div>

      {error && <div style={{ color: "var(--danger)", fontSize: 12.5 }}>{error}</div>}

      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <button type="button" onClick={() => setOpen(false)} style={btnGhost} disabled={saving}>
          Cancelar
        </button>
        <button type="submit" style={btnPrimary} disabled={saving}>
          {saving ? "Guardando…" : "Crear pendiente"}
        </button>
      </div>
    </form>
  );
}

const btnPrimary = {
  background: "var(--accent)",
  color: "var(--accent-ink)",
  border: "none",
  borderRadius: 8,
  padding: "9px 16px",
  fontWeight: 700,
  fontSize: 13.5,
};
const btnGhost = {
  background: "var(--surface-2)",
  color: "var(--ink)",
  border: "1px solid var(--border-strong)",
  borderRadius: 8,
  padding: "9px 16px",
  fontWeight: 600,
  fontSize: 13.5,
};
const input = {
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid var(--border-strong)",
  background: "var(--surface-2)",
  color: "var(--ink)",
  fontSize: 14,
};
const select = { ...input, padding: "8px 10px", fontSize: 13 };
