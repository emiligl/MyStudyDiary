const test = require("node:test");
const assert = require("node:assert/strict");

const {
  esSesionValidaParaInforme,
  obtenerMesesDisponibles,
  filtrarSesionesDelMes,
  crearDiasDelMes,
  agruparMinutosPorDia,
  normalizarTema,
  agruparMinutosPorTema,
  ordenarSesionesInforme,
  calcularResumenInforme,
  construirModeloInforme,
  escaparTextoInforme,
  generarHTMLInforme,
  obtenerEstadoExportacion,
  ejecutarExportacion
} = require("../app.js");

const hoy = new Date(2026, 9, 5, 12);

test("acepta una sesión válida del mes seleccionado", () => {
  assert.equal(
    esSesionValidaParaInforme(
      { fecha: "2026-10-05", minutos: 45 },
      "2026-10",
      hoy
    ),
    true
  );
});

test("rechaza fechas inválidas, formatos incorrectos y fechas futuras", () => {
  const sesionesInvalidas = [
    { fecha: "2026-02-30", minutos: 20 },
    { fecha: "05/10/2026", minutos: 20 },
    { fecha: "2026-10-06", minutos: 20 },
    { fecha: "2026-09-30", minutos: 20 }
  ];

  sesionesInvalidas.forEach((sesion) => {
    assert.equal(
      esSesionValidaParaInforme(sesion, "2026-10", hoy),
      false,
      sesion.fecha
    );
  });
});

test("rechaza minutos cero, negativos, no numéricos o no finitos", () => {
  const minutosInvalidos = [0, -1, "30", NaN, Infinity, -Infinity];

  minutosInvalidos.forEach((minutos) => {
    assert.equal(
      esSesionValidaParaInforme(
        { fecha: "2026-10-01", minutos },
        "2026-10",
        hoy
      ),
      false,
      String(minutos)
    );
  });
});

test("obtiene meses válidos sin duplicados y de más reciente a más antiguo", () => {
  const sesiones = [
    { fecha: "2026-01-15", minutos: 20 },
    { fecha: "2026-10-01", minutos: 30 },
    { fecha: "2026-09-20", minutos: 10 },
    { fecha: "2026-10-05", minutos: 15 },
    { fecha: "2026-10-06", minutos: 90 },
    { fecha: "2026-02-30", minutos: 50 },
    { fecha: "2026-08-01", minutos: 0 }
  ];

  assert.deepEqual(obtenerMesesDisponibles(sesiones, hoy), [
    "2026-10",
    "2026-09",
    "2026-01"
  ]);
});

test("obtenerMesesDisponibles no modifica las sesiones originales", () => {
  const sesiones = [
    { fecha: "2026-09-20", minutos: 10 },
    { fecha: "2026-10-01", minutos: 30 }
  ];
  const copia = structuredClone(sesiones);

  obtenerMesesDisponibles(sesiones, hoy);

  assert.deepEqual(sesiones, copia);
});

test("filtra las sesiones válidas del mes sin modificar las sesiones originales", () => {
  const sesiones = [
    { fecha: "2026-10-01", tema: "A", minutos: 20 },
    { fecha: "2026-09-30", tema: "B", minutos: 30 },
    { fecha: "2026-10-06", tema: "C", minutos: 40 },
    { fecha: "2026-10-02", tema: "D", minutos: 0 },
    { fecha: "2026-10-03", tema: "E", minutos: 15 }
  ];
  const copia = structuredClone(sesiones);

  assert.deepEqual(
    filtrarSesionesDelMes(sesiones, "2026-10", hoy),
    [sesiones[0], sesiones[4]]
  );
  assert.deepEqual(sesiones, copia);
});

test("crea todos los días naturales del mes con cero minutos", () => {
  const dias = crearDiasDelMes("2026-02");

  assert.equal(dias.size, 28);
  assert.equal(dias.get("2026-02-01"), 0);
  assert.equal(dias.get("2026-02-28"), 0);
  assert.equal(dias.has("2026-03-01"), false);
});

test("acumula minutos por día y conserva los días sin sesiones", () => {
  const sesiones = [
    { fecha: "2026-10-01", tema: "A", minutos: 20 },
    { fecha: "2026-10-01", tema: "B", minutos: 15 },
    { fecha: "2026-10-03", tema: "C", minutos: 5 },
    { fecha: "2026-10-06", tema: "D", minutos: 40 },
    { fecha: "2026-10-02", tema: "E", minutos: 0 }
  ];

  const totales = agruparMinutosPorDia(sesiones, "2026-10", hoy);

  assert.equal(totales.size, 31);
  assert.equal(totales.get("2026-10-01"), 35);
  assert.equal(totales.get("2026-10-03"), 5);
  assert.equal(totales.get("2026-10-02"), 0);
  assert.equal(totales.get("2026-10-06"), 0);
});

