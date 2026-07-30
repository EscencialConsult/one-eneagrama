# Handoff: Migración Plataforma Eneagrama (React + Supabase)

> Documento de contexto para arrancar el proyecto de Eneagrama en un chat nuevo, replicando el mismo enfoque que se usó para migrar la Plataforma DISC de AppScript a React + Supabase. Pegá este archivo completo al inicio de esa conversación.

---

## 1. Qué se hizo con DISC (el proyecto que estamos replicando)

**Origen**: Plataforma DISC funcionando en Google Apps Script + Google Sheets + Google Drive (`Plataforma Disc/Version AppScript`), que necesitaba escalar a "más masivo, más gente". Se migró a React + Tailwind + Supabase en `Plataforma Disc/Version con Backend`.

**Regla de oro seguida durante toda la migración**: replicar exacto, no rediseñar la lógica. El JS funcional que ya andaba bien (generación de PDF, gráficos, rueda de comportamiento) se copió tal cual a `public/legacy/` y `public/informe/`, sin tocarlo — solo se le cambió el "cableado" (de dónde lee/escribe datos), nunca la lógica interna.

**Decisiones de arquitectura confirmadas por Facundo** (aplicaron para DISC, replicar el mismo criterio salvo que se diga lo contrario):
- **Contraseñas en texto plano**, en tabla propia — NO Supabase Auth. Se decidió así para replicar exacto la UX del sistema original (login simple usuario/contraseña administrado por un panel), no por ignorancia de la alternativa segura.
- **Base única multi-tenant**: en vez de una planilla de Google Sheets por cliente/admin (como era en AppScript), todo vive en las mismas tablas de Supabase, separado por una columna `admin_id` (foreign key). Esto reemplaza el patrón de "una API por admin" del sistema viejo.
- Los logos de empresa y los informes PDF se guardan en **Supabase Storage** (buckets), no en links externos ni Google Drive.

---

## 2. Datos del proyecto Supabase (a REUTILIZAR, no crear uno nuevo)

- **Proyecto**: `platform_disc2026`
- **Ref**: `pnyzlhmpfavrusqgjuxk`
- **Región**: us-east-1
- **URL**: `https://pnyzlhmpfavrusqgjuxk.supabase.co`
- **Anon key** (pública, protegida por RLS — no es secreta, es la que usa el frontend):
  ```
  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBueXpsaG1wZmF2cnVzcWdqdXhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM2ODQ2MjAsImV4cCI6MjA5OTI2MDYyMH0.Ov1T9YFMb8imhsf92eRaApE954RcOwarMF8eyCNFyRI
  ```

**Importante**: Eneagrama va a vivir en este MISMO proyecto de Supabase (no hace falta crear uno nuevo ni pagar otro plan), pero con tablas completamente separadas — ver sección 4.

---

## 3. Tablas actuales de DISC (para entender el patrón, NO tocar)

```sql
-- admins: una fila por empresa/cliente que administra usuarios
admins (
  id uuid primary key,
  email_superadmin text,
  usuario_admin text unique,
  pass_admin text,              -- texto plano, a propósito
  email_admin text,
  fecha_alta timestamptz,
  estado text,                  -- 'activo' | 'inactivo'
  pack_status text,              -- feature flag de un add-on ("Pack Líder")
  name_empresa text,
  logo_empresa_link text
)

-- usuarios: personas evaluadas, pertenecen a un admin
usuarios (
  id uuid primary key,
  admin_id uuid references admins(id),
  usuario_user text,
  pass_user text,                -- texto plano
  email_user text,
  nombre text,
  fecha_alta timestamptz,
  estado text,
  pack_status text,
  unique (admin_id, usuario_user)
)

-- respuestas: resultado de cada test completado
respuestas (
  id uuid primary key,
  admin_id uuid references admins(id),
  disc_id bigint generated always as identity,  -- correlativo legacy
  fecha timestamptz,
  usuario_admin text, email_admin text,
  usuario_user text, nombre text, apellido text, email_user text,
  respuestas text,                -- string crudo de respuestas del test
  puntajes jsonb,                 -- {"D":32,"I":28,"S":24,"C":20}
  perfil_dominante text,
  pdf_path text                   -- ruta del PDF en Storage
)

-- superadmins: cuentas con acceso al panel de nivel superior (multi-cuenta)
superadmins (
  id uuid primary key,
  usuario text unique,
  password text,                  -- texto plano
  email text,
  fecha_alta timestamptz,
  estado text
)
```

