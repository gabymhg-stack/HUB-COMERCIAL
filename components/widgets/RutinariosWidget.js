import { upcomingRutinarios } from "@/lib/data";
import { widgetCard, widgetTitle } from "./CalendarWidget";

export default function RutinariosWidget({ tasks }) {
  const list = upcomingRutinarios(tasks);

  return (
    <div style={widgetCard}>
      <div style={widgetTitle}>Rutinarios próximos</div>

      {list.length === 0 && (
        <p style={{ fontSize: 12.5, color: "var(--ink-muted)" }}>No hay rutinarios pendientes cargados.</p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {list.map((t) => (
          <div key={t.id}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {t.title}
            </div>
            <div style={{ fontSize: 11.5, color: "var(--ink-muted)" }}>
              {t.area?.name ? t.area.name + " · " : ""}
              {t.due_date || "Sin fecha"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
