export default function CargaPorPersona({ data }) {
  const max = Math.max(1, ...data.map((d) => d.activos));

  return (
    <div style={card}>
      <div style={title}>Carga por persona</div>
      {data.every((d) => d.activos === 0) && (
        <p style={{ fontSize: 12.5, color: "var(--ink-muted)" }}>Nadie tiene pendientes activos ahora mismo.</p>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {data
          .filter((d) => d.activos > 0)
          .map((d) => (
            <div key={d.id}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 3 }}>
                <span style={{ fontWeight: 700 }}>{d.name}</span>
                <span style={{ color: "var(--ink-muted)" }}>
                  {d.activos} activo{d.activos === 1 ? "" : "s"}
                  {d.atrasados > 0 && (
                    <span style={{ color: "var(--danger)", fontWeight: 700 }}> · {d.atrasados} atrasado{d.atrasados === 1 ? "" : "s"}</span>
                  )}
                </span>
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

export const card = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 12,
  padding: 18,
};

export const title = {
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: "0.03em",
  textTransform: "uppercase",
  color: "var(--ink-muted)",
  marginBottom: 14,
};
