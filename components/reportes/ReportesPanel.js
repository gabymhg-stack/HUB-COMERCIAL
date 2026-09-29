import {
  computeKPIs,
  reportPorPersona,
  reportPorArea,
  completadosPorSemana,
  cicloPromedioPorPersona,
  cumplimientoATiempo,
  antiguedadPendientes,
  reportPorProyecto,
} from "@/lib/data";
import { velocidadAceptacion } from "@/lib/braindump";
import CargaPorPersona from "./CargaPorPersona";
import CargaPorArea from "./CargaPorArea";
import TendenciaSemanal from "./TendenciaSemanal";
import TiempoCiclo from "./TiempoCiclo";
import CumplimientoATiempo from "./CumplimientoATiempo";
import AntiguedadPendientes from "./AntiguedadPendientes";
import CargaPorProyecto from "./CargaPorProyecto";
import VelocidadAceptacion from "./VelocidadAceptacion";

export default function ReportesPanel({ tasks, people, areas, projects, braindumpItems }) {
  const kpis = computeKPIs(tasks);
  const kpiCards = [
    { label: "Activos", value: kpis.activos, color: "var(--ink)" },
    { label: "Atrasados", value: kpis.atrasados, color: "var(--danger)" },
    { label: "Bloqueados por Enrique", value: kpis.parados, color: "#b5651d" },
    { label: "Completados esta semana", value: kpis.completadosSemana, color: "var(--good)" },
  ];

  const porPersona = reportPorPersona(tasks, people);
  const porArea = reportPorArea(tasks, areas);
  const tendencia = completadosPorSemana(tasks, 6);
  const ciclo = cicloPromedioPorPersona(tasks, people);
  const cumplimiento = cumplimientoATiempo(tasks);
  const antiguedad = antiguedadPendientes(tasks);
  const porProyecto = reportPorProyecto(tasks, projects || []);
  const velocidad = velocidadAceptacion(braindumpItems || [], people);

  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: 10,
          marginBottom: 18,
        }}
      >
        {kpiCards.map((k) => (
          <div
            key={k.label}
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 10,
              padding: "12px 14px",
            }}
          >
            <div style={{ fontSize: 22, fontWeight: 800, color: k.color, lineHeight: 1.1 }}>{k.value}</div>
            <div style={{ fontSize: 11.5, color: "var(--ink-muted)", marginTop: 3, fontWeight: 600 }}>
              {k.label}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
          gap: 16,
          alignItems: "start",
        }}
      >
        <CargaPorPersona data={porPersona} />
        <CargaPorArea data={porArea} />
        <CargaPorProyecto data={porProyecto} />
        <TendenciaSemanal data={tendencia} />
        <TiempoCiclo data={ciclo} />
        <CumplimientoATiempo data={cumplimiento} />
        <AntiguedadPendientes data={antiguedad} />
        <VelocidadAceptacion data={velocidad} />
      </div>
    </div>
  );
}
