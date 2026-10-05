const test = require("node:test");
const assert = require("node:assert/strict");

const {
  crearRangoMapa,
  esFechaValida,
  agruparMinutosPorDiaMapa,
  calcularNivel,
  construirMapaCalor,
  obtenerDetalleCelda
} = require("../app.js");

const hoy = new Date(2026, 9, 3, 12);

test("crea 12 semanas completas de lunes a domingo", () => {
  const fechas = crearRangoMapa(hoy);

  assert.equal(fechas.length, 84);
  assert.equal(fechas[0], "2026-07-13");
  assert.equal(fechas.at(-1), "2026-10-04");
});

test("valida fechas locales reales sin interpretar textos como UTC", () => {
  assert.equal(esFechaValida("2026-10-03"), true);
  assert.equal(esFechaValida("2026-02-30"), false);
  assert.equal(esFechaValida("03/10/2026"), false);
});

test("suma sesiones del mismo día y descarta datos inválidos o futuros", () => {
  const sesiones = [
    { fecha: "2026-10-01", minutos: 20 },
    { fecha: "2026-10-01", minutos: 15 },
    { fecha: "2026-10-04", minutos: 500 },
    { fecha: "2026-10-02", minutos: 0 },
    { fecha: "2026-02-30", minutos: 40 }
  ];
  const rango = crearRangoMapa(hoy);
  const totales = agruparMinutosPorDiaMapa(sesiones, hoy, rango);

  assert.deepEqual(Object.fromEntries(totales), { "2026-10-01": 35 });
});

test("calcula niveles relativos entre cero y cuatro", () => {
  assert.equal(calcularNivel(0, 100), 0);
  assert.equal(calcularNivel(1, 100), 1);
  assert.equal(calcularNivel(26, 100), 2);
  assert.equal(calcularNivel(51, 100), 3);
  assert.equal(calcularNivel(100, 100), 4);
  assert.equal(calcularNivel(100, 0), 0);
});

test("construye celdas con totales, niveles y fechas futuras vacías", () => {
  const sesiones = [
    { fecha: "2026-10-01", minutos: 10 },
    { fecha: "2026-10-03", minutos: 30 },
    { fecha: "2026-10-04", minutos: 90 }
  ];
  const mapa = construirMapaCalor(sesiones, hoy);
  const celdas = new Map(mapa.celdas.map((celda) => [celda.fecha, celda]));

  assert.equal(mapa.celdas.length, 84);
  assert.equal(mapa.maximo, 30);
  assert.deepEqual(celdas.get("2026-10-01"), {
    fecha: "2026-10-01",
    minutos: 10,
    nivel: 2,
    futura: false
  });
  assert.deepEqual(celdas.get("2026-10-03"), {
    fecha: "2026-10-03",
    minutos: 30,
    nivel: 4,
    futura: false
  });
  assert.deepEqual(celdas.get("2026-10-04"), {
    fecha: "2026-10-04",
    minutos: 0,
    nivel: 0,
    futura: true
  });
});

test("genera detalles comprensibles para días estudiados, vacíos y futuros", () => {
  assert.equal(
    obtenerDetalleCelda({ fecha: "2026-10-01", minutos: 30, futura: false }),
    "01/10/2026: 30 minutos"
  );
  assert.equal(
    obtenerDetalleCelda({ fecha: "2026-10-02", minutos: 0, futura: false }),
    "02/10/2026: Sin estudiar"
  );
  assert.equal(
    obtenerDetalleCelda({ fecha: "2026-10-04", minutos: 0, futura: true }),
    "04/10/2026: Día futuro"
  );
});
