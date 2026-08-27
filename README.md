# HUB Control Comercial

App real (con base de datos y login) del panel operativo del equipo comercial de POP.
Reemplaza al prototipo publicado como Artifact — mismo modelo de datos y UX, ya con
guardado compartido de verdad.

## Stack
- **Next.js** (App Router) — la aplicación.
- **Supabase** — base de datos (Postgres) + autenticación del equipo.
- **Vercel** — hospedaje, con despliegue automático en cada push a `main`.

## Estado actual
Fase 1 de la construcción real: login funcionando + conexión a la base de datos
confirmada. Todavía no están las pantallas del prototipo (lista de pendientes,
proyectos, ajustes) — vienen en los siguientes commits.

## Configuración local (para desarrollo, no es necesaria para producción)
1. `npm install`
2. Copia `.env.local.example` a `.env.local` y llena los dos valores con los de tu
   proyecto de Supabase (Project Settings → API).
3. Corre `supabase/schema.sql` completo en el SQL Editor de tu proyecto de Supabase.
4. `npm run dev`

## Despliegue
Conectado a Vercel — cada push a `main` se publica solo. Las variables de entorno
(`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) se configuran en
Vercel → Project Settings → Environment Variables, no en este repositorio.
