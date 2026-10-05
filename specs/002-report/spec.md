# Spec 002 — Informe mensual de sesiones
Estado: implementada

## Contexto y objetivo

El Diario de Estudio permite registrar sesiones y consultar estadísticas dentro de la aplicación. Esta funcionalidad debe permitir generar un informe mensual descargable para conservar, revisar o compartir de forma ordenada la actividad de estudio de un mes.

## Usuarios

Personas que quieren consultar con detalle su actividad de estudio de un mes y conservar un resumen completo fuera de la aplicación.

## Historias de usuario

- HU-1. Como estudiante, quiero elegir un mes con sesiones para generar un informe de ese periodo.
- HU-2. Como estudiante, quiero descargar el informe en un formato legible para poder conservarlo o compartirlo.
- HU-3. Como estudiante, quiero consultar en el informe los totales, la distribución diaria y las sesiones concretas para entender mi actividad mensual.
- HU-4. Como estudiante, quiero que los datos inválidos o futuros no distorsionen el informe.

## Definiciones

- **Mes:** periodo natural local comprendido entre el primer y el último día de un mes.
- **Sesión válida:** registro con una fecha en formato `AAAA-MM-DD` que represente un día real del calendario, perteneciente al mes seleccionado, no posterior al día local de generación y con minutos numéricos, finitos y mayores que cero. El tema puede estar vacío.
- **Informe completo:** documento que contiene el resumen del mes, las métricas derivadas, la distribución de todos sus días naturales, los temas y el detalle de las sesiones válidas.
- **Tema agrupado:** tema tras eliminar los espacios exteriores y comparar sin distinguir mayúsculas de minúsculas. Los temas vacíos se agrupan como “Sin tema”.
- **Redondeo:** los promedios se muestran con dos decimales, usando redondeo convencional.

## Requisitos funcionales

### RF-1. Mes disponible

Cuando existan sesiones válidas de uno o más meses, el sistema deberá permitir elegir cualquiera de esos meses, identificado por su año y mes local, para preparar el informe.

### RF-2. Generación del informe

Cuando el usuario seleccione un mes disponible y solicite la exportación, el sistema deberá generar un informe mensual descargable en formato HTML.

### RF-3. Resumen mensual

Cuando se genere un informe, deberá mostrar el mes seleccionado y, como mínimo, el total de minutos, el número de sesiones válidas, los días estudiados y el número de temas distintos.

### RF-4. Métricas detalladas

Cuando se genere un informe, deberá mostrar el promedio de minutos por sesión, el promedio de minutos por día estudiado, la sesión o sesiones con más minutos, sus fechas, el día o días con más minutos y la distribución de minutos de cada día natural del mes, incluidos los días con cero minutos.

### RF-5. Temas estudiados

Cuando se genere un informe, deberá mostrar los temas estudiados durante el mes y sus minutos acumulados, agrupando como un mismo tema los nombres que solo difieran en mayúsculas o espacios exteriores, y mostrando “Sin tema” cuando el tema esté vacío.

### RF-6. Detalle de sesiones

Cuando se genere un informe, deberá incluir todas las sesiones válidas del mes seleccionado, con su fecha, tema y minutos, ordenadas por fecha descendente; si varias comparten fecha, por minutos descendentes y, si persiste el empate, por orden de registro más reciente.

### RF-7. Exclusión de datos no válidos

Cuando el sistema calcule o genere el informe, deberá excluir las sesiones con fechas inválidas, fechas futuras o minutos no positivos, sin modificar los registros originales.

### RF-8. Mes sin sesiones válidas

Cuando el usuario intente exportar un mes sin sesiones válidas, incluso si había sido seleccionado antes y sus datos cambiaron, el sistema deberá impedir la descarga y mostrar un aviso indicando que no hay datos válidos para generar el informe.

### RF-9. Legibilidad del documento

Cuando el usuario abra el informe descargado, deberá poder identificar claramente el periodo, el resumen, las métricas, los temas, la distribución diaria y el detalle de sesiones, sin necesitar conexión ni acceder a la aplicación original.

### RF-10. Contenido literal

Cuando el informe muestre temas u otros valores introducidos por el usuario, deberá presentarlos como texto literal, sin interpretarlos como contenido o marcado del documento.

### RF-11. Error de exportación

Si la generación o descarga no puede completarse, el sistema deberá informar del error y no presentar la operación como una exportación realizada.

## Requisitos no funcionales

- El informe no deberá perder información de las sesiones válidas ni alterar los datos guardados.
- Los cálculos deberán respetar el calendario y la fecha local del usuario.
- El contenido visible del informe deberá estar redactado en español claro.
- El informe deberá ser legible tanto en pantallas grandes como pequeñas y al imprimirlo, sin requerir desplazamiento horizontal para consultar sus secciones.

## Casos límite

- Un mes puede contener varias sesiones el mismo día; los minutos diarios deberán acumularse.
- Un mes puede tener sesiones válidas en un único día.
- Varias sesiones pueden compartir tema con diferencias de mayúsculas o espacios exteriores y deberán agruparse.
- Varias sesiones pueden empatar como las de más minutos; todas deberán aparecer como máximas.
- Varios días pueden empatar como los de más minutos; todos deberán aparecer como máximos.
- Las sesiones con el mismo día deberán ordenarse por minutos y después por registro más reciente.
- Los días naturales sin sesiones deberán aparecer con cero minutos en la distribución diaria.
- Una sesión sin tema deberá aparecer en el detalle y agruparse como “Sin tema”.
- Un mes sin sesiones válidas no deberá producir una descarga.
- Las sesiones futuras no deberán aparecer aunque pertenezcan al mes seleccionado.
- Las fechas imposibles, los formatos de fecha incorrectos, los minutos cero o negativos y los minutos no numéricos o no finitos no deberán aparecer ni afectar a las métricas.
- Si no existe ningún mes con sesiones válidas, no deberá haber un mes seleccionable para exportar.
- Los valores con caracteres especiales deberán conservarse como texto literal en el informe.

## Fuera de alcance

- Exportar formatos distintos de HTML.
- Exportar varios meses en un único informe.
- Modificar, borrar o corregir sesiones desde el informe.
- Sincronizar informes con un servidor o compartirlos automáticamente.

## Criterios de finalización

- El usuario puede seleccionar cualquier mes que tenga sesiones válidas.
- La exportación genera un HTML descargable con el periodo y toda la información definida.
- Los totales, promedios redondeados a dos decimales, temas, distribución diaria y detalle de sesiones coinciden con los datos válidos del mes.
- Los empates de sesiones y días con máximos se muestran completos y de forma determinista.
- Las sesiones futuras, inválidas o con minutos no positivos, no numéricos o no finitos quedan excluidas sin alterar los datos originales.
- Se impide la descarga de meses sin sesiones válidas y se muestra un aviso comprensible.
- El HTML puede abrirse sin conexión, muestra los valores de usuario literalmente y es legible en pantalla pequeña y al imprimirlo.

## Dudas abiertas

Ninguna.
