const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const {
  normalizarObjetivo,
  esFechaEnSemanaActual,
  esSesionContabilizada,
  calcularMinutosSemanaActual,
  calcularPorcentajeObjetivo,
  construirEstadoObjetivo,
  leerObjetivo,
  guardarObjetivo,
  borrarObjetivo,
  construirMapaCalor,
  agruparMinutosPorTema
} = require("../app.js");

const raiz = path.join(__dirname, "..");
const hoy = new Date(2026, 9, 7, 12); // miércoles 2026-10-07: semana del 05 al 11

const CLAVE_OBJETIVO = "diario-de-estudio-objetivo-semanal";
const CLAVE_SESIONES = "diario-de-estudio-sesiones";

function crearAlmacenamientoFalso(inicial = {}) {
  const datos = new Map(Object.entries(inicial));
  const registro = { leidos: [], escritos: [], borrados: [] };

  return {
    datos,
    registro,
    getItem(clave) {
      registro.leidos.push(clave);
      return datos.has(clave) ? datos.get(clave) : null;
    },
    setItem(clave, valor) {
      registro.escritos.push(clave);
      datos.set(clave, String(valor));
    },
    removeItem(clave) {
      registro.borrados.push(clave);
      datos.delete(clave);
    }
  };
}

const sesionesSemana = () => [
  { fecha: "2026-10-05", tema: "Álgebra", minutos: 40, creadaEn: 1 },
  { fecha: "2026-10-05", tema: "álgebra", minutos: 20, creadaEn: 2 },
  { fecha: "2026-10-07", tema: "Historia", minutos: 30, creadaEn: 3 }
];

// Entradas dañadas que no deben contar (fecha o minutos inválidos).
const sesionesDanadas = () => [
  null,
  { fecha: null, tema: "Sin fecha", minutos: 50, creadaEn: 4 },
  { fecha: 20261005, tema: "Numérica", minutos: 50, creadaEn: 7 },
  { fecha: "2026-10-05", tema: "Texto", minutos: "50", creadaEn: 8 },
  { fecha: "2026-10-05", tema: "No finito", minutos: NaN, creadaEn: 9 }
];

// El tema puede estar vacío o ausente: no debe romper nada.
const sesionesSinTemaValido = () => [
  { fecha: "2026-10-05", tema: null, minutos: 50, creadaEn: 5 },
  { fecha: "2026-10-05", minutos: 50, creadaEn: 6 }
];

test("RF-1: fija el objetivo en su clave propia y se repite en las semanas siguientes", () => {
  const almacen = crearAlmacenamientoFalso();

  guardarObjetivo(almacen, "300");

  assert.equal(almacen.datos.get(CLAVE_OBJETIVO), "300");
  assert.equal(leerObjetivo(almacen), 300);

  const semanaFutura = new Date(2026, 10, 18, 12);
  const estado = construirEstadoObjetivo([], 300, semanaFutura);
  assert.equal(estado.hayObjetivo, true);
  assert.equal(estado.objetivo, 300);
});

test("RF-2, RF-3 y RF-4: la interfaz integra el objetivo y elimina la tarjeta de minutos", () => {
  const html = fs.readFileSync(path.join(raiz, "index.html"), "utf8");

  assert.match(html, /id="objetivo-invitacion"/);
  assert.match(html, /id="objetivo-minutos"/);
  assert.match(html, /id="guardar-objetivo"/);
  assert.match(html, /id="borrar-objetivo"/);
  assert.doesNotMatch(html, /id="minutos-semana"/);
  assert.doesNotMatch(html, /racha--semana/);
});

test("RF-4: sin objetivo devuelve la invitación sin progreso ni errores", () => {
  const estado = construirEstadoObjetivo(sesionesSemana(), null, hoy);

  assert.equal(estado.hayObjetivo, false);
  assert.equal(estado.minutos, 0);
  assert.equal(estado.porcentaje, 0);
  assert.equal(estado.cumplido, false);
  assert.equal(estado.textoCumplido, "");
  assert.match(estado.mensaje, /objetivo semanal/i);
});

test("RF-5: el progreso muestra «llevas X de Y minutos»", () => {
  const estado = construirEstadoObjetivo(sesionesSemana(), 200, hoy);

  assert.equal(estado.minutos, 90);
  assert.equal(estado.textoProgreso, "llevas 90 de 200 minutos");
});

