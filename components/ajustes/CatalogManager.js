"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Administra un catálogo simple (Áreas, Desarrollos o Tipos) con el mismo
// patrón: agregar, renombrar, cambiar color (si aplica) y eliminar — pero
// solo si no está en uso en ningún pendiente/proyecto.
export default function CatalogManager({ tableName, label, withColor, initialItems, usageChecks }) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState("#4a3aa7");
  const [busyId, setBusyId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [error, setError] = useState("");

  async function refresh() {
    const supabase = createClient();
    const { data } = await supabase.from(tableName).select("*").order("name");
    setItems(data || []);
    router.refresh();
  }

  async function handleAdd() {
    if (!newName.trim()) return;
    setError("");
    const supabase = createClient();
    const payload = withColor ? { name: newName.trim(), color: newColor } : { name: newName.trim() };
    const { error: insertError } = await supabase.from(tableName).insert(payload);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    setNewName("");
    await refresh();
  }

  async function handleRename(item, name) {
    if (!name.trim() || name === item.name) return;
    setBusyId(item.id);
    setError("");
    const supabase = createClient();
    const { error: updateError } = await supabase.from(tableName).update({ name: name.trim() }).eq("id", item.id);
    setBusyId(null);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    await refresh();
  }

  async function handleColor(item, color) {
    const supabase = createClient();
    const { error: updateError } = await supabase.from(tableName).update({ color }).eq("id", item.id);
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

    for (const check of usageChecks) {
      const { count } = await supabase
        .from(check.table)
        .select("id", { count: "exact", head: true })
        .eq(check.column, item.id);
      if (count > 0) {
        setBusyId(null);
        setConfirmId(null);
        setError(
          `No se puede eliminar "${item.name}": está en uso en ${count} ${check.table === "tasks" ? "pendiente(s)" : "proyecto(s)"}.`
        );
        return;
      }
    }

    const { error: deleteError } = await supabase.from(tableName).delete().eq("id", item.id);
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
      <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 10 }}>{label}</div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
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
            {withColor && (
              <input
                type="color"
                defaultValue={item.color}
                onChange={(e) => handleColor(item, e.target.value)}
                style={{ width: 26, height: 26, border: "none", padding: 0, background: "none", flex: "none" }}
                title="Cambiar color"
              />
            )}
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
          <div style={{ fontSize: 12.5, color: "var(--ink-muted)" }}>Todavía no hay nada aquí.</div>
        )}
      </div>

      {error && <div style={{ color: "var(--danger)", fontSize: 12.5, marginBottom: 8 }}>{error}</div>}

      <div style={{ display: "flex", gap: 8 }}>
        {withColor && (
          <input
            type="color"
            value={newColor}
            onChange={(e) => setNewColor(e.target.value)}
            style={{ width: 38, height: 38, border: "1px solid var(--border-strong)", borderRadius: 8, padding: 0, flex: "none" }}
          />
        )}
        <input
          placeholder={`Nuevo(a) ${label.toLowerCase()}`}
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAdd();
          }}
          style={{ ...input, flex: 1 }}
        />
        <button onClick={handleAdd} style={btnPrimary}>
          Agregar
        </button>
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
const input = {
  padding: "9px 11px",
  borderRadius: 8,
  border: "1px solid var(--border-strong)",
  background: "var(--surface-2)",
  color: "var(--ink)",
  fontSize: 13.5,
};
