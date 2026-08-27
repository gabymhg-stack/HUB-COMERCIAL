"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Dar de alta/baja personas requiere la clave secreta de Supabase (no la
// pública), así que eso se sigue haciendo por fuera (pídeselo a Claude).
// Aquí se edita lo que sí es seguro con la llave pública: nombre, rol y si
// ve todo el equipo.
export default function TeamManager({ initialItems, currentUserId }) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [drafts, setDrafts] = useState(() =>
    Object.fromEntries(initialItems.map((p) => [p.id, { name: p.name, role: p.role, sees_all: p.sees_all }]))
  );
  const [busyId, setBusyId] = useState(null);
  const [confirmSelfRevokeId, setConfirmSelfRevokeId] = useState(null);
  const [error, setError] = useState("");

  function setDraft(id, patch) {
    setDrafts((d) => ({ ...d, [id]: { ...d[id], ...patch } }));
  }

  async function handleSave(item) {
    const draft = drafts[item.id];
    const selfRevoke = item.id === currentUserId && item.sees_all && !draft.sees_all;
    if (selfRevoke && confirmSelfRevokeId !== item.id) {
      setConfirmSelfRevokeId(item.id);
      return;
    }
    setConfirmSelfRevokeId(null);
    setBusyId(item.id);
    setError("");
    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ name: draft.name.trim(), role: draft.role.trim(), sees_all: draft.sees_all })
      .eq("id", item.id);
    setBusyId(null);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    const supabase2 = createClient();
    const { data } = await supabase2.from("profiles").select("*").order("name");
    setItems(data || []);
    router.refresh();
  }

  return (
    <div>
      <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 4 }}>Equipo</div>
      <div style={{ fontSize: 12, color: "var(--ink-muted)", marginBottom: 10 }}>
        Dar de alta o baja a alguien del equipo se hace por fuera de aquí (pídeselo a Claude — requiere la llave
        secreta de Supabase). Aquí puedes editar nombre, rol y si ve los pendientes de todo el equipo.
      </div>

      {error && <div style={{ color: "var(--danger)", fontSize: 12.5, marginBottom: 10 }}>{error}</div>}

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {items.map((item) => {
          const draft = drafts[item.id] || { name: item.name, role: item.role, sees_all: item.sees_all };
          const dirty =
            draft.name !== item.name || draft.role !== item.role || draft.sees_all !== item.sees_all;
          const armed = confirmSelfRevokeId === item.id;
          return (
            <div
              key={item.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                padding: "8px 10px",
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  background: item.color,
                  color: "#fff",
                  fontSize: 11,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flex: "none",
                }}
              >
                {item.name?.slice(0, 1)}
              </span>
              <input
                value={draft.name}
                onChange={(e) => setDraft(item.id, { name: e.target.value })}
                style={{ ...input, flex: 1, minWidth: 120 }}
              />
              <input
                value={draft.role}
                onChange={(e) => setDraft(item.id, { role: e.target.value })}
                style={{ ...input, flex: 1, minWidth: 140 }}
              />
              <label style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, flex: "none" }}>
                <input
                  type="checkbox"
                  checked={draft.sees_all}
                  onChange={(e) => setDraft(item.id, { sees_all: e.target.checked })}
                />
                Ve todo
              </label>
              <button
                onClick={() => handleSave(item)}
                disabled={!dirty || busyId === item.id}
                style={{
                  ...btnPrimary,
                  opacity: dirty ? 1 : 0.5,
                  fontSize: 12,
                  padding: "7px 12px",
                  background: armed ? "var(--danger)" : "var(--accent)",
                }}
              >
                {busyId === item.id ? "Guardando…" : armed ? "¿Seguro? Confirmar" : "Guardar"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const btnPrimary = {
  background: "var(--accent)",
  color: "var(--accent-ink)",
  border: "none",
  borderRadius: 8,
  fontWeight: 700,
};
const input = {
  padding: "8px 10px",
  borderRadius: 8,
  border: "1px solid var(--border-strong)",
  background: "var(--surface-2)",
  color: "var(--ink)",
  fontSize: 13,
};
