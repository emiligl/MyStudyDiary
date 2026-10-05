# Plan: informe mensual de sesiones

## Alcance

Generar bajo demanda un informe mensual completo en HTML descargable, usando únicamente las sesiones válidas disponibles y sin modificar los datos originales. El plan cubre RF-1 a RF-11.

## Archivos y responsabilidades

### `index.html` — modificar

- Añadir el control para seleccionar un mes disponible.
- Añadir el botón de exportación.
- Añadir una zona de estado para informar de éxito, ausencia de datos y errores.
- Mantener la interfaz en español y accesible mediante etiquetas, foco y mensajes asociados.
- Cubre RF-1, RF-2, RF-8 y RF-11.

### `styles.css` — modificar

- Presentar el selector, el botón y los mensajes siguiendo la estética existente.
- Mantener el diseño responsive sin desplazamiento horizontal.
- Definir los estilos necesarios para que el informe descargado sea legible en pantalla e impresión.
- Cubre RF-9 y los requisitos no funcionales de legibilidad.

### `app.js` — modificar

- Añadir las funciones puras de validación, filtrado, agrupación, ordenación, cálculo y construcción del modelo del informe.
- Leer las sesiones existentes sin cambiar su forma ni persistir datos derivados.
- Actualizar los meses disponibles cuando cambien las sesiones.
- Generar el HTML descargable bajo demanda y mostrar los estados de éxito o error.
- Escapar los valores introducidos por el usuario antes de incluirlos en el documento.
- Cubre RF-1 a RF-11.

### `tests/report*.test.js` — crear

- Probar la lógica pura con datos controlados y una fecha `hoy` explícita.
- Cubrir sesiones válidas, fechas locales, exclusiones, agrupaciones, orden, empates, métricas y meses sin datos.
- Cubre RF-1, RF-3, RF-4, RF-5, RF-6, RF-7 y RF-8.
- Se repartió en cuatro archivos: `report.test.js` (lógica, T1–T6), `report-html.test.js` (contenido y robustez del HTML), `report-descarga.test.js` (descarga, impresión y offline, T7) y `report-integracion.test.js` (validación RF por RF y cierre, T8).

### Funciones añadidas durante la implementación

- `obtenerEstadoExportacion` y `ejecutarExportacion` (T6): estado del selector y flujo de exportación con la descarga inyectada. Cubren RF-1, RF-2, RF-8 y RF-11.
- `prepararDescarga` y `descargarInforme` (T7): crean el archivo HTML UTF-8 y lo descargan con un enlace temporal; el entorno (`document`, `URL`, `setTimeout`) se inyecta. Cubren RF-2 y RF-11.
- `pluralizar`, `formatearPromedio` y `etiquetaTemaInforme`: textos del informe en español claro (singular/plural, promedios con dos decimales, “Sin tema” también en el detalle). Cubren RF-4, RF-5 y RF-9.

### `specs/002-report/spec.md` — modificar solo durante el cierre

- Mantener el estado `aprobada` durante la planificación y cambiarlo a `implementada` únicamente cuando la funcionalidad y su validación estén terminadas.

### `MEMORY.md` — actualizar al terminar cada fase

- Registrar el estado del plan, las decisiones adoptadas y las verificaciones realizadas, sin incluir datos de sesiones del usuario.

## Funciones puras de lógica

Todas las funciones que dependan del día actual recibirán `hoy` explícitamente y usarán fechas locales. No usarán `toISOString()`, `new Date("AAAA-MM-DD")` ni cálculos basados en 24 horas en milisegundos.

### `esSesionValidaParaInforme(sesion, mes, hoy)`

Devuelve si la sesión tiene una fecha local real con formato `AAAA-MM-DD`, pertenece al mes solicitado, no es futura y contiene minutos numéricos, finitos y mayores que cero. No modifica la sesión. Cubre RF-7.

### `obtenerMesesDisponibles(sesiones, hoy)`

Filtra las sesiones válidas respecto a `hoy`, obtiene sus meses locales sin repetirlos y los ordena de más reciente a más antiguo. Cubre RF-1 y RF-7.

### `filtrarSesionesDelMes(sesiones, mes, hoy)`

Devuelve nuevas referencias a las sesiones válidas del mes indicado, sin mutar el array original. Cubre RF-6 y RF-7.

### `ordenarSesionesInforme(sesiones)`

Ordena por fecha descendente, minutos descendentes y, en caso de empate, por el registro más reciente. La ordenación será determinista y no mutará la colección recibida. Cubre RF-6.

### `crearDiasDelMes(mes)`

