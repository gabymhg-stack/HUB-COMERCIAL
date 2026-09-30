-- ============================================================
-- NOTAS "REVISAR CON" (Javier/Jorge) + TIPO "Evento" — migración
-- adicional (30-sep-2026). Copia TODO este archivo y pégalo en
-- Supabase → SQL Editor → New query → Run. Es idempotente (usa IF NOT
-- EXISTS / DROP POLICY IF EXISTS / ON CONFLICT), así que no truena si
-- por accidente lo corres dos veces. No toca ninguna tabla, política ni
-- dato existente — solo agrega.
-- ============================================================

-- ---------- TABLA NUEVA: contact_notes ----------
-- Espacio libre para que Enrique/Gaby anoten qué pendientes hay que
-- revisar con Javier y con Jorge — personas externas al equipo, sin
-- cuenta en el HUB, así que no son un person_id de profiles. Solo dos
-- filas fijas (una por contacto), se sobreescriben, no es historial.
create table if not exists public.contact_notes (
  id          uuid primary key default gen_random_uuid(),
  contacto    text not null unique check (contacto in ('Javier', 'Jorge')),
  texto       text not null default '',
  set_by      uuid references public.profiles(id) on delete set null,
  updated_at  timestamptz not null default now()
);

-- ---------- SEGURIDAD (RLS) ----------
-- Totalmente admin-only (ver y editar): a diferencia de weekly_priorities,
-- aquí nadie más que Enrique/Gaby tiene por qué ver esto ni en su propio
-- HUB — vive solo dentro de la página de Braindump, que ya es admin-only.
alter table public.contact_notes enable row level security;

drop policy if exists "contact_notes_lectura" on public.contact_notes;
create policy "contact_notes_lectura" on public.contact_notes for select using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.sees_all)
);

drop policy if exists "contact_notes_inserta" on public.contact_notes;
create policy "contact_notes_inserta" on public.contact_notes for insert with check (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.sees_all)
);

drop policy if exists "contact_notes_actualiza" on public.contact_notes;
create policy "contact_notes_actualiza" on public.contact_notes for update using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.sees_all)
);

drop policy if exists "contact_notes_borra" on public.contact_notes;
create policy "contact_notes_borra" on public.contact_notes for delete using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.sees_all)
);

-- Semilla: las dos filas fijas, para que el widget no tenga que crearlas
-- desde el cliente la primera vez.
insert into public.contact_notes (contacto) values ('Javier') on conflict (contacto) do nothing;
insert into public.contact_notes (contacto) values ('Jorge') on conflict (contacto) do nothing;

-- ---------- TIPO NUEVO: Evento ----------
-- Se pudo haber agregado a mano desde Ajustes (type_labels es un
-- catálogo libre, sin código detrás de cada nombre) — esto solo te
-- ahorra el paso. El calendario ya sabe resaltar los pendientes de este
-- tipo (ver lib/data.js / CalendarWidget.js), no hace falta tocar nada
-- más en la base para que funcione.
insert into public.type_labels (name) values ('Evento') on conflict (name) do nothing;
