"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { BRAINDUMP_TAGS } from "@/lib/braindump";

// "Pedirle algo a un compañero" — a diferencia del Board (solo admins),
// esto lo puede usar cualquiera. Crea un braindump_item con
// origen='solicitud', que le aparece al destinatario en su propio
// widget como "📨 Solicitud de [tu nombre]".
export default function NewSolicitudForm({ people, currentUserId }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [targetId, setTargetId] = useState("");
  const [tag, setTag] = useState("");
  const [fecha, setFecha] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const options = people.filter((p) => p.id !== currentUserId);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim() || !targetId) {
      setError("Escribe qué necesitas y a quién se lo pides.");
      return;
    }
    setSaving(true);
    setError("");
    const supabase = createClient();
    const { error: insertError } = await supabase.from("braindump_items").insert({
      texto: text.trim(),
      asignado_a: targetId,
      creado_por: currentUserId,
      origen: "solicitud",
      tag: tag || "",
      fecha_limite: fecha || null,
    });
    setSaving(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    setText("");
    setTargetId("");
    setTag("");
    setFecha("");
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} style={linkBtn}>
        + Pedirle algo a un compañero
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: "var(--surface-2)",
        border: "1px solid var(--border-strong)",
        borderRadius: 10,
        padding: 12,
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <select value={targetId} onChange={(e) => setTargetId(e.target.value)} style={miniInput}>
        <option value="">¿A quién se lo pides?</option>
        {options.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
      <input
        placeholder="¿Qué necesitas?"
        value={text}
        onChange={(e) => setText(e.target.value)}
        style={miniInput}
      />
      <div style={{ display: "flex", gap: 8 }}>
        <select value={tag} onChange={(e) => setTag(e.target.value)} style={{ ...miniInput, flex: 1 }}>
          <option value="">Sin tag</option>
          {BRAINDUMP_TAGS.map((t) => (
            <option key={t.key} value={t.key}>
              {t.label}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          style={{ ...miniInput, flex: 1 }}
        />
      </div>

      {error && <div style={{ color: "var(--danger)", fontSize: 11.5 }}>{error}</div>}

      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <button type="button" onClick={() => setOpen(false)} disabled={saving} style={btnGhost}>
          Cancelar
        </button>
        <button type="submit" disabled={saving} style={btnPrimary}>
          {saving ? "Enviando…" : "Enviar solicitud"}
        </button>
      </div>
    </form>
  );
}

const linkBtn = {
  border: "none",
  background: "none",
  color: "var(--accent)",
  fontSize: 12.5,
  fontWeight: 700,
  padding: 0,
};
const miniInput = {
  fontSize: 12.5,
  padding: "7px 9px",
  borderRadius: 7,
  border: "1px solid var(--border-strong)",
  background: "var(--surface)",
  color: "var(--ink)",
};
const btnPrimary = {
  background: "var(--accent)",
  color: "var(--accent-ink)",
  border: "none",
  borderRadius: 7,
  padding: "7px 12px",
  fontWeight: 700,
  fontSize: 12.5,
};
const btnGhost = {
  background: "var(--surface)",
  color: "var(--ink)",
  border: "1px solid var(--border-strong)",
  borderRadius: 7,
  padding: "7px 12px",
  fontWeight: 600,
  fontSize: 12.5,
};
