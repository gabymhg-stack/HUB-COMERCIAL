"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Va debajo del nombre de cada columna en el Board — solo lo ven/editan
// Enrique y Gaby (el Board completo ya es admin-only). Click para
// escribir/editar la prioridad de la semana de esa persona; se guarda
// con upsert sobre weekly_priorities (una fila por persona, se
// sobreescribe cada vez — no es historial).
export default function PriorityEditor({ personId, currentUserId, initialText, updatedAt }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(initialText || "");
  const [saving, setSaving] = useState(false);

  async function save() {
    setEditing(false);
    const trimmed = text.trim();
    if (trimmed === (initialText || "").trim()) return;
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("weekly_priorities")
      .upsert(
        { person_id: personId, texto: trimmed, set_by: currentUserId, updated_at: new Date().toISOString() },
        { onConflict: "person_id" }
      );
    setSaving(false);
    if (error) {
      alert("No se pudo guardar la prioridad: " + error.message);
      setText(initialText || "");
      return;
    }
    router.refresh();
  }

  if (editing) {
    return (
      <div style={{ padding: "8px 14px", background: "var(--surface-2)", borderBottom: "1px solid var(--border)" }}>
        <textarea
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={save}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              e.currentTarget.blur();
            }
            if (e.key === "Escape") {
              setText(initialText || "");
              setEditing(false);
            }
          }}
          rows={2}
          placeholder="¿Cuál es su foco esta semana?"
          style={{
            width: "100%",
            fontSize: 12,
            fontWeight: 600,
            padding: "6px 8px",
            borderRadius: 6,
            border: "1px solid var(--border-strong)",
            background: "var(--surface)",
            color: "var(--ink)",
            resize: "vertical",
            fontFamily: "inherit",
          }}
        />
      </div>
    );
  }

  return (
    <div
      onClick={() => setEditing(true)}
      title="Click para editar la prioridad de la semana"
      style={{
        padding: "8px 14px",
        background: "var(--surface-2)",
        borderBottom: "1px solid var(--border)",
        cursor: "text",
        opacity: saving ? 0.6 : 1,
      }}
    >
      <div style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--ink-muted)", marginBottom: 2 }}>
        🎯 Prioridad de la semana
      </div>
      {text ? (
        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ink)", lineHeight: 1.35 }}>{text}</div>
      ) : (
        <div style={{ fontSize: 12, color: "var(--ink-muted)", fontStyle: "italic" }}>Click para asignar...</div>
      )}
    </div>
  );
}
