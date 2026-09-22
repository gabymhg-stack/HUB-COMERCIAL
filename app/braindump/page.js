import { createClient } from "@/lib/supabase/server";
import Topbar from "@/components/Topbar";
import BraindumpBoard from "@/components/braindump/BraindumpBoard";

export const dynamic = "force-dynamic";

export default async function BraindumpPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();

  if (!profile?.sees_all) {
    return (
      <div style={{ minHeight: "100vh" }}>
        <Topbar profile={profile} active="braindump" />
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 20px" }}>
          <p style={{ color: "var(--ink-muted)", fontSize: 13.5 }}>
            No tienes acceso a esta sección — es solo para Enrique y Gaby.
          </p>
        </div>
      </div>
    );
  }

  const [{ data: people }, { data: itemsRaw }, { data: prioritiesRaw }] = await Promise.all([
    supabase.from("profiles").select("*").order("name"),
    supabase
      .from("braindump_items")
      .select(
        "*, bloqueador:profiles!braindump_items_bloqueado_por_fkey(id,name,color), creador:profiles!braindump_items_creado_por_fkey(id,name,color)"
      )
      .order("orden", { ascending: true }),
    supabase.from("weekly_priorities").select("*"),
  ]);

  const adminIds = (people || []).filter((p) => p.sees_all).map((p) => p.id);
  const priorities = Object.fromEntries((prioritiesRaw || []).map((p) => [p.person_id, p]));

  return (
    <div style={{ minHeight: "100vh" }}>
      <Topbar profile={profile} active="braindump" />
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "24px 20px 60px" }}>
        <h1 style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>🧠 Braindump</h1>
        <p style={{ fontSize: 12.5, color: "var(--ink-muted)", marginBottom: 18 }}>
          Vaciado rápido de pendientes por persona — no es el HUB formal, es para asignar sin fricción. Cada quien
          acepta lo suyo con fecha compromiso desde su propio dashboard, y ahí sí se vuelve una tarea normal.
        </p>
        <BraindumpBoard
          items={itemsRaw || []}
          people={people || []}
          adminIds={adminIds}
          priorities={priorities}
          currentUserId={user.id}
        />
      </div>
    </div>
  );
}
