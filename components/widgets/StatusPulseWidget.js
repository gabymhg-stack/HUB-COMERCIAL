"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { sortTeamOrder } from "@/lib/braindump";
import { widgetCard, widgetTitle } from "./CalendarWidget";

// "🔨 En qué andamos" — a diferencia de la Prioridad de la semana (la
// pone un admin para otra persona), este status lo pone cada quien
// para sí mismo, y lo ve TODO el equipo (no solo Enrique/Gaby) — es
// visibilidad compartida a propósito. Una fila por persona, se
// sobreescribe cada vez que la actualiza (no es historial).
export default function StatusPulseWidget({ people, statuses, currentUserId }) {
  const byPerson = Object.fromEntries((statuses || []).map((s) => [s.person_id, s]));

  const withStatus = [];
  const withoutStatus = [];
  for (const p of people || []) {
    const row = byPerson[p.id];
    if (row?.texto) withStatus.push({ person: p, texto: row.texto, updated_at: row.updated_at });
    else withoutStatus.push({ person: p, texto: "", updated_at: null });
  }
  withStatus.sort((a, b) => (b.updated_at || "").localeCompare(a.updated_at || ""));
  const ordered = [...withStatus, ...sortTeamOrder(withoutStatus.map((r) => r.person)).map((p) => withoutStatus.find((r) => r.person.id === p.id))];

  return (
    <div style={widgetCard}>
      <div style={widgetTitle}>🔨 En qué andamos</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {ordered.map((row) => (
          <StatusRow key={row.person.id} row={row} isMine={row.person.id === currentUserId} />
        ))}
      </div>
    </div>
  );
}

function StatusRow({ row, isMine }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(row.texto || "");
  const relTime = relativeTime(row.updated_at);

  async function save() {
    setEditing(false);
    const trimmed = text.trim();
    if (trimmed === (row.texto || "").trim()) return;
    const supabase = createClient();
    const { error } = await supabase
      .from("status_updates")
      .upsert({ person_id: row.person.id, texto: trimmed, updated_at: new Date().toISOString() }, { onConflict: "person_id" });
    if (error) {
      alert("No se pudo guardar tu status: " + error.message);
      setText(row.texto || "");
      return;
    }
    router.refresh();
  }

  return (
    <div style={{ display: "flex", gap: 8 }}>
      <span
        style={{
          width: 22,
          height: 22,
          borderRadius: "50%",
          background: row.person.color,
          color: "#fff",
          fontSize: 10.5,
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flex: "none",
          marginTop: 1,
        }}
      >
        {row.person.name?.slice(0, 1)}
      </span>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--ink)" }}>{row.person.name}</div>

        {isMine && editing ? (
          <input
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={save}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.currentTarget.blur();
              if (e.key === "Escape") {
                setText(row.texto || "");
                setEditing(false);
              }
            }}
            placeholder="¿En qué estás ahora?"
            style={{
              width: "100%",
              fontSize: 12,
              padding: "4px 6px",
              borderRadius: 5,
              border: "1px solid var(--border-strong)",
              background: "var(--surface-2)",
              color: "var(--ink)",
              marginTop: 2,
            }}
          />
        ) : (
          <div
            onClick={() => isMine && setEditing(true)}
            title={isMine ? "Click para actualizar tu status" : undefined}
            style={{
              fontSize: 12,
              color: row.texto ? "var(--ink-2)" : "var(--ink-muted)",
              fontStyle: row.texto ? "normal" : "italic",
              cursor: isMine ? "text" : "default",
              lineHeight: 1.35,
              marginTop: 1,
            }}
          >
            {row.texto || (isMine ? "Click para poner tu status..." : "Sin actualizar")}
            {row.texto && relTime && (
              <span style={{ color: "var(--ink-muted)", fontWeight: 600 }}> · {relTime}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function relativeTime(iso) {
  if (!iso) return "";
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "justo ahora";
  if (mins < 60) return `hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs} h`;
  const days = Math.floor(hrs / 24);
  return days === 1 ? "hace 1 día" : `hace ${days} días`;
}
