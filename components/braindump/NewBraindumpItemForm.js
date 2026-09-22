"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// "+ Agregar pendiente" al fondo de cada columna del Board — solo
// admins llegan a ver esto (el Board completo es admin-only), así que
// aquí siempre se crea con origen='braindump'.
export default function NewBraindumpItemForm({ personId }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim()) return;
    setSaving(true);
    setError("");
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // orden nuevo = al final de lo que ya tenga esa persona activo.
    const { data: existing } = await supabase
      .from("braindump_items")
      .select("orden")
      .eq("asignado_a", personId)
      .order("orden", { ascending: false })
      .limit(1);
    const nextOrden = (existing?.[0]?.orden ?? -1) + 1;

    const { error: insertError } = await supabase.from("braindump_items").insert({
      texto: text.trim(),
      asignado_a: personId,
      creado_por: user.id,
      origen: "braindump",
      orden: nextOrden,
    });

    setSaving(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    setText("");
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} style={addBtn}>
        + Agregar pendiente
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <input
        autoFocus
        placeholder="¿Qué hay que hacer?"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
        style={{
          fontSize: 12.5,
          padding: "7px 9px",
          borderRadius: 7,
          border: "1px solid var(--border-strong)",
          background: "var(--surface-2)",
          color: "var(--ink)",
        }}
      />
      {error && <div style={{ color: "var(--danger)", fontSize: 11 }}>{error}</div>}
      <div style={{ display: "flex", gap: 6 }}>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setText("");
          }}
          style={{ ...addBtn, flex: 1 }}
          disabled={saving}
        >
          Cancelar
        </button>
        <button type="submit" style={{ ...addBtn, flex: 1, background: "var(--accent)", color: "var(--accent-ink)", borderColor: "var(--accent)" }} disabled={saving}>
          {saving ? "…" : "Agregar"}
        </button>
      </div>
    </form>
  );
}

const addBtn = {
  fontSize: 12,
  fontWeight: 700,
  padding: "7px 9px",
  borderRadius: 7,
  border: "1px dashed var(--border-strong)",
  background: "transparent",
  color: "var(--ink-muted)",
};
