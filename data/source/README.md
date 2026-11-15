# Snapshots oficiales de la Fase 1

Estos archivos son la entrada reproducible del ETL. No se editan a mano. El manifiesto `manifest.json` registra SHA-256, fuente, URL, fecha y licencia; `npm run verify:data` verifica la integridad.

| Archivo | Contenido | Fuente | Fecha | SHA-256 |
|---------|-----------|--------|-------|---------|
| `barrio-ciudad-granada.geojson` | Polígono oficial WGS84, 58 vértices | F-01 · SDP/UAECD · `barrioslegalizados/MapServer/0` | 2026-11-15 | `1CDD6D0A63E3AD38393EB8FB37CBF7E2CAD1AD507D97CC2EDCBE2E8CCD5B0F6E` |
| `estrato-ciudad-granada.geojson` | 34 manzanas, todas estrato 2 | F-02 · SDP/UAECD · `estratificacion/MapServer/1` | 2026-11-15 | `175E3BA4BAD361863B1731669AD7A9E1EFD7F2B531FA950EE170D5D8619591E9` |
| `barrio-atributos-oficial.json` | Registro oficial `LEG00645` (incluye `CODIGO_UPL`) | F-01 · SDP/UAECD | 2026-11-15 | `58EC23169DBA0C43EEEA8D0339C04DD07DE1B29C61D8AA9631087C31BF8FF229` |

## Reglas

- El polígono WGS84 proviene del servicio REST con `outSR=4326`; no se dibuja ni se simplifica.
- La ventana de estratificación devolvió 802 polígonos; el snapshot conserva **solo 34** con centroide dentro del polígono oficial.
- La fuente, URL y fecha de cada archivo están en `manifest.json` y en la API pública.
- Los archivos temporales de consulta no se versionan; estos snapshots sí, porque son el insumo verificable del ETL.

La verificación y el método completo están en `docs/evidencias/fase-0/README.md` y `docs/investigacion/fuentes-territoriales.md` §12.
