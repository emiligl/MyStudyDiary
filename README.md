# Diario de Estudio

Web estática para registrar sesiones de estudio y seguir el progreso diario.

## Funcionalidades

- Registrar una sesión con fecha, tema y minutos.
- Consultar la racha actual y la mejor racha histórica.
- Ver las tres sesiones más largas.
- Consultar los minutos estudiados esta semana.
- Ver cuántos días se ha estudiado durante el mes actual.
- Consultar el mes con más minutos y el mes con más temas estudiados.
- Conservar los datos en `localStorage` del navegador.

## Cómo usarla

Abre `index.html` con doble clic en un navegador. No requiere instalación, servidor ni dependencias.

## Tecnología

La aplicación está hecha con HTML, CSS y JavaScript nativos:

- `index.html`: estructura de la página.
- `styles.css`: diseño responsive.
- `app.js`: lógica, estadísticas y persistencia.

Las sesiones se guardan localmente con la clave `diario-de-estudio-sesiones`. Cada registro contiene `fecha`, `tema`, `minutos` y `creadaEn`.
