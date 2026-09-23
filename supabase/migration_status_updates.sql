-- ============================================================
-- "EN QUÉ ANDAMOS" — status del equipo — migración adicional (23-sep-2026)
-- Copia TODO este archivo y pégalo en Supabase → SQL Editor → New
-- query → Run. Es idempotente (usa IF NOT EXISTS / DROP POLICY IF
-- EXISTS), así que no truena si por accidente lo corres dos veces.
-- No toca ninguna tabla, política ni dato existente — solo agrega.
-- ============================================================

-- ---------- TABLA NUEVA ----------
-- Una fila por persona (person_id es UNIQUE) — cada quien pone/actualiza
-- SOLO la suya (a diferencia de weekly_priorities, que la pone un
-- admin). Se sobreescribe cada vez, no es historial.
create table if not exists public.status_updates (
  id          uuid primary key default gen_random_uuid(),
  person_id   uuid not null unique references public.profiles(id) on delete cascade,
  texto       text not null default '',
  updated_at  timestamptz not null default now()
);

-- ---------- SEGURIDAD (RLS) ----------
alter table public.status_updates enable row level security;

-- Todo el equipo puede leer la de todos (es visibilidad compartida a
-- propósito, no solo para admins).
drop policy if exists "status_updates_lectura" on public.status_updates;
create policy "status_updates_lectura" on public.status_updates for select using (auth.uid() is not null);

-- Cada quien solo puede crear/editar/borrar SU PROPIA fila.
drop policy if exists "status_updates_inserta" on public.status_updates;
create policy "status_updates_inserta" on public.status_updates for insert with check (person_id = auth.uid());

drop policy if exists "status_updates_actualiza" on public.status_updates;
create policy "status_updates_actualiza" on public.status_updates for update using (person_id = auth.uid());

drop policy if exists "status_updates_borra" on public.status_updates;
create policy "status_updates_borra" on public.status_updates for delete using (person_id = auth.uid());
