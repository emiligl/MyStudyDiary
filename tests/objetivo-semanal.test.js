const test = require("node:test");
const assert = require("node:assert/strict");

const {
  normalizarObjetivo,
  esFechaEnSemanaActual,
  esSesionContabilizada,
  calcularMinutosSemanaActual,
  calcularPorcentajeObjetivo,
  construirEstadoObjetivo,
  leerObjetivo,
  guardarObjetivo,
  borrarObjetivo
} = require("../app.js");

const hoy = new Date(2026, 9, 5, 12);

test("Normalización del objetivo", async (t) => {
  await t.test("acepta un entero positivo recortando los espacios", () => {
    assert.deepEqual(normalizarObjetivo("300"), {
      valido: true,
      objetivo: 300,
      mensaje: ""
    });
    assert.deepEqual(normalizarObjetivo(" 300 "), {
      valido: true,
      objetivo: 300,
      mensaje: ""
    });
    assert.deepEqual(normalizarObjetivo("   45   "), {
      valido: true,
      objetivo: 45,
      mensaje: ""
    });
  });

  await t.test("acepta un número entero positivo ya numérico", () => {
    assert.deepEqual(normalizarObjetivo(120), {
      valido: true,
      objetivo: 120,
      mensaje: ""
    });
  });

  await t.test("rechaza el valor vacío con su mensaje", () => {
    const resultado = normalizarObjetivo("");
    assert.equal(resultado.valido, false);
    assert.equal(resultado.objetivo, null);
    assert.match(resultado.mensaje, /entero/i);
    assert.match(resultado.mensaje, /mayor que cero/i);
  });

  await t.test("rechaza solo espacios con su mensaje", () => {
    const resultado = normalizarObjetivo("   ");
    assert.equal(resultado.valido, false);
    assert.equal(resultado.objetivo, null);
    assert.match(resultado.mensaje, /mayor que cero/i);
  });

  await t.test("rechaza cero", () => {
    ["0", " 0 ", 0].forEach((valor) => {
      const resultado = normalizarObjetivo(valor);
      assert.equal(resultado.valido, false, String(valor));
      assert.equal(resultado.objetivo, null, String(valor));
      assert.match(resultado.mensaje, /mayor que cero/i);
    });
  });

  await t.test("rechaza un valor negativo", () => {
    ["-5", -12].forEach((valor) => {
      const resultado = normalizarObjetivo(valor);
      assert.equal(resultado.valido, false, String(valor));
      assert.equal(resultado.objetivo, null, String(valor));
      assert.match(resultado.mensaje, /mayor que cero/i);
    });
  });

  await t.test("rechaza un valor decimal", () => {
    ["12.5", "0.5", 3.14].forEach((valor) => {
      const resultado = normalizarObjetivo(valor);
      assert.equal(resultado.valido, false, String(valor));
      assert.equal(resultado.objetivo, null, String(valor));
      assert.match(resultado.mensaje, /entero/i);
    });
  });

  await t.test("rechaza un texto no numérico", () => {
    ["abc", "300 min", "12,5"].forEach((valor) => {
      const resultado = normalizarObjetivo(valor);
      assert.equal(resultado.valido, false, valor);
      assert.equal(resultado.objetivo, null, valor);
      assert.match(resultado.mensaje, /entero/i);
    });
  });

  await t.test("rechaza los valores no finitos", () => {
    [NaN, Infinity, -Infinity].forEach((valor) => {
      const resultado = normalizarObjetivo(valor);
      assert.equal(resultado.valido, false, String(valor));
      assert.equal(resultado.objetivo, null, String(valor));
      assert.match(resultado.mensaje, /entero/i);
    });
  });

  await t.test("rechaza valores ausentes sin lanzar errores", () => {
    [null, undefined].forEach((valor) => {
      const resultado = normalizarObjetivo(valor);
      assert.equal(resultado.valido, false, String(valor));
      assert.equal(resultado.objetivo, null, String(valor));
      assert.match(resultado.mensaje, /mayor que cero/i);
    });
  });

  await t.test("no modifica el valor recibido ni el objetivo existente", () => {
    const entrada = " 300 ";
    normalizarObjetivo(entrada);
    assert.equal(entrada, " 300 ");

    const rechazado = normalizarObjetivo("-8");
    assert.equal(rechazado.objetivo, null);
    assert.ok(rechazado.mensaje.length > 0);
  });
});

