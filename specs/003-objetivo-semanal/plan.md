# Plan: objetivo semanal de estudio

## Alcance

Permitir fijar, editar y borrar un objetivo semanal de minutos, y mostrar el progreso de la semana natural local actual con una barra y textos, integrando los minutos de la semana en la misma tarjeta del objetivo. El objetivo es un dato aparte; las sesiones existentes no se modifican. El plan cubre RF-1 a RF-15.

## Archivos y responsabilidades

### `index.html` — modificar

- Retirar la tarjeta suelta «Minutos esta semana» (bloque `racha--semana` de la sección `.rachas`).
- Añadir una sección de tarjeta del objetivo con: campo de minutos, botón «Guardar», botón «Borrar objetivo» (visible solo con objetivo), mensaje de invitación cuando no hay objetivo, zona de barra, textos de progreso y estado de error.
- Mantener la interfaz en español y accesible mediante etiquetas, foco y mensajes asociados (`role="status"`, `aria-live`).
- Cubre RF-2, RF-3, RF-4, RF-5, RF-7.

### `styles.css` — modificar

- Ajustar la rejilla `.rachas` al retirar la tarjeta de minutos (pasa de 4 a 3 elementos).
- Estilar la tarjeta del objetivo, la barra y su relleno, el estado cumplido y el aviso de error siguiendo la estética de cuaderno existente.
- Garantizar que la barra no se deforme ni desborde: contenedor al 100 %, relleno con ancho porcentual y `max-width: 100%`, y objetivos muy grandes sin romper la rejilla.
- Adaptar el diseño a móvil (375 px) sin desplazamiento horizontal: controles apilados y textos con salto de línea razonable.
- Cubre RF-2, RF-5, RF-6 y los requisitos no funcionales de responsive y no depender solo del color.

### `app.js` — modificar

- Añadir las funciones puras de normalización del objetivo, validación de sesiones contabilizadas, cálculo de minutos de la semana, porcentaje de la barra y estado del progreso.
- Añadir la lectura, escritura y borrado robustos del objetivo en una clave de almacenamiento propia y separada de las sesiones.
- Retirar el uso de la función de minutos semanales anterior al desaparecer su tarjeta.
- Leer las sesiones sin cambiar su forma ni persistir datos derivados; las funciones nuevas son defensivas ante sesiones nulas o con tipos incorrectos.
- Pintar y conectar los eventos de guardar, editar y borrar, y recalcular el progreso al registrar una sesión.
- Exportar las funciones nuevas en el bloque `if (typeof module !== "undefined")` para los tests.
- Cubre RF-1 a RF-15.

### `tests/objetivo-semanal.test.js` y `tests/objetivo-integracion.test.js` — crear

- `objetivo-semanal.test.js`: lógica pura con datos controlados y `hoy` explícito (normalización, sesiones contabilizadas, minutos, porcentaje y estado).
- `objetivo-integracion.test.js`: validación RF por RF, robustez ante datos inválidos y cierre.
- Cubren RF-1, RF-4, RF-5, RF-6, RF-7, RF-8, RF-10, RF-11, RF-13, RF-14 y RF-15.

### `specs/003-objetivo-semanal/spec.md` — modificar solo durante el cierre

- Mantener el estado `aprobada` durante la implementación y cambiarlo a `implementada` únicamente al terminar y validar la funcionalidad.

### `README.md` y `MEMORY.md` — actualizar al terminar

- `README.md`: describir el objetivo semanal entre las funcionalidades.
- `MEMORY.md`: registrar el estado, las decisiones y las verificaciones, sin datos de sesiones del usuario.

## Funciones puras de lógica

Todas las funciones que dependan del día reciben `hoy` explícito y usan fechas locales. No usan `toISOString()`, `new Date("AAAA-MM-DD")` ni cálculos de 24 horas en milisegundos. Ninguna muta las sesiones originales y todas toleran `null` o tipos incorrectos.

### `normalizarObjetivo(valor)`

