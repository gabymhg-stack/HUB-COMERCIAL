import { createClient } from "@/lib/supabase/server";
import Topbar from "@/components/Topbar";
import AjustesPanel from "@/components/ajustes/AjustesPanel";

export const dynamic = "force-dynamic";

export default async function AjustesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();

  if (!profile?.sees_all) {
    return (
      <div style={{ minHeight: "100vh" }}>
        <Topbar profile={profile} active="ajustes" />
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 20px" }}>
          <p style={{ color: "var(--ink-muted)", fontSize: 13.5 }}>
            No tienes acceso a esta sección — es solo para Enrique y Gaby.
          </p>
        </div>
      </div>
    );
  }

  const [{ data: areas }, { data: devs }, { data: types }, { data: projects }, { data: people }] = await Promise.all([
    supabase.from("areas").select("*").order("name"),
    supabase.from("dev_tags").select("*").order("name"),
    supabase.from("type_labels").select("*").order("name"),
    supabase.from("projects").select("*").order("name"),
    supabase.from("profiles").select("*").order("name"),
  ]);

  return (
    <div style={{ minHeight: "100vh" }}>
      <Topbar profile={profile} active="ajustes" />
      <div style={{ maxWidth: 780, margin: "0 auto", padding: "24px 20px 60px" }}>
        <h1 style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>Ajustes</h1>
        <p style={{ fontSize: 12.5, color: "var(--ink-muted)", marginBottom: 18 }}>
          Administra los catálogos que usa todo el equipo. Un elemento en uso no se puede eliminar.
        </p>
        <AjustesPanel
          areas={areas || []}
          devs={devs || []}
          types={types || []}
          projects={projects || []}
          people={people || []}
          currentUserId={user.id}
        />
      </div>
    </div>
  );
}
