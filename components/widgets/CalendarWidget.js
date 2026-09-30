import { todayISO, calendarDays } from "@/lib/data";

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];
const WEEKDAYS = ["L", "M", "M", "J", "V", "S", "D"];

export default function CalendarWidget({ tasks }) {
  const today = todayISO();
  const [year, monthOneBased, todayDay] = today.split("-").map(Number);
  const month = monthOneBased - 1; // 0-based, como lo espera calendarDays
  const { daysInMonth, firstWeekday, counts, eventos } = calendarDays(tasks, year, month);

  const cells = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div style={widgetCard}>
      <div style={widgetTitle}>
        Calendario · {MONTHS[month]} {year}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 4 }}>
        {WEEKDAYS.map((w, i) => (
          <div
            key={i}
            style={{ fontSize: 10.5, fontWeight: 700, color: "var(--ink-muted)", textAlign: "center" }}
          >
            {w}
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
        {cells.map((d, i) => {
          if (d === null) return <div key={i} />;
          const isToday = d === todayDay;
          const count = counts[d] || 0;
          const eventCount = eventos[d] || 0;
          const isEvento = eventCount > 0;
          const title = isEvento
            ? `${eventCount} evento${eventCount === 1 ? "" : "s"}${
                count > eventCount ? ` · ${count} pendiente${count === 1 ? "" : "s"} en total` : ""
              }`
            : count
            ? `${count} pendiente${count === 1 ? "" : "s"}`
            : undefined;
          return (
            <div
              key={i}
              title={title}
              style={{
                aspectRatio: "1",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 6,
                fontSize: 11.5,
                fontWeight: isToday || isEvento ? 800 : 600,
                background: isToday ? "var(--accent)" : "transparent",
                color: isToday ? "var(--accent-ink)" : "var(--ink-2)",
                outline: isEvento ? `2px solid ${isToday ? "var(--accent-ink)" : "var(--accent)"}` : "none",
                outlineOffset: -2,
              }}
            >
              {d}
              <span
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: "50%",
                  marginTop: 1,
                  background: count ? (isToday ? "var(--accent-ink)" : "var(--danger)") : "transparent",
                }}
              />
            </div>
          );
        })}
      </div>

      {Object.keys(eventos).length > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 8, fontSize: 10.5, color: "var(--ink-muted)" }}>
          <span style={{ width: 10, height: 10, borderRadius: 3, border: "2px solid var(--accent)", flex: "none" }} />
          Evento
        </div>
      )}
    </div>
  );
}

export const widgetCard = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 12,
  padding: "14px 14px 16px",
};

export const widgetTitle = {
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: "0.03em",
  textTransform: "uppercase",
  color: "var(--ink-muted)",
  marginBottom: 10,
};
