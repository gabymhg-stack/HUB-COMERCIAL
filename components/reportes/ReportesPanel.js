import { computeKPIs, reportPorPersona, reportPorArea, completadosPorSemana } from "@/lib/data";
import CargaPorPersona from "./CargaPorPersona";
import CargaPorArea from "./CargaPorArea";
import TendenciaSemanal from "./TendenciaSemanal";

export default function ReportesPanel({ tasks, people, areas }) {
  const kpis = computeKPIs(tasks);
  const kpiCards = [
    { label: "Activos", value: kpis.activos, color: "var(--ink)" },
    { label: "Atrasados", value: kpis.atrasados, color: "var(--danger)" },
    { label: "Parados por Enrique", value: kpis.parados, color: "#b5651d" },
    { label: "Completados esta semana", value: kpis.completadosSemana, color: "var(--good)" },
  ];

  const porPersona = reportPorPersona(tasks, people);
  const porArea = reportPorArea(tasks, areas);
  const tendencia = completadosPorSemana(tasks, 6);

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

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <CargaPorPersona data={porPersona} />
        <CargaPorArea data={porArea} />
        <TendenciaSemanal data={tendencia} />
      </div>
    </div>
  );
}
