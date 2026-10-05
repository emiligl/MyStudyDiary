# Diario de Estudio

Web estática para registrar sesiones de estudio y seguir el progreso diario.

## Funcionalidades

### Registro y estadísticas principales
- Registrar una sesión con fecha, tema y minutos.
- Consultar la racha actual (días consecutivos estudiados) y la mejor racha histórica.
- Ver las tres sesiones más largas.
- Consultar los minutos estudiados de la semana actual (lunes a domingo) dentro de la tarjeta del objetivo.
- Ver cuántos días se ha estudiado durante el mes actual.
- Consultar el mes con más minutos y el mes con más temas estudiados.

### Objetivo semanal
- Fijar un objetivo único de minutos por semana (número entero mayor que cero) que se repite cada semana, incluidas las futuras.
- Ver el progreso en una tarjeta con barra y el texto «llevas X de Y minutos».
- Reconocer el objetivo alcanzado o superado con «objetivo cumplido» y los minutos de exceso.
- Editar o borrar el objetivo cuando se necesite, sin alterar las sesiones registradas.

### Visualización y análisis
- **Mapa de calor**: 12 semanas de lunes a domingo con 4 niveles de intensidad según los minutos de cada día.
- **Informe mensual descargable** en HTML: resumen, métricas con promedios, distribución diaria, temas agrupados y detalle de sesiones. El archivo se abre sin conexión y es optimizado para impresión.

### Persistencia
- Conservar los datos en `localStorage` del navegador (sin servidor).

## Cómo usarla

Abre `index.html` con doble clic en un navegador. No requiere instalación, servidor ni dependencias.

## Tecnología

Stack simple y sin dependencias: **HTML, CSS y JavaScript nativos**.

### Estructura
- `index.html`: estructura y composición de componentes.
- `styles.css`: diseño responsive (mobile-first), mapa de calor, objetivo semanal, informe e impresión.
- `app.js`: lógica pura (funciones sin efectos secundarios), estadísticas, mapa de calor, informe, objetivo semanal y persistencia.

### Desarrollo y pruebas
Ejecuta `node --test` para lanzar la suite de 144 tests automáticos (requiere Node, pero la aplicación no lo necesita).

```bash
node --test
# Resultado: 144 tests, 144 pass, 0 fail
```

Los tests cubren:
- Validación y filtrado de sesiones (fechas locales, exclusión de futuros/inválidos).
- Cálculo de estadísticas (rachas, máximos, promedios, agrupaciones).
- Normalización del objetivo, sesiones contabilizadas, minutos de la semana, llenado de la barra, estado del progreso y persistencia del objetivo.
- Generación de mapa de calor (niveles relativos, estructura HTML).
- Modelo y HTML del informe (resumen, métricas, distribución, temas, detalle).
- Descarga y manejo de errores.
- Casos extremos: años bisiestos, cambios de hora, medianoche, datos corruptos.

### Datos
Las sesiones se guardan en `localStorage` con la clave `diario-de-estudio-sesiones`. Cada sesión es un objeto:
```json
{ "fecha": "AAAA-MM-DD", "tema": "string", "minutos": number, "creadaEn": timestamp }
```

El objetivo semanal se guarda aparte en `localStorage` con la clave `diario-de-estudio-objetivo-semanal` (un entero de minutos como texto).

Notas:
- Las fechas siempre son locales; no se usan `toISOString()` ni UTC.
- Los datos nunca se modifican al generar estadísticas o exportar (inmutabilidad), ni al fijar, editar o borrar el objetivo.
- Las funciones derivadas (racha, top 3, promedios, mejores meses, minutos de la semana y progreso del objetivo) se recalculan cada vez, nunca se persisten.

## Principios del proyecto

El proyecto sigue 6 principios innegociables documentados en [`docs/constitution.md`](docs/constitution.md):

1. **Stack simple**: solo HTML, CSS y JavaScript nativos; se abre con doble clic (`file://`).
2. **Specs y código alineados**: cada funcionalidad está descrita en una spec ejecutable con plan y checklist de tareas.
3. **Lógica separada de interfaz**: funciones puras testeables en Node + UI reactiva en el navegador.
4. **Tests verificables**: pruebas automáticas con el runner de Node, sin frameworks externos.
5. **Datos protegidos**: localStorage es la única fuente de verdad; todos los cálculos derivan de ahí.
6. **Idioma coherente**: interfaz y código completamente en español.

Los detalles de cada funcionalidad están en `specs/*/`: spec aprobada, plan de implementación, tareas completadas.
