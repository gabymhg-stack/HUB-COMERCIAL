import { daysBetween, todayISO, toLocalISO } from "@/lib/data";

// Banner de "Prioridad de la semana" en el HUB de cada quien — se llena
// desde el Board de Braindump (solo Enrique/Gaby la editan ahí). Va
// justo arriba de los KPIs en el contenido principal. Si no hay
// prioridad asignada, no se renderiza nada (no queremos un cuadro vacío
// permanente para el resto del equipo).
export default function PriorityBanner({ priority }) {
  const texto = priority?.texto?.trim();
  if (!texto) return null;

  const setByName = priority?.setBy?.name;
  const days = priority?.updated_at ? daysBetween(toLocalISO(priority.updated_at) || todayISO(), todayISO()) : null;

  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        alignItems: "flex-start",
        background: "linear-gradient(135deg, var(--accent) 0%, var(--accent) 100%)",
        borderRadius: 12,
        padding: "14px 16px",
        marginBottom: 16,
      }}
    >
      <span style={{ fontSize: 22, lineHeight: 1, flex: "none" }}>🎯</span>
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: 10.5,
            fontWeight: 800,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            color: "var(--accent-ink)",
            opacity: 0.85,
            marginBottom: 3,
          }}
        >
          Tu prioridad esta semana
        </div>
        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--accent-ink)", lineHeight: 1.35 }}>{texto}</div>
        {(setByName || days !== null) && (
          <div style={{ fontSize: 11, color: "var(--accent-ink)", opacity: 0.75, marginTop: 5 }}>
            {setByName ? `— ${setByName}` : ""}
            {setByName && days !== null ? " · " : ""}
            {days !== null ? (days === 0 ? "hoy" : days === 1 ? "hace 1 día" : `hace ${days} días`) : ""}
          </div>
        )}
      </div>
    </div>
  );
}
