# AGENTS.md — Diario de Estudio

## Ejecución y estructura

- Aplicación estática: `index.html` es la entrada y carga `styles.css` y `app.js`.
- Solo HTML, CSS y JavaScript nativos; no hay npm, dependencias, build, servidor ni lint. Los tests usan solo el runner integrado de Node (`node --test`).
- Debe funcionar abriendo `index.html` con doble clic (`file://`): no usar módulos ES, `fetch` local ni APIs que requieran servidor.
- El comando `.opencode/commands/feature.md` exige plan antes de implementar nuevas funcionalidades.

## Datos y fechas

- `localStorage` usa la clave `diario-de-estudio-sesiones` y objetos `{ fecha: "AAAA-MM-DD", tema, minutos, creadaEn }`.
- No cambies la forma de los datos sin mantener compatibilidad con las sesiones existentes.
- Usa siempre fechas locales; no uses `toISOString()` ni `new Date("AAAA-MM-DD")`.
- La racha actual cuenta días consecutivos hasta hoy; si hoy está vacío, empieza por ayer. Varias sesiones del día cuentan una vez y las fechas futuras no cuentan.
- La mejor racha es el tramo histórico más largo de días consecutivos y se recalcula, no se guarda.
- El top 3 contiene las sesiones no futuras con más minutos; empates: fecha y después `creadaEn`, de más reciente a más antigua.
- Los minutos semanales suman todas las sesiones no futuras de lunes a domingo de la semana local y se recalculan.
- Los meses destacados agrupan sesiones por `AAAA-MM`, ignoran fechas futuras y se recalculan: “Más minutos” suma `minutos` y “Más cursos” cuenta temas distintos sin distinguir mayúsculas ni espacios exteriores; los empates eligen el mes más reciente.
- Días estudiados este mes = número de fechas únicas de sesiones no futuras cuyo `AAAA-MM` coincide con el mes local actual; se recalcula y no se guarda.

## Cambios y verificación

- Mantén la interfaz en español, el diseño responsive y los cambios pequeños; no añadas funcionalidades no solicitadas.
- Antes de empezar lee `docs/constitution.md`, todas las specs activas de `docs/` y `MEMORY.md`; al terminar actualiza `MEMORY.md` con el estado y decisiones relevantes, sin datos sensibles.
- Los tests automáticos existentes usan solo el runner integrado de Node; ejecútalos con `node --test`. Después de cada cambio, verifica con el MCP de Chrome DevTools: abre `index.html`, prueba la funcionalidad, revisa la consola y comprueba la vista móvil.
- Verifica manualmente abriendo `index.html` en un navegador. Para borrar los datos, elimina en DevTools → Application → Local Storage la clave `diario-de-estudio-sesiones`.
