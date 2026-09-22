"use client";

import { groupByPerson, sortTeamOrder, visibleInBoard } from "@/lib/braindump";
import BraindumpColumn from "./BraindumpColumn";

// Vista de admins: 5 columnas (una por persona) con scroll horizontal.
// Solo llega gente con profile.sees_all (el gate real está en
// app/braindump/page.js, aquí ya se asume que sí puede verlo).
export default function BraindumpBoard({ items, people, adminIds }) {
  const visible = visibleInBoard(items, new Set(adminIds));
  const orderedPeople = sortTeamOrder(people);
  const grouped = groupByPerson(visible, orderedPeople);

  return (
    <div
      style={{
        display: "flex",
        gap: 16,
        overflowX: "auto",
        paddingBottom: 12,
      }}
    >
      {orderedPeople.map((p) => {
        const bucket = grouped[p.id] || { activos: [], hechos: [] };
        return <BraindumpColumn key={p.id} person={p} activos={bucket.activos} hechos={bucket.hechos} />;
      })}
    </div>
  );
}