test("esFechaEnSemanaActual", async (t) => {
  await t.test("acepta los días de la semana local que contiene hoy", () => {
    assert.equal(esFechaEnSemanaActual("2026-10-05", hoy), true);
    assert.equal(esFechaEnSemanaActual("2026-10-07", hoy), true);
    assert.equal(esFechaEnSemanaActual("2026-10-11", hoy), true);
  });

  await t.test("rechaza fechas fuera de la semana", () => {
    assert.equal(esFechaEnSemanaActual("2026-10-04", hoy), false);
    assert.equal(esFechaEnSemanaActual("2026-10-12", hoy), false);
    assert.equal(esFechaEnSemanaActual("2026-09-30", hoy), false);
  });

  await t.test("rechaza fechas malformadas o imposibles", () => {
    assert.equal(esFechaEnSemanaActual("05/10/2026", hoy), false);
    assert.equal(esFechaEnSemanaActual("2026-2-30", hoy), false);
    assert.equal(esFechaEnSemanaActual("2026-02-30", hoy), false);
    assert.equal(esFechaEnSemanaActual("", hoy), false);
  });

  await t.test("no modifica la fecha de hoy recibida", () => {
    const copia = new Date(hoy);
    esFechaEnSemanaActual("2026-10-11", hoy);
    assert.equal(hoy.getTime(), copia.getTime());
  });
});

test("Sesión contabilizada", async (t) => {
  await t.test("acepta una sesión válida de la semana actual no futura", () => {
    assert.equal(
      esSesionContabilizada({ fecha: "2026-10-05", tema: "A", minutos: 45 }, hoy),
      true
    );
    assert.equal(
      esSesionContabilizada({ fecha: "2026-10-05", minutos: 10 }, hoy),
      true
    );
  });

  await t.test("rechaza sesiones nulas o con tipos incorrectos", () => {
    [null, undefined, 42, "sesión", [], true].forEach((sesion) => {
      assert.equal(esSesionContabilizada(sesion, hoy), false, String(sesion));
    });
  });

  await t.test("rechaza fechas malformadas o imposibles", () => {
    [
      { fecha: "05/10/2026", minutos: 20 },
      { fecha: "2026-10-5", minutos: 20 },
      { fecha: "2026-02-30", minutos: 20 },
      { fecha: "", minutos: 20 },
      { minutos: 20 }
    ].forEach((sesion) => {
      assert.equal(esSesionContabilizada(sesion, hoy), false, sesion.fecha);
    });
  });

  await t.test("rechaza fechas fuera de la semana o futuras", () => {
    [
      { fecha: "2026-10-04", minutos: 20 },
      { fecha: "2026-10-12", minutos: 20 },
      { fecha: "2026-10-06", minutos: 20 }
    ].forEach((sesion) => {
      assert.equal(esSesionContabilizada(sesion, hoy), false, sesion.fecha);
    });
  });

  await t.test("rechaza minutos cero, negativos, de texto o no finitos", () => {
    [0, -5, "30", NaN, Infinity, -Infinity].forEach((minutos) => {
      assert.equal(
        esSesionContabilizada({ fecha: "2026-10-05", minutos }, hoy),
        false,
        String(minutos)
      );
    });
  });
});

