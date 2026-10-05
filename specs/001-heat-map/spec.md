# Mapa de calor de estudio

## Contexto y objetivo

El Diario de Estudio ya registra sesiones y sus minutos. Esta funcionalidad debe ofrecer una visión rápida de la constancia reciente, como un calendario de actividad, donde los días con más estudio destaquen visualmente.

## Usuarios

Personas que estudian y quieren revisar de un vistazo qué días han estudiado durante las últimas semanas.

## Historias de usuario

- Como estudiante, quiero ver mis días estudiados de las últimas semanas para reconocer mi constancia.
- Como estudiante, quiero distinguir visualmente cuánto estudié cada día para identificar mis días más productivos.
- Como estudiante, quiero consultar la fecha y los minutos de un día concreto para entender cada celda del mapa.

## Requisitos funcionales

### RF-1. Periodo visible

El mapa deberá representar las últimas 12 semanas naturales, de lunes a domingo, incluyendo la semana actual incompleta y las 11 semanas anteriores.

**Criterios de aceptación (EARS):**

- Cuando se muestre el mapa, deberá contener exactamente 12 semanas y 84 días.
- Cuando la semana actual todavía no haya terminado, los días posteriores a hoy deberán aparecer vacíos.

### RF-2. Actividad diaria

El mapa deberá representar cada día mediante una celda. Los minutos de un día serán la suma de todas sus sesiones.

**Criterios de aceptación (EARS):**

- Cuando un día tenga una o más sesiones, su celda deberá representar el total de minutos de ese día.
- Cuando un día no tenga sesiones, su celda deberá aparecer como “Sin estudiar”.
- Cuando existan varias sesiones el mismo día, deberán acumularse y no crear celdas adicionales.

### RF-3. Intensidad visual

La intensidad del color deberá aumentar según los minutos estudiados. El día con más minutos del periodo visible será la referencia de máxima intensidad.

**Criterios de aceptación (EARS):**

- Cuando un día tenga más minutos que otro, su color deberá ser igual o más intenso.
- Cuando un día sea el máximo del periodo, deberá mostrar la intensidad máxima.
- Cuando no haya sesiones en el periodo, ninguna celda deberá mostrar actividad.

### RF-4. Detalle de una celda

El usuario deberá poder consultar la fecha y los minutos asociados a cada día.

**Criterios de aceptación (EARS):**

- Cuando el usuario interactúe con una celda, deberá poder identificar su fecha y sus minutos.
- Cuando la celda corresponda a un día sin sesiones, el detalle deberá indicar que no hubo estudio.

### RF-5. Leyenda

El mapa deberá incluir una leyenda visible que explique las celdas sin estudio y los niveles de intensidad.

**Criterios de aceptación (EARS):**

- Cuando se muestre el mapa, la leyenda deberá estar visible junto a él.
- Cuando el usuario consulte la leyenda, deberá entender qué significa cada nivel de color.

### RF-6. Fechas futuras

Las fechas futuras no deberán representar actividad estudiada.

**Criterios de aceptación (EARS):**

- Cuando una fecha futura esté dentro de la semana actual, deberá mostrarse vacía.
- Cuando existan datos futuros guardados, no deberán influir en ninguna intensidad ni total diario.

## Requisitos no funcionales

- La información deberá estar en español claro y ser comprensible para principiantes.
- El mapa y su leyenda deberán poder consultarse en una pantalla móvil sin desplazamiento horizontal.
- La funcionalidad no deberá borrar ni modificar las sesiones existentes.
- La ausencia de sesiones o datos válidos deberá producir un estado vacío comprensible, no un error visible.
- El significado de los colores no deberá depender únicamente del color; la fecha y los minutos deberán estar disponibles al interactuar.

## Casos límite

- No hay sesiones guardadas.
- Solo existe una sesión en las 12 semanas.
- Hay varias sesiones el mismo día.
- Todas las sesiones tienen cero minutos o datos inválidos.
- El máximo de minutos aparece en varios días.
- La fecha actual es lunes o domingo.
- El periodo cruza un cambio de mes o de año.
- La semana actual contiene días futuros.
- La zona horaria local cambia por horario de verano o invierno.

## Fuera de alcance

- Mostrar periodos distintos de 12 semanas.
- Filtros por tema, curso o rango personalizado.
- Editar o eliminar sesiones desde el mapa.
- Guardar estadísticas calculadas como datos independientes.
- Comparar periodos o compartir el mapa.

## Criterios de finalización

- Se visualizan las 12 semanas y la semana actual se comporta correctamente.
- Los totales diarios y las intensidades coinciden con las sesiones guardadas.
- La leyenda y los detalles de las celdas son comprensibles.
- Los casos límite principales funcionan sin errores.
- La vista móvil no tiene desbordamiento horizontal.
- La consola no muestra errores durante la verificación.

## Dudas abiertas

Ninguna. Se usan cuatro niveles discretos de intensidad entre “Sin estudiar” y el máximo del periodo.
