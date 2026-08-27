import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Topbar from "@/components/Topbar";
import PendientesList from "@/components/PendientesList";
import NewTaskForm from "@/components/NewTaskForm";

export const dynamic = "force-dynamic";

export default async function ProyectoDetailPage({ params }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [
    { data: profile },
    { data: project },
    { data: areas },
    { data: types },
    { data: devs },
    { data: projects },
    { data: people },
    { data: tasksRaw },
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase.from("projects").select("*, dev:dev_tags(id,name,color), owner:profiles(id,name,color)").eq("id", id).maybeSingle(),
    supabase.from("areas").select("*").order("name"),
    supabase.from("type_labels").select("*").order("name"),
    supabase.from("dev_tags").select("*").order("name"),
    supabase.from("projects").select("*").order("name"),
    supabase.from("profiles").select("*").order("name"),
    supabase
      .from("tasks")
      .select(
        "*, area:areas(id,name,color), dev:dev_tags(id,name,color), type:type_labels(id,name), project:projects(id,name), owners:task_owners(person:profiles(id,name,color))"
      )
      .eq("project_id", id),
  ]);

  if (!project) return notFound();

  const tasks = tasksRaw || [];

  return (
    <div style={{ minHeight: "100vh" }}>
      <Topbar profile={profile} active="proyectos" />
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 20px 60px" }}>
        <Link href="/proyectos" style={{ fontSize: 12.5, color: "var(--ink-muted)", textDecoration: "none" }}>
          ‹ Proyectos
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "6px 0 4px" }}>
          {project.dev && (
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: project.dev.color,
                flex: "none",
              }}
            />
          )}
          <h1 style={{ fontSize: 20, fontWeight: 800 }}>{project.name}</h1>
        </div>
        <p style={{ fontSize: 12.5, color: "var(--ink-muted)", marginBottom: 18 }}>
          {project.dev ? project.dev.name + " · " : ""}
          Dueño: {project.owner?.name || "—"} · {tasks.length} subtarea{tasks.length === 1 ? "" : "s"}
        </p>

        <NewTaskForm
          areas={areas || []}
          types={types || []}
          devs={devs || []}
          projects={projects || []}
          people={people || []}
          currentUserId={user.id}
          defaultProjectId={id}
        />

        <PendientesList
          tasks={tasks}
          areas={areas || []}
          types={types || []}
          devs={devs || []}
          projects={projects || []}
          people={people || []}
          currentUserId={user.id}
          currentProfile={profile}
        />

        {tasks.length === 0 && (
          <p style={{ color: "var(--ink-muted)", fontSize: 13.5 }}>
            Este proyecto todavía no tiene subtareas — crea la primera con el botón de arriba.
          </p>
        )}
      </div>
    </div>
  );
}
