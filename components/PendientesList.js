"use client";

import { useState } from "react";
import TaskCard from "./TaskCard";
import TaskDetailModal from "./TaskDetailModal";
import { GROUP_LABELS } from "@/lib/data";

export default function PendientesList({
  groups,
  order,
  areas,
  types,
  devs,
  projects,
  people,
  currentUserId,
  currentProfile,
}) {
  const [openTask, setOpenTask] = useState(null);

  return (
    <>
      {order.map((key) => {
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
