"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Dropdown de "Bloqueado por…" para un item ya aceptado — cualquiera de
// los 5 miembros del equipo (menos uno mismo). Si ya está bloqueado,
// muestra el botón para desbloquear en vez del selector.
export default function BlockControl({ item, people, currentUserId }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const options = people.filter((p) => p.id !== currentUserId);

  async function setBlocked(personId) {
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("braindump_items")
      .update({ estado: "bloqueado", bloqueado_por: personId })
      .eq("id", item.id);
    setBusy(false);
    setOpen(false);
    if (error) {
      alert("No se pudo guardar: " + error.message);
      return;
    }
    router.refresh();
  }

  async function unblock() {
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("braindump_items")
      .update({ estado: "aceptado", bloqueado_por: null })
      .eq("id", item.id);
    setBusy(false);
    if (error) {
      alert("No se pudo guardar: " + error.message);
      return;
    }
    router.refresh();
  }

  if (item.estado === "bloqueado") {
    return (
      <button onClick={unblock} disabled={busy} style={linkBtn}>
        {busy ? "…" : "Desbloquear"}
      </button>
    );
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} style={linkBtn}>
        Marcar bloqueado por…
      </button>
    );
  }

  return (
    <select
      autoFocus
      defaultValue=""
      onBlur={() => setOpen(false)}
      onChange={(e) => e.target.value && setBlocked(e.target.value)}
      disabled={busy}
      style={{
        fontSize: 11.5,
        padding: "4px 6px",
        borderRadius: 6,
        border: "1px solid var(--border-strong)",
        background: "var(--surface-2)",
        color: "var(--ink)",
      }}
    >
      <option value="" disabled>
        ¿Bloqueado por quién?
      </option>
      {options.map((p) => (
        <option key={p.id} value={p.id}>
          {p.name}
        </option>
      ))}
    </select>
  );
}

const linkBtn = {
  border: "none",
  background: "none",
  color: "var(--accent)",
  fontSize: 11.5,
  fontWeight: 700,
  padding: 0,
};
