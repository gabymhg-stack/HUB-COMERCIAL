"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Los proyectos se crean desde la pestaña Proyectos (todavía no construida);
// aquí solo se administran los que ya existen: renombrar o eliminar.
export default function ProjectsManager({ initialItems }) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [busyId, setBusyId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [error, setError] = useState("");

  async function refresh() {
    const supabase = createClient();
    const { data } = await supabase.from("projects").select("*").order("name");
    setItems(data || []);
    router.refresh();
  }

  async function handleRename(item, name) {
    if (!name.trim() || name === item.name) return;
    setBusyId(item.id);
    const supabase = createClient();
    const { error: updateError } = await supabase.from("projects").update({ name: name.trim() }).eq("id", item.id);
    setBusyId(null);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    await refresh();
  }

  async function handleDelete(item) {
    if (confirmId !== item.id) {
      setConfirmId(item.id);
      return;
    }
    setBusyId(item.id);
    setError("");
    const supabase = createClient();
    const { error: deleteError } = await supabase.from("projects").delete().eq("id", item.id);
    setBusyId(null);
    setConfirmId(null);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    await refresh();
  }

  return (
    <div>
      <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 4 }}>Proyectos</div>
      <div style={{ fontSize: 12, color: "var(--ink-muted)", marginBottom: 10 }}>
        Crear un proyecto nuevo se hará desde la pestaña Proyectos (todavía no está lista). Aquí puedes renombrar o
        eliminar los que ya existen — si borras uno, sus pendientes se quedan sin proyecto asignado, no se borran.
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {items.map((item) => (
          <div
            key={item.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              padding: "7px 10px",
            }}
          >
            <input
              defaultValue={item.name}
              onBlur={(e) => handleRename(item, e.target.value)}
              disabled={busyId === item.id}
              style={{ ...input, flex: 1 }}
            />
            <button
              onClick={() => handleDelete(item)}
              disabled={busyId === item.id}
              style={{
                ...btnGhost,
                color: "var(--danger)",
                borderColor: confirmId === item.id ? "var(--danger)" : "var(--border-strong)",
                fontSize: 12,
                padding: "6px 10px",
              }}
            >
              {confirmId === item.id ? "¿Seguro?" : "Eliminar"}
            </button>
          </div>
        ))}
        {items.length === 0 && (
          <div style={{ fontSize: 12.5, color: "var(--ink-muted)" }}>Todavía no hay proyectos creados.</div>
        )}
      </div>

      {error && <div style={{ color: "var(--danger)", fontSize: 12.5, marginTop: 8 }}>{error}</div>}
    </div>
  );
}

const btnGhost = {
  background: "var(--surface-2)",
  color: "var(--ink)",
  border: "1px solid var(--border-strong)",
  borderRadius: 8,
  padding: "9px 16px",
  fontWeight: 600,
  fontSize: 13.5,
};
const input = {
  padding: "9px 11px",
  borderRadius: 8,
  border: "1px solid var(--border-strong)",
  background: "var(--surface-2)",
  color: "var(--ink)",
  fontSize: 13.5,
};
