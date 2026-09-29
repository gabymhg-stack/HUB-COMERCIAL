import { card, title } from "./CargaPorPersona";

// Antigüedad de lo atrasado y de lo bloqueado: promedio + el más viejo,
// no solo el conteo actual. "Bloqueados" es una aproximación (ver nota
// en lib/data.js: no existe timestamp de "cuándo se bloqueó").
export default function AntiguedadPendientes({ data }) {
  const { atrasados, bloqueados } = data;

  return (
    <div style={card}>
      <div style={title}>Antigüedad de lo pendiente</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <StatBlock label="Atrasados" n={atrasados.n} promedio={atrasados.promedio} max={atrasados.max} color="var(--danger)" />
        <StatBlock label="Bloqueados" n={bloqueados.n} promedio={bloqueados.promedio} max={bloqueados.max} color="#b5651d" />
      </div>
      <p style={{ fontSize: 10.5, color: "var(--ink-muted)", marginTop: 12 }}>
        Bloqueados: aproximado — se mide desde que se creó el pendiente, porque no se guarda la fecha exacta en que se bloqueó.
      </p>
    </div>
  );
}

function StatBlock({ label, n, promedio, max, color }) {
  if (!n) {
    return (
      <div>
        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-muted)", marginBottom: 4 }}>{label}</div>
        <p style={{ fontSize: 12, color: "var(--ink-muted)" }}>Ninguno ahora mismo.</p>
      </div>
    );
  }
  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 700, color, marginBottom: 4 }}>
        {label} · {n}
      </div>
      <div style={{ fontSize: 20, fontWeight: 800, lineHeight: 1.1 }}>{promedio} d</div>
      <div style={{ fontSize: 11, color: "var(--ink-muted)" }}>promedio · el más viejo lleva {max} d</div>
    </div>
  );
}
