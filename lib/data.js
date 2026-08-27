// Helpers de fecha y agrupación por urgencia — misma lógica que el
// prototipo: Atrasados / Hoy / Esta semana / Más adelante / Completados.

export function todayISO() {
  const d = new Date();
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d - tz).toISOString().slice(0, 10);
}

export function daysBetween(a, b) {
  const A = new Date(a + "T00:00:00");
  const B = new Date(b + "T00:00:00");
  return Math.round((B - A) / 86400000);
}

export function groupTasks(tasks) {
  const today = todayISO();
  const groups = { atrasados: [], hoy: [], semana: [], adelante: [], completados: [] };

  for (const t of tasks) {
    if (t.status === "completado") {
      groups.completados.push(t);
      continue;
    }
    if (!t.due_date) {
      groups.adelante.push(t);
      continue;
    }
    const diff = daysBetween(today, t.due_date);
    if (diff < 0) groups.atrasados.push(t);
    else if (diff === 0) groups.hoy.push(t);
    else if (diff <= 7) groups.semana.push(t);
    else groups.adelante.push(t);
  }

  const byDate = (a, b) => (a.due_date || "9999").localeCompare(b.due_date || "9999");
  groups.atrasados.sort(byDate);
  groups.semana.sort(byDate);
  groups.adelante.sort(byDate);
  groups.completados.sort((a, b) => (b.completed_at || "").localeCompare(a.completed_at || ""));

  return groups;
}

export const GROUP_LABELS = {
  atrasados: "Atrasados",
  hoy: "Hoy",
  semana: "Esta semana",
  adelante: "Más adelante",
  completados: "Completados",
};
