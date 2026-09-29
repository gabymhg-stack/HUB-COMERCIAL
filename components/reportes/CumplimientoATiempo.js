import { card, title } from "./CargaPorPersona";

// % de lo completado que se cerró en o antes de su fecha límite. Barra
// de dos segmentos (bueno/malo) con conteos siempre visibles al lado —
// nunca solo el color para distinguir a tiempo de tarde.
export default function CumplimientoATiempo({ data }) {
  const { onTime, late, total, pct } = data;

  return (
    <div style={card}>
      <div style={title}>Cumplimiento a tiempo</div>
      {total === 0 ? (
        <p style={{ fontSize: 12.5, color: "var(--ink-muted)" }}>
          Todavía no hay suficientes pendientes completados con fecha límite para medir esto.
        </p>
      ) : (
        <>
          <div style={{ fontSize: 28, fontWeight: 800, color: "var(--good)", lineHeight: 1 }}>
            {pct}%
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-muted)", marginLeft: 8 }}>
              se cerró en o antes de su fecha
            </span>
          </div>
          <div style={{ display: "flex", height: 10, borderRadius: 5, overflow: "hidden", marginTop: 12, gap: 2 }}>
            <div style={{ width: `${(onTime / total) * 100}%`, background: "var(--good)" }} />
            <div style={{ width: `${(late / total) * 100}%`, background: "var(--danger)" }} />
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 11.5,
              color: "var(--ink-muted)",
              marginTop: 6,
            }}
          >
            <span>
              <b style={{ color: "var(--good)" }}>{onTime}</b> a tiempo
            </span>
            <span>
              <b style={{ color: "var(--danger)" }}>{late}</b> tarde
            </span>
          </div>
        </>
      )}
    </div>
  );
}
