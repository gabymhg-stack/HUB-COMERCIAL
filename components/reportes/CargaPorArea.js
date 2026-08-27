import { card, title } from "./CargaPorPersona";

export default function CargaPorArea({ data }) {
  const max = Math.max(1, ...data.map((d) => d.activos));

  return (
    <div style={card}>
      <div style={title}>Distribución por área</div>
      {data.every((d) => d.activos === 0) && (
        <p style={{ fontSize: 12.5, color: "var(--ink-muted)" }}>No hay pendientes activos todavía.</p>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {data
          .filter((d) => d.activos > 0)
          .map((d) => (
            <div key={d.id}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 3 }}>
                <span style={{ fontWeight: 700 }}>{d.name}</span>
                <span style={{ color: "var(--ink-muted)" }}>{d.activos}</span>
              </div>
              <div style={{ height: 8, borderRadius: 4, background: "var(--surface-2)", overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    width: `${(d.activos / max) * 100}%`,
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
