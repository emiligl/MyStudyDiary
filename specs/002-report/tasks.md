# Tareas: informe mensual de sesiones

- [x] **T1. Implementar la validación de sesiones y la obtención de meses disponibles, empezando por sus tests.** RF-1, RF-7
  - Hecho cuando: la implementación ha sido verificada mediante tests que aceptan sesiones válidas, rechazan fechas imposibles, fechas futuras, minutos cero, negativos, no numéricos o no finitos, y devuelven los meses válidos sin duplicados y ordenados.

- [x] **T2. Implementar el filtrado del mes y las agrupaciones diarias y por tema, empezando por sus tests.** RF-3, RF-4, RF-5, RF-7
  - Hecho cuando: la implementación ha sido verificada mediante tests que solo incluyen sesiones válidas del mes, acumulan los minutos por cada día natural, conservan los días con cero minutos y agrupan correctamente los temas, incluidos los vacíos como “Sin tema”.

- [x] **T3. Implementar la ordenación y el resumen estadístico, empezando por sus tests.** RF-3, RF-4, RF-5, RF-6
  - Hecho cuando: la implementación ha sido verificada mediante tests que comprueban el orden por fecha, minutos y registro reciente, los totales, conteos, promedios a dos decimales y todos los empates de sesiones y días máximos.

- [x] **T4. Construir el modelo completo del informe y los estados sin datos, empezando por sus tests.** RF-2, RF-3, RF-4, RF-5, RF-6, RF-7, RF-8
  - Hecho cuando: la implementación ha sido verificada y el modelo reúne periodo, resumen, distribución diaria, temas y sesiones ordenadas, no muta los datos originales y devuelve un estado no exportable cuando el mes no tiene sesiones válidas.

- [x] **T5. Generar el HTML autocontenido y proteger los valores introducidos por el usuario, empezando por sus tests.** RF-2, RF-9, RF-10
  - Hecho cuando: la implementación ha sido verificada mediante tests que confirman que el HTML contiene todas las secciones definidas, puede abrirse sin la aplicación original y muestra los valores especiales como texto literal sin interpretarlos como marcado.

- [x] **T6. Añadir el selector de meses, el botón de exportación y los mensajes de estado.** RF-1, RF-2, RF-8, RF-11
  - Hecho cuando: la implementación ha sido verificada y la interfaz muestra los meses válidos, deshabilita la exportación sin selección o sin meses, revalida los datos al exportar, impide la descarga de meses sin datos y comunica éxito o error.

- [x] **T7. Integrar la descarga del HTML y ajustar la presentación responsive e imprimible.** RF-2, RF-9, RF-10, RF-11
  - Hecho cuando: la implementación ha sido verificada y el usuario puede descargar y abrir el informe completo sin conexión, el contenido es legible en pantalla pequeña y al imprimir, no hay desplazamiento horizontal y los valores de usuario permanecen literales.

- [x] **T8. Ejecutar la validación completa y cerrar la documentación de la spec.** RF-1, RF-2, RF-3, RF-4, RF-5, RF-6, RF-7, RF-8, RF-9, RF-10, RF-11
  - Hecho cuando: la implementación ha sido verificada con `node --test` sin fallos, Chrome DevTools confirma el flujo completo, la consola está limpia, la vista móvil funciona, no se modifican sesiones existentes, `MEMORY.md` queda actualizado y la spec pasa a `implementada`.