Recibe el texto introducido o el valor guardado y devuelve `{ valido, objetivo, mensaje }`. Se recortan los espacios; se acepta solo un entero mayor que cero (sin decimales). Un valor vacío, cero, negativo, decimal, no numérico o no finito produce `valido: false` con un mensaje que pide un número entero de minutos mayor que cero. Cubre RF-1, RF-8 y RF-14.

### `esFechaEnSemanaActual(fecha, hoy)`

Devuelve si `fecha` (texto local `AAAA-MM-DD`) es una fecha real que cae entre el lunes y el domingo de la semana local que contiene `hoy`. Reutiliza el cálculo de inicio de semana local ya existente; no muta la fecha recibida. Cubre RF-10.

### `esSesionContabilizada(sesion, hoy)`

Devuelve si la sesión existe como objeto, tiene una fecha local válida en la semana actual, no es posterior a `hoy` y tiene minutos numéricos, finitos y mayores que cero. Es defensiva ante `null` y tipos incorrectos. Cubre RF-11.

### `calcularMinutosSemanaActual(sesiones, hoy)`

Devuelve la suma de minutos de todas las sesiones contabilizadas, contando cada sesión una vez y acumulando los minutos del mismo día. Tolera una colección no válida (devuelve 0). Sustituye a la función de minutos semanales anterior. Cubre RF-10, RF-11 y RF-13.

### `calcularPorcentajeObjetivo(minutos, objetivo)`

Devuelve el porcentaje de llenado de la barra: `min(100, minutos / objetivo × 100)`, redondeado al alza al entero próximo, con un mínimo del 1 % cuando `minutos` es mayor que cero y menor que `objetivo`. Con objetivo no válido o minutos no positivos devuelve 0. Cubre RF-6.

### `construirEstadoObjetivo(sesiones, objetivo, hoy)`

Devuelve un modelo inmutable con `hayObjetivo`, `objetivo`, `minutos`, `porcentaje`, `cumplido`, `exceso` y los textos de progreso y cumplimiento. Sin objetivo devuelve el estado de invitación. Al alcanzar o superar el objetivo, `cumplido` es verdadero y el exceso es `max(0, minutos - objetivo)`; el texto de cumplimiento solo menciona el exceso cuando es mayor que cero. Cubre RF-4, RF-5, RF-6, RF-7 y RF-13.

### `leerObjetivo(almacenamiento)` y `guardarObjetivo(almacenamiento, valor)` / `borrarObjetivo(almacenamiento)`

Leen, escriben y borran el objetivo usando un almacenamiento inyectable con su propia clave separada de las sesiones. `leerObjetivo` devuelve el objetivo válido o su ausencia (nunca lanza con datos corruptos); `guardarObjetivo` rechaza valores no válidos; `borrarObjetivo` elimina solo el dato del objetivo. Nunca tocan la colección de sesiones. Cubre RF-1, RF-8, RF-9 y RF-15.

## Algoritmo en pseudocódigo

Cálculo del progreso:

```text
construirEstadoObjetivo(sesiones, objetivo, hoy):
    si objetivo no es un entero mayor que cero:
        devolver { hayObjetivo: false, mensaje: "Fija un objetivo semanal..." }

    minutos ← calcularMinutosSemanaActual(sesiones, hoy)
    porcentaje ← calcularPorcentajeObjetivo(minutos, objetivo)
    cumplido ← minutos >= objetivo
    exceso ← max(0, minutos - objetivo)

    textoProgreso ← "llevas " + minutos + " de " + objetivo + " minutos"
    si cumplido y exceso > 0:
        textoCumplido ← "objetivo cumplido · " + exceso + " minutos de exceso"
    si cumplido y exceso = 0:
        textoCumplido ← "objetivo cumplido"
    si no cumplido:
        textoCumplido ← ""

    devolver { hayObjetivo: true, objetivo, minutos, porcentaje, cumplido, exceso,
               textoProgreso, textoCumplido }
```

Flujo de guardar, editar y borrar:

