import { createClient } from "@/lib/supabase/server";
import { signOut } from "./actions";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // El middleware ya garantiza que aquí siempre hay un usuario autenticado.
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  const { count: taskCount, error: tasksError } = await supabase
    .from("tasks")
    .select("*", { count: "exact", head: true });

  const { count: areaCount } = await supabase
    .from("areas")
    .select("*", { count: "exact", head: true });

  return (
    <div style={{ minHeight: "100vh", padding: "40px 20px" }}>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>HUB Control Comercial</h1>
          <form action={signOut}>
            <button
              type="submit"
              style={{
                border: "1px solid var(--border-strong)",
                background: "var(--surface-2)",
                borderRadius: 8,
                padding: "7px 12px",
                fontSize: 12.5,
                fontWeight: 600,
              }}
            >
              Cerrar sesión
            </button>
          </form>
        </div>

        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border-strong)",
            borderRadius: 14,
            padding: 24,
          }}
        >
          <p style={{ fontSize: 13, color: "var(--ink-muted)", margin: "0 0 16px" }}>
            Esta es la base de la app real — todavía no tiene las pantallas del prototipo
            (pendientes, proyectos, ajustes). Sirve para confirmar que el login, la base de
            datos y el despliegue ya están conectados de punta a punta.
          </p>

          <Row label="Sesión iniciada como" value={user.email} ok />
          <Row
            label="Perfil en la tabla profiles"
            value={
              profile
                ? `${profile.name} · ${profile.role}`
                : "No encontrado — falta crear tu fila en profiles (ver instrucciones)"
            }
            ok={!!profile}
          />
          <Row
            label="Conexión a la base de datos"
            value={
              tasksError
                ? `Error: ${tasksError.message}`
                : `OK — ${taskCount ?? 0} pendientes, ${areaCount ?? 0} áreas`
            }
            ok={!tasksError}
          />
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, ok }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
        padding: "10px 0",
        borderTop: "1px solid var(--border)",
      }}
    >
      <span
        style={{
          width: 18,
          height: 18,
          borderRadius: "50%",
          flex: "none",
          marginTop: 1,
          background: ok ? "var(--good)" : "var(--warning)",
          color: "#fff",
          fontSize: 11,
          fontWeight: 800,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {ok ? "✓" : "!"}
      </span>
      <div>
        <div style={{ fontSize: 12, color: "var(--ink-muted)", fontWeight: 600 }}>{label}</div>
        <div style={{ fontSize: 14 }}>{value}</div>
      </div>
    </div>
  );
}
