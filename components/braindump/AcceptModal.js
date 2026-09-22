"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { pickDefaultAreaAndType } from "@/lib/braindump";
import { todayISO } from "@/lib/data";

// Modal para aceptar un item del Braindump: pide fecha compromiso
// (obligatoria) y, al confirmar, crea la tarea real en el HUB del
// usuario vinculada al item (braindump_item_id) — Braindump y HUB
// quedan como dos vistas del mismo pendiente, no dos registros.
export default function AcceptModal({ item, areas, types, currentUserId, onClose }) {
  const router = useRouter();
  const [date, setDate] = useState(item.fecha_limite || todayISO());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleConfirm() {
    if (!date) {
      setError("La fecha compromiso es obligatoria.");
      return;
    }
    setSaving(true);
    setError("");
    const supabase = createClient();
    const nowISO = new Date().toISOString();

    const { error: itemError } = await supabase
      .from("braindump_items")
      .update({ estado: "aceptado", fecha_compromiso: date, aceptado_at: nowISO })
      .eq("id", item.id);
    if (itemError) {
      setSaving(false);
      setError(itemError.message);
      return;
    }

    const { area, type } = pickDefaultAreaAndType(areas, types);
    const { data: task, error: taskError } = await supabase
      .from("tasks")
      .insert({
        title: item.texto,
        area_id: area?.id,
        type_id: type?.id || null,
        priority: "media",
        due_date: date,
        created_by: currentUserId,
        braindump_item_id: item.id,
      })
      .select()
      .single();
    if (taskError) {
      setSaving(false);
      setError("El item se aceptó pero no se pudo crear la tarea: " + taskError.message);
      return;
    }

    const { error: ownerError } = await supabase
      .from("task_owners")
      .insert({ task_id: task.id, person_id: currentUserId });
    setSaving(false);
    if (ownerError) {
      setError("La tarea se creó pero no se pudo asignar como tuya: " + ownerError.message);
      return;
    }

    router.refresh();
    onClose();
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(31,29,24,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        zIndex: 100,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--surface)",
          borderRadius: 14,
          border: "1px solid var(--border-strong)",
          padding: 22,
          width: "100%",
          maxWidth: 360,
        }}
      >
        <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 4 }}>Aceptar pendiente</div>
        <div style={{ fontSize: 13, color: "var(--ink-muted)", marginBottom: 16 }}>{item.texto}</div>

        <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
          Fecha compromiso
        </label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          autoFocus
          style={{
            width: "100%",
            padding: "9px 10px",
            borderRadius: 8,
            border: "1px solid var(--border-strong)",
            background: "var(--surface-2)",
            color: "var(--ink)",
            fontSize: 14,
          }}
        />

        {error && <div style={{ color: "var(--danger)", fontSize: 12, marginTop: 10 }}>{error}</div>}

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 18 }}>
          <button onClick={onClose} disabled={saving} style={btnGhost}>
            Cancelar
          </button>
          <button onClick={handleConfirm} disabled={saving} style={btnPrimary}>
            {saving ? "Guardando…" : "Aceptar y crear tarea"}
          </button>
        </div>
      </div>
    </div>
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
