"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function NewProjectForm({ devs, currentUserId }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [devId, setDevId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Ponle un nombre al proyecto.");
      return;
    }
    setSaving(true);
    setError("");
    const supabase = createClient();
    const { error: insertError } = await supabase.from("projects").insert({
      name: name.trim(),
      dev_id: devId || null,
      owner_id: currentUserId,
    });
    setSaving(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    setName("");
    setDevId("");
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} style={btnPrimary}>
        + Nuevo proyecto
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
        padding: 16,
        marginBottom: 18,
        display: "flex",
        gap: 10,
        flexWrap: "wrap",
        alignItems: "center",
      }}
    >
      <input
        placeholder="Nombre del proyecto"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ ...input, flex: 1, minWidth: 200 }}
        autoFocus
      />
      <select value={devId} onChange={(e) => setDevId(e.target.value)} style={input}>
        <option value="">Sin desarrollo</option>
        {devs.map((d) => (
          <option key={d.id} value={d.id}>
            {d.name}
          </option>
        ))}
      </select>
      {error && <div style={{ color: "var(--danger)", fontSize: 12.5, width: "100%" }}>{error}</div>}
      <div style={{ display: "flex", gap: 8, marginLeft: "auto" }}>
        <button type="button" onClick={() => setOpen(false)} style={btnGhost} disabled={saving}>
          Cancelar
        </button>
        <button type="submit" style={btnPrimary} disabled={saving}>
          {saving ? "Creando…" : "Crear proyecto"}
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
  padding: "9px 11px",
  borderRadius: 8,
  border: "1px solid var(--border-strong)",
  background: "var(--surface-2)",
  color: "var(--ink)",
  fontSize: 13.5,
};