test("Minutos de la semana actual", async (t) => {
  await t.test("suma varias sesiones contabilizadas acumulando el mismo día", () => {
    const sesiones = [
      { fecha: "2026-10-05", tema: "A", minutos: 30 },
      { fecha: "2026-10-05", tema: "B", minutos: 15 },
      { fecha: "2026-10-07", tema: "C", minutos: 45 }
    ];

    assert.equal(calcularMinutosSemanaActual(sesiones, new Date(2026, 9, 7, 12)), 90);
  });

  await t.test("excluye sesiones nulas, inválidas o fuera de la semana", () => {
    const sesiones = [
      { fecha: "2026-10-05", minutos: 30 },
      null,
      { fecha: "2026-10-05", minutos: 0 },
      { fecha: "2026-10-04", minutos: 100 },
      { fecha: "2026-10-06", minutos: 100 },
      { fecha: "2026-02-30", minutos: 100 },
      { fecha: "2026-10-05", minutos: "30" },
      { fecha: "2026-10-05", minutos: Infinity }
    ];

    assert.equal(calcularMinutosSemanaActual(sesiones, hoy), 30);
  });

  await t.test("devuelve 0 sin sesiones o con una colección no válida", () => {
    assert.equal(calcularMinutosSemanaActual([], hoy), 0);
    assert.equal(calcularMinutosSemanaActual(null, hoy), 0);
    assert.equal(calcularMinutosSemanaActual(undefined, hoy), 0);
    assert.equal(calcularMinutosSemanaActual({}, hoy), 0);
    assert.equal(calcularMinutosSemanaActual("sesiones", hoy), 0);
  });

  await t.test("no modifica las sesiones originales", () => {
    const sesiones = [
      { fecha: "2026-10-05", tema: "A", minutos: 30, creadaEn: 1 },
      { fecha: "2026-10-07", tema: "B", minutos: 45, creadaEn: 2 }
    ];
    const copia = structuredClone(sesiones);

    calcularMinutosSemanaActual(sesiones, hoy);

    assert.deepEqual(sesiones, copia);
  });
});

test("Porcentaje de la barra", async (t) => {
  await t.test("devuelve 0 sin avance", () => {
    assert.equal(calcularPorcentajeObjetivo(0, 100), 0);
    assert.equal(calcularPorcentajeObjetivo(-5, 100), 0);
  });

  await t.test("aplica el mínimo del 1 % con avance parcial muy pequeño", () => {
    assert.equal(calcularPorcentajeObjetivo(1, 1000), 1);
    assert.equal(calcularPorcentajeObjetivo(2, 1000), 1);
  });

  await t.test("redondea al alza el avance parcial", () => {
    assert.equal(calcularPorcentajeObjetivo(51, 100), 51);
    assert.equal(calcularPorcentajeObjetivo(1, 3), 34);
    assert.equal(calcularPorcentajeObjetivo(1, 4), 25);
    assert.equal(calcularPorcentajeObjetivo(250, 1000), 25);
  });

  await t.test("llena al 100 % al alcanzar el objetivo", () => {
    assert.equal(calcularPorcentajeObjetivo(100, 100), 100);
    assert.equal(calcularPorcentajeObjetivo(300, 300), 100);
    assert.equal(calcularPorcentajeObjetivo(99, 100), 99);
  });

  await t.test("no supera el 100 % al superar el objetivo", () => {
    assert.equal(calcularPorcentajeObjetivo(150, 100), 100);
    assert.equal(calcularPorcentajeObjetivo(100000, 100), 100);
  });

  await t.test("devuelve 0 con un objetivo no válido", () => {
    [0, -5, 12.5, NaN, Infinity, -Infinity].forEach((objetivo) => {
      assert.equal(calcularPorcentajeObjetivo(50, objetivo), 0, String(objetivo));
    });
  });

  await t.test("devuelve 0 con minutos no válidos", () => {
    [NaN, Infinity, -Infinity, "30", null].forEach((minutos) => {
      assert.equal(calcularPorcentajeObjetivo(minutos, 100), 0, String(minutos));
    });
  });
});

