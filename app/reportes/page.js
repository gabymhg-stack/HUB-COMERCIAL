import { createClient } from "@/lib/supabase/server";
import Topbar from "@/components/Topbar";
import ReportesPanel from "@/components/reportes/ReportesPanel";

export const dynamic = "force-dynamic";

export default async function ReportesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();

  if (!profile?.sees_all) {
    return (
      <div style={{ minHeight: "100vh" }}>
        <Topbar profile={profile} active="reportes" />
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 20px" }}>
          <p style={{ color: "var(--ink-muted)", fontSize: 13.5 }}>
            No tienes acceso a esta sección — es solo para Enrique y Gaby.
          </p>
        </div>
      </div>
    );
  }

  const [{ data: areas }, { data: people }, { data: tasksRaw }, { data: projects }, { data: braindumpItems }] =
    await Promise.all([
      supabase.from("areas").select("*").order("name"),
      supabase.from("profiles").select("*").order("name"),
      supabase
        .from("tasks")
        .select(
          "*, area:areas(id,name,color), dev:dev_tags(id,name,color), type:type_labels(id,name), project:projects(id,name), owners:task_owners(person:profiles(id,name,color))"
        ),
      supabase.from("projects").select("*").order("name"),
      supabase.from("braindump_items").select("id,asignado_a,created_at,aceptado_at,estado"),
    ]);

  return (
    <div style={{ minHeight: "100vh" }}>
      <Topbar profile={profile} active="reportes" />
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 20px 60px" }}>
        <h1 style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>Reportes</h1>
        <p style={{ fontSize: 12.5, color: "var(--ink-muted)", marginBottom: 18 }}>
          Carga de trabajo del equipo, distribución por área/proyecto, tiempos de ciclo y cumplimiento.
        </p>
        <ReportesPanel
          tasks={tasksRaw || []}
          people={people || []}
          areas={areas || []}
          projects={projects || []}
          braindumpItems={braindumpItems || []}
        />
      </div>
    </div>
  );
}
