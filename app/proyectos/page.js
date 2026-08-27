import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Topbar from "@/components/Topbar";
import NewProjectForm from "@/components/proyectos/NewProjectForm";

export const dynamic = "force-dynamic";

export default async function ProyectosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: profile }, { data: devs }, { data: projects }, { data: taskCounts }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase.from("dev_tags").select("*").order("name"),
    supabase
      .from("projects")
      .select("*, dev:dev_tags(id,name,color), owner:profiles(id,name,color)")
      .order("name"),
    supabase.from("tasks").select("project_id, status").not("project_id", "is", null),
  ]);

  const counts = {};
  for (const t of taskCounts || []) {
    if (!counts[t.project_id]) counts[t.project_id] = { total: 0, done: 0 };
    counts[t.project_id].total++;
    if (t.status === "completado") counts[t.project_id].done++;
  }

  return (
    <div style={{ minHeight: "100vh" }}>
      <Topbar profile={profile} active="proyectos" />
      <div style={{ maxWidth: 780, margin: "0 auto", padding: "24px 20px 60px" }}>
        <h1 style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>Proyectos</h1>
        <p style={{ fontSize: 12.5, color: "var(--ink-muted)", marginBottom: 18 }}>
          Un proyecto agrupa subtareas de distintas personas. Cualquiera puede crear uno.
        </p>

        <NewProjectForm devs={devs || []} currentUserId={user.id} />

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {(projects || []).map((p) => {
            const c = counts[p.id] || { total: 0, done: 0 };
            return (
              <Link
                key={p.id}
                href={`/proyectos/${p.id}`}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderLeft: `4px solid ${p.dev?.color || "var(--accent)"}`,
                  borderRadius: 10,
                  padding: "12px 14px",
                  textDecoration: "none",
                  color: "var(--ink)",
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{p.name}</div>
                  <div style={{ fontSize: 11.5, color: "var(--ink-muted)", marginTop: 3 }}>
                    {p.dev ? p.dev.name + " · " : ""}
                    {c.total} subtarea{c.total === 1 ? "" : "s"}
                    {c.total > 0 ? ` · ${c.done} completada${c.done === 1 ? "" : "s"}` : ""}
                    {p.owner ? ` · Dueño: ${p.owner.name}` : ""}
                  </div>
                </div>
                <span style={{ fontSize: 18, color: "var(--ink-muted)" }}>›</span>
              </Link>
            );
          })}
          {(!projects || projects.length === 0) && (
            <p style={{ color: "var(--ink-muted)", fontSize: 13.5 }}>
              No hay proyectos todavía — crea el primero con el botón de arriba.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