test("normaliza temas para agrupar mayúsculas, espacios y temas vacíos", () => {
  assert.equal(normalizarTema("  JavaScript  "), "javascript");
  assert.equal(normalizarTema("   "), "sin tema");
});

test("agrupa minutos por tema y muestra Sin tema para valores vacíos", () => {
  const sesiones = [
    { fecha: "2026-10-01", tema: " JavaScript ", minutos: 20 },
    { fecha: "2026-10-02", tema: "javascript", minutos: 15 },
    { fecha: "2026-10-03", tema: "  ", minutos: 10 }
  ];

  const temas = agruparMinutosPorTema(sesiones);

  assert.deepEqual(temas.get("javascript"), {
    tema: "JavaScript",
    minutos: 35
  });
  assert.deepEqual(temas.get("sin tema"), {
    tema: "Sin tema",
    minutos: 10
  });
});

test("ordena sesiones por fecha, minutos y registro reciente sin mutar la entrada", () => {
  const sesiones = [
    { fecha: "2026-10-01", tema: "A", minutos: 20, creadaEn: 1 },
    { fecha: "2026-10-03", tema: "B", minutos: 10, creadaEn: 2 },
    { fecha: "2026-10-03", tema: "C", minutos: 10, creadaEn: 3 },
    { fecha: "2026-10-02", tema: "D", minutos: 30, creadaEn: 4 }
  ];
  const copia = structuredClone(sesiones);

  assert.deepEqual(ordenarSesionesInforme(sesiones), [
    sesiones[2],
    sesiones[1],
    sesiones[3],
    sesiones[0]
  ]);
  assert.deepEqual(sesiones, copia);
});

test("calcula el resumen con promedios y todos los empates máximos", () => {
  const sesiones = [
    { fecha: "2026-10-01", tema: "A", minutos: 20 },
    { fecha: "2026-10-01", tema: "B", minutos: 20 },
    { fecha: "2026-10-03", tema: "C", minutos: 10 }
  ];
  const minutosPorDia = new Map([
    ["2026-10-01", 40],
    ["2026-10-02", 0],
    ["2026-10-03", 10]
  ]);
  const minutosPorTema = new Map([
    ["a", { tema: "A", minutos: 40 }],
    ["c", { tema: "C", minutos: 10 }]
  ]);

  assert.deepEqual(calcularResumenInforme(sesiones, minutosPorDia, minutosPorTema), {
    totalMinutos: 50,
    totalSesiones: 3,
    diasEstudiados: 2,
    temasDistintos: 2,
    promedioMinutosPorSesion: 16.67,
    promedioMinutosPorDiaEstudiado: 25,
    sesionesMaximas: [sesiones[0], sesiones[1]],
    diasMaximos: ["2026-10-01"]
  });
});

test("construye el modelo completo sin modificar las sesiones originales", () => {
  const sesiones = [
    { fecha: "2026-10-01", tema: "A", minutos: 20, creadaEn: 1 },
    { fecha: "2026-10-01", tema: "B", minutos: 10, creadaEn: 2 },
    { fecha: "2026-09-30", tema: "C", minutos: 30, creadaEn: 3 },
    { fecha: "2026-10-06", tema: "D", minutos: 40, creadaEn: 4 }
  ];
  const copia = structuredClone(sesiones);

  const modelo = construirModeloInforme(sesiones, "2026-10", hoy);

  assert.equal(modelo.mes, "2026-10");
  assert.deepEqual(modelo.sesiones, [sesiones[0], sesiones[1]]);
  assert.equal(modelo.minutosPorDia.size, 31);
  assert.equal(modelo.minutosPorDia.get("2026-10-01"), 30);
  assert.equal(modelo.minutosPorTema.size, 2);
  assert.equal(modelo.resumen.totalMinutos, 30);
  assert.equal(modelo.resumen.diasEstudiados, 1);
  assert.deepEqual(sesiones, copia);
});

test("devuelve un estado no exportable cuando el mes no tiene sesiones válidas", () => {
  const sesiones = [
    { fecha: "2026-09-30", tema: "A", minutos: 20 },
    { fecha: "2026-10-06", tema: "B", minutos: 30 },
    { fecha: "2026-10-01", tema: "C", minutos: 0 }
  ];

  assert.deepEqual(construirModeloInforme(sesiones, "2026-10", hoy), {
    exportable: false,
    sesiones: []
  });
});

test("escapa los valores de usuario para mostrarlos como texto literal", () => {
  assert.equal(
    escaparTextoInforme('<script>alert("hola")</script>'),
    "&lt;script&gt;alert(&quot;hola&quot;)&lt;/script&gt;"
  );
});

