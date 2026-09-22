"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import BraindumpItemCard from "./BraindumpItemCard";
import NewBraindumpItemForm from "./NewBraindumpItemForm";
import PriorityEditor from "./PriorityEditor";

// Una columna del Board (una persona). El drag & drop es nativo del
// navegador (draggable + dragover + drop) y solo reordena DENTRO de la
// misma columna, tal cual pide el brief — si el drag vino de otra
// columna simplemente no se encuentra en la lista local y se ignora.
export default function BraindumpColumn({ person, activos, hechos, currentUserId, priority }) {
  const router = useRouter();
  const [dragId, setDragId] = useState(null);
  const [overId, setOverId] = useState(null);

  function handleDragStart(e, item) {
    setDragId(item.id);
    e.dataTransfer.effectAllowed = "move";
  }
  function handleDragEnd() {
    setDragId(null);
    setOverId(null);
  }
  function handleDragOverItem(e, item) {
    e.preventDefault();
    if (item.id !== dragId) setOverId(item.id);
  }

  async function handleDrop(e) {
    e.preventDefault();
    const draggedId = dragId;
    const targetId = overId;
    setDragId(null);
    setOverId(null);
    if (!draggedId || draggedId === targetId) return;

    const list = [...activos];
    const fromIdx = list.findIndex((i) => i.id === draggedId);
    if (fromIdx === -1) return; // viene de otra columna — el drag & drop no reasigna persona

    const [moved] = list.splice(fromIdx, 1);
    const toIdx = targetId ? list.findIndex((i) => i.id === targetId) : -1;
    list.splice(toIdx === -1 ? list.length : toIdx, 0, moved);

    const supabase = createClient();
    await Promise.all(
      list.map((it, idx) => supabase.from("braindump_items").update({ orden: idx }).eq("id", it.id))
    );
    router.refresh();
  }

  return (
    <div
      className="braindump-column"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      style={{
        flex: "0 0 260px",
        width: 260,
        display: "flex",
        flexDirection: "column",
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 14,
        boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
        maxHeight: "calc(100vh - 140px)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          background: person.color,
          color: "#fff",
          padding: "12px 14px",
          fontWeight: 800,
          fontSize: 14,
          flex: "none",
        }}
      >
        {person.name}
        <span style={{ fontWeight: 600, fontSize: 12, opacity: 0.85 }}> · {activos.length}</span>
      </div>

      <PriorityEditor
        personId={person.id}
        currentUserId={currentUserId}
        initialText={priority?.texto}
        updatedAt={priority?.updated_at}
      />

      <div style={{ padding: 10, overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
        <NewBraindumpItemForm personId={person.id} />

        {activos.map((item) => (
          <div key={item.id} onDragOver={(e) => handleDragOverItem(e, item)}>
            <BraindumpItemCard item={item} draggable onDragStart={handleDragStart} onDragEnd={handleDragEnd} />
          </div>
        ))}
        {activos.length === 0 && (
          <p style={{ fontSize: 12, color: "var(--ink-muted)", textAlign: "center", padding: "6px 0" }}>
            Nada pendiente.
          </p>
        )}

        {hechos.length > 0 && (
          <>
            <div
              style={{
                borderTop: "1px solid var(--border)",
                marginTop: 6,
                paddingTop: 8,
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                color: "var(--ink-muted)",
              }}
            >
              Hecho · {hechos.length}
            </div>
            {hechos.map((item) => (
              <BraindumpItemCard key={item.id} item={item} draggable={false} />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
