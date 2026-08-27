// Helpers de fecha y agrupación por urgencia — misma lógica que el
// prototipo: Atrasados / Hoy / Esta semana / Más adelante / Completados.

export function todayISO() {
  const d = new Date();
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d - tz).toISOString().slice(0, 10);
}

// Convierte un timestamp UTC (como lo guarda Supabase, ej. created_at,
// completed_at) a la fecha calendario LOCAL del navegador. Nunca usar
// timestamp.slice(0,10) directo: eso da la fecha en UTC, que en Monterrey
// (UTC-6) puede ya ser "mañana" y produce cosas como "-1 días".
export function toLocalISO(timestamp) {
  if (!timestamp) return null;
  const d = new Date(timestamp);
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

// KPIs de la fila superior: Activos, Atrasados, Parados por Enrique,
// Completados esta semana (últimos 7 días naturales incluyendo hoy).
export function computeKPIs(tasks) {
  const today = todayISO();
  let activos = 0;
  let atrasados = 0;
  let parados = 0;
  let completadosSemana = 0;

  for (const t of tasks) {
    const done = t.status === "completado";
    if (!done) {
      activos++;
      if (t.due_date && daysBetween(today, t.due_date) < 0) atrasados++;
      if (t.blocked_by_enrique) parados++;
    } else if (t.completed_at) {
      const d = toLocalISO(t.completed_at);
      const diff = daysBetween(d, today);
      if (diff >= 0 && diff <= 7) completadosSemana++;
    }
  }

  return { activos, atrasados, parados, completadosSemana };
}