test("Estado del progreso", async (t) => {
  await t.test("sin objetivo devuelve la invitación sin errores", () => {
    [null, undefined, 0, -5, 12.5, NaN].forEach((objetivo) => {
      const estado = construirEstadoObjetivo([], objetivo, hoy);
      assert.equal(estado.hayObjetivo, false, String(objetivo));
      assert.match(estado.mensaje, /objetivo semanal/i);
      assert.match(estado.mensaje, /fija|fijar/i);
      assert.equal(estado.cumplido, false);
      assert.equal(estado.textoCumplido, "");
    });
  });

  await t.test("con objetivo pero sin minutos no está cumplido", () => {
    const estado = construirEstadoObjetivo([], 500, hoy);

    assert.equal(estado.hayObjetivo, true);
    assert.equal(estado.objetivo, 500);
    assert.equal(estado.minutos, 0);
    assert.equal(estado.porcentaje, 0);
    assert.equal(estado.cumplido, false);
    assert.equal(estado.exceso, 0);
    assert.equal(estado.textoProgreso, "llevas 0 de 500 minutos");
    assert.equal(estado.textoCumplido, "");
  });

  await t.test("refleja el avance parcial", () => {
    const sesiones = [
      { fecha: "2026-10-05", tema: "A", minutos: 60 },
      { fecha: "2026-10-05", tema: "B", minutos: 40 }
    ];

    const estado = construirEstadoObjetivo(sesiones, 500, hoy);

    assert.equal(estado.minutos, 100);
    assert.equal(estado.porcentaje, 20);
    assert.equal(estado.cumplido, false);
    assert.equal(estado.exceso, 0);
    assert.equal(estado.textoProgreso, "llevas 100 de 500 minutos");
    assert.equal(estado.textoCumplido, "");
  });

  await t.test("al alcanzar justo el objetivo no muestra exceso", () => {
    const sesiones = [
      { fecha: "2026-10-05", tema: "A", minutos: 150 },
      { fecha: "2026-10-05", tema: "B", minutos: 150 }
    ];

    const estado = construirEstadoObjetivo(sesiones, 300, hoy);

    assert.equal(estado.cumplido, true);
    assert.equal(estado.exceso, 0);
    assert.equal(estado.porcentaje, 100);
    assert.equal(estado.textoCumplido, "objetivo cumplido");
    assert.doesNotMatch(estado.textoCumplido, /exceso/);
  });

  await t.test("al superar el objetivo muestra los minutos de exceso", () => {
    const sesiones = [{ fecha: "2026-10-05", tema: "A", minutos: 450 }];

    const estado = construirEstadoObjetivo(sesiones, 300, hoy);

    assert.equal(estado.cumplido, true);
    assert.equal(estado.exceso, 150);
    assert.equal(estado.porcentaje, 100);
    assert.match(estado.textoCumplido, /objetivo cumplido/i);
    assert.match(estado.textoCumplido, /150 minutos de exceso/i);
  });

  await t.test("muestra cumplido cuando el objetivo llega ya superado", () => {
    const sesiones = [{ fecha: "2026-10-05", tema: "A", minutos: 600 }];

    const estado = construirEstadoObjetivo(sesiones, 100, hoy);

    assert.equal(estado.cumplido, true);
    assert.equal(estado.exceso, 500);
    assert.match(estado.textoCumplido, /500 minutos de exceso/i);
  });

  await t.test("tolera sesiones vacías o inválidas", () => {
    const sesiones = [
      null,
      { fecha: "2026-10-06", minutos: 100 },
      { fecha: "2026-02-30", minutos: 100 },
      { fecha: "2026-10-05", minutos: "100" }
    ];

    const estado = construirEstadoObjetivo(sesiones, 100, hoy);

    assert.equal(estado.minutos, 0);
    assert.equal(estado.cumplido, false);
  });

  await t.test("devuelve un modelo inmutable y no muta las sesiones", () => {
    const sesiones = [{ fecha: "2026-10-05", tema: "A", minutos: 120 }];
    const copia = structuredClone(sesiones);

    const estado = construirEstadoObjetivo(sesiones, 300, hoy);

    assert.equal(Object.isFrozen(estado), true);
    assert.deepEqual(sesiones, copia);
  });
});

const CLAVE_OBJETIVO = "diario-de-estudio-objetivo-semanal";
const CLAVE_SESIONES_PRUEBA = "diario-de-estudio-sesiones";

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

