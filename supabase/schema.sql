-- ═══════════════════════════════════════════════════════════════
-- ONE ENEAGRAMA — Esquema Supabase
-- Mismo proyecto Supabase que DISC (platform_disc2026), tablas propias
-- con prefijo eneagrama_.
--
-- ÚNICO ARCHIVO — regla fija: TODO cambio de base de datos (tablas
-- nuevas, columnas nuevas, correcciones de políticas, lo que sea) se
-- agrega DIRECTO en este mismo archivo, como una sección nueva al
-- final (ver "CORRECCIONES" más abajo). Nunca se crea un
-- migration_*.sql aparte — este archivo completo es siempre la fuente
-- de verdad y siempre es seguro volver a correrlo entero de punta a
-- punta (por eso todo usa IF NOT EXISTS / DROP POLICY IF EXISTS antes
-- de recrear / ON CONFLICT DO NOTHING).
--
-- Ejecutar en: Supabase Dashboard → SQL Editor → New query → pegar
-- TODO el archivo → Run. Re-ejecutar completo cada vez que cambie.
-- ═══════════════════════════════════════════════════════════════

-- ── TABLA: eneagrama_superadmins ────────────────────────────────
-- Totalmente independiente de "superadmins" (DISC). Sin lógica compartida.
create table if not exists eneagrama_superadmins (
  id         uuid primary key default gen_random_uuid(),
  usuario    text not null unique,
  password   text not null,          -- texto plano, a propósito (mismo modelo que DISC)
  email      text not null default '',
  fecha_alta timestamptz not null default now(),
  estado     text not null default 'activo'      -- activo | inactivo
);

-- ── TABLA: eneagrama_admins ──────────────────────────────────────
create table if not exists eneagrama_admins (
  id                uuid primary key default gen_random_uuid(),
  email_superadmin  text not null default 'superadmin@local',
  usuario_admin     text not null unique,
  pass_admin        text not null,
  email_admin       text not null,
  fecha_alta        timestamptz not null default now(),
  estado            text not null default 'activo',      -- activo | inactivo
  pack_status       text not null default '',             -- feature flag (paridad con "Pack Líder" de DISC)
  name_empresa      text not null default '',
  logo_empresa_link text not null default ''
);

-- ── TABLA: eneagrama_usuarios ────────────────────────────────────
create table if not exists eneagrama_usuarios (
  id           uuid primary key default gen_random_uuid(),
  admin_id     uuid not null references eneagrama_admins(id) on delete cascade,
  usuario_user text not null,
  pass_user    text not null,
  email_user   text not null default '',
  nombre       text not null default '',
  fecha_alta   timestamptz not null default now(),
  estado       text not null default 'activo',
  pack_status  text not null default '',
  unique (admin_id, usuario_user)
);

-- ── TABLA: eneagrama_respuestas ──────────────────────────────────
-- Se calculan y guardan tipo_base/alas/flechas/puntajes en el insert
-- (usando calculoEneagramaTotal.js como ÚNICA fuente de cálculo, la
-- misma que arma el Informe/PDF) — a diferencia de DISC, que deja
-- estos campos sin calcular. Necesario para que PanelData.jsx pueda
-- filtrar/agrupar por tipo sin re-parsear el string de respuestas.
create table if not exists eneagrama_respuestas (
  id               uuid primary key default gen_random_uuid(),
  admin_id         uuid references eneagrama_admins(id) on delete set null,
  eneagrama_id     bigint generated always as identity,  -- correlativo (reemplaza Eneagrama_Id del .gs)
  fecha            timestamptz not null default now(),
  usuario_admin    text not null default '',
  email_admin      text not null default '',
  usuario_user     text not null default '',
  nombre           text not null default '',
  apellido         text not null default '',
  email_user       text not null default '',
  respuestas       text not null,                        -- string crudo "{T1: Xm Ys - 1;3, 2;1, ...} {T2: ...}"
                                                           -- (formato idéntico al legacy; calculoEneagramaTotal.js
                                                           --  lo parsea con regex /\d+;\d+/g, ignora etiquetas/tiempos)
  puntajes         jsonb,                                 -- {"1":45,"2":80,...} scores normalizados 0-100 por tipo
  puntajes_raw     jsonb,                                 -- {"1":32,"2":41,...} suma cruda por tipo (rawScores)
  tipo_base        smallint check (tipo_base between 1 and 9),
  ala1             smallint check (ala1 between 1 and 9),
  ala2             smallint check (ala2 between 1 and 9),
  ala_dominante    smallint check (ala_dominante between 1 and 9),
  integracion      smallint check (integracion between 1 and 9),
  desintegracion   smallint check (desintegracion between 1 and 9),
  pdf_path         text default '',                       -- ruta del PDF en Storage
  -- v1 no manda email automático (descarga manual, igual que DISC).
  -- Columna lista por si se agrega una Edge Function + servicio de
  -- email más adelante (el cambio se agrega en la sección CORRECCIONES
  -- de este mismo archivo, no en un archivo separado).
  email_enviado    boolean not null default false
);

