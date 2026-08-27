"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const STATUS_OPTIONS = [
  { value: "pendiente", label: "Pendiente" },
  { value: "en_proceso", label: "En proceso" },
  { value: "completado", label: "Completado" },
];

export default function TaskDetailModal({
  task,
  areas,
  types,
  devs,
  projects,
  people,
  currentUserId,
  currentProfile,
  onClose,
}) {
  const router = useRouter();
  const [form, setForm] = useState(() => ({
    title: task.title || "",
    area_id: task.area_id || areas[0]?.id || "",
    type_id: task.type_id || "",
    dev_id: task.dev_id || "",
    project_id: task.project_id || "",
    priority: task.priority || "media",
    due_date: task.due_date || "",
    blocked_by_enrique: !!task.blocked_by_enrique,
    status: task.status || "pendiente",
    owners: (task.owners || []).map((o) => o.person?.id).filter(Boolean),
  }));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deleteArm, setDeleteArm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [postingComment, setPostingComment] = useState(false);

  useEffect(() => {
    let active = true;
    const supabase = createClient();
    supabase
      .from("comments")
      .select("*, author:profiles(id,name,color)")
      .eq("task_id", task.id)
      .order("created_at", { ascending: true })
      .then(({ data, error: commentsError }) => {
        if (!active) return;
        if (!commentsError) setComments(data || []);
        setLoadingComments(false);
      });
    return () => {
      active = false;
    };
  }, [task.id]);

  function toggleOwner(id) {
    setForm((f) => ({
      ...f,
      owners: f.owners.includes(id) ? f.owners.filter((x) => x !== id) : [...f.owners, id],
    }));
  }

  async function handleSave() {
    if (!form.title.trim() || !form.area_id) {
      setError("Título y área son obligatorios.");
      return;
    }
    setSaving(true);
    setError("");
    const supabase = createClient();

    const wasCompleted = task.status === "completado";
    const nowCompleted = form.status === "completado";
    const completed_at = nowCompleted ? (wasCompleted ? task.completed_at : new Date().toISOString()) : null;

    const { error: updateError } = await supabase
      .from("tasks")
      .update({
        title: form.title.trim(),
        area_id: form.area_id,
        type_id: form.type_id || null,
        dev_id: form.dev_id || null,
        project_id: form.project_id || null,
        priority: form.priority,
        due_date: form.due_date || null,
        blocked_by_enrique: form.blocked_by_enrique,
        status: form.status,
        completed_at,
      })
      .eq("id", task.id);

    if (updateError) {
      setSaving(false);
      setError(updateError.message);
      return;
    }

    const { error: deleteOwnersError } = await supabase.from("task_owners").delete().eq("task_id", task.id);
    if (deleteOwnersError) {
      setSaving(false);
      setError(deleteOwnersError.message);
      return;
    }
    if (form.owners.length) {
      const rows = form.owners.map((person_id) => ({ task_id: task.id, person_id }));
      const { error: insertOwnersError } = await supabase.from("task_owners").insert(rows);
      if (insertOwnersError) {
        setSaving(false);
        setError(insertOwnersError.message);
        return;
      }
    }

    setSaving(false);
    router.refresh();
    onClose();
  }

  async function handleAddComment() {
    if (!newComment.trim()) return;
    setPostingComment(true);
    const supabase = createClient();
    const { data, error: commentError } = await supabase
      .from("comments")
      .insert({ task_id: task.id, author_id: currentUserId, text: newComment.trim() })
      .select("*, author:profiles(id,name,color)")
      .single();
    setPostingComment(false);
    if (commentError) {
      setError(commentError.message);
      return;
    }
    setComments((c) => [...c, data]);
    setNewComment("");
  }

  async function handleDelete() {
    if (!deleteArm) {
      setDeleteArm(true);
      return;
    }
    setDeleting(true);
    const supabase = createClient();
    const { error: deleteError } = await supabase.from("tasks").delete().eq("id", task.id);
    setDeleting(false);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    router.refresh();
    onClose();
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(31,29,24,0.45)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "40px 16px",
        overflowY: "auto",
        zIndex: 100,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--surface)",
          borderRadius: 14,
          border: "1px solid var(--border-strong)",
          padding: 22,
          width: "100%",
          maxWidth: 560,
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
          <input
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            style={{ ...input, fontSize: 16, fontWeight: 700, flex: 1 }}
          />
          <button onClick={onClose} style={{ ...btnGhost, padding: "7px 11px" }}>
            Cerrar
          </button>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setForm((f) => ({ ...f, status: opt.value }))}
              style={{
                ...btnGhost,
                flex: 1,
                background: form.status === opt.value ? "var(--accent)" : "var(--surface-2)",
                color: form.status === opt.value ? "var(--accent-ink)" : "var(--ink)",
                border: form.status === opt.value ? "1px solid var(--accent)" : "1px solid var(--border-strong)",
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <select value={form.area_id} onChange={(e) => setForm((f) => ({ ...f, area_id: e.target.value }))} style={select}>
            {areas.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
          <select value={form.type_id} onChange={(e) => setForm((f) => ({ ...f, type_id: e.target.value }))} style={select}>
            <option value="">Sin tipo</option>
            {types.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <select value={form.priority} onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))} style={select}>
            <option value="alta">Prioridad alta</option>
            <option value="media">Prioridad media</option>
            <option value="baja">Prioridad baja</option>
          </select>
          <input
            type="date"
            value={form.due_date}
            onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))}
            style={select}
          />
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <select value={form.dev_id} onChange={(e) => setForm((f) => ({ ...f, dev_id: e.target.value }))} style={select}>
            <option value="">Sin desarrollo</option>
            {devs.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
          <select value={form.project_id} onChange={(e) => setForm((f) => ({ ...f, project_id: e.target.value }))} style={select}>
            <option value="">Sin proyecto</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
            <input
              type="checkbox"
              checked={form.blocked_by_enrique}
              onChange={(e) => setForm((f) => ({ ...f, blocked_by_enrique: e.target.checked }))}
            />
            Parado por Enrique
          </label>
        </div>

        <div>
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, color: "var(--ink-muted)" }}>
            Responsables
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {people.map((p) => (
              <label
                key={p.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  fontSize: 12.5,
                  border: "1px solid var(--border)",
                  borderRadius: 20,
                  padding: "4px 10px",
                  background: form.owners.includes(p.id) ? "var(--surface-2)" : "transparent",
                }}
              >
                <input type="checkbox" checked={form.owners.includes(p.id)} onChange={() => toggleOwner(p.id)} />
                {p.name}
              </label>
            ))}
          </div>
        </div>

        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8, color: "var(--ink-muted)" }}>
            Comentarios
          </div>
          {loadingComments ? (
            <div style={{ fontSize: 12.5, color: "var(--ink-muted)" }}>Cargando…</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
              {comments.length === 0 && (
                <div style={{ fontSize: 12.5, color: "var(--ink-muted)" }}>Sin comentarios todavía.</div>
              )}
              {comments.map((c) => (
                <div key={c.id} style={{ background: "var(--surface-2)", borderRadius: 8, padding: "8px 10px" }}>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: c.author?.color || "var(--ink)" }}>
                    {c.author?.name || "—"}{" "}
                    <span style={{ fontWeight: 500, color: "var(--ink-muted)" }}>
                      · {new Date(c.created_at).toLocaleString("es-MX", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, marginTop: 2 }}>{c.text}</div>
                </div>
              ))}
            </div>
          )}
          <div style={{ display: "flex", gap: 8 }}>
            <input
              placeholder={`Comentar como ${currentProfile?.name || ""}`}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddComment();
              }}
              style={{ ...input, flex: 1 }}
            />
            <button onClick={handleAddComment} disabled={postingComment} style={btnGhost}>
              {postingComment ? "…" : "Agregar"}
            </button>
          </div>
        </div>

        {error && <div style={{ color: "var(--danger)", fontSize: 12.5 }}>{error}</div>}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
          <button
            onClick={handleDelete}
            disabled={deleting}
            style={{
              ...btnGhost,
              color: "var(--danger)",
              borderColor: deleteArm ? "var(--danger)" : "var(--border-strong)",
            }}
          >
            {deleting ? "Eliminando…" : deleteArm ? "Confirmar eliminación" : "Eliminar pendiente"}
          </button>
          <button onClick={handleSave} disabled={saving} style={btnPrimary}>
            {saving ? "Guardando…" : "Guardar cambios"}
          </button>
        </div>
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
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid var(--border-strong)",
  background: "var(--surface-2)",
  color: "var(--ink)",
  fontSize: 14,
};
const select = { ...input, padding: "8px 10px", fontSize: 13 };
