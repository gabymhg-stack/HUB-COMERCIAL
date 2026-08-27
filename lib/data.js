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

// Datos para el widget de calendario del sidebar: día 1..N del mes,
// día de la semana en que arranca (0=lunes) y cuántos pendientes (no
// completados) vencen cada día. Solo fechas dentro del HUB — sin
// integración a Google/Outlook.
export function calendarDays(tasks, year, month) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const rawFirstWeekday = new Date(year, month, 1).getDay(); // 0=domingo
  const firstWeekday = (rawFirstWeekday + 6) % 7; // 0=lunes

  const counts = {};
  for (const t of tasks) {
    if (!t.due_date || t.status === "completado") continue;
    const [y, m, d] = t.due_date.split("-").map(Number);
    if (y === year && m === month + 1) {
      counts[d] = (counts[d] || 0) + 1;
    }
  }

  return { daysInMonth, firstWeekday, counts };
}

// Próximos pendientes de tipo "Rutinario" que aún no se completan,
// ordenados por fecha (los sin fecha van al final). La generación
// automática de cada ocurrencia todavía no existe — este widget solo
// muestra los que ya están cargados como pendientes.
export function upcomingRutinarios(tasks, limit = 6) {
  return tasks
    .filter((t) => t.type?.name === "Rutinario" && t.status !== "completado")
    .sort((a, b) => (a.due_date || "9999").localeCompare(b.due_date || "9999"))
    .slice(0, limit);
}

// Pendientes marcados como "parados por Enrique" que siguen sin
// completarse, ordenados por fecha.
export function paradosPorEnrique(tasks) {
  return tasks
    .filter((t) => t.blocked_by_enrique && t.status !== "completado")
    .sort((a, b) => (a.due_date || "9999").localeCompare(b.due_date || "9999"));
}

// ---- Reportes (solo Enrique/Gaby) ----

// Carga de trabajo por persona: activos y atrasados, contando cada
// pendiente una vez por cada responsable asignado (task_owners).
export function reportPorPersona(tasks, people) {
  const today = todayISO();
  const map = {};
  for (const p of people) map[p.id] = { id: p.id, name: p.name, color: p.color, activos: 0, atrasados: 0 };

  for (const t of tasks) {
    if (t.status === "completado") continue;
    const atrasado = !!(t.due_date && daysBetween(today, t.due_date) < 0);
    const owners = t.owners || [];
    for (const o of owners) {
      const pid = o.person?.id;
      if (!pid || !map[pid]) continue;
      map[pid].activos++;
      if (atrasado) map[pid].atrasados++;
    }
  }

  return Object.values(map).sort((a, b) => b.activos - a.activos);
}

// Distribución de pendientes activos por Área.
export function reportPorArea(tasks, areas) {
  const map = {};
  for (const a of areas) map[a.id] = { id: a.id, name: a.name, color: a.color, activos: 0 };

  for (const t of tasks) {
    if (t.status === "completado") continue;
    if (map[t.area_id]) map[t.area_id].activos++;
  }

  return Object.values(map).sort((a, b) => b.activos - a.activos);
}

// Tendencia de completados por semana (lunes a domingo), las últimas
// `weeks` semanas incluyendo la actual (parcial).
export function completadosPorSemana(tasks, weeks = 6) {
  const today = todayISO();
  const [y, m, d] = today.split("-").map(Number);
  const todayDate = new Date(y, m - 1, d);
  const dow = (todayDate.getDay() + 6) % 7; // 0=lunes
  const startOfThisWeek = new Date(todayDate);
  startOfThisWeek.setDate(todayDate.getDate() - dow);

  const buckets = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const start = new Date(startOfThisWeek);
    start.setDate(startOfThisWeek.getDate() - i * 7);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    buckets.push({ start, end, count: 0 });
  }

  for (const t of tasks) {
    if (t.status !== "completado" || !t.completed_at) continue;
    const iso = toLocalISO(t.completed_at);
    const [ty, tm, td] = iso.split("-").map(Number);
    const dt = new Date(ty, tm - 1, td);
    for (const b of buckets) {
      if (dt >= b.start && dt <= b.end) {
        b.count++;
        break;
      }
    }
  }

  return buckets.map((b) => ({
    label: `${b.start.getDate()}/${b.start.getMonth() + 1}`,
    count: b.count,
  }));
}