Genera todos los días naturales del mes local, incluidos los días sin sesiones, con total inicial de cero. Cubre RF-4.

### `agruparMinutosPorDia(sesiones, mes, hoy)`

Inicializa todos los días del mes y suma los minutos de las sesiones válidas correspondientes. Cubre RF-4 y RF-7.

### `normalizarTema(tema)`

Elimina espacios exteriores y compara el resultado sin distinguir mayúsculas de minúsculas. Los valores vacíos se representan como “Sin tema”. Cubre RF-5.

### `agruparMinutosPorTema(sesiones)`

Agrupa las sesiones por el tema normalizado, suma sus minutos y conserva una etiqueta visible en español. Cubre RF-5.

### `calcularResumenInforme(sesiones, minutosPorDia, minutosPorTema)`

Calcula total de minutos, número de sesiones, días estudiados, temas distintos, promedios con dos decimales, sesiones máximas y días máximos. En los empates conserva todos los elementos máximos. Cubre RF-3, RF-4 y RF-5.

### `construirModeloInforme(sesiones, mes, hoy)`

Compone un modelo inmutable con el mes, las sesiones ordenadas, el resumen, la distribución diaria y los temas agrupados. Si no hay sesiones válidas, devuelve un estado sin datos en lugar de un informe exportable. Cubre RF-2, RF-3, RF-4, RF-5, RF-6, RF-7 y RF-8.

### `escaparTextoInforme(texto)` y `generarHTMLInforme(modelo)`

Transforman los valores de usuario para que se presenten como texto literal y generan un documento HTML autocontenido con todas las secciones del modelo. La generación no modifica datos ni depende de la aplicación original. Cubre RF-2, RF-9 y RF-10.

## Algoritmo en pseudocódigo

```text
al cargar o cambiar las sesiones:
    hoy ← fecha local actual
    meses ← obtenerMesesDisponibles(sesiones, hoy)
    mostrar meses en el selector
    si no hay meses:
        deshabilitar la exportación
        mostrar que no existen meses con sesiones válidas

al seleccionar un mes:
    conservar el mes seleccionado

al solicitar exportación:
    hoy ← fecha local actual
    modelo ← construirModeloInforme(sesiones actuales, mes seleccionado, hoy)

    si modelo no contiene sesiones válidas:
        impedir la descarga
        mostrar el aviso de RF-8
        terminar

    html ← generarHTMLInforme(modelo)
    intentar descargar html como documento
    si la descarga falla:
        mostrar el error de RF-11
    si termina correctamente:
        mostrar confirmación sin alterar las sesiones
```

La construcción del modelo seguirá este orden:

```text
válidas ← filtrar sesiones con esSesionValidaParaInforme
si válidas está vacío: devolver estado sin datos
ordenadas ← ordenarSesionesInforme(válidas)
días ← crearDiasDelMes(mes)
totalesPorDía ← agrupar minutos de válidas en días
totalesPorTema ← agrupar minutos de válidas por tema normalizado
resumen ← calcularResumenInforme(válidas, totalesPorDía, totalesPorTema)
devolver mes, ordenadas, días, temas y resumen
```

## Pintado e interacción de la interfaz

1. La interfaz mostrará un selector con los meses que tengan al menos una sesión válida, en orden descendente.
2. El botón de exportación permanecerá deshabilitado cuando no exista ningún mes disponible o no haya una selección válida.
3. Al solicitar la exportación se volverán a validar los datos con el `hoy` actual para evitar exportar sesiones que se hayan vuelto futuras o inválidas.
4. Los mensajes de estado indicarán, en español, si no hay datos, si la exportación terminó o si ocurrió un error.
5. El HTML descargado contendrá el periodo, resumen, métricas, máximos, distribución de todos los días, temas agrupados y tabla de sesiones.
6. El documento descargado incluirá sus estilos necesarios para abrirse sin conexión y se adaptará a pantalla e impresión sin desplazamiento horizontal.
7. Los temas y demás valores del usuario se mostrarán como texto literal y no como marcado interpretado.

Cobertura: RF-1, RF-2, RF-3, RF-4, RF-5, RF-6, RF-7, RF-8, RF-9, RF-10 y RF-11.

## Decisiones técnicas y alternativas descartadas

### HTML descargable

- **Decisión:** generar un documento HTML autocontenido bajo demanda.
- **Alternativa descartada:** CSV, porque no representa bien el resumen, los máximos, la distribución ni la legibilidad para compartir.
- **Alternativa descartada:** PDF, porque añadiría complejidad y no es necesario para el objetivo de conservar y consultar el informe.
- **RF cubiertos:** RF-2 y RF-9.

