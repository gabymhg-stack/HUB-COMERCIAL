"use client";

// Columna del lado izquierdo para saltar entre "Todo el equipo" y la
// vista de una persona específica — recrea lo que ya se había validado
// en el prototipo, pero como riel vertical (separado del resto de la
// pantalla) para que no se sienta pegado al botón de "+ Nuevo pendiente".
// Selección única (no se combina con los chips de Filtros). Solo se usa
// para Enrique/Gaby (sees_all) — el resto del equipo ya aterriza
// filtrado a lo suyo por RLS, no necesita este switch.
export default function PersonSwitcher({ people, active, onChange }) {
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: 10,
        display: "flex",
        flexDirection: "column",
        gap: 4,
        flex: "0 0 210px",
        minWidth: 180,
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: "0.03em",
          textTransform: "uppercase",
          color: "var(--ink-muted)",
          padding: "4px 8px 8px",
        }}
      >
        Ver pendientes de
      </div>

      <Row active={active === null} onClick={() => onChange(null)} label="Todo el equipo" sub="Vista general" />

      {people.map((p) => (
        <Row
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

function Row({ active, onClick, label, sub, avatarColor, initial }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 8px",
        borderRadius: 8,
        border: "none",
        width: "100%",
        background: active ? "var(--accent)" : "transparent",
        color: active ? "var(--accent-ink)" : "var(--ink)",
        cursor: "pointer",
        textAlign: "left",
      }}
    >
      <span
        style={{
          width: 22,
          height: 22,
          borderRadius: "50%",
          background: avatarColor || (active ? "var(--accent-ink)" : "var(--surface-2)"),
          color: avatarColor ? "#fff" : active ? "var(--accent)" : "var(--ink-muted)",
          fontSize: 10.5,
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flex: "none",
        }}
      >
        {initial || "•"}
      </span>
      <span style={{ minWidth: 0 }}>
        <div
          style={{
            fontWeight: 700,
            fontSize: 13,
            lineHeight: 1.2,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {label}
        </div>
        {sub && (
          <div style={{ fontSize: 10.5, opacity: 0.8, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {sub}
          </div>
        )}
      </span>
    </button>
  );
}
