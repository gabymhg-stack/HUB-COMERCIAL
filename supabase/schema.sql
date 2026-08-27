-- ============================================================
-- HUB Control Comercial — esquema de base de datos
-- Copia TODO este archivo y pégalo en Supabase → SQL Editor → New query → Run
-- Se puede correr una sola vez sobre un proyecto nuevo y vacío.
-- ============================================================

-- ---------- PERFILES (una fila por persona del equipo) ----------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  role text not null,
  sees_all boolean not null default false,
  color text not null default '#4a3aa7',
  created_at timestamptz not null default now()
);

-- ---------- CATÁLOGOS ----------
create table public.areas (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  color text not null,
  created_at timestamptz not null default now()
);

create table public.dev_tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  color text not null,
  created_at timestamptz not null default now()
);

create table public.type_labels (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

-- ---------- PROYECTOS ----------
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  dev_id uuid references public.dev_tags(id) on delete set null,
  owner_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- ---------- PENDIENTES ----------
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  priority text not null check (priority in ('alta', 'media', 'baja')),
  due_date date,
  type_id uuid references public.type_labels(id),
  area_id uuid not null references public.areas(id),
  dev_id uuid references public.dev_tags(id) on delete set null,
  project_id uuid references public.projects(id) on delete set null,
  status text not null default 'pendiente' check (status in ('pendiente', 'en_proceso', 'completado')),
  blocked_by_enrique boolean not null default false,
  completed_at timestamptz,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.task_owners (
  task_id uuid not null references public.tasks(id) on delete cascade,
  person_id uuid not null references public.profiles(id) on delete cascade,
  primary key (task_id, person_id)
);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  author_id uuid references public.profiles(id),
  text text not null,
  created_at timestamptz not null default now()
);

-- ============================================================
-- SEGURIDAD POR RENGLÓN (RLS)
-- Enrique y Gaby (sees_all = true) ven y editan todo.
-- El resto del equipo ve solo lo que le corresponde: donde es
-- responsable directo, o proyectos donde participa.
-- ============================================================
alter table public.profiles enable row level security;
alter table public.areas enable row level security;
alter table public.dev_tags enable row level security;
alter table public.type_labels enable row level security;
alter table public.projects enable row level security;
alter table public.tasks enable row level security;
alter table public.task_owners enable row level security;
alter table public.comments enable row level security;

create policy "profiles_lectura" on public.profiles for select using (auth.uid() is not null);
create policy "profiles_actualiza_propio" on public.profiles for update using (id = auth.uid());

create policy "areas_lectura" on public.areas for select using (auth.uid() is not null);
create policy "areas_escritura" on public.areas for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.sees_all)
);

create policy "dev_tags_lectura" on public.dev_tags for select using (auth.uid() is not null);
create policy "dev_tags_escritura" on public.dev_tags for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.sees_all)
);

create policy "type_labels_lectura" on public.type_labels for select using (auth.uid() is not null);
create policy "type_labels_escritura" on public.type_labels for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.sees_all)
);

create policy "projects_lectura" on public.projects for select using (auth.uid() is not null);
create policy "projects_escritura" on public.projects for all using (auth.uid() is not null);

create policy "tasks_lectura" on public.tasks for select using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.sees_all)
  or exists (select 1 from public.task_owners o where o.task_id = tasks.id and o.person_id = auth.uid())
  or exists (
    select 1 from public.projects pr
    where pr.id = tasks.project_id
      and (
        pr.owner_id = auth.uid()
        or exists (
          select 1 from public.tasks t2
          join public.task_owners o2 on o2.task_id = t2.id
          where t2.project_id = pr.id and o2.person_id = auth.uid()
        )
      )
  )
);
create policy "tasks_inserta" on public.tasks for insert with check (auth.uid() is not null);
create policy "tasks_actualiza" on public.tasks for update using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.sees_all)
  or exists (select 1 from public.task_owners o where o.task_id = tasks.id and o.person_id = auth.uid())
  or created_by = auth.uid()
);
create policy "tasks_borra" on public.tasks for delete using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.sees_all)
  or created_by = auth.uid()
);

create policy "task_owners_lectura" on public.task_owners for select using (auth.uid() is not null);
create policy "task_owners_escritura" on public.task_owners for all using (auth.uid() is not null);

create policy "comments_lectura" on public.comments for select using (auth.uid() is not null);
create policy "comments_inserta" on public.comments for insert with check (auth.uid() is not null);

-- ============================================================
-- CATÁLOGOS INICIALES (los mismos ya validados en el prototipo)
-- ============================================================
insert into public.areas (name, color) values
  ('Dirección', '#4a3aa7'),
  ('Operación', '#1baf7a'),
  ('Ventas', '#2a78d6'),
  ('Brokers', '#eb6834'),
  ('MKT Digital', '#eda100'),
  ('MKT Tradicional', '#e87ba4'),
  ('Corp', '#008300');

insert into public.dev_tags (name, color) values
  ('Átiko', '#eb6834'),
  ('Pórtiko', '#4a3aa7'),
  ('Trópiko', '#2a78d6'),
  ('Qercia', '#0d5f8f');

insert into public.type_labels (name) values
  ('Entregable'), ('Junta'), ('Decisión'), ('Rutinario'), ('Pendiente personal');

-- ============================================================
-- SIGUIENTE PASO (hazlo tú, después de correr todo lo de arriba):
-- 1. Ve a Authentication → Users → Add user, crea a cada persona del
--    equipo con su correo de POP y una contraseña temporal.
-- 2. Por cada persona creada, copia su "User UID" y corre esto,
--    reemplazando los valores (sees_all = true solo para Enrique y Gaby):
--
-- insert into public.profiles (id, name, role, sees_all, color) values
--   ('PEGA-AQUI-EL-USER-UID', 'Gabriela Hinojosa', 'Chief of Staff', true, '#4a3aa7');
-- ============================================================