create index if not exists idx_eneagrama_usuarios_admin      on eneagrama_usuarios(admin_id);
create index if not exists idx_eneagrama_respuestas_admin    on eneagrama_respuestas(admin_id);
create index if not exists idx_eneagrama_respuestas_email    on eneagrama_respuestas(email_user);
create index if not exists idx_eneagrama_respuestas_tipo     on eneagrama_respuestas(tipo_base);

-- ── STORAGE: bucket para informes PDF ────────────────────────────
insert into storage.buckets (id, name, public)
values ('eneagrama_informes', 'eneagrama_informes', true)
on conflict (id) do nothing;

-- ── STORAGE: bucket para logos de empresa ────────────────────────
insert into storage.buckets (id, name, public)
values ('eneagrama_logos', 'eneagrama_logos', true)
on conflict (id) do nothing;

-- ── RLS ───────────────────────────────────────────────────────────
-- Mismo modelo de confianza que DISC: API pública, autorización en la app.
alter table eneagrama_superadmins enable row level security;
alter table eneagrama_admins      enable row level security;
alter table eneagrama_usuarios    enable row level security;
alter table eneagrama_respuestas  enable row level security;

-- Postgres no soporta "CREATE POLICY IF NOT EXISTS", así que cada política
-- se dropea primero (si existe) y se recrea — esto es lo que hace que
-- correr este archivo entero de nuevo sea siempre seguro (idempotente).
drop policy if exists "anon full access superadmins" on eneagrama_superadmins;
create policy "anon full access superadmins" on eneagrama_superadmins for all to anon using (true) with check (true);

drop policy if exists "anon full access admins" on eneagrama_admins;
create policy "anon full access admins" on eneagrama_admins for all to anon using (true) with check (true);

drop policy if exists "anon full access usuarios" on eneagrama_usuarios;
create policy "anon full access usuarios" on eneagrama_usuarios for all to anon using (true) with check (true);

drop policy if exists "anon full access respuestas" on eneagrama_respuestas;
create policy "anon full access respuestas" on eneagrama_respuestas for all to anon using (true) with check (true);

drop policy if exists "anon upload informes" on storage.objects;
create policy "anon upload informes" on storage.objects for insert to anon
  with check (bucket_id = 'eneagrama_informes');

drop policy if exists "anon read informes" on storage.objects;
create policy "anon read informes" on storage.objects for select to anon
  using (bucket_id = 'eneagrama_informes');

drop policy if exists "anon upload logos" on storage.objects;
create policy "anon upload logos" on storage.objects for insert to anon
  with check (bucket_id = 'eneagrama_logos');

drop policy if exists "anon update logos" on storage.objects;
create policy "anon update logos" on storage.objects for update to anon
  using (bucket_id = 'eneagrama_logos') with check (bucket_id = 'eneagrama_logos');

drop policy if exists "anon read logos" on storage.objects;
create policy "anon read logos" on storage.objects for select to anon
  using (bucket_id = 'eneagrama_logos');

-- Semilla opcional de superadmin inicial — descomentar y cambiar la clave antes de correr:
-- insert into eneagrama_superadmins (usuario, password, email)
-- values ('superadmin', 'CAMBIAR_ESTA_CLAVE', 'superadmin@local')
-- on conflict (usuario) do nothing;

-- ═══════════════════════════════════════════════════════════════
-- CORRECCIONES — todo cambio futuro al esquema va ACÁ ABAJO, como
-- una sección nueva, nunca en un archivo aparte. Patrón a seguir:
--
--   -- [2026-08-15] agregar columna X a eneagrama_respuestas
--   alter table eneagrama_respuestas
--     add column if not exists ejemplo_columna text default '';
--
--   -- [2026-08-15] corregir política de logos
--   drop policy if exists "anon update logos" on storage.objects;
--   create policy "anon update logos" on storage.objects for update to anon
--     using (bucket_id = 'eneagrama_logos') with check (bucket_id = 'eneagrama_logos');
--
-- Reglas: siempre "if not exists" / "drop ... if exists" antes de
-- crear, siempre con fecha en el comentario, nunca borrar las
-- secciones de arriba (son el estado base ya aplicado en producción).
-- ═══════════════════════════════════════════════════════════════
