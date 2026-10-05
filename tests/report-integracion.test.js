const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const {
  obtenerEstadoExportacion,
  ejecutarExportacion,
  descargarInforme,
  construirModeloInforme,
  crearDiasDelMes
} = require("../app.js");

const raiz = path.join(__dirname, "..");
const hoy = new Date(2026, 9, 5, 12);

const sesionesMezcladas = () => [
  { fecha: "2026-10-01", tema: " Álgebra ", minutos: 40, creadaEn: 1 },
  { fecha: "2026-10-01", tema: "álgebra", minutos: 20, creadaEn: 2 },
  { fecha: "2026-10-03", tema: "Historia", minutos: 30, creadaEn: 3 },
  { fecha: "2026-10-04", tema: "   ", minutos: 10, creadaEn: 4 },
  { fecha: "2026-10-09", tema: "Futura", minutos: 99, creadaEn: 5 },
  { fecha: "2026-10-02", tema: "Cero", minutos: 0, creadaEn: 6 },
  { fecha: "2026-02-30", tema: "Imposible", minutos: 15, creadaEn: 7 },
  { fecha: "2026-09-12", tema: "Septiembre", minutos: 50, creadaEn: 8 }
];

function exportar(sesiones, mes, fecha = hoy) {
  const descargas = [];
  const entorno = {
    documento: {
      createElement: () => ({ click() {}, remove() {} }),
      body: { appendChild() {} }
    },
    URL: {
      createObjectURL: (blob) => {
        descargas.push(blob);
        return "blob:x";
      },
      revokeObjectURL() {}
    },
    setTimeout: (accion) => accion()
  };
  const resultado = ejecutarExportacion(
    sesiones,
    mes,
    fecha,
    (html, nombre) => descargarInforme(html, nombre, entorno)
  );
  return { resultado, descargas };
}

test("RF-1: ofrece solo los meses con sesiones válidas, del más reciente al más antiguo", () => {
  const estado = obtenerEstadoExportacion(sesionesMezcladas(), hoy);

  assert.deepEqual(estado.meses.map((mes) => mes.valor), ["2026-10", "2026-09"]);
  assert.equal(estado.puedeExportar, true);
});

test("el selector escribe el mes en español correcto: Octubre de 2026", () => {
  const estado = obtenerEstadoExportacion(sesionesMezcladas(), hoy);

  assert.deepEqual(
    estado.meses.map((mes) => mes.etiqueta),
    ["Octubre de 2026", "Septiembre de 2026"]
  );
});

test("RF-2 a RF-7: el informe descargado coincide con los datos válidos del mes", async () => {
  const sesiones = sesionesMezcladas();
  const { resultado, descargas } = exportar(sesiones, "2026-10");
  const html = await descargas[0].text();

  assert.equal(resultado.estado, "exito");
  assert.equal(descargas.length, 1);

  assert.match(html, /100 minutos/);
  assert.match(html, /4 sesiones/);
  assert.match(html, /3 días estudiados/);
  assert.match(html, /3 temas distintos/);

  assert.match(html, /25,00 minutos/);
  assert.match(html, /33,33 minutos/);
  assert.match(html, /Sesión con más minutos: 2026-10-01/);
  assert.match(html, /Día con más minutos: 2026-10-01/);

  assert.match(html, /Sin tema/);
  assert.equal((html.match(/Álgebra/g) || []).length >= 1, true);

  assert.doesNotMatch(html, /Futura|Imposible|Cero|Septiembre/);
  assert.doesNotMatch(html, /99 min|15 min|50 min/);
  assert.match(html, /<th scope="row">2026-10-09<\/th>\s*<td>0 min<\/td>/);
});

test("casos límite: una sesión sin tema aparece en el detalle como Sin tema", async () => {
  const { descargas } = exportar(sesionesMezcladas(), "2026-10");
  const html = await descargas[0].text();
  const detalle = html.slice(html.indexOf('id="sesiones"'));

  assert.match(detalle, /<td class="tema">Sin tema<\/td>/);
  assert.doesNotMatch(detalle, /<td class="tema">\s*<\/td>/);
});

test("RF-6: el detalle de sesiones sale por fecha descendente", async () => {
  const { descargas } = exportar(sesionesMezcladas(), "2026-10");
  const html = await descargas[0].text();
  const detalle = html.slice(html.indexOf('id="sesiones"'));
  const fechas = detalle.match(/<th scope="row">(\d{4}-\d{2}-\d{2})<\/th>/g).map((f) => f.slice(-15, -5));

  assert.deepEqual(fechas, ["2026-10-04", "2026-10-03", "2026-10-01", "2026-10-01"]);
});

