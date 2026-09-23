import { createClient } from "@/lib/supabase/server";
import { signOut } from "./actions";
import Topbar from "@/components/Topbar";
import HomeView from "@/components/HomeView";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [
    { data: profile },
    { data: areas },
    { data: types },
    { data: devs },
    { data: projects },
    { data: people },
    { data: tasksRaw, error: tasksError },
    { data: braindumpRaw },
    { data: priorityRaw },
    { data: statusesRaw },
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase.from("areas").select("*").order("name"),
    supabase.from("type_labels").select("*").order("name"),
    supabase.from("dev_tags").select("*").order("name"),
    supabase.from("projects").select("*").order("name"),
    supabase.from("profiles").select("*").order("name"),
    supabase
      .from("tasks")
      .select(
        "*, area:areas(id,name,color), dev:dev_tags(id,name,color), type:type_labels(id,name), project:projects(id,name), owners:task_owners(person:profiles(id,name,color))"
      ),
    // Solo lo que me toca a mí: lo que me asignaron + lo que yo pedí —
    // así el widget del Braindump no necesita traer la tabla completa.
    supabase
      .from("braindump_items")
      .select(
        "*, asignado:profiles!braindump_items_asignado_a_fkey(id,name,color), creador:profiles!braindump_items_creado_por_fkey(id,name,color), bloqueador:profiles!braindump_items_bloqueado_por_fkey(id,name,color)"
      )
      .or(`asignado_a.eq.${user.id},creado_por.eq.${user.id}`),
    // Prioridad de la semana asignada por Enrique/Gaby — una fila por
    // persona, se sobreescribe cada semana (ver weekly_priorities).
    supabase
      .from("weekly_priorities")
      .select("*, setBy:profiles!weekly_priorities_set_by_fkey(id,name)")
      .eq("person_id", user.id)
      .maybeSingle(),
    // "En qué andamos" — de todo el equipo, la ve cualquiera (no solo
    // admins), cada quien solo puede editar la suya.
    supabase.from("status_updates").select("*"),
  ]);

  if (!profile) {
    return (
      <div style={{ padding: 40 }}>
        <p>
          Tu usuario existe en el login pero no tiene una fila en <code>profiles</code> todavía.
          Pídele a Gaby que corra el <code>insert into profiles</code> con tu User UID.
        </p>
        <form action={signOut}>
          <button type="submit">Cerrar sesión</button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh" }}>
      <Topbar profile={profile} active="pendientes" />
      <HomeView
        profile={profile}
        areas={areas || []}
        types={types || []}
        devs={devs || []}
        projects={projects || []}
        people={people || []}
        tasks={tasksRaw || []}
        tasksError={tasksError?.message}
        braindumpItems={braindumpRaw || []}
        priority={priorityRaw}
        statuses={statusesRaw || []}
        currentUserId={user.id}
      />
    </div>
  );
}
