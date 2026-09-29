import { card, title } from "./CargaPorPersona";

function formatHoras(h) {
  if (h < 24) return `${h} h`;
  return `${Math.round((h / 24) * 10) / 10} d`;
}

// Velocidad de aceptación del Braindump: tiempo promedio entre que se
// crea un item y la persona lo acepta. Ordenado ascendente: arriba
// queda quien acepta más rápido.
export default function VelocidadAceptacion({ data }) {
  const max = Math.max(1, ...data.map((d) => d.promedioHoras));

  return (
    <div style={card}>
      <div style={title}>Braindump — velocidad de aceptación</div>
      {data.length === 0 && (
        <p style={{ fontSize: 12.5, color: "var(--ink-muted)" }}>Todavía no hay items aceptados para medir esto.</p>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {data.map((d) => (
          <div key={d.id}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 3 }}>
              <span style={{ fontWeight: 700 }}>{d.name}</span>
              <span style={{ color: "var(--ink-muted)" }}>{formatHoras(d.promedioHoras)} en promedio</span>
            </div>
            <div style={{ height: 8, borderRadius: 4, background: "var(--surface-2)", overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  width: `${(d.promedioHoras / max) * 100}%`,
                  background: d.color || "var(--accent)",
                  borderRadius: 4,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
