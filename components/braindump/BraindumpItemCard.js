"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { BRAINDUMP_TAGS, tagInfo, daysRemainingInfo, ESTADO_LABEL } from "@/lib/braindump";

const ESTADO_BADGE = {
  sin_aceptar: { bg: "rgba(224,80,58,0.12)", color: "var(--danger)", text: "Sin aceptar" },
  aceptado: { bg: "rgba(27,175,122,0.12)", color: "var(--good)", text: "✓ Aceptado" },
  bloqueado: { bg: "rgba(237,161,0,0.15)", color: "#b5651d", text: "⏸ Bloqueado" },
  completado: { bg: "rgba(27,175,122,0.12)", color: "var(--good)", text: "✓ Hecho" },
  rechazado: { bg: "var(--surface-2)", color: "var(--ink-muted)", text: "✕ Rechazado" },
};

// Tarjeta de un item del Braindump dentro del Board de admins: arrastrable
// (zona activa), editable en línea (texto/tag/fecha) y con borrado. La
// tarjeta que ve cada usuario en su propio widget es otro componente
// (WidgetItemCard) porque las acciones que puede hacer son distintas.
export default function BraindumpItemCard({ item, onDragStart, onDragEnd, draggable }) {
  const router = useRouter();
  const [editingText, setEditingText] = useState(false);
  const [text, setText] = useState(item.texto);
  const [showTagPicker, setShowTagPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [deleteArm, setDeleteArm] = useState(false);
  const [busy, setBusy] = useState(false);

  const tag = tagInfo(item.tag);
  const { color: dayColor, label: dayLabel } = daysRemainingInfo(item.fecha_limite);
  const badge = ESTADO_BADGE[item.estado] || ESTADO_BADGE.sin_aceptar;
  const isSolicitud = item.origen === "solicitud";

  async function patch(fields) {
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.from("braindump_items").update(fields).eq("id", item.id);
    setBusy(false);
    if (error) {
      alert("No se pudo guardar: " + error.message);
      return;
    }
    router.refresh();
  }

  async function saveText() {
    setEditingText(false);
    if (text.trim() && text.trim() !== item.texto) await patch({ texto: text.trim() });
    else setText(item.texto);
  }

  async function handleDelete() {
    if (!deleteArm) {
      setDeleteArm(true);
      return;
    }
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.from("braindump_items").delete().eq("id", item.id);
    setBusy(false);
    if (error) {
      alert("No se pudo eliminar: " + error.message);
      return;
    }
    router.refresh();
  }

  return (
    <div
      className="braindump-item"
      draggable={draggable}
      onDragStart={(e) => onDragStart?.(e, item)}
      onDragEnd={onDragEnd}
      style={{
        display: "grid",
        gridTemplateColumns: draggable ? "14px 1fr auto" : "1fr auto",
        alignItems: "start",
        gap: 8,
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderLeft: item.estado === "sin_aceptar" ? "3px solid var(--danger)" : "3px solid transparent",
        borderRadius: 9,
        padding: "9px 10px",
        opacity: busy ? 0.6 : 1,
      }}
    >
      {draggable && (
        <span
          title="Arrastrar para reordenar"
          style={{ cursor: "grab", color: "var(--ink-muted)", fontSize: 13, marginTop: 2, userSelect: "none" }}
        >
          ⠿
        </span>
      )}

      <div style={{ minWidth: 0 }}>
        {editingText ? (
          <input
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={saveText}
            onKeyDown={(e) => e.key === "Enter" && saveText()}
            style={{
              width: "100%",
              fontSize: 13,
              fontWeight: 600,
              padding: "3px 5px",
              borderRadius: 5,
              border: "1px solid var(--border-strong)",
              background: "var(--surface-2)",
              color: "var(--ink)",
            }}
          />
        ) : (
          <div
            onClick={() => setEditingText(true)}
            title="Click para editar el texto"
            style={{
              fontSize: 13,
              fontWeight: 600,
              cursor: "text",
              textDecoration: item.estado === "completado" ? "line-through" : "none",
              color: item.estado === "completado" ? "var(--ink-muted)" : "var(--ink)",
            }}
          >
            {isSolicitud && <span style={{ marginRight: 4 }}>📨</span>}
            {item.texto}
          </div>
        )}

        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6, marginTop: 6 }}>
          <span
            style={{
              fontSize: 10.5,
              fontWeight: 800,
              padding: "1.5px 7px",
              borderRadius: 20,
              background: badge.bg,
              color: badge.color,
            }}
          >
            {item.estado === "bloqueado" && item.bloqueador ? `⏸ Bloqueado por ${item.bloqueador.name}` : badge.text}
          </span>
          {tag && (
            <span style={{ fontSize: 10.5, fontWeight: 800, color: tag.color }}>{tag.label}</span>
          )}
          {item.fecha_limite && (
            <span style={{ fontSize: 10.5, fontWeight: 700, color: dayColor }}>{dayLabel}</span>
          )}
          {item.estado === "aceptado" && item.fecha_compromiso && (
            <span style={{ fontSize: 10.5, color: "var(--ink-muted)" }}>Compromiso: {item.fecha_compromiso}</span>
          )}
        </div>

        {showTagPicker && (
          <div style={{ marginTop: 6 }}>
            <select
              autoFocus
              value={item.tag || ""}
              onBlur={() => setShowTagPicker(false)}
              onChange={(e) => {
                patch({ tag: e.target.value });
                setShowTagPicker(false);
              }}
              style={miniSelect}
            >
              <option value="">Sin tag</option>
              {BRAINDUMP_TAGS.map((t) => (
                <option key={t.key} value={t.key}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        )}
        {showDatePicker && (
          <div style={{ marginTop: 6 }}>
            <input
              autoFocus
              type="date"
              defaultValue={item.fecha_limite || ""}
              onBlur={(e) => {
                patch({ fecha_limite: e.target.value || null });
                setShowDatePicker(false);
              }}
              style={miniSelect}
            />
          </div>
        )}
      </div>

      <div className="braindump-item-actions" style={{ display: "flex", flexDirection: "column", gap: 3, alignItems: "flex-end" }}>
        <button onClick={() => setShowTagPicker((s) => !s)} title="Cambiar tag" style={iconBtn}>
          🏷️
        </button>
        <button onClick={() => setShowDatePicker((s) => !s)} title="Cambiar fecha límite" style={iconBtn}>
          📅
        </button>
        <button
          onClick={handleDelete}
          title="Eliminar"
          style={{ ...iconBtn, color: deleteArm ? "var(--danger)" : "var(--ink-muted)" }}
        >
          {deleteArm ? "confirmar" : "×"}
        </button>
      </div>
    </div>
  );
}

const iconBtn = {
  border: "none",
  background: "none",
  fontSize: 12,
  padding: 2,
  color: "var(--ink-muted)",
  lineHeight: 1,
};
const miniSelect = {
  fontSize: 11.5,
  padding: "3px 5px",
  borderRadius: 5,
  border: "1px solid var(--border-strong)",
  background: "var(--surface-2)",
  color: "var(--ink)",
};