test("genera un HTML autocontenido con todas las secciones del informe", () => {
  const sesiones = [
    { fecha: "2026-10-01", tema: " JavaScript ", minutos: 20, creadaEn: 1 },
    { fecha: "2026-10-03", tema: "  ", minutos: 10, creadaEn: 2 }
  ];
  const modelo = construirModeloInforme(sesiones, "2026-10", hoy);
  const html = generarHTMLInforme(modelo);

  assert.match(html, /<!DOCTYPE html>/i);
  assert.match(html, /<html lang="es">/);
  assert.match(html, /<style>/);
  assert.match(html, /octubre de 2026/i);
  assert.match(html, /30 minutos/);
  assert.match(html, /2 sesiones/);
  assert.match(html, /2 días estudiados/);
  assert.match(html, /2 temas distintos/);
  assert.match(html, /15,00 minutos/);
  assert.match(html, /2026-10-01/);
  assert.match(html, /2026-10-03/);
  assert.match(html, /JavaScript/);
  assert.match(html, /Sin tema/);
  assert.match(html, /2026-10-02/);
  assert.doesNotMatch(html, /<script>alert/);
});

test("el estado de exportación ofrece los meses válidos y habilita el botón", () => {
  const sesiones = [
    { fecha: "2026-10-01", tema: "A", minutos: 20 },
    { fecha: "2026-09-15", tema: "B", minutos: 30 },
    { fecha: "2026-10-06", tema: "C", minutos: 40 }
  ];

  const estado = obtenerEstadoExportacion(sesiones, hoy);

  assert.equal(estado.puedeExportar, true);
  assert.deepEqual(
    estado.meses.map((mes) => mes.valor),
    ["2026-10", "2026-09"]
  );
  assert.match(estado.meses[0].etiqueta, /octubre de 2026/i);
});

test("el estado de exportación deshabilita el botón si no hay meses válidos", () => {
  const sesiones = [
    { fecha: "2026-10-06", tema: "A", minutos: 20 },
    { fecha: "2026-02-30", tema: "B", minutos: 30 },
    { fecha: "2026-10-01", tema: "C", minutos: 0 }
  ];

  const estado = obtenerEstadoExportacion(sesiones, hoy);

  assert.equal(estado.puedeExportar, false);
  assert.deepEqual(estado.meses, []);
  assert.match(estado.mensaje, /no hay meses con sesiones válidas/i);
});

test("exporta un mes válido, descarga el HTML y confirma el éxito", () => {
  const sesiones = [{ fecha: "2026-10-01", tema: "A", minutos: 20, creadaEn: 1 }];
  const descargas = [];

  const resultado = ejecutarExportacion(
    sesiones,
    "2026-10",
    hoy,
    (html, nombre) => descargas.push({ html, nombre })
  );

  assert.equal(resultado.estado, "exito");
  assert.match(resultado.mensaje, /informe/i);
  assert.equal(descargas.length, 1);
  assert.equal(descargas[0].nombre, "informe-estudio-2026-10.html");
  assert.match(descargas[0].html, /<!DOCTYPE html>/i);
});

test("impide la descarga de un mes sin sesiones válidas y avisa al usuario", () => {
  const sesiones = [{ fecha: "2026-10-06", tema: "A", minutos: 20, creadaEn: 1 }];
  let descargado = false;

  const resultado = ejecutarExportacion(sesiones, "2026-10", hoy, () => {
    descargado = true;
  });

  assert.equal(resultado.estado, "sin-datos");
  assert.match(resultado.mensaje, /no hay datos válidos/i);
  assert.equal(descargado, false);
});

test("no exporta si no hay un mes seleccionado", () => {
  const sesiones = [{ fecha: "2026-10-01", tema: "A", minutos: 20, creadaEn: 1 }];
  let descargado = false;

  const resultado = ejecutarExportacion(sesiones, "", hoy, () => {
    descargado = true;
  });

  assert.equal(resultado.estado, "sin-datos");
  assert.equal(descargado, false);
});

test("informa del error cuando la descarga falla y no lo presenta como exportado", () => {
  const sesiones = [{ fecha: "2026-10-01", tema: "A", minutos: 20, creadaEn: 1 }];

  const resultado = ejecutarExportacion(sesiones, "2026-10", hoy, () => {
    throw new Error("fallo simulado");
  });

  assert.equal(resultado.estado, "error");
  assert.match(resultado.mensaje, /no se pudo/i);
});

test("revalida con el día actual: un mes que pasó a futuro deja de exportarse", () => {
  const sesiones = [{ fecha: "2026-10-05", tema: "A", minutos: 20, creadaEn: 1 }];
  const ayer = new Date(2026, 9, 4, 12);
  let descargado = false;

  const resultado = ejecutarExportacion(sesiones, "2026-10", ayer, () => {
    descargado = true;
  });

  assert.equal(resultado.estado, "sin-datos");
  assert.equal(descargado, false);
});
