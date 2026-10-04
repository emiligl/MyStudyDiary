# MEMORY.md — Diario de Estudio
Memoria del proyecto entre sesiones. Máximo ~50 líneas: resume o elimina lo que ya no aporte.
## Estado actual
- El proyecto está en `/home/emiligl/projects/MyStudyDiary`.
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
## Aprendizajes y errores a evitar
- `AGENTS.md` resume las reglas de datos, fechas, funcionalidades derivadas y verificación; las decisiones de estado se mantienen aquí.
- La interfaz usa una estética de cuaderno: fondo de papel, tinta azul profunda y coral como acento principal de la racha.
- Las tarjetas de estadísticas usan iconos separados para evitar desbordamientos en pantallas estrechas.
## Próximos pasos
- (vacío por ahora)
