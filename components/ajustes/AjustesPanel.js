"use client";

import { useState } from "react";
import CatalogManager from "./CatalogManager";
import ProjectsManager from "./ProjectsManager";
import TeamManager from "./TeamManager";

const TABS = [
  { key: "areas", label: "Áreas" },
  { key: "devs", label: "Desarrollos" },
  { key: "types", label: "Tipos" },
  { key: "projects", label: "Proyectos" },
  { key: "team", label: "Equipo" },
];

export default function AjustesPanel({ areas, devs, types, projects, people, currentUserId }) {
  const [tab, setTab] = useState("areas");

  return (
    <div>
      <div style={{ display: "flex", gap: 6, marginBottom: 18, flexWrap: "wrap" }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              border: "1px solid var(--border-strong)",
              borderRadius: 8,
              padding: "7px 14px",
              fontSize: 13,
              fontWeight: 700,
              background: tab === t.key ? "var(--accent)" : "var(--surface)",
              color: tab === t.key ? "var(--accent-ink)" : "var(--ink)",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          padding: 18,
        }}
      >
        {tab === "areas" && (
          <CatalogManager
            tableName="areas"
            label="Áreas"
            withColor
            initialItems={areas}
            usageChecks={[{ table: "tasks", column: "area_id" }]}
          />
        )}
        {tab === "devs" && (
          <CatalogManager
            tableName="dev_tags"
            label="Desarrollos"
            withColor
            initialItems={devs}
            usageChecks={[
              { table: "tasks", column: "dev_id" },
              { table: "projects", column: "dev_id" },
            ]}
          />
        )}
        {tab === "types" && (
          <CatalogManager
            tableName="type_labels"
            label="Tipos"
            withColor={false}
            initialItems={types}
            usageChecks={[{ table: "tasks", column: "type_id" }]}
          />
        )}
        {tab === "projects" && <ProjectsManager initialItems={projects} />}
        {tab === "team" && <TeamManager initialItems={people} currentUserId={currentUserId} />}
      </div>
    </div>
  );
}