test("coherencia: los totales por día, por tema y de sesiones suman lo mismo", () => {
  const modelo = construirModeloInforme(sesionesMezcladas(), "2026-10", hoy);
  const sumaDias = [...modelo.minutosPorDia.values()].reduce((a, b) => a + b, 0);
  const sumaTemas = [...modelo.minutosPorTema.values()].reduce((a, t) => a + t.minutos, 0);
  const sumaSesiones = modelo.sesiones.reduce((a, s) => a + s.minutos, 0);

  assert.equal(sumaDias, modelo.resumen.totalMinutos);
  assert.equal(sumaTemas, modelo.resumen.totalMinutos);
  assert.equal(sumaSesiones, modelo.resumen.totalMinutos);
});

test("RF-7: exportar nunca modifica ni congela las sesiones guardadas", () => {
  const sesiones = sesionesMezcladas();
  const copia = structuredClone(sesiones);

  exportar(sesiones, "2026-10");
  exportar(sesiones, "2026-09");
  obtenerEstadoExportacion(sesiones, hoy);

  assert.deepEqual(sesiones, copia);
  assert.equal(sesiones.some((sesion) => Object.isFrozen(sesion)), false);
});

test("RF-8: un mes sin sesiones válidas no genera descarga y avisa", () => {
  const { resultado, descargas } = exportar(sesionesMezcladas(), "2026-08");

  assert.equal(resultado.estado, "sin-datos");
  assert.match(resultado.mensaje, /no hay datos válidos/i);
  assert.equal(descargas.length, 0);
});

test("RF-8: sin ninguna sesión válida no hay mes seleccionable", () => {
  const estado = obtenerEstadoExportacion([], hoy);

  assert.equal(estado.puedeExportar, false);
  assert.deepEqual(estado.meses, []);
});

test("fechas locales: una sesión de hoy cuenta aunque sean las 00:30", () => {
  const sesiones = [{ fecha: "2026-10-05", tema: "A", minutos: 10, creadaEn: 1 }];
  const { resultado } = exportar(sesiones, "2026-10", new Date(2026, 9, 5, 0, 30));

  assert.equal(resultado.estado, "exito");
});

test("fechas locales: a las 23:59 del día anterior la sesión de mañana es futura", () => {
  const sesiones = [{ fecha: "2026-10-05", tema: "A", minutos: 10, creadaEn: 1 }];
  const { resultado } = exportar(sesiones, "2026-10", new Date(2026, 9, 4, 23, 59));

  assert.equal(resultado.estado, "sin-datos");
});

test("fechas locales: los meses con cambio de hora y los bisiestos tienen sus días exactos", () => {
  assert.equal(crearDiasDelMes("2026-03").size, 31);
  assert.equal(crearDiasDelMes("2026-10").size, 31);
  assert.equal(crearDiasDelMes("2026-02").size, 28);
  assert.equal(crearDiasDelMes("2028-02").size, 29);
  assert.equal(crearDiasDelMes("2026-12").size, 31);

  const dias = [...crearDiasDelMes("2026-10").keys()];
  assert.equal(dias[0], "2026-10-01");
  assert.equal(dias.at(-1), "2026-10-31");
  assert.equal(new Set(dias).size, 31);
});

test("cierre: la spec 002 figura como implementada", () => {
  const spec = fs.readFileSync(path.join(raiz, "specs/002-report/spec.md"), "utf8");

  assert.match(spec, /^Estado: implementada$/m);
  assert.doesNotMatch(spec, /NECESITA ACLARACIÓN\] [^N]/);
});

test("cierre: todas las tareas de la spec 002 están marcadas", () => {
  const tareas = fs.readFileSync(path.join(raiz, "specs/002-report/tasks.md"), "utf8");

  assert.equal((tareas.match(/^- \[x\] \*\*T\d/gm) || []).length, 8);
  assert.doesNotMatch(tareas, /^- \[ \]/m);
});

test("cierre: README y AGENTS describen el informe y los tests sin contradecirse", () => {
  const readme = fs.readFileSync(path.join(raiz, "README.md"), "utf8");
  const agents = fs.readFileSync(path.join(raiz, "AGENTS.md"), "utf8");

  assert.match(readme, /informe mensual/i);
  assert.match(readme, /node --test/);
  assert.doesNotMatch(agents, /ni tests\/lint/);
});
