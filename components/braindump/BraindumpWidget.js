"use client";

import WidgetItemCard from "./WidgetItemCard";
import NewSolicitudForm from "./NewSolicitudForm";

const ESTADO_WEIGHT = { sin_aceptar: 0, bloqueado: 1, aceptado: 2 };

// Widget que vive arriba del feed de cada usuario (antes de sus tareas
// actuales): lo que le asignaron desde el Braindump de Enrique/Gaby, más
// las solicitudes que le llegaron de un compañero — y, debajo, un
// resumen de las solicitudes que él mismo mandó. `items` ya viene
// filtrado desde el server a "asignado_a = yo O creado_por = yo".
export default function BraindumpWidget({ items, people, areas, types, currentUserId }) {
  const assignedToMe = items
    .filter((i) => i.asignado_a === currentUserId && i.estado !== "completado")
    .sort(
      (a, b) =>
        (ESTADO_WEIGHT[a.estado] ?? 9) - (ESTADO_WEIGHT[b.estado] ?? 9) ||
        (a.fecha_limite || "9999").localeCompare(b.fecha_limite || "9999")
    );

  const sentByMe = items
    .filter((i) => i.creado_por === currentUserId && i.origen === "solicitud" && i.estado !== "completado")
    .sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));

  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: "14px 16px 16px",
        marginBottom: 18,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, gap: 10, flexWrap: "wrap" }}>
        <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: "0.02em" }}>
          🧠 Lo que viene de arriba {assignedToMe.length > 0 && `· ${assignedToMe.length}`}
        </div>
        <NewSolicitudForm people={people} currentUserId={currentUserId} />
      </div>

      {assignedToMe.length === 0 ? (
        <p style={{ fontSize: 12.5, color: "var(--ink-muted)", margin: 0 }}>
          No tienes nada pendiente por aceptar ahora mismo.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {assignedToMe.map((item) => (
            <WidgetItemCard
              key={item.id}
              item={item}
              mode="assigned"
              areas={areas}
              types={types}
              people={people}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      )}

      {sentByMe.length > 0 && (
        <div style={{ marginTop: 14, borderTop: "1px solid var(--border)", paddingTop: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.03em", textTransform: "uppercase", color: "var(--ink-muted)", marginBottom: 8 }}>
            Solicitudes que mandaste · {sentByMe.length}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {sentByMe.map((item) => (
              <WidgetItemCard
                key={item.id}
                item={item}
                mode="sent"
                areas={areas}
                types={types}
                people={people}
                currentUserId={currentUserId}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
