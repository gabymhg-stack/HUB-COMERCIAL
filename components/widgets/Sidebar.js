import CalendarWidget from "./CalendarWidget";
import ParadosWidget from "./ParadosWidget";
import RutinariosWidget from "./RutinariosWidget";

// Orden fijo por diseño: Calendario, Parados por Enrique (solo
// Enrique/Gaby), Rutinarios próximos.
export default function Sidebar({ tasks, showParados }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, flex: "0 0 280px", minWidth: 260 }}>
      <CalendarWidget tasks={tasks} />
      {showParados && <ParadosWidget tasks={tasks} />}
      <RutinariosWidget tasks={tasks} />
    </div>
  );
}