test("RF-6: la barra se llena con min(100, X/Y×100) al alza y mínimo del 1 %", () => {
  assert.equal(calcularPorcentajeObjetivo(90, 200), 45);
  assert.equal(calcularPorcentajeObjetivo(1, 1000), 1);
  assert.equal(calcularPorcentajeObjetivo(200, 200), 100);
  assert.equal(calcularPorcentajeObjetivo(300, 200), 100);
  assert.equal(calcularPorcentajeObjetivo(0, 200), 0);
});

test("RF-7: al alcanzar o superar hay «objetivo cumplido» y exceso", () => {
  const superado = construirEstadoObjetivo(sesionesSemana(), 60, hoy);
  assert.equal(superado.cumplido, true);
  assert.equal(superado.exceso, 30);
  assert.match(superado.textoCumplido, /objetivo cumplido/i);
  assert.match(superado.textoCumplido, /30 minutos de exceso/i);

  const justo = construirEstadoObjetivo(sesionesSemana(), 90, hoy);
  assert.equal(justo.cumplido, true);
  assert.equal(justo.exceso, 0);
  assert.equal(justo.textoCumplido, "objetivo cumplido");
  assert.doesNotMatch(justo.textoCumplido, /exceso/);
});

test("RF-8: editar el objetivo recalcula contra el valor nuevo", () => {
  const almacen = crearAlmacenamientoFalso();
  guardarObjetivo(almacen, "300");
  guardarObjetivo(almacen, "500");

  const objetivo = leerObjetivo(almacen);
  const estado = construirEstadoObjetivo(sesionesSemana(), objetivo, hoy);

  assert.equal(objetivo, 500);
  assert.equal(estado.porcentaje, 18);
  assert.equal(estado.textoProgreso, "llevas 90 de 500 minutos");
});

test("RF-9: borrar elimina el objetivo y conserva las sesiones", () => {
  const sesiones = JSON.stringify(sesionesSemana());
  const almacen = crearAlmacenamientoFalso({ [CLAVE_OBJETIVO]: "300", [CLAVE_SESIONES]: sesiones });

  borrarObjetivo(almacen);

  assert.equal(leerObjetivo(almacen), null);
  assert.equal(almacen.datos.get(CLAVE_SESIONES), sesiones);
  assert.deepEqual(almacen.registro.borrados, [CLAVE_OBJETIVO]);
});

test("RF-10: los minutos de la semana suman las sesiones contabilizadas y acumulan el mismo día", () => {
  assert.equal(calcularMinutosSemanaActual(sesionesSemana(), hoy), 90);
  assert.equal(esSesionContabilizada({ fecha: "2026-10-05", minutos: 40 }, hoy), true);
});

test("RF-11: se excluyen fechas y minutos inválidos sin modificar los registros", () => {
  const sesiones = [
    ...sesionesSemana(),
    { fecha: "2026-10-11", tema: "Futura", minutos: 999, creadaEn: 9 },
    { fecha: "2026-02-30", tema: "Imposible", minutos: 999, creadaEn: 10 },
    { fecha: "2026-10-05", tema: "Cero", minutos: 0, creadaEn: 11 },
    { fecha: "2026-10-05", tema: "Negativa", minutos: -5, creadaEn: 12 },
    { fecha: "2026-10-05", tema: "Texto", minutos: "30", creadaEn: 13 },
    { fecha: "2026-10-05", tema: "Infinito", minutos: Infinity, creadaEn: 14 }
  ];
  const copia = structuredClone(sesiones);

  assert.equal(calcularMinutosSemanaActual(sesiones, hoy), 90);
  assert.deepEqual(sesiones, copia);
});

test("RF-12 y RF-13: registrar una sesión recalcula el progreso sin persistir minutos", () => {
  const almacen = crearAlmacenamientoFalso();
  guardarObjetivo(almacen, "300");
  const objetivo = leerObjetivo(almacen);
  const inicial = construirEstadoObjetivo(sesionesSemana(), objetivo, hoy);

  const registrada = [
    ...sesionesSemana(),
    { fecha: "2026-10-07", tema: "Historia", minutos: 50, creadaEn: 15 }
  ];
  const actualizado = construirEstadoObjetivo(registrada, objetivo, hoy);

  assert.equal(inicial.minutos, 90);
  assert.equal(actualizado.minutos, 140);
  assert.equal(actualizado.textoProgreso, "llevas 140 de 300 minutos");
  assert.deepEqual([...almacen.datos.keys()], [CLAVE_OBJETIVO]);
});

