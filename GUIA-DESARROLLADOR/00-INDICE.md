# Guía del Desarrollador — kikovargas.fit

Guía práctica para trabajar en el proyecto día a día. Comandos copy-paste, flujos concretos, troubleshooting.

**Complementa a `DOCS-TECNICA/`**. Si buscas entender cómo funciona algo, ve a `DOCS-TECNICA/`. Si buscas cómo **hacer** algo, estás en el sitio correcto.

## Índice

| # | Guía | Cuándo usarla |
|---|------|---------------|
| 01 | [Ejecutar en local](./01-ejecutar-local.md) | Primera vez que levantas el proyecto + workflow diario de dev |
| 02 | [Desplegar con Docker](./02-deploy-docker.md) | Deploy a VPS, primera vez y actualizaciones |
| 03 | [Actualizar la base de datos](./03-base-de-datos.md) | Cambios en `schema.prisma`, migraciones, seeding |
| 04 | [Debugging común](./04-debugging.md) | "No funciona" — problemas frecuentes y soluciones |
| 05 | [Flujo de trabajo diario](./05-flujo-trabajo.md) | Cómo añadir una feature, hacer PR, hacer review |

## Convenciones

- Los comandos asumen que estás en la **raíz del proyecto** (`cd kikovargass/`).
- Windows/Mac/Linux: los comandos usan `sh`/`bash`. En Windows usar **Git Bash** o **WSL** (no PowerShell puro para los scripts).
- `npm` en la raíz; `docker compose` (sin guion) para Docker Compose V2.
- Comandos peligrosos están marcados con ⚠️.
- Comandos destructivos (borran datos) están marcados con 🔥.

## Requisitos previos

Antes de tocar nada:
- **Node 20+** (`node --version`)
- **Docker 24+** + **docker compose** (`docker --version`)
- **Git** (`git --version`)
- Editor con soporte de TypeScript (VS Code recomendado)
- Acceso al repo de GitHub

## Arranque rápido (1 minuto)

Si ya tienes todo instalado y solo quieres ver el proyecto corriendo:

```bash
git clone https://github.com/PabloFuentess97/kikovargas.git
cd kikovargas
cp .env.example .env
# editar .env — al menos JWT_SECRET
docker compose up -d
```

Navega a `http://localhost:3000`.

Seed admin:
```bash
docker compose exec app npx tsx prisma/seed.ts
```

Login: `admin@kikovargass.com` / `changeme12345678` (cambiar inmediatamente).

Si algo falla: [04-debugging.md](./04-debugging.md).
