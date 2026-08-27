"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { daysBetween, todayISO, toLocalISO } from "@/lib/data";

const PRIORITY_LABEL = { alta: "Alta", media: "Media", baja: "Baja" };
const PRIORITY_COLOR = { alta: "var(--danger)", media: "var(--warning)", baja: "var(--ink-muted)" };

export default function TaskCard({ task, onOpen }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);
  const done = task.status === "completado";
  const inProgress = task.status === "en_proceso";

  async function toggleDone(e) {
    e.stopPropagation();
    if (busy) return;
    setBusy(true);
    const supabase = createClient();
    const patch = done
      ? { status: "pendiente", completed_at: null }
      : { status: "completado", completed_at: new Date().toISOString() };
    const { error } = await supabase.from("tasks").update(patch).eq("id", task.id);
    setBusy(false);
    if (error) {
      alert("No se pudo guardar: " + error.message);
      return;
    }
    startTransition(() => router.refresh());
  }

  const owners = (task.owners || []).map((o) => o.person).filter(Boolean);
  const createdDays = daysBetween(toLocalISO(task.created_at) || todayISO(), todayISO());
  const overdueDays =
    task.due_date && !done ? Math.max(0, daysBetween(task.due_date, todayISO())) : 0;

  return (
    <div
      onClick={onOpen}
      style={{
        display: "flex",
        gap: 12,
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderLeft: `4px solid ${task.area?.color || "var(--accent)"}`,
        borderRadius: 10,
        padding: "12px 14px",
        opacity: pending ? 0.6 : 1,
        cursor: onOpen ? "pointer" : "default",
      }}
    >
      <button
        onClick={toggleDone}
        title={done ? "Marcar como pendiente" : "Marcar como completado"}
        style={{
          width: 20,
          height: 20,
          borderRadius: "50%",
          border: `1.5px solid ${done ? "var(--good)" : inProgress ? "var(--accent)" : "var(--border-strong)"}`,
          background: done ? "var(--good)" : inProgress ? "var(--accent)" : "var(--surface-2)",
          color: "#fff",
          flex: "none",
          marginTop: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 12,
          fontWeight: 800,
          padding: 0,
        }}
      >
        {done ? "✓" : inProgress ? "•" : ""}
      </button>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
          <div
            style={{
              fontWeight: 700,
              fontSize: 14,
              textDecoration: done ? "line-through" : "none",
              color: done ? "var(--ink-muted)" : "var(--ink)",
            }}
          >
            {task.title}
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flex: "none" }}>
            <div style={{ display: "flex", gap: -6 }}>
              {owners.map((p) => (
                <span
                  key={p.id}
                  title={p.name}
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    background: p.color,
                    color: "#fff",
                    fontSize: 10.5,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "2px solid var(--surface)",
                    marginLeft: -6,
                  }}
                >
                  {p.name?.slice(0, 1)}
                </span>
              ))}
            </div>
            {task.dev && (
              <span style={{ fontSize: 11, fontWeight: 700, color: task.dev.color }}>{task.dev.name}</span>
            )}
          </div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6, fontSize: 11 }}>
          <Badge>{task.area?.name}</Badge>
          {task.type && <Badge>{task.type.name}</Badge>}
          {inProgress && (
            <span style={{ color: "var(--accent)", fontWeight: 700 }}>● En proceso</span>
          )}
          <span style={{ color: PRIORITY_COLOR[task.priority], fontWeight: 700 }}>
            {PRIORITY_LABEL[task.priority]}
          </span>
          {task.blocked_by_enrique && (
            <span style={{ color: "#b5651d", fontWeight: 700 }}>Parado por Enrique</span>
          )}
          {task.project && <Badge>{task.project.name}</Badge>}
        </div>

        <div style={{ fontSize: 11, color: "var(--ink-muted)", marginTop: 4 }}>
          {task.due_date ? `Entrega ${task.due_date}` : "Sin fecha"} · Creado hace {createdDays}{" "}
          {createdDays === 1 ? "día" : "días"}
          {overdueDays > 0 && (
            <span style={{ color: "var(--danger)" }}> · {overdueDays} días de atraso</span>
          )}
        </div>
      </div>
    </div>
  );
}

function Badge({ children }) {
  if (!children) return null;
  return (
    <span
      style={{
        background: "var(--surface-2)",
        border: "1px solid var(--border)",
        borderRadius: 6,
        padding: "2px 7px",
        color: "var(--ink-2)",
        fontWeight: 600,
      }}
    >
      {children}
    </span>
  );
}
