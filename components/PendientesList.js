"use client";

import { useMemo, useState } from "react";
import TaskCard from "./TaskCard";
import TaskDetailModal from "./TaskDetailModal";
import FiltersBar from "./FiltersBar";
import PersonSwitcher from "./PersonSwitcher";
import { groupTasks, GROUP_LABELS } from "@/lib/data";

const PRIORITY_ORDER = { alta: 0, media: 1, baja: 2 };

function sortFlat(tasks, sortBy) {
  const arr = [...tasks];
  const doneWeight = (t) => (t.status === "completado" ? 1 : 0);
  if (sortBy === "prioridad") {
    arr.sort(
      (a, b) =>
        doneWeight(a) - doneWeight(b) ||
        PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority] ||
        (a.due_date || "9999").localeCompare(b.due_date || "9999")
    );
  } else if (sortBy === "fecha") {
    arr.sort((a, b) => doneWeight(a) - doneWeight(b) || (a.due_date || "9999").localeCompare(b.due_date || "9999"));
  } else if (sortBy === "proyecto") {
    arr.sort(
      (a, b) =>
        doneWeight(a) - doneWeight(b) ||
        (a.project?.name || "zzzzz").localeCompare(b.project?.name || "zzzzz") ||
        (a.title || "").localeCompare(b.title || "")
    );
  }
  return arr;
}

export default function PendientesList({
  tasks,
  areas,
  types,
  devs,
  projects,
  people,
  currentUserId,
  currentProfile,
}) {
  const [openTask, setOpenTask] = useState(null);
  const [filters, setFilters] = useState({ areas: [], types: [], priorities: [], projects: [] });
  const [sortBy, setSortBy] = useState("urgencia");
  const [personFilter, setPersonFilter] = useState(null); // null = "Todo el equipo"

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      if (personFilter && !t.owners?.some((o) => o.person?.id === personFilter)) return false;
      if (filters.areas.length && !filters.areas.includes(t.area_id)) return false;
      if (filters.types.length && !filters.types.includes(t.type_id)) return false;
      if (filters.priorities.length && !filters.priorities.includes(t.priority)) return false;
      if (filters.projects.length && !filters.projects.includes(t.project_id)) return false;
      return true;
    });
  }, [tasks, filters, personFilter]);

  const order = ["atrasados", "hoy", "semana", "adelante", "completados"];
  const groups = sortBy === "urgencia" ? groupTasks(filtered) : null;
  const flatList = sortBy === "urgencia" ? null : sortFlat(filtered, sortBy);

  return (
    <>
      {currentProfile?.sees_all && people?.length > 0 && (
        <PersonSwitcher people={people} active={personFilter} onChange={setPersonFilter} />
      )}

      <FiltersBar
        areas={areas}
        types={types}
        projects={projects}
        filters={filters}
        setFilters={setFilters}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />

      {groups &&
        order.map((key) => {
          const list = groups[key];
          if (!list.length) return null;
          return (
            <div key={key} style={{ marginBottom: 22 }}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  color: key === "atrasados" ? "var(--danger)" : "var(--ink-muted)",
                  marginBottom: 8,
                }}
              >
                {GROUP_LABELS[key]} · {list.length}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {list.map((t) => (
                  <TaskCard key={t.id} task={t} onOpen={() => setOpenTask(t)} />
                ))}
              </div>
            </div>
          );
        })}

      {flatList && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 22 }}>
          {flatList.map((t) => (
            <TaskCard key={t.id} task={t} onOpen={() => setOpenTask(t)} />
          ))}
          {flatList.length === 0 && (
            <p style={{ color: "var(--ink-muted)", fontSize: 13.5 }}>Nada coincide con esos filtros.</p>
          )}
        </div>
      )}

      {openTask && (
        <TaskDetailModal
          task={openTask}
          areas={areas}
          types={types}
          devs={devs}
          projects={projects}
          people={people}
          currentUserId={currentUserId}
          currentProfile={currentProfile}
          onClose={() => setOpenTask(null)}
        />
      )}
    </>
  );
}
