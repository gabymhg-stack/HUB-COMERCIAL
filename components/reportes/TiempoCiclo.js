import { card, title } from "./CargaPorPersona";

// Tiempo de ciclo promedio (creado → completado) por persona, en días.
// Ordenado ascendente: arriba queda quien cierra más rápido.
export default function TiempoCiclo({ data }) {
  const max = Math.max(1, ...data.map((d) => d.promedio));

  return (
    <div style={card}>
      <div style={title}>Tiempo de ciclo (creado → completado)</div>
      {data.length === 0 && (
        <p style={{ fontSize: 12.5, color: "var(--ink-muted)" }}>
          Todavía no hay suficientes pendientes completados para medir esto.
        </p>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {data.map((d) => (
          <div key={d.id}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 3 }}>
              <span style={{ fontWeight: 700 }}>{d.name}</span>
              <span style={{ color: "var(--ink-muted)" }}>{d.promedio} d en promedio</span>
            </div>
            <div style={{ height: 8, borderRadius: 4, background: "var(--surface-2)", overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  width: `${(d.promedio / max) * 100}%`,
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