### No persistir informes

- **Decisión:** calcular el informe desde las sesiones actuales en cada exportación.
- **Alternativa descartada:** guardar informes o métricas derivadas, porque podría dejar datos obsoletos y duplicaría información del usuario.
- **RF cubiertos:** RF-3, RF-4, RF-5, RF-6 y RF-7.

### Validación al generar y no solo al seleccionar

- **Decisión:** recalcular `hoy`, las sesiones válidas y el mes seleccionado justo antes de exportar.
- **Alternativa descartada:** confiar en la lista de meses creada al cargar, porque los datos pueden cambiar o el día local puede avanzar.
- **RF cubiertos:** RF-1, RF-7 y RF-8.

### Mostrar todos los empates

- **Decisión:** mostrar todas las sesiones y días que compartan el máximo.
- **Alternativa descartada:** elegir solo uno, porque ocultaría información válida y produciría resultados arbitrarios.
- **RF cubiertos:** RF-4 y RF-6.

### Distribución completa del mes

- **Decisión:** incluir también los días con cero minutos.
- **Alternativa descartada:** mostrar solo días estudiados, porque impediría interpretar huecos y la constancia mensual.
- **RF cubiertos:** RF-4 y RF-9.

### Agrupación de temas

- **Decisión:** comparar temas tras recortar espacios exteriores y sin distinguir mayúsculas; representar vacíos como “Sin tema”.
- **Alternativa descartada:** tratar cada texto como distinto, porque fragmentaría artificialmente los temas del usuario.
- **RF cubiertos:** RF-3, RF-5 y RF-6.

### Protección del contenido introducido

- **Decisión:** mostrar los valores de usuario como texto literal en el informe.
- **Alternativa descartada:** insertar valores sin transformación, porque podría alterar la estructura del documento y no cumpliría RF-10.
- **RF cubiertos:** RF-9 y RF-10.

## Estrategia de tests

### Tests unitarios con `node --test`

Crear `tests/report.test.js` antes de implementar la funcionalidad. Los tests importarán únicamente las funciones puras y usarán fechas locales explícitas.

| Grupo | Comprobaciones | RF |
|---|---|---|
| Meses disponibles | Detectar meses con sesiones válidas, eliminar duplicados y ordenar meses. | RF-1, RF-7 |
| Validación | Aceptar fechas reales y minutos positivos finitos; excluir fechas imposibles, formatos incorrectos, fechas futuras, cero, negativos, textos no numéricos y valores no finitos. | RF-7 |
| Filtrado y orden | Mantener solo el mes seleccionado y ordenar por fecha, minutos y registro más reciente. | RF-6, RF-7 |
| Días | Crear todos los días del mes, sumar sesiones repetidas y conservar ceros. | RF-4 |
| Temas | Agrupar mayúsculas y espacios exteriores, representar temas vacíos y sumar minutos. | RF-3, RF-5 |
| Resumen | Calcular totales, conteos, días, temas, promedios a dos decimales y máximos con empates. | RF-3, RF-4, RF-5 |
| Sin datos | Devolver estado no exportable para meses sin sesiones válidas o sin meses disponibles. | RF-1, RF-8 |
| Modelo completo | Verificar que el modelo contenga todas las secciones y no mutile las sesiones originales. | RF-2, RF-3, RF-4, RF-5, RF-6, RF-7 |
| HTML | Comprobar que el contenido del usuario se escapa y que el documento incluye todas las secciones definidas. | RF-2, RF-9, RF-10 |

### Verificación de interfaz

Con Chrome DevTools se verificará:

- Selector con meses disponibles y botón deshabilitado cuando corresponda: RF-1.
- Exportación de un mes y apertura del HTML descargado: RF-2 y RF-9.
- Resumen, métricas, temas, distribución y sesiones visibles: RF-3 a RF-6.
- Exclusión de registros futuros o inválidos y conservación de `localStorage`: RF-7.
- Aviso y ausencia de descarga para meses sin datos válidos: RF-8.
- Texto literal para temas con caracteres especiales: RF-10.
- Mensaje de error cuando la exportación no se complete: RF-11.
- Consola sin errores y vista móvil sin desplazamiento horizontal, conforme a la constitución.

### Verificación de regresión

- Ejecutar `node --test` para conservar el comportamiento del mapa de calor y de la lógica existente.
- Abrir `index.html` directamente con `file://` y comprobar que la funcionalidad sigue funcionando sin servidor.
- Confirmar que ninguna sesión existente se modifica o desaparece.
