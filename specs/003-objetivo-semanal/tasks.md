# Tareas: objetivo semanal de estudio

- [x] **T1. Implementar la normalización y validación del objetivo introducido, empezando por sus tests.** RF-1, RF-8, RF-14
  - Hecho cuando: la implementación ha sido verificada mediante tests que aceptan enteros positivos recortando espacios y rechazan vacío, cero, negativo, decimal, texto no numérico y valores no finitos, con su mensaje y sin modificar el objetivo existente.

- [x] **T2. Implementar la sesión contabilizada y los minutos de la semana actual, empezando por sus tests.** RF-10, RF-11, RF-13
  - Hecho cuando: la implementación ha sido verificada mediante tests que suman los minutos de todas las sesiones contabilizadas contando cada una una vez, acumulan el mismo día y excluyen sesiones nulas, con tipos incorrectos, fechas malformadas, imposibles o futuras y minutos cero, negativos, no numéricos o no finitos.

- [x] **T3. Calcular el porcentaje de llenado de la barra, empezando por sus tests.** RF-6
  - Hecho cuando: la implementación ha sido verificada mediante tests que comprueban `min(100, X/Y×100)` redondeado al alza, el 100 % al alcanzar o superar, el mínimo del 1 % con avance parcial y el 0 % sin avance.

- [x] **T4. Construir el estado del progreso con sus textos, empezando por sus tests.** RF-4, RF-5, RF-7, RF-13
  - Hecho cuando: la implementación ha sido verificada mediante tests que devuelven la invitación sin objetivo y, con objetivo, los minutos, el porcentaje, el cumplimiento, el exceso y los textos, incluido el exceso cero sin «0 minutos de exceso».

- [x] **T5. Leer, guardar y borrar el objetivo de forma robusta en su propia clave.** RF-1, RF-8, RF-9, RF-15
  - Hecho cuando: la implementación ha sido verificada mediante tests que leen un objetivo válido, tratan como ausencia los datos corruptos o ausentes, guardan un valor válido, rechazan uno inválido, borran solo el objetivo y nunca tocan las sesiones.

- [x] **T6. Retirar la tarjeta «Minutos esta semana» e integrar la tarjeta del objetivo en la interfaz.** RF-2, RF-3, RF-4
  - Hecho cuando: la implementación ha sido verificada y la tarjeta del objetivo se muestra siempre con el campo y «Guardar», sin una tarjeta separada de minutos de la semana, y muestra el mensaje de invitación cuando no hay objetivo.

- [x] **T7. Estilar la barra, los textos de progreso y el estado de cumplimiento con diseño responsive.** RF-5, RF-6, RF-7
  - Hecho cuando: la implementación ha sido verificada y la barra se llena según el porcentaje, se muestran «llevas X de Y minutos» y «objetivo cumplido» con el exceso, la barra no se deforma ni desborda y la vista de 375 px no tiene desplazamiento horizontal.

- [x] **T8. Conectar guardar, editar y borrar, y recalcular el progreso al registrar sesiones.** RF-1, RF-8, RF-9, RF-12, RF-14
  - Hecho cuando: la implementación ha sido verificada y guardar fija o edita el objetivo, un valor inválido muestra un aviso sin cambiar el objetivo, borrar vuelve al estado sin objetivo y registrar una sesión actualiza el progreso sin alterar las sesiones.

- [x] **T9. Ejecutar la validación completa y cerrar la documentación de la spec.** RF-1, RF-2, RF-3, RF-4, RF-5, RF-6, RF-7, RF-8, RF-9, RF-10, RF-11, RF-12, RF-13, RF-14, RF-15
  - Hecho cuando: la implementación ha sido verificada con `node --test` sin fallos, Chrome DevTools confirma el flujo completo con la consola limpia y la vista móvil, ninguna sesión existente se modifica o pierde, `README.md` y `MEMORY.md` quedan actualizados y la spec pasa a `implementada`.
