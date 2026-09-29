// Helpers puros del módulo Braindump — catálogo de tags, semáforo de
// días restantes y agrupación por persona. Reutiliza los helpers de
// fecha ya existentes en lib/data.js (misma zona horaria local, mismo
// criterio de "hoy") para que Braindump y el resto del HUB nunca
// calculen los días de forma distinta.
import { daysBetween, todayISO } from "./data";

// Lista exacta de tags del Braindump, con sus colores — es un catálogo
// fijo (no editable desde Ajustes), a propósito: son pocos y así se
// evita otro CRUD para algo que casi no cambia.
export const BRAINDUMP_TAGS = [
  { key: "ER", label: "ER", color: "#0D9488" },
  { key: "Pop", label: "Pop", color: "#6B7280" },
  { key: "Com", label: "Com", color: "#DC2626" },
  { key: "Mkt", label: "Mkt", color: "#65A30D" },
  { key: "GH", label: "GH", color: "#0891B2" },
  { key: "ATK", label: "ATK", color: "#4F46E5" },
  { key: "PTK", label: "PTK", color: "#C026D3" },
  { key: "TPK", label: "TPK", color: "#16A34A" },
  { key: "QRC", label: "QRC", color: "#92400E" },
];

export function tagInfo(tag) {
  return BRAINDUMP_TAGS.find((t) => t.key === tag) || null;
}

// Semáforo de días restantes hasta fecha_limite. Resuelve el traslape
// entre "5-20 días" y "1-5 días" del brief dándole el día 5 al ámbar
// (el corte queda: >20 gris · 6-20 verde · 1-5 ámbar · ≤0 rojo).
export function daysRemainingInfo(fecha_limite) {
  if (!fecha_limite) return { days: null, color: "var(--ink-muted)", label: "Sin fecha" };
  const days = daysBetween(todayISO(), fecha_limite);
  let color;
  if (days > 20) color = "var(--ink-muted)";
  else if (days > 5) color = "#16A34A";
  else if (days >= 1) color = "#D97706";
  else color = "#DC2626";
  const label = days === 0 ? "Hoy" : days > 0 ? `${days} d` : `${Math.abs(days)} d de atraso`;
  return { days, color, label };
}

export const ESTADO_LABEL = {
  sin_aceptar: "Sin aceptar",
  aceptado: "Aceptado",
  bloqueado: "Bloqueado",
  completado: "Completado",
  rechazado: "Rechazado",
};

// Agrupa los items del Braindump por persona asignada, separando zona
// activa (sin_aceptar/aceptado/bloqueado) de zona completados — el
// orden de columnas lo decide quien llama (mismo orden fijo del equipo).
export function groupByPerson(items, people) {
  const map = {};
  for (const p of people) map[p.id] = { person: p, activos: [], hechos: [] };
  for (const it of items) {
    const bucket = map[it.asignado_a];
    if (!bucket) continue;
    if (it.estado === "completado" || it.estado === "rechazado") bucket.hechos.push(it);
    else bucket.activos.push(it);
  }
  for (const key of Object.keys(map)) {
    map[key].activos.sort((a, b) => (a.orden || 0) - (b.orden || 0));
    map[key].hechos.sort((a, b) => (b.completado_at || b.created_at || "").localeCompare(a.completado_at || a.created_at || ""));
  }
  return map;
}

// El Board de admins solo muestra 'braindump' + las 'solicitud' que un
// admin haya creado él mismo (ver brief, sección 5). Las solicitudes
// entre no-admins quedan fuera del Board por completo.
export function visibleInBoard(items, adminIds) {
  return items.filter((it) => it.origen === "braindump" || adminIds.has(it.creado_por));
}

// Área por default al aceptar un item del Braindump, según quién lo
// acepta — cada quien tiene un área "de casa" distinta, así el
// pendiente ya nace clasificado razonablemente en vez de caer siempre
// en la misma área para todos. Cada entrada es una lista de nombres a
// intentar en orden (por si el nombre exacto de la persona/área
// cambiara un poco en Supabase); si ninguno existe, cae al fallback
// genérico de abajo en vez de tronar.
const DEFAULT_AREA_BY_PERSON = {
  "Gabriela Hinojosa": ["Chieff Of Staff", "Chief Of Staff"],
  Enrique: ["Dirección", "Direccion"],
  Kiara: ["Corporativo", "Corp"],
  Erick: ["Ventas"],
  Luis: ["Marketing", "Mkt"],
};

// Área/Tipo por default para la tarea que se crea al aceptar un item del
// Braindump (el Braindump no captura área/tipo — es deliberadamente
// simple). Si se conoce quién acepta (person), se intenta primero su
// área de casa (ver DEFAULT_AREA_BY_PERSON); si no aplica o no existe,
// cae al fallback genérico ("Chieff Of Staff" ya existe en producción
// para pendientes cross-área, y si tampoco existiera, la primera del
// catálogo en vez de tronar).
export function pickDefaultAreaAndType(areas, types, person) {
  const tryNames = (person && DEFAULT_AREA_BY_PERSON[person.name]) || [];
  let area = null;
  for (const name of tryNames) {
    area = areas.find((a) => a.name === name);
    if (area) break;
  }
  if (!area) {
    area =
      areas.find((a) => a.name === "Chieff Of Staff") ||
      areas.find((a) => a.name === "Corp" || a.name === "Corporativo") ||
      areas[0] ||
      null;
  }
  const type =
    types.find((t) => t.name === "Pendiente") ||
    types.find((t) => t.name === "Pendiente personal") ||
    types[0] ||
    null;
  return { area, type };
}

// Velocidad de aceptación del Braindump: horas promedio entre que se
// crea un item y la persona lo acepta (aceptado_at). Solo cuenta items
// ya aceptados — no dice nada de lo que sigue "sin aceptar" ahora mismo.
export function velocidadAceptacion(items, people) {
  const map = {};
  for (const p of people) map[p.id] = { id: p.id, name: p.name, color: p.color, totalHoras: 0, n: 0 };

  for (const it of items) {
    if (!it.aceptado_at || !it.created_at) continue;
    const horas = (new Date(it.aceptado_at) - new Date(it.created_at)) / 3600000;
    if (horas < 0) continue;
    const bucket = map[it.asignado_a];
    if (!bucket) continue;
    bucket.totalHoras += horas;
    bucket.n += 1;
  }

  return Object.values(map)
    .filter((d) => d.n > 0)
    .map((d) => ({ ...d, promedioHoras: Math.round((d.totalHoras / d.n) * 10) / 10 }))
    .sort((a, b) => a.promedioHoras - b.promedioHoras);
}

export const TEAM_ORDER_NAMES = ["Enrique", "Gabriela Hinojosa", "Erick", "Luis", "Kiara"];

// Ordena la lista de personas en el orden fijo del equipo que pide el
// brief (Enrique · Gaby · Erick · Luis · Kiara); cualquier persona nueva
// que no esté en la lista se agrega al final, para no romper si crece el
// equipo.
export function sortTeamOrder(people) {
  return [...people].sort((a, b) => {
    const ia = TEAM_ORDER_NAMES.indexOf(a.name);
    const ib = TEAM_ORDER_NAMES.indexOf(b.name);
    return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
  });
}
