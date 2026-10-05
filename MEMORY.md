# MEMORY.md — Diario de Estudio
Memoria del proyecto entre sesiones. Máximo ~50 líneas: resume o elimina lo que ya no aporte.
## Estado actual
- El proyecto está en `/home/emiligl/projects/MyStudyDiary`.
- Repositorio remoto privado: `https://github.com/emiligl/MyStudyDiary`.
- `README.md` documenta el uso, las funcionalidades, la estructura y cómo lanzar los tests.
- `docs/constitution.md` contiene los seis principios innegociables (stack simple, spec y código alineados, lógica separada de la interfaz, tests verificables, datos protegidos, idioma coherente).
- Spec 001 (mapa de calor de 12 semanas, cuatro niveles): implementada, T1–T4 hechas.
- Spec 002 (informe mensual en HTML): **implementada**. `specs/002-report/` tiene spec, plan y las 8 tareas (T1–T8) hechas; cubre RF-1 a RF-11.
- Informe: tarjeta con selector de meses válidos y botón «Exportar informe». Se calcula bajo demanda desde las sesiones; no se guarda nada nuevo en `localStorage`.
- Lógica pura y testeable en `app.js`: `obtenerEstadoExportacion`, `ejecutarExportacion`, `construirModeloInforme`, `generarHTMLInforme` y `descargarInforme` (entorno inyectable).
- El HTML descargado es autocontenido (sin recursos externos ni scripts), escapa los valores del usuario, usa singular/plural, promedios con dos decimales y reglas de impresión.
- Tests (`node --test`): `heat-map`, `report`, `report-html`, `report-descarga` y `report-integracion`; 66 pasan, también con TZ Madrid, Nueva York, Auckland, Kolkata y UTC.
- v1 funcionando: registrar sesiones (fecha, tema, minutos), racha actual, mejor racha, top 3 de sesiones más largas, minutos semanales, días estudiados del mes, meses destacados y lista de sesiones.
- Datos en localStorage con la clave `diario-de-estudio-sesiones`; cada sesión usa `fecha`, `tema`, `minutos` y `creadaEn`.
## Decisiones (y por qué)
- Sin backend ni dependencias: cualquiera debe poder abrirlo con doble clic.
- Fecha editable en el formulario: permite registrar días pasados y ver la racha crecer.
- La mejor racha se recalcula desde las sesiones, ignorando fechas futuras y duplicados del mismo día, para no mantener un dato derivado separado.
- El top 3 se recalcula sin persistirlo: ignora fechas futuras y ordena por minutos, fecha y `creadaEn` descendentes.
- Los minutos semanales se recalculan sin persistirlos: suman todas las sesiones de lunes a domingo de la semana local actual y excluyen fechas futuras.
- Los meses destacados se recalculan sin persistirlos: muestran el mes con más minutos y el mes con más temas distintos; los empates eligen el mes más reciente.
- Los días estudiados del mes se recalculan sin persistirlos como fechas únicas del mes local actual, ignorando fechas futuras.
- El informe revalida los datos con la fecha actual justo al exportar, no al elegir el mes: un mes sin datos válidos no se descarga (RF-8).
## Aprendizajes y errores a evitar
- `AGENTS.md` resume las reglas de datos, fechas, funcionalidades derivadas y verificación; las decisiones de estado se mantienen aquí.
- La interfaz usa una estética de cuaderno: fondo de papel, tinta azul profunda y coral como acento principal de la racha.
- Las tarjetas de estadísticas usan iconos separados para evitar desbordamientos en pantallas estrechas.
- Ejecutar siempre `node --test` completo, no solo el archivo de la tarea: una regresión de T2 (export del mapa de calor) pasó inadvertida.
- Al auditar, ejecutar el código real y no solo leerlo: así aparecieron las fechas máximas ausentes (RF-4) y «Sin tema» en blanco en el detalle.
- `overflow-wrap: anywhere` en todas las celdas parte fechas y cabeceras en móvil: aplicarlo solo a la celda del tema.
- `text-transform: capitalize` escribe «Octubre De 2026»: capitalizar solo la primera letra del mes.
## Próximos pasos
- Comprobar a mano la vista previa de impresión del informe (no automatizable con las herramientas actuales).
- Hacer commit de los cambios pendientes (spec 002, tests, README y AGENTS).
