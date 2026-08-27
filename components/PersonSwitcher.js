"use client";

// Fila de pills para saltar entre "Todo el equipo" y la vista de una
// persona específica — recrea lo que ya se había validado en el
// prototipo. Selección única (no se combina con los chips de Filtros).
// Solo se usa para Enrique/Gaby (sees_all) — el resto del equipo ya
// aterriza filtrado a lo suyo por RLS, no necesita este switch.
export default function PersonSwitcher({ people, active, onChange }) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
      <Pill active={active === null} onClick={() => onChange(null)} label="Todo el equipo" sub="Vista general" />
      {people.map((p) => (
        <Pill
          key={p.id}
          active={active === p.id}
          onClick={() => onChange(p.id)}
          avatarColor={p.color}
          initial={p.name?.slice(0, 1)}
          label={p.name}
          sub={p.role}
        />
      ))}
    </div>
  );
}

function Pill({ active, onClick, label, sub, avatarColor, initial }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 14px",
        borderRadius: 999,
        border: "1px solid " + (active ? "var(--accent)" : "var(--border)"),
        background: active ? "var(--accent)" : "var(--surface)",
        color: active ? "var(--accent-ink)" : "var(--ink)",
        cursor: "pointer",
        textAlign: "left",
      }}
    >
      {avatarColor && (
        <span
          style={{
            width: 22,
            height: 22,
            borderRadius: "50%",
            background: avatarColor,
            color: "#fff",
            fontSize: 10.5,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flex: "none",
          }}
        >
          {initial}
        </span>
      )}
      <span>
        <div style={{ fontWeight: 700, fontSize: 13, lineHeight: 1.2 }}>{label}</div>
        {sub && <div style={{ fontSize: 10.5, opacity: 0.8 }}>{sub}</div>}
      </span>
    </button>
  );
}
