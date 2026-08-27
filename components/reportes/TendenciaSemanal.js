import { card, title } from "./CargaPorPersona";

export default function TendenciaSemanal({ data }) {
  const max = Math.max(1, ...data.map((d) => d.count));

  return (
    <div style={card}>
      <div style={title}>Completados por semana</div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 120 }}>
        {data.map((d, i) => (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--ink-2)" }}>{d.count}</div>
            <div
              style={{
                width: "100%",
                maxWidth: 28,
                height: Math.max(4, (d.count / max) * 80),
                borderRadius: "4px 4px 0 0",
                background: i === data.length - 1 ? "var(--accent)" : "var(--border-strong)",
              }}
            />
            <div style={{ fontSize: 10.5, color: "var(--ink-muted)" }}>{d.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
