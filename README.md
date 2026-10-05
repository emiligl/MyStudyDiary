# Diario de Estudio

Web estática para registrar sesiones de estudio y seguir el progreso diario.

## Funcionalidades

- Registrar una sesión con fecha, tema y minutos.
- Consultar la racha actual y la mejor racha histórica.
- Ver las tres sesiones más largas.
- Consultar los minutos estudiados esta semana.
- Ver cuántos días se ha estudiado durante el mes actual.
- Consultar el mes con más minutos y el mes con más temas estudiados.
- Consultar un mapa de calor de los días estudiados durante las últimas 12 semanas.
- Exportar un informe mensual en HTML de cualquier mes con sesiones: resumen, métricas, distribución diaria, temas y detalle de sesiones. El archivo se abre sin conexión y se puede imprimir.
- Conservar los datos en `localStorage` del navegador.

## Cómo usarla

Abre `index.html` con doble clic en un navegador. No requiere instalación, servidor ni dependencias.

## Tecnología

La aplicación está hecha con HTML, CSS y JavaScript nativos:

- `index.html`: estructura de la página.
- `styles.css`: diseño responsive.
- `app.js`: lógica, estadísticas, informe mensual y persistencia.
- `tests/`: pruebas automáticas de la lógica con el runner integrado de Node.

Para ejecutar las pruebas (requiere Node, pero la aplicación no lo necesita): `node --test`.

Las sesiones se guardan localmente con la clave `diario-de-estudio-sesiones`. Cada registro contiene `fecha`, `tema`, `minutos` y `creadaEn`.