```text
al cargar la página:
    objetivo ← leerObjetivo(almacenamiento)
    pintar tarjeta y progreso con objetivo y sesiones actuales

al pulsar "Guardar":
    resultado ← normalizarObjetivo(valor del campo)
    si no resultado.valido:
        mostrar el aviso de RF-14 y no cambiar el objetivo
    si resultado.valido:
        guardarObjetivo(almacenamiento, resultado.objetivo)
        limpiar el aviso, pintar la tarjeta y recalcular el progreso

al pulsar "Borrar objetivo":
    borrarObjetivo(almacenamiento)
    pintar el estado sin objetivo

al registrar una sesión (submit existente):
    guardar la sesión como hasta ahora
    leer el objetivo vigente y repintar el progreso con las sesiones actualizadas
```

## Pintado e interacción de la interfaz

1. La tarjeta del objetivo se muestra siempre. Sin objetivo, muestra un mensaje que invita a fijarlo y el campo con «Guardar», sin barra ni progreso.
2. Con objetivo, muestra el texto «llevas X de Y minutos», la barra rellena según el porcentaje calculado y, si corresponde, «objetivo cumplido» con los minutos de exceso.
3. El campo de minutos y el botón «Guardar» están siempre visibles; el botón «Borrar objetivo» solo aparece cuando hay objetivo.
4. Al guardar un valor nuevo se fija o edita el objetivo; un valor inválido muestra un aviso y no modifica el objetivo existente.
5. El progreso se recalcula al registrar una sesión y al volver a abrir la página, sin conservar los minutos estudiados.
6. La barra no depende solo del color: junto a ella siempre está el texto de minutos.

Cobertura: RF-2, RF-3, RF-4, RF-5, RF-6, RF-7, RF-8, RF-9 y RF-12.

## Decisiones técnicas y alternativas descartadas

### Clave de almacenamiento propia para el objetivo

- **Decisión:** guardar el objetivo en una clave de almacenamiento separada de las sesiones (propuesta: `diario-de-estudio-objetivo-semanal`).
- **Alternativa descartada:** guardarlo dentro de la misma colección de sesiones, porque cambiaría la forma de los datos del usuario y pondría en riesgo la compatibilidad (constitución, principio 5).
- **RF cubiertos:** RF-1, RF-9 y RF-15.

### Estado del objetivo como número o ausencia

- **Decisión:** representar el estado como un entero mayor que cero o su ausencia; la lectura normaliza y valida el valor guardado y, ante datos corruptos o ausentes, se comporta como ausencia.
- **Alternativa descartada:** guardar el objetivo como texto libre sin validar, porque mostraría objetivos inválidos y rompería los cálculos de la barra.
- **RF cubiertos:** RF-4, RF-13, RF-14 y RF-15.

### Reutilizar la normalización para lo guardado y lo introducido

- **Decisión:** aplicar `normalizarObjetivo` tanto al valor introducido por el usuario como al leído del almacenamiento.
- **Alternativa descartada:** tener dos validaciones distintas, porque duplicaría reglas y permitiría estados incoherentes.
- **RF cubiertos:** RF-1, RF-8 y RF-14.

### Función de minutos semanales nueva y defensiva

- **Decisión:** crear `calcularMinutosSemanaActual(sesiones, hoy)` que valida fechas y minutos y tolera datos inválidos, y retirar el uso de la función anterior al desaparecer su tarjeta.
- **Alternativa descartada:** reutilizar la función de minutos semanales existente, porque no recibe `hoy` ni excluye minutos no numéricos, negativos, no finitos o fechas malformadas.
- **RF cubiertos:** RF-10, RF-11, RF-12 y RF-13.

### Recálculo en lugar de persistencia

- **Decisión:** recalcular los minutos y el progreso desde las sesiones y el objetivo en cada pintado.
- **Alternativa descartada:** guardar los minutos de la semana como dato independiente, porque quedarían obsoletos y duplicarían información.
- **RF cubiertos:** RF-12, RF-13 y RF-15.

