"use client";

import { useState } from "react";
import TaskCard from "./TaskCard";

// "Carpeta" de completados: colapsada por default (siempre arranca
// cerrada al cargar la página) para no abrumar el plano principal con
// todo lo que ya se hizo — un click la abre/cierra. No es una tabla ni
// vista aparte a propósito: mismo TaskCard, mismo modal de detalle,
// nada más escondido detrás de un disclosure.
export default function ArchivoSection({ tasks, onOpen }) {
  const [open, setOpen] = useState(false);
  if (!tasks.length) return null;

  return (
    <div style={{ marginBottom: 22 }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          background: "var(--surface-2)",
          border: "1px solid var(--border)",
          borderRadius: 8,
          padding: "9px 12px",
          cursor: "pointer",
          fontSize: 12,
          fontWeight: 800,
          letterSpacing: "0.03em",
          textTransform: "uppercase",
          color: "var(--ink-muted)",
        }}
      >
        <span>📁 Archivo · Completados · {tasks.length}</span>
        <span style={{ fontSize: 11 }}>{open ? "Ocultar ▲" : "Ver ▼"}</span>
      </button>

      {open && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
          {tasks.map((t) => (
            <TaskCard key={t.id} task={t} onOpen={() => onOpen(t)} />
          ))}
        </div>
      )}
    </div>
  );
}
