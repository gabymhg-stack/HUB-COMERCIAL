"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { tagInfo, daysRemainingInfo } from "@/lib/braindump";
import AcceptModal from "./AcceptModal";
import BlockControl from "./BlockControl";

// Item dentro del widget "🧠 Pendientes de Enrique" del dashboard de
// cada usuario. mode="assigned" = algo que me asignaron (puedo aceptar
// / bloquear / rechazar). mode="sent" = una solicitud que YO le mandé a
// alguien más — ahí solo puedo ver el estado y cancelarla si sigue sin
// aceptar.
export default function WidgetItemCard({ item, mode, areas, types, people, currentUserId }) {
  const router = useRouter();
  const [showAccept, setShowAccept] = useState(false);
  const [busy, setBusy] = useState(false);

  const tag = tagInfo(item.tag);
  const { color: dayColor, label: dayLabel } = daysRemainingInfo(item.fecha_limite);
  const isSolicitud = item.origen === "solicitud";

  async function reject() {
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.from("braindump_items").update({ estado: "rechazado" }).eq("id", item.id);
    setBusy(false);
    if (error) {
      alert("No se pudo guardar: " + error.message);
      return;
    }
    router.refresh();
  }

  async function cancelSent() {
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.from("braindump_items").delete().eq("id", item.id);
    setBusy(false);
    if (error) {
      alert("No se pudo cancelar: " + error.message);
      return;
    }
    router.refresh();
  }

  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderLeft: item.estado === "sin_aceptar" ? "3px solid var(--danger)" : "3px solid transparent",
        borderRadius: 10,
        padding: "10px 12px",
        opacity: busy ? 0.6 : 1,
      }}
    >
      {isSolicitud && (
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", marginBottom: 3 }}>
          {mode === "sent" ? `📨 Le pediste a ${item.asignado?.name || "—"}` : `📨 Solicitud de ${item.creador?.name || "—"}`}
        </div>
      )}
      <div style={{ fontSize: 13.5, fontWeight: 700 }}>{item.texto}</div>

      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, marginTop: 6 }}>
        {tag && <span style={{ fontSize: 10.5, fontWeight: 800, color: tag.color }}>{tag.label}</span>}
        {item.fecha_limite && <span style={{ fontSize: 10.5, fontWeight: 700, color: dayColor }}>{dayLabel}</span>}

        {mode === "assigned" && item.estado === "sin_aceptar" && (
          <>
            <button onClick={() => setShowAccept(true)} style={acceptBtn}>
              Aceptar
            </button>
            {isSolicitud && (
              <button onClick={reject} disabled={busy} style={rejectBtn}>
                Rechazar
              </button>
            )}
          </>
        )}

        {mode === "assigned" && item.estado === "aceptado" && (
          <>
            <span style={{ fontSize: 10.5, fontWeight: 800, color: "var(--good)" }}>✓ Aceptado</span>
            <span style={{ fontSize: 10.5, color: "var(--ink-muted)" }}>Compromiso: {item.fecha_compromiso}</span>
            <BlockControl item={item} people={people} currentUserId={currentUserId} />
          </>
        )}

        {mode === "assigned" && item.estado === "bloqueado" && (
          <>
            <span style={{ fontSize: 10.5, fontWeight: 800, color: "#b5651d" }}>
              ⏸ Parado por {item.bloqueador?.name || "—"}
            </span>
            <BlockControl item={item} people={people} currentUserId={currentUserId} />
          </>
        )}

        {mode === "sent" && (
          <>
            <span
              style={{
                fontSize: 10.5,
                fontWeight: 800,
                color:
                  item.estado === "bloqueado"
                    ? "#b5651d"
                    : item.estado === "rechazado"
                    ? "var(--danger)"
                    : item.estado === "aceptado"
                    ? "var(--good)"
                    : "var(--ink-muted)",
              }}
            >
              {item.estado === "bloqueado"
                ? `⏸ Parado por ${item.bloqueador?.name || "—"}`
                : item.estado === "rechazado"
                ? "✕ Rechazada"
                : item.estado === "aceptado"
                ? "✓ Aceptada"
                : "Sin aceptar"}
            </span>
            {item.estado === "sin_aceptar" && (
              <button onClick={cancelSent} disabled={busy} style={rejectBtn}>
                Cancelar
              </button>
            )}
          </>
        )}
      </div>

      {showAccept && (
        <AcceptModal
          item={item}
          areas={areas}
          types={types}
          currentUserId={currentUserId}
          onClose={() => setShowAccept(false)}
        />
      )}
    </div>
  );
}

const acceptBtn = {
  background: "var(--accent)",
  color: "var(--accent-ink)",
  border: "none",
  borderRadius: 20,
  padding: "3px 11px",
  fontWeight: 700,
  fontSize: 11.5,
};
const rejectBtn = {
  background: "none",
  border: "1px solid var(--border-strong)",
  color: "var(--ink-muted)",
  borderRadius: 20,
  padding: "3px 11px",
  fontWeight: 700,
  fontSize: 11.5,
};