### Llenado de la barra

- **Decisión:** porcentaje `min(100, X / Y × 100)`, redondeo al alza y mínimo del 1 % con avance parcial.
- **Alternativa descartada:** mostrar porcentajes superiores al 100 % o barras vacías con avance mínimo, porque confundirían el estado y no encajan con la spec.
- **RF cubiertos:** RF-6 y RF-7.

### Defensa ante sesiones nulas o inválidas

- **Decisión:** las funciones nuevas comprueban que cada sesión es un objeto con fecha válida y minutos numéricos finitos y positivos, e ignoran el resto sin lanzar errores.
- **Alternativa descartada:** confiar en la forma de los datos sin validarlos, porque una sesión `null` o con tipos incorrectos rompería el cálculo del progreso (riesgo conocido de la spec 002).
- **RF cubiertos:** RF-11 y el requisito no funcional de estado comprensible.

## Estrategia de tests

### Tests unitarios con `node --test`

Crear los tests antes de implementar cada parte. Importarán solo funciones puras y usarán fechas locales explícitas.

| Grupo | Comprobaciones | RF |
|---|---|---|
| Normalización del objetivo | Aceptar enteros positivos y recortar espacios; rechazar vacío, cero, negativo, decimal, texto no numérico y valores no finitos con su mensaje. | RF-1, RF-8, RF-14 |
| Sesión contabilizada | Aceptar sesiones de la semana actual no futuras con minutos positivos finitos; excluir nulas, tipos incorrectos, fechas malformadas o imposibles, fechas futuras y minutos cero, negativos, no numéricos o no finitos. | RF-10, RF-11 |
| Minutos de la semana | Sumar varias sesiones del mismo día una sola vez cada una; excluir las no contabilizadas; devolver 0 sin sesiones o con datos inválidos. | RF-10, RF-11, RF-13 |
| Porcentaje de la barra | Calcular `min(100, X/Y×100)` al alza, llenar al 100 % al alcanzar o superar, aplicar el mínimo del 1 % con avance parcial y 0 % sin avance. | RF-6 |
| Estado del progreso | Sin objetivo devolver la invitación; con objetivo calcular minutos, cumplido, exceso y textos, incluido exceso cero sin «0 minutos de exceso». | RF-4, RF-5, RF-7, RF-13 |
| Persistencia del objetivo | Leer un objetivo válido, tratarlo como ausencia ante valores corruptos o ausentes, guardar un valor válido, rechazar uno inválido y borrar solo el objetivo. | RF-1, RF-9, RF-15 |
| Integración RF por RF | Recorrer RF-1 a RF-15 con datos controlados y comprobar que las sesiones originales nunca se mutan. | RF-1 a RF-15 |

### Verificación de interfaz con Chrome DevTools

- Sin objetivo: mensaje de invitación y controles visibles, sin barra: RF-3 y RF-4.
- Fijar un objetivo y ver la barra y «llevas X de Y minutos»: RF-1, RF-2, RF-5 y RF-6.
- Alcanzar y superar el objetivo: «objetivo cumplido» y minutos de exceso, barra llena: RF-6 y RF-7.
- Editar el objetivo y comprobar el recálculo: RF-8.
- Borrar el objetivo y volver al estado sin objetivo: RF-9.
- Registrar una sesión y ver el progreso actualizado: RF-12.
- Valor inválido (vacío, cero, decimal, texto): aviso y objetivo sin cambios: RF-14.
- Sesiones inválidas o nulas: la tarjeta se muestra sin errores: RF-11.
- Consola sin errores y vista móvil de 375 px sin desplazamiento horizontal ni barra deformada.

### Verificación de regresión

- Ejecutar `node --test` completo para conservar el mapa de calor, el informe y la lógica existente.
- Abrir `index.html` con `file://` y comprobar que todo funciona sin servidor.
- Confirmar que ninguna sesión existente se modifica o desaparece al fijar, editar o borrar el objetivo.
