# MEMORY.md — Diario de Estudio
Memoria del proyecto entre sesiones. Máximo ~50 líneas: resume o elimina lo que ya no aporte.
## Estado actual
- El proyecto está en `/home/emiligl/projects/MyStudyDiary`.
- Repositorio remoto privado: `https://github.com/emiligl/MyStudyDiary`.
- `README.md` documenta el uso, las funcionalidades, la estructura y cómo lanzar los tests.
- `docs/constitution.md` contiene los seis principios innegociables (stack simple, spec y código alineados, lógica separada de la interfaz, tests verificables, datos protegidos, idioma coherente).
- Spec 001 (mapa de calor de 12 semanas, cuatro niveles): implementada, T1–T4 hechas.
- Spec 002 (informe mensual en HTML): implementada, `specs/002-report/` T1–T8 hechas.
- Spec 003 (objetivo semanal de estudio): **implementada**, `specs/003-objetivo-semanal/` T1–T9 hechas; cubre RF-1 a RF-15.
- v1: registrar sesiones, racha actual, mejor racha, top 3, días del mes, meses destacados, mapa de calor e informe mensual.
- Objetivo semanal: tarjeta con campo + «Guardar» + «Borrar objetivo», barra y textos «llevas X de Y minutos» y «objetivo cumplido · N minutos de exceso». Retirada la antigua tarjeta suelta «Minutos esta semana» (quedan 3 tarjetas de racha).
- Datos en localStorage: sesiones en `diario-de-estudio-sesiones` (`fecha`, `tema`, `minutos`, `creadaEn`) y objetivo en la clave aparte `diario-de-estudio-objetivo-semanal` (entero > 0 guardado como texto).
- Tests (`node --test`): `heat-map`, `report`, `report-html`, `report-descarga`, `report-integracion`, `objetivo-semanal` y `objetivo-integracion`; 144 pasan.
## Decisiones (y por qué)
- Sin backend ni dependencias: cualquiera debe poder abrirlo con doble clic.
- Fecha editable en el formulario: permite registrar días pasados y ver la racha crecer.
- La mejor racha y el top 3 se recalculan sin persistirse (fechas futuras ignoradas; empates por fecha y `creadaEn`).
- Los minutos de la semana se recalculan desde las sesiones contabilizadas (fecha local válida en la semana actual, no futura, minutos numéricos finitos > 0); ya no se usa la función antigua `calcularMinutosSemana`.
- Meses destacados y días estudiados del mes se recalculan y no se persisten.
- El informe revalida los datos con la fecha actual al exportar, no al elegir el mes.
- El objetivo vive en su propia clave para no cambiar la forma de las sesiones (compatibilidad) y se aplica a todas las semanas, incluidas las futuras.
- El progreso del objetivo se recalcula en cada pintado; al leerlo se revalida con `normalizarObjetivo` y los datos corruptos o ausentes se tratan como ausencia.
- La barra usa `min(100, X/Y×100)` redondeada al alza, con mínimo 1 % si hay avance parcial; el texto de minutos siempre acompaña para no depender solo del color.
## Aprendizajes y errores a evitar
- `AGENTS.md` resume las reglas de datos, fechas, funcionalidades derivadas y verificación; las decisiones de estado se mantienen aquí.
- La interfaz usa una estética de cuaderno: fondo de papel, tinta azul profunda y coral como acento principal.
- Ejecutar siempre `node --test` completo, no solo el archivo de la tarea: una regresión de T2 pasó inadvertida.
- Al auditar, ejecutar el código real y no solo leerlo: así aparecieron fallos de fechas y de «Sin tema».
- `overflow-wrap: anywhere` en todas las celdas parte fechas y cabeceras en móvil: aplicarlo solo a la celda del tema.
- `text-transform: capitalize` escribe «Octubre De 2026»: capitalizar solo la primera letra del mes.
- Las estadísticas heredadas asumían `fecha`/`tema` como texto; en la FASE 6 de la spec 003 se filtraron las entradas corruptas (`esSesionConFecha`/`esSesionRegistrada`) y el pintado del objetivo se hizo independiente del resto, así que un dato dañado ya no lanza ni deja la tarjeta sin progreso.
## Próximos pasos
- Comprobar a mano la vista previa de impresión del informe (no automatizable con las herramientas actuales).
- Hacer commit de los cambios pendientes (spec 003, tests, README y AGENTS).
