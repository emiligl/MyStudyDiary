const test = require("node:test");
const assert = require("node:assert/strict");

const {
  construirModeloInforme,
  generarHTMLInforme,
  prepararDescarga,
  descargarInforme,
  ejecutarExportacion
} = require("../app.js");

const hoy = new Date(2026, 9, 5, 12);

function crearEntornoFalso({ falloAlCrearURL = false, falloAlHacerClic = false } = {}) {
  const registro = { anadidos: [], eliminados: 0, revocadas: [], clics: 0, blob: null };
  const enlace = {
    href: "",
    download: "",
    click() {
      registro.clics++;
      if (falloAlHacerClic) throw new Error("clic bloqueado");
    },
    remove() {
      registro.eliminados++;
    }
  };
  const entorno = {
    documento: {
      createElement: () => enlace,
      body: { appendChild: (elemento) => registro.anadidos.push(elemento) }
    },
    URL: {
      createObjectURL: (blob) => {
        if (falloAlCrearURL) throw new Error("sin memoria");
        registro.blob = blob;
        return "blob:informe-falso";
      },
      revokeObjectURL: (url) => registro.revocadas.push(url)
    },
    setTimeout: (accion) => accion()
  };

  return { entorno, registro, enlace };
}

function crearHTML() {
  const sesiones = [{ fecha: "2026-10-01", tema: "A", minutos: 20, creadaEn: 1 }];
  return generarHTMLInforme(construirModeloInforme(sesiones, "2026-10", hoy));
}

test("RF-2: prepara un archivo HTML en UTF-8 con el contenido íntegro", async () => {
  const html = crearHTML();
  const { blob, nombre } = prepararDescarga(html, "informe-estudio-2026-10.html");

  assert.equal(nombre, "informe-estudio-2026-10.html");
  assert.match(blob.type, /^text\/html/);
  assert.match(blob.type, /utf-8/i);
  assert.equal(await blob.text(), html);
});

test("RF-2: descarga el informe mediante un enlace temporal que se limpia", () => {
  const { entorno, registro, enlace } = crearEntornoFalso();

  descargarInforme(crearHTML(), "informe-estudio-2026-10.html", entorno);

  assert.equal(enlace.href, "blob:informe-falso");
  assert.equal(enlace.download, "informe-estudio-2026-10.html");
  assert.equal(registro.anadidos.length, 1);
  assert.equal(registro.clics, 1);
  assert.equal(registro.eliminados, 1);
  assert.deepEqual(registro.revocadas, ["blob:informe-falso"]);
});

test("RF-11: si no se puede crear el archivo, lanza el error y no deja restos", () => {
  const { entorno, registro } = crearEntornoFalso({ falloAlCrearURL: true });

  assert.throws(() => descargarInforme(crearHTML(), "a.html", entorno), /sin memoria/);
  assert.equal(registro.anadidos.length, 0);
  assert.equal(registro.clics, 0);
});

test("RF-11: si el clic falla, limpia el enlace y libera la URL antes de fallar", () => {
  const { entorno, registro } = crearEntornoFalso({ falloAlHacerClic: true });

  assert.throws(() => descargarInforme(crearHTML(), "a.html", entorno), /clic bloqueado/);
  assert.equal(registro.eliminados, 1);
  assert.deepEqual(registro.revocadas, ["blob:informe-falso"]);
});

test("RF-11: fuera del navegador la descarga falla con un error claro", () => {
  assert.throws(() => descargarInforme(crearHTML(), "a.html"), /navegador/i);
});

test("RF-11: un fallo real de descarga se comunica como error y no como éxito", () => {
  const sesiones = [{ fecha: "2026-10-01", tema: "A", minutos: 20, creadaEn: 1 }];
  const { entorno } = crearEntornoFalso({ falloAlCrearURL: true });

  const resultado = ejecutarExportacion(
    sesiones,
    "2026-10",
    hoy,
    (html, nombre) => descargarInforme(html, nombre, entorno)
  );

  assert.equal(resultado.estado, "error");
});

test("RF-2: el flujo completo entrega el HTML del mes con su nombre de archivo", async () => {
  const sesiones = [{ fecha: "2026-10-01", tema: "Álgebra", minutos: 20, creadaEn: 1 }];
  const { entorno, registro, enlace } = crearEntornoFalso();

  const resultado = ejecutarExportacion(
    sesiones,
    "2026-10",
    hoy,
    (html, nombre) => descargarInforme(html, nombre, entorno)
  );

  assert.equal(resultado.estado, "exito");
  assert.equal(enlace.download, "informe-estudio-2026-10.html");
  assert.match(await registro.blob.text(), /Álgebra/);
});

test("RF-9: el HTML se abre sin conexión, sin recursos externos ni scripts", () => {
  const html = crearHTML();

  assert.doesNotMatch(html, /https?:\/\//);
  assert.doesNotMatch(html, /<link\b/i);
  assert.doesNotMatch(html, /<script\b/i);
  assert.doesNotMatch(html, /\bsrc\s*=/i);
  assert.doesNotMatch(html, /url\(/i);
  assert.match(html, /<style>/);
});

test("RF-9: el informe es legible en pantallas pequeñas", () => {
  const html = crearHTML();

  assert.match(html, /<meta name="viewport" content="width=device-width, initial-scale=1.0">/);
  assert.match(html, /@media \(max-width: 500px\)/);
});

test("RF-9: el informe está preparado para imprimirse sin cortar filas ni títulos", () => {
  const html = crearHTML();

  assert.match(html, /@page\s*\{[^}]*margin/);
  assert.match(html, /@media print/);
  assert.match(html, /break-inside:\s*avoid/);
  assert.match(html, /break-after:\s*avoid/);
  assert.match(html, /display:\s*table-header-group/);
  assert.match(html, /\.seccion\s*\{\s*overflow:\s*visible/);
});

test("RF-9: con un tema larguísimo solo se parte el tema, no las fechas ni los minutos", () => {
  const sesiones = [{ fecha: "2026-10-01", tema: "Z".repeat(150), minutos: 20, creadaEn: 1 }];
  const html = generarHTMLInforme(construirModeloInforme(sesiones, "2026-10", hoy));

  assert.match(html, /th,\s*td\s*\{[^}]*white-space:\s*nowrap/);
  assert.doesNotMatch(html, /th,\s*td\s*\{[^}]*overflow-wrap/);
  assert.match(html, /\.tema\s*\{[^}]*white-space:\s*normal[^}]*overflow-wrap:\s*anywhere/);
  assert.equal((html.match(/class="tema"/g) || []).length, 2);
});

test("RF-10: los valores del usuario siguen literales en el archivo descargado", async () => {
  const tema = '<b onclick="x()">negrita</b>';
  const sesiones = [{ fecha: "2026-10-01", tema, minutos: 20, creadaEn: 1 }];
  const { entorno, registro } = crearEntornoFalso();

  ejecutarExportacion(
    sesiones,
    "2026-10",
    hoy,
    (html, nombre) => descargarInforme(html, nombre, entorno)
  );
  const contenido = await registro.blob.text();

  assert.doesNotMatch(contenido, /<b onclick/);
  assert.match(contenido, /&lt;b onclick=&quot;x\(\)&quot;&gt;negrita&lt;\/b&gt;/);
});
