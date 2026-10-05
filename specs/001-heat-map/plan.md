# Plan: mapa de calor de estudio

## Alcance y decisiones asumidas

- Se muestran 12 semanas naturales: la semana actual, incompleta si procede, y las 11 anteriores.
- Cada semana va de lunes a domingo y el mapa contiene 84 celdas.
- Se usan cuatro niveles de intensidad más “Sin estudiar”. El nivel se calcula de forma relativa al máximo de minutos del periodo.
- Las celdas permiten consulta con ratón, toque y teclado; muestran fecha y minutos. Las fechas futuras quedan vacías.
- Las sesiones inválidas (fecha no válida o minutos no positivos) se ignoran sin modificar los datos originales.

## Archivos y responsabilidades

- `specs/001-heat-map/spec.md` — actualizar la spec para incorporar estas decisiones y cerrar `[NECESITA ACLARACIÓN]`.
- `index.html` — añadir la sección del mapa, sus semanas/días, leyenda y una zona accesible para el detalle de la celda.
- `styles.css` — crear la cuadrícula de 12 semanas, los cuatro niveles visuales, el estado vacío, el foco de teclado y el comportamiento móvil sin desplazamiento horizontal.
- `app.js` — añadir las funciones puras del mapa y conectar su resultado con la interfaz, sin cambiar la persistencia existente.
- `tests/heat-map.test.js` — crear pruebas unitarias con `node --test` para las funciones puras, sin instalar dependencias.
- `AGENTS.md` — documentar el comando de pruebas nativo y la regla de verificar también con Chrome DevTools.
- `MEMORY.md` — registrar que la spec y el plan del mapa están definidos y qué decisiones se adoptaron.

## Funciones puras de lógica

Todas recibirán la fecha de referencia `hoy` como parámetro; ninguna leerá directamente la hora del sistema ni modificará sus argumentos.

- `obtenerFechaLocal(fecha)` — convierte una fecha local en `AAAA-MM-DD` usando sus componentes locales.
- `obtenerInicioDeSemana(hoy)` — devuelve el lunes de la semana que contiene `hoy`.
- `crearRangoMapa(hoy)` — genera las 84 fechas desde el lunes de hace 11 semanas hasta el domingo de la semana actual.
- `esFechaValida(fecha)` — comprueba el formato y que la fecha de calendario exista, sin interpretar textos como UTC.
- `agruparMinutosPorDia(sesiones, hoy, rango)` — ignora fechas futuras, inválidas, fuera del rango y minutos no positivos; suma las sesiones restantes por fecha.
- `calcularNivel(minutos, maximo)` — devuelve 0 para “Sin estudiar” y, si hay máximo, un nivel del 1 al 4 según la proporción del máximo.
- `construirMapaCalor(sesiones, hoy)` — combina las fechas, totales, estados futuros y niveles en una estructura de 84 celdas ordenadas por semana y día.
- `obtenerDetalleCelda(celda)` — produce el texto de fecha y minutos, o “Sin estudiar” cuando no hay actividad.

## Algoritmo del mapa en pseudocódigo

```text
RECIBIR sesiones Y hoy

inicio = OBTENER_EL_LUNES_DE_LA_SEMANA(hoy)
inicio = RESTAR 11 semanas usando operaciones locales de calendario
fechas = GENERAR cada fecha desde inicio hasta el domingo de la semana actual
totales = mapa vacío por fecha

PARA cada sesión:
  SI fecha inválida O minutos no positivos O fecha futura O fecha fuera de fechas:
    IGNORAR sesión
  SI NO:
    totales[fecha] = totales[fecha] + minutos

maximo = mayor valor de totales, o cero si no hay valores

PARA cada fecha de fechas, en orden lunes-domingo y semana antigua-actual:
  SI fecha es futura:
    crear celda vacía y no activa
  SI total de fecha no existe:
    crear celda “Sin estudiar” con nivel 0
  SI NO:
    nivel = REDONDEAR HACIA ARRIBA(total / maximo * 4)
    crear celda con total y nivel entre 1 y 4

DEVOLVER las 84 celdas y el máximo usado como referencia
```

## Pintado de la interfaz y cobertura de RF

- La sección mostrará una cuadrícula con 12 columnas semanales y 7 filas diarias; cubrirá RF-1 y RF-2.
- Cada celda tendrá un nivel visual, un estado vacío y un nombre accesible con fecha y minutos; cubrirá RF-3 y RF-4.
- La leyenda explicará “Sin estudiar” y los niveles 1 a 4; cubrirá RF-5.
- Las fechas futuras se pintarán vacías y no entrarán en el máximo ni en los totales; cubrirá RF-6.
- En móvil las celdas reducirán su tamaño y conservarán la lectura sin desplazamiento horizontal; cubrirá los requisitos no funcionales de responsive y accesibilidad.
- El mapa se recalculará al cargar y después de guardar una sesión; no añadirá datos derivados a `localStorage`.

## Decisiones técnicas y alternativas descartadas

- **Cálculo dinámico:** se recalculará desde las sesiones para evitar estadísticas obsoletas; se descarta persistir el mapa o sus totales.
- **Fechas locales con `hoy`:** permite probar cualquier día y evita UTC; se descarta depender de la fecha global del sistema dentro de la lógica.
- **Cuadrícula de celdas accesibles:** es suficientemente simple, legible y compatible con teclado; se descarta un canvas porque dificulta el detalle y la accesibilidad.
- **Cuatro niveles relativos:** se adapta a periodos con ritmos distintos; se descartan tramos fijos porque podrían dejar todos los días con la misma intensidad.
- **`node --test` nativo:** verifica la lógica sin instalar paquetes; se descartan Jest, Vitest y otros runners por la constitución.

## Estrategia de tests con `node --test`

- Ejecutar `node --test tests/heat-map.test.js` sin instalar dependencias.
- Probar que un `hoy` fijo produce exactamente 84 fechas, empieza en lunes y termina en domingo.
- Probar lunes, domingo, cambios de mes/año y semanas que incluyen cambios de horario.
- Probar suma de varias sesiones del mismo día y exclusión de fechas futuras, inválidas, fuera de rango y con minutos no positivos.
- Probar niveles sin sesiones, con un único día, con máximos empatados y con días de intensidades crecientes.
- Probar que la salida de una celda contiene fecha/minutos o “Sin estudiar”.
- Verificar RF-4, RF-5, responsive, foco de teclado y ausencia de errores con Chrome DevTools, porque son comportamientos de interfaz.

## Criterio de finalización del plan

La implementación podrá comenzar cuando `spec.md` incorpore las decisiones de este plan y todos los RF tengan una prueba unitaria o una verificación manual identificada.
