-- ============================================================
-- PRIORIDAD / OBJETIVO DE LA SEMANA — migración adicional (22-sep-2026)
-- Copia TODO este archivo y pégalo en Supabase → SQL Editor → New
-- query → Run. Es idempotente (usa IF NOT EXISTS / DROP POLICY IF
-- EXISTS), así que no truena si por accidente lo corres dos veces.
-- No toca ninguna tabla, política ni dato existente — solo agrega.
-- ============================================================

-- ---------- TABLA NUEVA ----------
-- Una fila por persona (person_id es UNIQUE): Enrique/Gaby la
-- sobreescriben cada semana, no se guarda historial de prioridades
-- viejas — si en el futuro se quiere ver el historial, se puede quitar
-- el UNIQUE y filtrar por la más reciente.
create table if not exists public.weekly_priorities (
  id          uuid primary key default gen_random_uuid(),
  person_id   uuid not null unique references public.profiles(id) on delete cascade,
  texto       text not null default '',
  set_by      uuid references public.profiles(id) on delete set null,
  updated_at  timestamptz not null default now()
);

-- ---------- SEGURIDAD (RLS) ----------
alter table public.weekly_priorities enable row level security;

-- Cada quien ve la suya; Enrique/Gaby (sees_all) ven todas.
drop policy if exists "weekly_priorities_lectura" on public.weekly_priorities;
create policy "weekly_priorities_lectura" on public.weekly_priorities for select using (
  person_id = auth.uid()
  or exists (select 1 from public.profiles p where p.id = auth.uid() and p.sees_all)
);

-- Solo Enrique/Gaby pueden asignar/editar/borrar prioridades (incluida
-- la suya propia). El resto del equipo solo la lee en su HUB.
drop policy if exists "weekly_priorities_inserta" on public.weekly_priorities;
create policy "weekly_priorities_inserta" on public.weekly_priorities for insert with check (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.sees_all)
);

drop policy if exists "weekly_priorities_actualiza" on public.weekly_priorities;
create policy "weekly_priorities_actualiza" on public.weekly_priorities for update using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.sees_all)
);

drop policy if exists "weekly_priorities_borra" on public.weekly_priorities;
create policy "weekly_priorities_borra" on public.weekly_priorities for delete using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.sees_all)
);
