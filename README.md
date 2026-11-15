# mi-barrio-backend

Backend privado de **Mi Barrio – Ciudad Granada**. Pertenece a la Fase 1 y solo sirve los datos de
HU-01 (ficha general) y HU-02 (polígono y centroide). No implementa HU-03 a HU-13, administración ni
autenticación administrativa.

## Arquitectura

- Dominio: `src/domain/barrio`.
- Aplicación: casos de uso `GetBarrio` y `GetBarrioGeometria`.
- Infraestructura: PostgreSQL/PostGIS, ETL, HTTP interno y middlewares.
- Contrato canónico de la frontera interna: `contracts/internal.openapi.yaml`.
- No hay importaciones desde `mi-barrio-api` ni desde `mi-barrio-frontend`; la única comunicación es
  HTTP con `X-Service-Token`.

## Requisitos

- Node.js 22 o superior (probado con Node 24).
- PostgreSQL 16 + PostGIS (entorno verificado: PostgreSQL 16.13 / PostGIS 3.7.0).
- Variables de entorno descritas en `.env.example`.

## Puesta en marcha local

```bash
npm ci
cp .env.example .env
npm run verify:data
npm run migrate
npm run etl
npm run dev
```

El ETL es transaccional y valida, antes de confirmar:

- un único polígono oficial y coincidencia exacta con el snapshot;
- `SRID=4326`, geometría válida y `58` vértices;
- centroide a menos de `5 m` de `4.641833, -74.171758`;
- `34` manzanas, todas estrato `2`, todas contenidas en el polígono;
- hashes SHA-256 de los snapshots contra `data/source/manifest.json`.

## Endpoints internos

| Método | Ruta | Protección |
|---|---|---|
| `GET` | `/internal/v1/health` | Sin token |
| `GET` | `/internal/v1/barrio` | `X-Service-Token` |
| `GET` | `/internal/v1/barrio/geometria` | `X-Service-Token` |

Los errores usan `{ "error": { "code", "message", "requestId" } }`. El backend no tiene CORS público
y no debe publicarse en Internet.

## Red privada

El backend escucha en `HOST=0.0.0.0` para funcionar dentro de una red de servicios. En contenedores:

```bash
docker network create mi-barrio-internal
docker run --name mi-barrio-backend --network mi-barrio-internal \
  -e DATABASE_URL=... -e SERVICE_TOKEN=... mi-barrio-backend
```

No se usa `--publish`/`-p`: el puerto `3001` no se publica al host ni a Internet. La API debe usar
`BACKEND_URL=http://mi-barrio-backend:3001`, no `localhost`, cuando ambos servicios están en
contenedores separados. El token debe compartirse únicamente entre API y backend.

## Contrato interno

`contracts/internal.openapi.yaml` es la única fuente de verdad de esta frontera. `mi-barrio-api`
sincroniza una copia generada y verifica su SHA-256; no se editan contratos duplicados a mano.

## Pruebas

```bash
npm run typecheck
npm run lint
npm run check:lines
npm run test:unit
npm run test:integration
npm run test:contract
npm run test:geo
npm run ci
```

La suite cubre mapper, HTTP interno, repositorio PostgreSQL/PostGIS, contrato y validación
geográfica. Los tests de integración y geográficos requieren la base migrada y el ETL ejecutado.

## Límite de 100 líneas

`npm run check:lines` y ESLint fallan si un archivo escrito a mano supera 100 líneas. Los tipos
generados desde contratos (`internal-schema.ts`) se excluyen porque son artefactos reproducibles.

## Evidencia y limitaciones

- Evidencia de Fase 1: `../docs/evidencias/fase-1/`.
- D-7 (JWT + refresh + Argon2) queda pendiente para la fase de administración.
- No se implementaron establecimientos, historia, rutas ni otros datos sin fuente verificada.
- El workflow de CI usa PostGIS 16-3.7; el entorno local verificado usa PostGIS 3.7.0.
