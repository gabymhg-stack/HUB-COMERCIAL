"use client";

import { useState } from "react";

const SORT_OPTIONS = [
  { value: "urgencia", label: "Urgencia" },
  { value: "prioridad", label: "Prioridad" },
  { value: "fecha", label: "Fecha de entrega" },
  { value: "proyecto", label: "Proyecto" },
];

export default function FiltersBar({ areas, types, projects, filters, setFilters, sortBy, setSortBy }) {
  const [open, setOpen] = useState(false);

  const activeCount =
    filters.areas.length + filters.types.length + filters.priorities.length + filters.projects.length;

  function toggle(group, id) {
    setFilters((f) => ({
      ...f,
      [group]: f[group].includes(id) ? f[group].filter((x) => x !== id) : [...f[group], id],
    }));
  }

  function clearAll() {
    setFilters({ areas: [], types: [], priorities: [], projects: [] });
  }

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <button
          onClick={() => setOpen((o) => !o)}
          style={{
            ...btnGhost,
            background: activeCount > 0 ? "var(--accent)" : "var(--surface-2)",
            color: activeCount > 0 ? "var(--accent-ink)" : "var(--ink)",
          }}
        >
          Filtros{activeCount > 0 ? ` (${activeCount})` : ""}
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5 }}>
          <span style={{ color: "var(--ink-muted)" }}>Ordenar por</span>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={select}>
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {activeCount > 0 && (
          <button onClick={clearAll} style={{ ...btnGhost, fontSize: 12, padding: "6px 10px" }}>
            Limpiar filtros
          </button>
        )}
      </div>

      {open && (
        <div
          style={{
            marginTop: 10,
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            padding: 14,
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <ChipRow
            label="Área"
            items={areas}
            selected={filters.areas}
            onToggle={(id) => toggle("areas", id)}
          />
          <ChipRow
            label="Tipo"
            items={types}
            selected={filters.types}
            onToggle={(id) => toggle("types", id)}
          />
          <ChipRow
            label="Prioridad"
            items={[
              { id: "alta", name: "Alta" },
              { id: "media", name: "Media" },
              { id: "baja", name: "Baja" },
            ]}
            selected={filters.priorities}
            onToggle={(id) => toggle("priorities", id)}
          />
          <ChipRow
            label="Proyecto"
            items={projects}
            selected={filters.projects}
            onToggle={(id) => toggle("projects", id)}
          />
        </div>
      )}
    </div>
  );
}

function ChipRow({ label, items, selected, onToggle }) {
  if (!items.length) return null;
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-muted)", marginBottom: 5 }}>{label}</div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {items.map((item) => {
          const active = selected.includes(item.id);
          return (
            <button
              key={item.id}
              onClick={() => onToggle(item.id)}
              style={{
                border: "1px solid var(--border-strong)",
                borderRadius: 20,
                padding: "4px 11px",
                fontSize: 12,
                fontWeight: 600,
                background: active ? "var(--accent)" : "var(--surface-2)",
                color: active ? "var(--accent-ink)" : "var(--ink)",
              }}
            >
              {item.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const btnGhost = {
  border: "1px solid var(--border-strong)",
  borderRadius: 8,
  padding: "7px 13px",
  fontSize: 13,
  fontWeight: 700,
};
const select = {
  padding: "6px 9px",
  borderRadius: 8,
  border: "1px solid var(--border-strong)",
  background: "var(--surface-2)",
  color: "var(--ink)",
  fontSize: 12.5,
};
