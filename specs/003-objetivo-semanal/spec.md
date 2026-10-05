# Spec 003 — Objetivo semanal de estudio
Estado: implementada

## Contexto y objetivo

El Diario de Estudio ya muestra los minutos estudiados de la semana actual, pero no permite fijar una meta. Esta funcionalidad debe permitir al usuario definir cuántos minutos quiere estudiar cada semana y ver su avance hacia ese objetivo, para motivarse a cumplirlo.

Los minutos de la semana dejan de mostrarse en una tarjeta suelta y pasan a formar parte de la nueva tarjeta del objetivo, que reúne los minutos estudiados de la semana, el objetivo fijado y la barra de progreso en un único lugar y evita duplicar el dato.

## Usuarios

Personas que estudian y quieren fijarse una meta semanal y comprobar su progreso dentro de la aplicación.

## Historias de usuario

- HU-1. Como estudiante, quiero fijar cuántos minutos quiero estudiar a la semana para tener una meta clara.
- HU-2. Como estudiante, quiero ver en una sola tarjeta, con una barra y un texto, cuánto llevo estudiado esta semana respecto a mi objetivo para saber si voy cumpliéndolo.
- HU-3. Como estudiante, quiero saber cuándo he alcanzado mi objetivo semanal y cuánto lo he superado para reconocer mi esfuerzo.
- HU-4. Como estudiante, quiero poder editar o borrar mi objetivo cuando lo necesite sin perder mis sesiones registradas.

## Definiciones

- **Objetivo semanal:** meta única de minutos fijada por el usuario, que debe ser un número entero mayor que cero y se aplica a todas las semanas, incluidas las futuras.
- **Semana actual:** periodo natural local de lunes a domingo que contiene el día actual.
- **Sesión contabilizada:** registro con una fecha local válida en formato `AAAA-MM-DD` que pertenece a la semana actual, no es posterior al día actual y tiene minutos numéricos, finitos y mayores que cero. El tema puede estar vacío.
- **Minutos estudiados de la semana:** suma de los minutos de todas las sesiones contabilizadas, contando cada sesión una vez y acumulando los minutos del mismo día.
- **Progreso:** comparación entre los minutos estudiados de la semana y el objetivo fijado, mostrada con una barra y un texto de minutos.
- **Estado sin objetivo:** estado en el que no hay ningún objetivo fijado; la tarjeta muestra una invitación a fijarlo.

## Requisitos funcionales

### RF-1. Fijar el objetivo

Cuando el usuario escriba un objetivo semanal de minutos y pulse «Guardar», el sistema deberá registrarlo como meta única que se repite cada semana, incluidas las futuras.

### RF-2. Tarjeta integrada del objetivo

El sistema deberá mostrar una única tarjeta que reúna los minutos estudiados de la semana, el objetivo fijado y la barra de progreso, y no deberá mostrar una tarjeta separada de minutos de la semana.

### RF-3. Controles siempre visibles

El sistema deberá mostrar siempre, en la tarjeta del objetivo, el campo de minutos y el botón «Guardar».

### RF-4. Sin objetivo

Si no hay ningún objetivo fijado, entonces el sistema deberá mostrar un mensaje que invite a fijarlo, sin barra ni progreso y sin generar errores.

### RF-5. Ver el progreso

Mientras exista un objetivo fijado, el sistema deberá mostrar una barra visual y el texto «llevas X de Y minutos», donde X son los minutos estudiados de la semana actual e Y el objetivo.

### RF-6. Llenado de la barra

Mientras exista un objetivo fijado, el sistema deberá llenar la barra en proporción a X entre Y, con un porcentaje igual a `min(100, X / Y × 100)`, redondeado al alza al entero más próximo, y deberá mostrar al menos un 1 % de llenado cuando X sea mayor que cero y menor que Y.

### RF-7. Objetivo cumplido

Mientras los minutos estudiados de la semana alcancen o superen el objetivo, el sistema deberá mostrar además el texto «objetivo cumplido» y los minutos de exceso; cuando el exceso sea exactamente cero, deberá indicar el objetivo alcanzado sin mostrar «0 minutos de exceso».

### RF-8. Editar el objetivo

Cuando exista un objetivo y el usuario escriba un valor nuevo y pulse «Guardar», el sistema deberá actualizar el objetivo y recalcular el progreso de la semana actual contra el nuevo valor.

### RF-9. Borrar el objetivo

Cuando exista un objetivo y el usuario use el control «Borrar objetivo», el sistema deberá eliminar el objetivo y volver al estado sin objetivo.

### RF-10. Sesiones contabilizadas

Cuando el sistema calcule los minutos de la semana, deberá sumar los minutos de todas las sesiones contabilizadas, contando cada sesión una vez y acumulando los minutos del mismo día.

### RF-11. Exclusión de datos no válidos

Cuando el sistema calcule el progreso, deberá excluir las sesiones con fechas malformadas o futuras y las de minutos no numéricos, no finitos o no positivos, sin modificar los registros originales.