test("Persistencia del objetivo", async (t) => {
  await t.test("lee un objetivo válido guardado", () => {
    const almacen = crearAlmacenamientoFalso({ [CLAVE_OBJETIVO]: "300" });

    assert.equal(leerObjetivo(almacen), 300);
  });

  await t.test("normaliza el valor guardado al leerlo", () => {
    const almacen = crearAlmacenamientoFalso({ [CLAVE_OBJETIVO]: "  250  " });

    assert.equal(leerObjetivo(almacen), 250);
  });

  await t.test("trata como ausencia los datos corruptos sin lanzar", () => {
    ["abc", "0", "-5", "12.5", "", "NaN", "Infinity"].forEach((valor) => {
      const almacen = crearAlmacenamientoFalso({ [CLAVE_OBJETIVO]: valor });
      assert.equal(leerObjetivo(almacen), null, valor);
    });
  });

  await t.test("devuelve ausencia si no hay objetivo guardado", () => {
    const almacen = crearAlmacenamientoFalso();

    assert.equal(leerObjetivo(almacen), null);
  });

  await t.test("devuelve ausencia si la lectura del almacenamiento falla", () => {
    const almacen = {
      getItem() {
        throw new Error("almacenamiento bloqueado");
      }
    };

    assert.equal(leerObjetivo(almacen), null);
  });

  await t.test("guarda un valor válido y devuelve el resultado", () => {
    const almacen = crearAlmacenamientoFalso();

    const resultado = guardarObjetivo(almacen, " 450 ");

    assert.equal(resultado.valido, true);
    assert.equal(resultado.objetivo, 450);
    assert.equal(almacen.datos.get(CLAVE_OBJETIVO), "450");
    assert.equal(leerObjetivo(almacen), 450);
  });

  await t.test("no escribe nada al guardar un valor inválido", () => {
    ["0", "-5", "abc", ""].forEach((valor) => {
      const almacen = crearAlmacenamientoFalso();
      const resultado = guardarObjetivo(almacen, valor);

      assert.equal(resultado.valido, false, valor);
      assert.equal(almacen.datos.has(CLAVE_OBJETIVO), false, valor);
      assert.deepEqual(almacen.registro.escritos, [], valor);
    });
  });

  await t.test("borra solo el objetivo", () => {
    const almacen = crearAlmacenamientoFalso({
      [CLAVE_OBJETIVO]: "300",
      [CLAVE_SESIONES_PRUEBA]: "[]"
    });

    borrarObjetivo(almacen);

    assert.equal(almacen.datos.has(CLAVE_OBJETIVO), false);
    assert.equal(almacen.datos.get(CLAVE_SESIONES_PRUEBA), "[]");
    assert.deepEqual(almacen.registro.borrados, [CLAVE_OBJETIVO]);
  });

  await t.test("nunca lee, escribe ni borra la clave de sesiones", () => {
    const sesiones = JSON.stringify([
      { fecha: "2026-10-05", tema: "A", minutos: 30, creadaEn: 1 }
    ]);
    const almacen = crearAlmacenamientoFalso({
      [CLAVE_OBJETIVO]: "300",
      [CLAVE_SESIONES_PRUEBA]: sesiones
    });

    leerObjetivo(almacen);
    guardarObjetivo(almacen, "500");
    borrarObjetivo(almacen);

    assert.equal(almacen.datos.get(CLAVE_SESIONES_PRUEBA), sesiones);
    assert.ok(!almacen.registro.leidos.includes(CLAVE_SESIONES_PRUEBA));
    assert.ok(!almacen.registro.escritos.includes(CLAVE_SESIONES_PRUEBA));
    assert.ok(!almacen.registro.borrados.includes(CLAVE_SESIONES_PRUEBA));
  });
});

test("reemplaza el objetivo existente y recalcula el progreso", () => {
  const almacen = crearAlmacenamientoFalso();
  const sesiones = [{ fecha: "2026-10-05", tema: "Álgebra", minutos: 150 }];

  guardarObjetivo(almacen, "300");
  guardarObjetivo(almacen, "500");

  assert.equal(leerObjetivo(almacen), 500);

  const estado = construirEstadoObjetivo(sesiones, leerObjetivo(almacen), hoy);
  assert.equal(estado.objetivo, 500);
  assert.equal(estado.porcentaje, 30);
  assert.equal(estado.textoProgreso, "llevas 150 de 500 minutos");
  assert.equal(estado.cumplido, false);
});

test("persistencia: guardar y volver a leer devuelve el mismo objetivo", () => {
  const almacen = crearAlmacenamientoFalso();

  guardarObjetivo(almacen, 420);

  assert.equal(leerObjetivo(almacen), 420);
  assert.equal(leerObjetivo(almacen), leerObjetivo(almacen));
});