**Storage buckets**: `informes` (PDFs generados, público), `logos` (logos de empresa, público).

**RLS**: habilitado en todas las tablas, pero con políticas abiertas para el rol `anon` (`for all to anon using (true) with check (true)`). Esto replica el modelo de confianza del sistema original en Apps Script: la API era pública y la autorización vivía en la lógica de la app, no en la base. Los nombres de política solo necesitan ser únicos POR TABLA, no globalmente — se puede repetir el mismo nombre de política en tablas distintas sin problema.

---

## 4. Convención para Eneagrama — cómo NO chocar con DISC

Decisiones ya tomadas por Facundo para este nuevo proyecto:

1. **Prefijo `eneagrama_` en TODAS las tablas nuevas**, sin excepción:
   - `eneagrama_admins`
   - `eneagrama_usuarios`
   - `eneagrama_respuestas`
   - `eneagrama_superadmins`
   - (y cualquier tabla adicional que necesite el test de Eneagrama)

2. **Superadmins totalmente separados**: `eneagrama_superadmins` es su propia tabla, independiente de `superadmins` (la de DISC). Un superadmin de una plataforma NO tiene por qué tener cuenta en la otra. No compartir lógica de login entre ambas.

3. **Buckets de Storage con nombre propio**, para no chocar con `informes`/`logos` de DISC: usar `eneagrama_informes` y `eneagrama_logos` (o el nombre que corresponda al tipo de archivo que genere el test de Eneagrama).

4. **Un solo archivo de esquema SQL** (`schema.sql`) como fuente de verdad — mismo criterio que se usó en DISC: todo el DDL (tablas, buckets, RLS, políticas) en un único archivo que se carga una sola vez en el SQL Editor de Supabase. Si después hace falta un cambio y el esquema ya se corrió en producción, se agrega un archivo `migration_<algo>.sql` chico con el delta (no se reescribe ni se vuelve a correr todo `schema.sql`), y se actualiza `schema.sql` en paralelo para que seguirse reflejando como fuente de verdad completa y actualizada.

5. **Proyecto de código separado**: Eneagrama debería vivir en su propio repo/carpeta (ej. `Plataforma Eneagrama/Version con Backend`), NO mezclado dentro del repo de DISC. Va a tener su propio `.env` con la MISMA `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` de arriba (mismo proyecto Supabase, pero apuntando solo a sus tablas `eneagrama_*` en el código).

6. **Falta la estructura real de Eneagrama todavía**: Facundo no tiene a mano la planilla/columnas originales de Eneagrama en este momento — las va a pasar en el chat nuevo. La sección 3 de arriba (esquema de DISC) sirve como PLANTILLA de referencia para armar el esquema equivalente de Eneagrama una vez que se tenga esa información real (qué pregunta el test, cómo se calculan los 9 tipos de eneagrama, qué datos arma el informe final, etc.) — no inventar columnas de Eneagrama sin esa info.

---

## 5. Patrones de arquitectura de código a replicar

