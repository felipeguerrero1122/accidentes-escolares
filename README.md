# Registro de Accidentes Escolares

Aplicacion web basada en Next.js + Prisma + PostgreSQL para reemplazar una planilla Excel de accidentes escolares.

## Requisitos

- Node.js 20+
- PostgreSQL 15+

## Inicio rapido

1. Copiar `.env.example` a `.env`.
2. Instalar dependencias: `npm install`
3. Generar Prisma Client: `npx prisma generate`
4. Ejecutar migraciones: `npx prisma migrate dev`
5. Cargar seed: `npm run prisma:seed`
6. Iniciar: `npm run dev`

## Credenciales seed

- Email: valor de `ADMIN_EMAIL`
- Password: valor de `ADMIN_PASSWORD`

## Importacion inicial

- `POST /api/students/import`
- `POST /api/accidents/import`
- Script local: `npm run import:excel -- "base_datos_accidente_escolar_v3 (1).xlsm"`

Ambos endpoints aceptan `multipart/form-data` con un archivo `file` en formato `.xlsx`, `.xlsm` o `.csv`.

## Notas

- El proyecto esta optimizado para uso de escritorio.
- La ficha PDF se genera desde `/api/accidents/:id/pdf`.
