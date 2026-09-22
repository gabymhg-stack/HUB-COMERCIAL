-- ============================================================
-- MÓDULO BRAINDUMP — migración adicional (22-sep-2026)
-- Copia TODO este archivo y pégalo en Supabase → SQL Editor → New
-- query → Run. Es idempotente (usa IF NOT EXISTS / DROP POLICY IF
-- EXISTS), así que no truena si por accidente lo corres dos veces.
-- No toca ninguna tabla, política ni dato existente — solo agrega.
-- ============================================================

-- ---------- TABLA NUEVA ----------
create table if not exists public.braindump_items (
  id                uuid primary key default gen_random_uuid(),
  texto             text not null,
  asignado_a        uuid not null references public.profiles(id) on delete cascade,
  creado_por        uuid not null references public.profiles(id),
  -- 'braindump' = lo crea un admin desde el Board de 5 columnas.
  -- 'solicitud' = lo crea cualquier usuario para pedirle algo a otro.
  origen            text not null default 'braindump' check (origen in ('braindump', 'solicitud')),
  tag               text default '',
  fecha_limite      date,
  orden             bigint not null default 0,
  estado            text not null default 'sin_aceptar'
                      check (estado in ('sin_aceptar', 'aceptado', 'bloqueado', 'completado', 'rechazado')),
  fecha_compromiso  date,
  aceptado_at       timestamptz,
  completado_at     timestamptz,
  bloqueado_por     uuid references public.profiles(id) on delete set null,
  comentario_cierre text default '',
  created_at        timestamptz not null default now()
);

-- ---------- VÍNCULO CON LA TAREA QUE SE CREA AL ACEPTAR ----------
-- No se toca ningún campo existente de tasks, solo se agrega este.
alter table public.tasks
  add column if not exists braindump_item_id uuid references public.braindump_items(id) on delete set null;

-- ---------- SEGURIDAD (RLS) ----------
alter table public.braindump_items enable row level security;

drop policy if exists "braindump_lectura" on public.braindump_items;
create policy "braindump_lectura" on public.braindump_items for select using (auth.uid() is not null);

-- Cualquiera puede crear una 'solicitud' propia (creado_por = uno mismo);
-- solo Enrique/Gaby (sees_all) pueden crear items 'braindump' desde el Board.
drop policy if exists "braindump_inserta" on public.braindump_items;
create policy "braindump_inserta" on public.braindump_items for insert with check (
  creado_por = auth.uid()
  and (
    origen = 'solicitud'
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.sees_all)
  )
);

-- Enrique/Gaby pueden editar cualquier fila (mover, reordenar, tag, fecha,
-- texto, eliminar via estado). Cualquier persona puede actualizar SOLO lo
-- que le asignaron (para aceptar/bloquear/rechazar) o lo que ella creó
-- (para dar seguimiento a su propia solicitud).
drop policy if exists "braindump_actualiza" on public.braindump_items;
create policy "braindump_actualiza" on public.braindump_items for update using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.sees_all)
  or asignado_a = auth.uid()
  or creado_por = auth.uid()
);

drop policy if exists "braindump_borra" on public.braindump_items;
create policy "braindump_borra" on public.braindump_items for delete using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.sees_all)
  or creado_por = auth.uid()
);

-- Índices de apoyo (no estrictamente necesarios con el tamaño de equipo
-- actual, pero evitan tener que acordarse de agregarlos después).
create index if not exists braindump_items_asignado_a_idx on public.braindump_items(asignado_a);
create index if not exists braindump_items_creado_por_idx on public.braindump_items(creado_por);
