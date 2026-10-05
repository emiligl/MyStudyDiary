# AGENTS.md — Diario de Estudio

## Ejecución y estructura

- Aplicación estática: `index.html` es la entrada y carga `styles.css` y `app.js`.
- Solo HTML, CSS y JavaScript nativos; no hay npm, dependencias, build, servidor ni lint. Los tests usan solo el runner integrado de Node (`node --test`).
- Debe funcionar abriendo `index.html` con doble clic (`file://`): no usar módulos ES, `fetch` local ni APIs que requieran servidor.
- El comando `.opencode/commands/feature.md` exige plan antes de implementar nuevas funcionalidades.

## Datos y fechas

- `localStorage` usa la clave `diario-de-estudio-sesiones` y objetos `{ fecha: "AAAA-MM-DD", tema, minutos, creadaEn }`. El objetivo semanal se guarda aparte, en la clave `diario-de-estudio-objetivo-semanal`, como un entero de minutos mayor que cero.
- No cambies la forma de los datos sin mantener compatibilidad con las sesiones existentes.
- Usa siempre fechas locales; no uses `toISOString()` ni `new Date("AAAA-MM-DD")`.
- La racha actual cuenta días consecutivos hasta hoy; si hoy está vacío, empieza por ayer. Varias sesiones del día cuentan una vez y las fechas futuras no cuentan.
- La mejor racha es el tramo histórico más largo de días consecutivos y se recalcula, no se guarda.
- El top 3 contiene las sesiones no futuras con más minutos; empates: fecha y después `creadaEn`, de más reciente a más antigua.
- Los minutos de la semana actual suman las sesiones contabilizadas (fecha local válida entre el lunes y el domingo de la semana actual, no posterior a hoy y con minutos numéricos, finitos y mayores que cero) y se recalculan; no se persisten.
- El objetivo semanal es un entero mayor que cero, se aplica a todas las semanas y vive en su propia clave; el progreso se recalcula desde las sesiones contabilizadas y la barra se llena con `min(100, X / Y × 100)` redondeada al alza, con un mínimo del 1 % si hay avance parcial.
- Los meses destacados agrupan sesiones por `AAAA-MM`, ignoran fechas futuras y se recalculan: “Más minutos” suma `minutos` y “Más cursos” cuenta temas distintos sin distinguir mayúsculas ni espacios exteriores; los empates eligen el mes más reciente.
- Días estudiados este mes = número de fechas únicas de sesiones no futuras cuyo `AAAA-MM` coincide con el mes local actual; se recalcula y no se guarda.

## Cambios y verificación

- Mantén la interfaz en español, el diseño responsive y los cambios pequeños; no añadas funcionalidades no solicitadas.
- Antes de empezar lee `docs/constitution.md`, todas las specs activas de `docs/` y `MEMORY.md`; al terminar actualiza `MEMORY.md` con el estado y decisiones relevantes, sin datos sensibles.
- Los tests automáticos existentes usan solo el runner integrado de Node; ejecútalos con `node --test`. Después de cada cambio, verifica con el MCP de Chrome DevTools: abre `index.html`, prueba la funcionalidad, revisa la consola y comprueba la vista móvil.
- Verifica manualmente abriendo `index.html` en un navegador. Para borrar los datos, elimina en DevTools → Application → Local Storage las claves `diario-de-estudio-sesiones` y `diario-de-estudio-objetivo-semanal`.
