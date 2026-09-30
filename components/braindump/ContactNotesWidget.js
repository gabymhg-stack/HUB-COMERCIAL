"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { widgetCard, widgetTitle } from "../widgets/CalendarWidget";

// Columna libre solo para Enrique/Gaby (la página de Braindump entera ya
// es admin-only): un cuadro por contacto externo (Javier, Jorge) para
// anotar qué pendientes hay que revisar con cada uno la próxima vez que
// se hable con ellos. No son personas del equipo (no tienen cuenta en
// el HUB), así que viven en su propia tabla — no en profiles/Braindump.
export default function ContactNotesWidget({ notes, currentUserId }) {
  const byContact = Object.fromEntries((notes || []).map((n) => [n.contacto, n]));

  return (
    <div style={widgetCard}>
      <div style={widgetTitle}>🗒️ Revisar con</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <ContactNoteBox contacto="Javier" note={byContact.Javier} currentUserId={currentUserId} />
        <ContactNoteBox contacto="Jorge" note={byContact.Jorge} currentUserId={currentUserId} />
      </div>
    </div>
  );
}

function ContactNoteBox({ contacto, note, currentUserId }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(note?.texto || "");
  const [saving, setSaving] = useState(false);
  const initialText = note?.texto || "";

  async function save() {
    setEditing(false);
    const trimmed = text.trim();
    if (trimmed === initialText.trim()) return;
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("contact_notes")
      .upsert(
        { contacto, texto: trimmed, set_by: currentUserId, updated_at: new Date().toISOString() },
        { onConflict: "contacto" }
      );
    setSaving(false);
    if (error) {
      alert("No se pudo guardar: " + error.message);
      setText(initialText);
      return;
    }
    router.refresh();
  }

  return (
    <div
      style={{
        border: "1px solid var(--border)",
        borderRadius: 9,
        padding: "9px 11px",
        opacity: saving ? 0.6 : 1,
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 800, color: "var(--ink)", marginBottom: 4 }}>{contacto}</div>

      {editing ? (
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
              setText(initialText);
              setEditing(false);
            }
          }}
          rows={3}
          placeholder="¿Qué hay que revisar con él?"
          style={{
            width: "100%",
            fontSize: 12,
            fontWeight: 500,
            padding: "6px 8px",
            borderRadius: 6,
            border: "1px solid var(--border-strong)",
            background: "var(--surface-2)",
            color: "var(--ink)",
            resize: "vertical",
            fontFamily: "inherit",
          }}
        />
      ) : (
        <div
          onClick={() => setEditing(true)}
          title="Click para editar"
          style={{
            fontSize: 12,
            lineHeight: 1.4,
            color: text ? "var(--ink-2)" : "var(--ink-muted)",
            fontStyle: text ? "normal" : "italic",
            cursor: "text",
            whiteSpace: "pre-wrap",
          }}
        >
          {text || "Click para anotar..."}
        </div>
      )}
    </div>
  );
}
