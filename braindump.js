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

// Área/Tipo por default para la tarea que se crea al aceptar un item del
// Braindump (el Braindump no captura área/tipo — es deliberadamente
// simple). "Chieff Of Staff" ya existe como área en producción para este
// tipo de pendientes cross-área; si no existiera (instalación nueva),
// cae al primer catálogo disponible en vez de tronar.
export function pickDefaultAreaAndType(areas, types) {
  const area =
    areas.find((a) => a.name === "Chieff Of Staff") ||
    areas.find((a) => a.name === "Corp" || a.name === "Corporativo") ||
    areas[0] ||
    null;
  const type =
    types.find((t) => t.name === "Pendiente") ||
    types.find((t) => t.name === "Pendiente personal") ||
    types[0] ||
    null;
  return { area, type };
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