- **Stack**: Vite + React 18 + React Router v6 + Tailwind CSS v4 (`@tailwindcss/vite`, `@theme` para tokens de marca, `@utility` para utilidades custom).
- **`src/lib/supabase.js`**: cliente Supabase inicializado desde `import.meta.env.VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`. Si faltan, solo hace `console.warn` (no crashea) y cae a un cliente placeholder — **cuidado**: esto significa que si en Netlify no se configuran esas env vars manualmente, la app "funciona" visualmente pero todo login/consulta falla en silencio. Hay que configurar esas variables en el dashboard de Netlify del sitio nuevo de Eneagrama (no se copian solas desde `.env`, que está en `.gitignore` a propósito).
- **`src/lib/auth.js`**: objeto `Auth.login(usuario, password, rol)` con 3 ramas (SUPERADMIN / ADMIN / USER), cada una consultando su tabla correspondiente. Adaptar para usar las tablas `eneagrama_*`.
- **`src/lib/session.js`**: wrapper de `sessionStorage` para la sesión activa.
- **Rutas (`src/App.jsx`)**: Landing (`/`), SuperAdmin, Admin, Userboard, Test, y una ruta catch-all (`*`) que redirige a `/`.
- **`public/_redirects`** con `/* /index.html 200` — **obligatorio** en Netlify para que las rutas internas (`/admin`, `/superadmin`, `/userboard`, `/test`) no den 404 al navegar directo o recargar. Nos costó un bug real en DISC por no tenerlo desde el principio.
- **Página de Informe como HTML estático** (`public/informe/index.html`), fuera del router de React, si no necesita llamar al backend (lee de `sessionStorage`). Se navega ahí con `window.location.href`, no con React Router.
- **Escapado de HTML**: cualquier valor con origen en el usuario que se inserte vía `dangerouslySetInnerHTML` DEBE pasar por una función de sanitización real (`div.textContent` → `div.innerHTML`, nunca un "no-op" que solo castee a string). En DISC hubo una vulnerabilidad XSS real por esto — no repetir el error.
- **Nunca emojis en la UI** — usar Heroicons (`@heroicons/react`) para todo ícono.
- **Footer idéntico en todas las páginas** de la plataforma (un solo componente `Footer.jsx` compartido, sin variantes).

### Gotchas de CSS que costó tiempo diagnosticar (evitarlos desde el vamos)

- No poner `height: 100%` + `overflow-x: hidden` juntos en `<html>`: esa combinación fuerza `overflow-y: auto` por spec de CSS y atrapa el scroll dentro de `<html>` como su propia caja, limitada al alto de la ventana.
- Si un fondo decorativo usa `position: absolute` con `inset: 0`, el `<body>` (o el ancestro relevante) necesita `position: relative` — si no, el fondo se dimensiona contra el viewport (ICB) en vez de contra el alto real del documento, y se corta a mitad de página en contenido largo.
- No declarar `background-color` sólida en `<html>` Y en `<body>` a la vez si hay capas decorativas semi-transparentes con z-index negativo encima — el navegador las oscurece de más. Declarar el color de fondo en un solo lugar.
- Todo wrapper que tenga hijos con z-index negativo necesita `isolation: isolate` (o alguna otra propiedad que dispare su propio stacking context), si no esos hijos "escapan" al contexto de la raíz del documento y pueden quedar ocultos detrás de elementos no relacionados.

---

## 6. Identidad visual — NO asumir que hay que copiar el diseño de ONE/DISC

La Landing de DISC usa colores/tipografía de marca "ONE" (cyan/pink/gold sobre fondo oscuro, recientemente rediseñada a tema claro solo en la página de inicio). Eneagrama probablemente tenga su propia marca/cliente — no asumir que hay que reusar la paleta de ONE a menos que Facundo lo pida explícitamente. Sí vale la pena preguntar por el tema de color (claro/oscuro) antes de arrancar a maquetar, como se hizo acá.

---

## 7. Qué preguntar apenas arranque el chat nuevo

1. ¿Tenés la planilla/código .gs original de Eneagrama (columnas, lógica de cálculo de tipos)?
2. ¿Cómo se llama la empresa/cliente para el que es esta plataforma (si es Escencial u otro)?
3. ¿Identidad visual: colores de marca propios, o reusar el estilo de ONE?
4. ¿El mismo modelo de roles (SuperAdmin / Admin de empresa / Usuario evaluado), o es distinto para Eneagrama?
