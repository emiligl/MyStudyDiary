const test = require("node:test");
const assert = require("node:assert/strict");

const {
  construirModeloInforme,
  generarHTMLInforme,
  calcularResumenInforme,
  ordenarSesionesInforme
} = require("../app.js");

const hoy = new Date(2026, 9, 5, 12);

function seccion(html, id, siguiente) {
  return html.slice(html.indexOf(`id="${id}"`), html.indexOf(`id="${siguiente}"`));
}

test("RF-4: el informe muestra las fechas de las sesiones y los días con más minutos", () => {
  const sesiones = [
    { fecha: "2026-10-01", tema: "A", minutos: 20, creadaEn: 1 },
    { fecha: "2026-10-03", tema: "B", minutos: 20, creadaEn: 2 },
    { fecha: "2026-10-04", tema: "C", minutos: 5, creadaEn: 3 }
  ];
  const html = generarHTMLInforme(construirModeloInforme(sesiones, "2026-10", hoy));
  const metricas = seccion(html, "metricas", "distribucion");

  assert.match(metricas, /Sesiones con más minutos/);
  assert.match(metricas, /2026-10-01, 2026-10-03/);
  assert.match(metricas, /Días con más minutos/);
});

test("RF-4: con una única sesión máxima usa el singular y su fecha", () => {
  const sesiones = [{ fecha: "2026-10-02", tema: "A", minutos: 25, creadaEn: 1 }];
  const html = generarHTMLInforme(construirModeloInforme(sesiones, "2026-10", hoy));
  const metricas = seccion(html, "metricas", "distribucion");

  assert.match(metricas, /Sesión con más minutos/);
  assert.match(metricas, /Día con más minutos/);
  assert.match(metricas, /2026-10-02/);
});

test("los promedios se muestran siempre con dos decimales", () => {
  const sesiones = [
    { fecha: "2026-10-01", tema: "A", minutos: 20, creadaEn: 1 },
    { fecha: "2026-10-01", tema: "B", minutos: 20, creadaEn: 2 },
    { fecha: "2026-10-03", tema: "C", minutos: 10, creadaEn: 3 }
  ];
  const html = generarHTMLInforme(construirModeloInforme(sesiones, "2026-10", hoy));

  assert.match(html, /16,67 minutos/);
  assert.match(html, /25,00 minutos/);
});

test("usa singular cuando solo hay un elemento", () => {
  const sesiones = [{ fecha: "2026-10-01", tema: "A", minutos: 1, creadaEn: 1 }];
  const html = generarHTMLInforme(construirModeloInforme(sesiones, "2026-10", hoy));

  assert.match(html, /1 sesión</);
  assert.match(html, /1 día estudiado</);
  assert.match(html, /1 tema distinto</);
  assert.match(html, /1 minuto</);
  assert.doesNotMatch(html, /1 sesiones|1 días|1 temas|1 minutos/);
});

test("usa plural cuando hay varios elementos", () => {
  const sesiones = [
    { fecha: "2026-10-01", tema: "A", minutos: 20, creadaEn: 1 },
    { fecha: "2026-10-02", tema: "B", minutos: 10, creadaEn: 2 }
  ];
  const html = generarHTMLInforme(construirModeloInforme(sesiones, "2026-10", hoy));

  assert.match(html, /2 sesiones</);
  assert.match(html, /2 días estudiados</);
  assert.match(html, /2 temas distintos</);
});

test("RF-10: un tema con marcado se escapa en todo el documento generado", () => {
  const tema = '<img src=x onerror="alert(1)"> & <script>alert(2)</script>';
  const sesiones = [{ fecha: "2026-10-01", tema, minutos: 20, creadaEn: 1 }];
  const html = generarHTMLInforme(construirModeloInforme(sesiones, "2026-10", hoy));

  assert.doesNotMatch(html, /<img src=x/);
  assert.doesNotMatch(html, /<script>alert/);
  assert.match(html, /&lt;img src=x onerror=&quot;alert\(1\)&quot;&gt; &amp; &lt;script&gt;/);
});

test("RF-9: las secciones evitan el desbordamiento horizontal con textos largos", () => {
  const sesiones = [{ fecha: "2026-10-01", tema: "X".repeat(200), minutos: 20, creadaEn: 1 }];
  const html = generarHTMLInforme(construirModeloInforme(sesiones, "2026-10", hoy));

  assert.equal((html.match(/<section class="seccion"/g) || []).length, 5);
  assert.match(html, /overflow-wrap:\s*anywhere/);
});

test("el resumen de listas vacías no produce NaN ni máximos falsos", () => {
  const resumen = calcularResumenInforme([], new Map([["2026-10-01", 0]]), new Map());

  assert.equal(resumen.promedioMinutosPorSesion, 0);
  assert.equal(resumen.promedioMinutosPorDiaEstudiado, 0);
  assert.deepEqual(resumen.sesionesMaximas, []);
  assert.deepEqual(resumen.diasMaximos, []);
});

test("ordena de forma determinista aunque falte creadaEn", () => {
  const sinRegistro = { fecha: "2026-10-01", tema: "Antigua", minutos: 10 };
  const conRegistro = { fecha: "2026-10-01", tema: "Reciente", minutos: 10, creadaEn: 5 };

  assert.deepEqual(
    ordenarSesionesInforme([sinRegistro, conRegistro]).map((s) => s.tema),
    ["Reciente", "Antigua"]
  );
  assert.deepEqual(
    ordenarSesionesInforme([conRegistro, sinRegistro]).map((s) => s.tema),
    ["Reciente", "Antigua"]
  );
});

test("el modelo es inmutable, pero no congela las sesiones originales", () => {
  const sesiones = [{ fecha: "2026-10-01", tema: "A", minutos: 20, creadaEn: 1 }];
  const modelo = construirModeloInforme(sesiones, "2026-10", hoy);

  assert.equal(Object.isFrozen(modelo), true);
  assert.equal(Object.isFrozen(modelo.sesiones), true);
  assert.equal(Object.isFrozen(modelo.resumen), true);
  assert.equal(Object.isFrozen(sesiones[0]), false);
});