test("RF-14: un valor inválido se rechaza y no modifica el objetivo existente", () => {
  const almacen = crearAlmacenamientoFalso();
  guardarObjetivo(almacen, "300");

  ["", "0", "-5", "12.5", "abc", "Infinity"].forEach((valor) => {
    assert.equal(normalizarObjetivo(valor).valido, false, valor);
    assert.equal(guardarObjetivo(almacen, valor).valido, false, valor);
  });

  assert.equal(leerObjetivo(almacen), 300);
});

test("RF-15: solo se conserva el objetivo; las sesiones son un dato aparte", () => {
  const almacen = crearAlmacenamientoFalso();

  guardarObjetivo(almacen, "300");
  borrarObjetivo(almacen);

  assert.equal(almacen.datos.has(CLAVE_OBJETIVO), false);
  assert.equal(almacen.registro.escritos.includes(CLAVE_SESIONES), false);
  assert.equal(almacen.registro.leidos.includes(CLAVE_SESIONES), false);
  assert.equal(almacen.registro.borrados.includes(CLAVE_SESIONES), false);
});

test("coherencia: los minutos de la semana coinciden con las contabilizadas", () => {
  const sesiones = sesionesSemana();
  const sumaValidas = sesiones
    .filter((sesion) => esSesionContabilizada(sesion, hoy))
    .reduce((total, sesion) => total + sesion.minutos, 0);

  assert.equal(calcularMinutosSemanaActual(sesiones, hoy), sumaValidas);
});

test("coherencia: ninguna operación muta las sesiones originales", () => {
  const sesiones = [
    ...sesionesSemana(),
    { fecha: "2026-10-11", tema: "Futura", minutos: 999, creadaEn: 9 }
  ];
  const copia = structuredClone(sesiones);

  esFechaEnSemanaActual("2026-10-07", hoy);
  calcularMinutosSemanaActual(sesiones, hoy);
  construirEstadoObjetivo(sesiones, 200, hoy);
  construirMapaCalor(sesiones, hoy);

  assert.deepEqual(sesiones, copia);
  assert.equal(sesiones.some((sesion) => Object.isFrozen(sesion)), false);
});

test("datos dañados: el objetivo se construye aunque haya entradas corruptas", () => {
  const sesiones = [...sesionesDanadas(), ...sesionesSemana()];

  assert.equal(calcularMinutosSemanaActual(sesiones, hoy), 90);

  const estado = construirEstadoObjetivo(sesiones, 200, hoy);
  assert.equal(estado.hayObjetivo, true);
  assert.equal(estado.minutos, 90);
  assert.equal(estado.textoProgreso, "llevas 90 de 200 minutos");
});

test("datos dañados: esSesionContabilizada rechaza las entradas corruptas", () => {
  sesionesDanadas().forEach((sesion) => {
    assert.equal(esSesionContabilizada(sesion, hoy), false);
  });
});

test("datos corruptos: el tema vacío o ausente no rompe las funciones heredadas", () => {
  const sesiones = [...sesionesDanadas(), ...sesionesSinTemaValido(), ...sesionesSemana()];

  assert.doesNotThrow(() => construirMapaCalor(sesiones, hoy));
  assert.doesNotThrow(() => agruparMinutosPorTema(sesiones));
  assert.equal(construirMapaCalor(sesiones, hoy).celdas.length, 84);
});

test("cierre: la spec 003 figura como implementada", () => {
  const spec = fs.readFileSync(path.join(raiz, "specs/003-objetivo-semanal/spec.md"), "utf8");

  assert.match(spec, /^Estado: implementada$/m);
});

test("cierre: todas las tareas de la spec 003 están marcadas", () => {
  const tareas = fs.readFileSync(path.join(raiz, "specs/003-objetivo-semanal/tasks.md"), "utf8");

  assert.equal((tareas.match(/^- \[x\] \*\*T\d/gm) || []).length, 9);
  assert.doesNotMatch(tareas, /^- \[ \]/m);
});

test("cierre: README y MEMORY describen el objetivo semanal", () => {
  const readme = fs.readFileSync(path.join(raiz, "README.md"), "utf8");
  const memoria = fs.readFileSync(path.join(raiz, "MEMORY.md"), "utf8");

  assert.match(readme, /objetivo semanal/i);
  assert.match(readme, /diario-de-estudio-objetivo-semanal/);
  assert.match(memoria, /spec 003/i);
});
