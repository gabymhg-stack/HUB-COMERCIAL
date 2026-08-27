import { createClient } from "@/lib/supabase/server";
import { signOut } from "./actions";
import { groupTasks, computeKPIs } from "@/lib/data";
import PendientesList from "@/components/PendientesList";
import NewTaskForm from "@/components/NewTaskForm";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: profile }, { data: areas }, { data: types }, { data: devs }, { data: projects }, { data: people }, { data: tasksRaw, error: tasksError }] =
    await Promise.all([
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

  const tasks = tasksRaw || [];
  const groups = groupTasks(tasks);
  const kpis = computeKPIs(tasks);
  const order = ["atrasados", "hoy", "semana", "adelante", "completados"];
  const kpiCards = [
    { label: "Activos", value: kpis.activos, color: "var(--ink)" },
    { label: "Atrasados", value: kpis.atrasados, color: "var(--danger)" },
    { label: "Parados por Enrique", value: kpis.parados, color: "#b5651d" },
    { label: "Completados esta semana", value: kpis.completadosSemana, color: "var(--good)" },
  ];

  return (
    <div style={{ minHeight: "100vh" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 24px",
          borderBottom: "1px solid var(--border)",
          background: "var(--surface)",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              background: "var(--accent)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
            }}
          >
            P
          </span>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, lineHeight: 1.1 }}>HUB Control Comercial</div>
            <div style={{ fontSize: 11, color: "var(--ink-muted)" }}>POP</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span
            style={{
              width: 26,
              height: 26,
              borderRadius: "50%",
              background: profile.color,
              color: "#fff",
              fontSize: 12,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {profile.name?.slice(0, 1)}
          </span>
          <div style={{ fontSize: 12.5 }}>
            <div style={{ fontWeight: 700 }}>{profile.name}</div>
            <div style={{ color: "var(--ink-muted)" }}>{profile.role}</div>
          </div>
          <form action={signOut}>
            <button
              type="submit"
              style={{
                border: "1px solid var(--border-strong)",
                background: "var(--surface-2)",
                borderRadius: 8,
                padding: "7px 12px",
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              Cerrar sesión
            </button>
          </form>
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 20px 60px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: 10,
            marginBottom: 18,
          }}
        >
          {kpiCards.map((k) => (
            <div
              key={k.label}
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                padding: "12px 14px",
              }}
            >
              <div style={{ fontSize: 22, fontWeight: 800, color: k.color, lineHeight: 1.1 }}>
                {k.value}
              </div>
              <div style={{ fontSize: 11.5, color: "var(--ink-muted)", marginTop: 3, fontWeight: 600 }}>
                {k.label}
              </div>
            </div>
          ))}
        </div>

        <NewTaskForm
          areas={areas || []}
          types={types || []}
          devs={devs || []}
          projects={projects || []}
          people={people || []}
          currentUserId={user.id}
        />

        {tasksError && (
          <div style={{ color: "var(--danger)", marginBottom: 16, fontSize: 13 }}>
            Error cargando pendientes: {tasksError.message}
          </div>
        )}

        <PendientesList
          groups={groups}
          order={order}
          areas={areas || []}
          types={types || []}
          devs={devs || []}
          projects={projects || []}
          people={people || []}
          currentUserId={user.id}
          currentProfile={profile}
        />

        {!tasks.length && !tasksError && (
          <p style={{ color: "var(--ink-muted)", fontSize: 13.5 }}>
            No hay pendientes todavía — crea el primero con el botón de arriba.
          </p>
        )}
      </div>
    </div>
  );
}
