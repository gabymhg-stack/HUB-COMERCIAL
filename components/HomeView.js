"use client";

import { useMemo, useState } from "react";
import { computeKPIs } from "@/lib/data";
import PersonSwitcher from "./PersonSwitcher";
import NewTaskForm from "./NewTaskForm";
import PendientesList from "./PendientesList";
import Sidebar from "./widgets/Sidebar";

// Dueño del layout de 3 columnas de la pantalla de Pendientes: riel de
// personas (izquierda, solo Enrique/Gaby) · contenido central (KPIs,
// crear pendiente, lista) · widgets (derecha). El switcher de persona
// vive aquí (no dentro de PendientesList) para que quede separado como
// bloque propio, no pegado al botón de "+ Nuevo pendiente".
export default function HomeView({ profile, areas, types, devs, projects, people, tasks, tasksError, currentUserId }) {
  const [personFilter, setPersonFilter] = useState(null); // null = "Todo el equipo"

  const visibleTasks = useMemo(() => {
    if (!personFilter) return tasks;
    return tasks.filter((t) => t.owners?.some((o) => o.person?.id === personFilter));
  }, [tasks, personFilter]);

  const kpis = computeKPIs(visibleTasks);
  const kpiCards = [
    { label: "Activos", value: kpis.activos, color: "var(--ink)" },
    { label: "Atrasados", value: kpis.atrasados, color: "var(--danger)" },
    { label: "Parados por Enrique", value: kpis.parados, color: "#b5651d" },
    { label: "Completados esta semana", value: kpis.completadosSemana, color: "var(--good)" },
  ];

  return (
    <div
      style={{
        maxWidth: 1280,
        margin: "0 auto",
        padding: "24px 20px 60px",
        display: "flex",
        gap: 20,
        alignItems: "flex-start",
        flexWrap: "wrap",
      }}
    >
      {profile?.sees_all && people?.length > 0 && (
        <PersonSwitcher people={people} active={personFilter} onChange={setPersonFilter} />
      )}

      <div style={{ flex: "1 1 480px", minWidth: 320 }}>
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

        <NewTaskForm
          areas={areas || []}
          types={types || []}
          devs={devs || []}
          projects={projects || []}
          people={people || []}
          currentUserId={currentUserId}
        />

        {tasksError && (
          <div style={{ color: "var(--danger)", marginBottom: 16, fontSize: 13 }}>
            Error cargando pendientes: {tasksError}
          </div>
        )}

        <PendientesList
          tasks={visibleTasks}
          areas={areas || []}
          types={types || []}
          devs={devs || []}
          projects={projects || []}
          people={people || []}
          currentUserId={currentUserId}
          currentProfile={profile}
        />

        {!visibleTasks.length && !tasksError && (
          <p style={{ color: "var(--ink-muted)", fontSize: 13.5 }}>
            {personFilter ? "Esta persona no tiene pendientes ahora mismo." : "No hay pendientes todavía — crea el primero con el botón de arriba."}
          </p>
        )}
      </div>

      <Sidebar tasks={tasks} showParados={!!profile?.sees_all} />
    </div>
  );
}