### RF-12. Recálculo al registrar sesiones

Cuando se registre o modifique una sesión de la semana actual, el sistema deberá recalcular y actualizar el progreso mostrado.

### RF-13. Progreso recalculado

El sistema deberá recalcular el progreso a partir de las sesiones y del objetivo fijado, sin guardar los minutos estudiados de la semana como dato independiente.

### RF-14. Objetivo no válido

Si el valor introducido para el objetivo está vacío, no es un número entero o es menor o igual que cero, entonces el sistema deberá rechazarlo con un aviso que pida un número entero de minutos mayor que cero y no modificar el objetivo existente.

### RF-15. Conservación del objetivo

El sistema deberá conservar únicamente el objetivo fijado entre usos de la aplicación; los minutos estudiados de la semana no se conservan y se recalculan desde las sesiones.

## Requisitos no funcionales

- La información deberá estar en español claro y ser comprensible para principiantes.
- La tarjeta del objetivo, la barra y el texto deberán poder consultarse en una pantalla móvil sin desplazamiento horizontal; la barra no deberá deformarse ni desbordar en pantallas estrechas.
- Fijar, editar o borrar el objetivo no deberá alterar la forma ni la clave de las sesiones existentes en ningún caso; el objetivo es un dato aparte y las sesiones no se tocan.
- La ausencia de objetivo o de sesiones deberá producir un estado comprensible, no un error visible.
- El progreso no deberá depender únicamente del color para indicar el avance o el cumplimiento; el texto de minutos deberá estar siempre disponible.

## Casos límite

- No hay ningún objetivo fijado.
- No hay sesiones en la semana actual.
- El objetivo todavía no se ha alcanzado.
- El objetivo se ha alcanzado justo con los minutos de la semana (exceso cero).
- El objetivo se ha superado.
- El usuario cambia el objetivo a mitad de semana: el progreso se recalcula contra el nuevo objetivo y no se conserva el anterior.
- El usuario borra el objetivo: se vuelve al estado sin objetivo.
- El usuario borra el objetivo y lo vuelve a fijar, con y sin sesiones en la semana.
- El usuario fija un objetivo ya superado por los minutos de la semana: se muestra como cumplido con su exceso.
- El objetivo se supera varias veces dentro de la misma semana.
- El objetivo es tan grande que no es alcanzable en la semana.
- Se registra o modifica una sesión de la semana actual: el progreso se actualiza.
- El usuario introduce un objetivo vacío, cero, negativo, decimal, no numérico o no finito.
- El día actual es lunes o domingo.
- Al pasar de domingo a lunes, el progreso vuelve a cero y empieza la nueva semana.
- La semana actual contiene días futuros.
- Existen sesiones futuras guardadas que no deben contar.
- Existen sesiones con minutos inválidos o fechas malformadas que no deben contar.
- La semana cruza un cambio de mes o de año.
- La zona horaria local cambia por horario de verano o invierno.

## Fuera de alcance

- Objetivos definidos para una semana concreta o distintos entre semanas.
- Historial, comparación o evolución de objetivos anteriores.
- Objetivos por tema, curso o asignatura.
- Recordatorios, notificaciones o avisos automáticos.
- Objetivos compartidos o sincronizados con otros servicios o personas.
- Navegar a otras semanas distintas de la actual.

## Criterios de finalización

- El usuario puede fijar un objetivo semanal de minutos con el campo y el botón «Guardar», y este se repite cada semana.
- La tarjeta del objetivo se muestra siempre e integra los minutos de la semana, el objetivo y la barra, sin una tarjeta separada de minutos de la semana.
- Cuando no hay objetivo, la tarjeta muestra un mensaje que invita a fijarlo, sin barra ni errores.
- El progreso mostrado coincide con los minutos de las sesiones contabilizadas de la semana actual frente al objetivo.
- La barra se llena según `min(100, X / Y × 100)`, redondeada al alza, muestra al menos un 1 % con avance parcial y queda llena al 100 % al alcanzar o superar el objetivo.
- El texto muestra siempre «llevas X de Y minutos» y, al alcanzar o superar el objetivo, añade «objetivo cumplido» y los minutos de exceso; con exceso cero no muestra «0 minutos de exceso».
- Editar el objetivo recalcula el progreso y borrarlo vuelve al estado sin objetivo, sin alterar las sesiones.
- Registrar o modificar una sesión de la semana actual actualiza el progreso.
- Un valor vacío, cero, negativo, decimal, no numérico o no finito se rechaza con un aviso y no modifica el objetivo.
- Solo se conserva el objetivo entre usos de la aplicación; los minutos estudiados se recalculan desde las sesiones.
- Fijar, editar o borrar el objetivo no altera la forma ni la clave de las sesiones existentes.
- Los casos límite principales funcionan sin errores.
- La vista móvil no tiene desbordamiento horizontal y la barra no se deforma.
- La consola no muestra errores durante la verificación.

## Dudas abiertas

Ninguna.
