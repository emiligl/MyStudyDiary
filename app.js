const CLAVE_SESIONES = "diario-de-estudio-sesiones";

const formulario = typeof document !== "undefined" ? document.querySelector("#formulario-sesion") : null;
const campoFecha = typeof document !== "undefined" ? document.querySelector("#fecha") : null;
const campoTema = typeof document !== "undefined" ? document.querySelector("#tema") : null;
const campoMinutos = typeof document !== "undefined" ? document.querySelector("#minutos") : null;
const listaSesiones = typeof document !== "undefined" ? document.querySelector("#lista-sesiones") : null;
const topSesiones = typeof document !== "undefined" ? document.querySelector("#top-sesiones") : null;
const elementoRacha = typeof document !== "undefined" ? document.querySelector("#racha") : null;
const elementoMejorRacha = typeof document !== "undefined" ? document.querySelector("#mejor-racha") : null;
const elementoMinutosSemana = typeof document !== "undefined" ? document.querySelector("#minutos-semana") : null;
const elementoDiasMes = typeof document !== "undefined" ? document.querySelector("#dias-mes") : null;
const elementoMesMasMinutos = typeof document !== "undefined" ? document.querySelector("#mes-mas-minutos") : null;
const elementoMesMasCursos = typeof document !== "undefined" ? document.querySelector("#mes-mas-cursos") : null;
const mapaCalor = typeof document !== "undefined" ? document.querySelector("#mapa-calor") : null;
const mesesMapaCalor = typeof document !== "undefined" ? document.querySelector(".mapa-calor__meses") : null;
const detalleMapaCalor = typeof document !== "undefined" ? document.querySelector("#detalle-mapa-calor") : null;
const selectorMesInforme = typeof document !== "undefined" ? document.querySelector("#mes-informe") : null;
const botonExportarInforme = typeof document !== "undefined" ? document.querySelector("#exportar-informe") : null;
const estadoInforme = typeof document !== "undefined" ? document.querySelector("#estado-informe") : null;

function fechaLocal(fecha = new Date()) {
  const año = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${año}-${mes}-${dia}`;
}

function esFechaValida(fecha) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return false;

  const [año, mes, dia] = fecha.split("-").map(Number);
  const fechaComprobada = new Date(año, mes - 1, dia);
  return fechaLocal(fechaComprobada) === fecha;
}

function esSesionValidaParaInforme(sesion, mes, hoy) {
  if (!sesion || typeof sesion !== "object") return false;
  if (!esFechaValida(sesion.fecha)) return false;
  if (sesion.fecha.slice(0, 7) !== mes) return false;
  if (sesion.fecha > fechaLocal(hoy)) return false;
  if (typeof sesion.minutos !== "number") return false;
  return Number.isFinite(sesion.minutos) && sesion.minutos > 0;
}

function obtenerMesesDisponibles(sesiones, hoy) {
  if (!Array.isArray(sesiones)) return [];

  const meses = new Set();
  sesiones.forEach((sesion) => {
    if (typeof sesion?.fecha !== "string") return;

    const mes = sesion.fecha.slice(0, 7);
    if (esSesionValidaParaInforme(sesion, mes, hoy)) {
      meses.add(mes);
    }
  });

  return [...meses].sort((a, b) => b.localeCompare(a));
}

function filtrarSesionesDelMes(sesiones, mes, hoy) {
  if (!Array.isArray(sesiones)) return [];

  return sesiones.filter((sesion) => esSesionValidaParaInforme(sesion, mes, hoy));
}

function crearDiasDelMes(mes) {
  const [año, numeroMes] = mes.split("-").map(Number);
  const dia = new Date(año, numeroMes - 1, 1);
  const siguienteMes = new Date(año, numeroMes, 1);
  const dias = new Map();

  while (dia < siguienteMes) {
    dias.set(fechaLocal(dia), 0);
    dia.setDate(dia.getDate() + 1);
  }

  return dias;
}

function agruparMinutosPorDia(sesiones, mes, hoy) {
  const totales = crearDiasDelMes(mes);

  filtrarSesionesDelMes(sesiones, mes, hoy).forEach((sesion) => {
    totales.set(sesion.fecha, totales.get(sesion.fecha) + sesion.minutos);
  });

  return totales;
}

function normalizarTema(tema) {
  const temaNormalizado = typeof tema === "string"
    ? tema.trim().toLocaleLowerCase("es-ES")
    : "";

  return temaNormalizado || "sin tema";
}

function agruparMinutosPorTema(sesiones) {
  const temas = new Map();

  if (!Array.isArray(sesiones)) return temas;

  sesiones.forEach((sesion) => {
    const clave = normalizarTema(sesion.tema);
    if (!temas.has(clave)) {
      const etiqueta = clave === "sin tema"
        ? "Sin tema"
        : sesion.tema.trim();
      temas.set(clave, { tema: etiqueta, minutos: 0 });
    }

    temas.get(clave).minutos += sesion.minutos;
  });

  return temas;
}

function ordenarSesionesInforme(sesiones) {
  if (!Array.isArray(sesiones)) return [];

  return [...sesiones].sort((a, b) => {
    if (a.fecha !== b.fecha) return b.fecha.localeCompare(a.fecha);
    if (a.minutos !== b.minutos) return b.minutos - a.minutos;
    return (Number(b.creadaEn) || 0) - (Number(a.creadaEn) || 0);
  });
}

function redondearDosDecimales(valor) {
  return Math.round((valor + Number.EPSILON) * 100) / 100;
}

function calcularResumenInforme(sesiones, minutosPorDia, minutosPorTema) {
  const totalMinutos = sesiones.reduce((total, sesion) => total + sesion.minutos, 0);
  const diasEstudiados = [...minutosPorDia.values()].filter((minutos) => minutos > 0).length;
  const maximoSesiones = Math.max(0, ...sesiones.map((sesion) => sesion.minutos));
  const maximoDias = Math.max(0, ...minutosPorDia.values());

  return {
    totalMinutos,
    totalSesiones: sesiones.length,
    diasEstudiados,
    temasDistintos: minutosPorTema.size,
    promedioMinutosPorSesion: sesiones.length > 0
      ? redondearDosDecimales(totalMinutos / sesiones.length)
      : 0,
    promedioMinutosPorDiaEstudiado: diasEstudiados > 0
      ? redondearDosDecimales(totalMinutos / diasEstudiados)
      : 0,
    sesionesMaximas: maximoSesiones > 0
      ? sesiones.filter((sesion) => sesion.minutos === maximoSesiones)
      : [],
    diasMaximos: maximoDias > 0
      ? [...minutosPorDia.entries()]
        .filter(([, minutos]) => minutos === maximoDias)
        .map(([fecha]) => fecha)
      : []
  };
}

function obtenerInicioDeSemana(hoy) {
  const inicio = new Date(hoy);
  const diaSemana = inicio.getDay();
  const diasDesdeLunes = diaSemana === 0 ? 6 : diaSemana - 1;
  inicio.setDate(inicio.getDate() - diasDesdeLunes);
  return inicio;
}

function crearRangoMapa(hoy) {
  const inicio = obtenerInicioDeSemana(hoy);
  inicio.setDate(inicio.getDate() - 77);

  return Array.from({ length: 84 }, () => {
    const fecha = fechaLocal(inicio);
    inicio.setDate(inicio.getDate() + 1);
    return fecha;
  });
}

function agruparMinutosPorDiaMapa(sesiones, hoy, rango) {
  const hoyTexto = fechaLocal(hoy);
  const fechasDelRango = new Set(rango);
  const totales = new Map();

  sesiones.forEach((sesion) => {
    const minutos = Number(sesion.minutos);
    if (
      !esFechaValida(sesion.fecha) ||
      !Number.isFinite(minutos) ||
      minutos <= 0 ||
      sesion.fecha > hoyTexto ||
      !fechasDelRango.has(sesion.fecha)
    ) {
      return;
    }

    totales.set(sesion.fecha, (totales.get(sesion.fecha) || 0) + minutos);
  });

  return totales;
}

function calcularNivel(minutos, maximo) {
  if (minutos <= 0 || maximo <= 0) return 0;
  return Math.min(4, Math.ceil((minutos / maximo) * 4));
}

function construirMapaCalor(sesiones, hoy) {
  const fechas = crearRangoMapa(hoy);
  const totales = agruparMinutosPorDiaMapa(sesiones, hoy, fechas);
  const maximo = Math.max(0, ...totales.values());
  const hoyTexto = fechaLocal(hoy);
  const celdas = fechas.map((fecha) => {
    const futura = fecha > hoyTexto;
    const minutos = futura ? 0 : totales.get(fecha) || 0;

    return {
      fecha,
      minutos,
      nivel: calcularNivel(minutos, maximo),
      futura
    };
  });

  return { celdas, maximo };
}

function etiquetaTemaInforme(tema) {
  const temaLimpio = typeof tema === "string" ? tema.trim() : "";
  return temaLimpio || "Sin tema";
}

function pluralizar(cantidad, singular, plural) {
  return `${cantidad} ${cantidad === 1 ? singular : plural}`;
}

function formatearPromedio(valor) {
  const texto = valor.toLocaleString("es-ES", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  return `${texto} minutos`;
}

function escaparTextoInforme(texto) {
  return String(texto).replace(/[&<>'"]/g, (caracter) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#039;",
    '"': "&quot;"
  }[caracter]));
}

function generarHTMLInforme(modelo) {
  if (!modelo?.exportable) return "";

  const resumen = modelo.resumen;
  const temas = [...modelo.minutosPorTema.values()].sort((a, b) => {
    if (b.minutos !== a.minutos) return b.minutos - a.minutos;
    return a.tema.localeCompare(b.tema, "es-ES");
  });
  const maximoSesiones = resumen.sesionesMaximas[0]?.minutos || 0;
  const maximoDias = Math.max(0, ...modelo.minutosPorDia.values());
  const etiquetaSesionesMaximas = resumen.sesionesMaximas.length === 1
    ? "Sesión con más minutos"
    : "Sesiones con más minutos";
  const etiquetaDiasMaximos = resumen.diasMaximos.length === 1
    ? "Día con más minutos"
    : "Días con más minutos";
  const fechasSesionesMaximas = escaparTextoInforme(
    [...new Set(resumen.sesionesMaximas.map((sesion) => sesion.fecha))].join(", ")
  );
  const fechasDiasMaximos = escaparTextoInforme(resumen.diasMaximos.join(", "));
  const filasDias = [...modelo.minutosPorDia.entries()].map(([fecha, minutos]) => `
      <tr>
        <th scope="row">${escaparTextoInforme(fecha)}</th>
        <td>${minutos} min</td>
      </tr>`).join("");
  const filasTemas = temas.map((tema) => `
      <tr>
        <th scope="row" class="tema">${escaparTextoInforme(tema.tema)}</th>
        <td>${tema.minutos} min</td>
      </tr>`).join("");
  const filasSesiones = modelo.sesiones.map((sesion) => `
      <tr>
        <th scope="row">${escaparTextoInforme(sesion.fecha)}</th>
        <td class="tema">${escaparTextoInforme(etiquetaTemaInforme(sesion.tema))}</td>
        <td>${sesion.minutos} min</td>
      </tr>`).join("");

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Informe de estudio · ${escaparTextoInforme(modelo.mes)}</title>
  <style>
    :root { color-scheme: light; font-family: Arial, sans-serif; }
    * { box-sizing: border-box; }
    body { margin: 0; background: #f4efe5; color: #202c39; }
    main { width: min(100% - 32px, 760px); margin: 0 auto; padding: 28px 0 64px; }
    h1, h2 { line-height: 1.2; }
    .resumen { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
    .dato { margin: 0; padding: 16px; border: 1px solid #d9d2c5; border-radius: 12px; background: #fffdf8; overflow-wrap: anywhere; }
    .dato strong { display: block; font-size: 1.35rem; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 10px; border-bottom: 1px solid #d9d2c5; text-align: left; white-space: nowrap; }
    .tema { white-space: normal; overflow-wrap: anywhere; }
    .seccion { margin-top: 28px; overflow-x: auto; }
    @page { margin: 16mm; }
    @media (max-width: 500px) {
      .resumen { grid-template-columns: 1fr; }
      th, td { padding: 8px 6px; font-size: 0.9rem; }
    }
    @media print {
      body { background: white; }
      main { width: 100%; padding: 0; }
      .seccion { overflow: visible; }
      .dato, tr { break-inside: avoid; }
      h2 { break-after: avoid; }
      thead { display: table-header-group; }
    }
  </style>
</head>
<body>
  <main>
    <header>
      <p>Informe de estudio</p>
      <h1>${escaparTextoInforme(formatearMes(modelo.mes))}</h1>
    </header>

    <section class="seccion" aria-labelledby="resumen">
      <h2 id="resumen">Resumen</h2>
      <div class="resumen">
        <p class="dato"><strong>${pluralizar(resumen.totalMinutos, "minuto", "minutos")}</strong>Total</p>
        <p class="dato"><strong>${pluralizar(resumen.totalSesiones, "sesión", "sesiones")}</strong>Sesiones válidas</p>
        <p class="dato"><strong>${pluralizar(resumen.diasEstudiados, "día estudiado", "días estudiados")}</strong>Días con actividad</p>
        <p class="dato"><strong>${pluralizar(resumen.temasDistintos, "tema distinto", "temas distintos")}</strong>Temas agrupados</p>
      </div>
    </section>

    <section class="seccion" aria-labelledby="metricas">
      <h2 id="metricas">Métricas</h2>
      <div class="resumen">
        <p class="dato"><strong>${formatearPromedio(resumen.promedioMinutosPorSesion)}</strong>Promedio por sesión</p>
        <p class="dato"><strong>${formatearPromedio(resumen.promedioMinutosPorDiaEstudiado)}</strong>Promedio por día estudiado</p>
        <p class="dato"><strong>${pluralizar(maximoSesiones, "minuto", "minutos")}</strong>${etiquetaSesionesMaximas}: ${fechasSesionesMaximas}</p>
        <p class="dato"><strong>${pluralizar(maximoDias, "minuto", "minutos")}</strong>${etiquetaDiasMaximos}: ${fechasDiasMaximos}</p>
      </div>
    </section>

    <section class="seccion" aria-labelledby="distribucion">
      <h2 id="distribucion">Distribución diaria</h2>
      <table>
        <thead><tr><th scope="col">Fecha</th><th scope="col">Minutos</th></tr></thead>
        <tbody>${filasDias}</tbody>
      </table>
    </section>

    <section class="seccion" aria-labelledby="temas">
      <h2 id="temas">Temas</h2>
      <table>
        <thead><tr><th scope="col">Tema</th><th scope="col">Minutos</th></tr></thead>
        <tbody>${filasTemas}</tbody>
      </table>
    </section>

    <section class="seccion" aria-labelledby="sesiones">
      <h2 id="sesiones">Sesiones</h2>
      <table>
        <thead><tr><th scope="col">Fecha</th><th scope="col">Tema</th><th scope="col">Minutos</th></tr></thead>
        <tbody>${filasSesiones}</tbody>
      </table>
    </section>
  </main>
</body>
</html>`;
}

function construirModeloInforme(sesiones, mes, hoy) {
  const sesionesDelMes = filtrarSesionesDelMes(sesiones, mes, hoy);
  if (sesionesDelMes.length === 0) {
    return { exportable: false, sesiones: [] };
  }

  const sesionesOrdenadas = ordenarSesionesInforme(sesionesDelMes);
  const minutosPorDia = agruparMinutosPorDia(sesionesOrdenadas, mes, hoy);
  const minutosPorTema = agruparMinutosPorTema(sesionesOrdenadas);

  return Object.freeze({
    exportable: true,
    mes,
    sesiones: Object.freeze(sesionesOrdenadas),
    minutosPorDia,
    minutosPorTema,
    resumen: Object.freeze(
      calcularResumenInforme(sesionesOrdenadas, minutosPorDia, minutosPorTema)
    )
  });
}

function obtenerEstadoExportacion(sesiones, hoy) {
  const meses = obtenerMesesDisponibles(sesiones, hoy).map((mes) => {
    const nombre = formatearMes(mes);
    return {
      valor: mes,
      etiqueta: nombre.charAt(0).toLocaleUpperCase("es-ES") + nombre.slice(1)
    };
  });

  if (meses.length === 0) {
    return {
      meses,
      puedeExportar: false,
      mensaje: "Todavía no hay meses con sesiones válidas para exportar."
    };
  }

  return { meses, puedeExportar: true, mensaje: "" };
}

function ejecutarExportacion(sesiones, mes, hoy, descargar) {
  const modelo = typeof mes === "string" && mes
    ? construirModeloInforme(sesiones, mes, hoy)
    : { exportable: false };

  if (!modelo.exportable) {
    return {
      estado: "sin-datos",
      mensaje: "No hay datos válidos para generar el informe de ese mes."
    };
  }

  try {
    descargar(generarHTMLInforme(modelo), `informe-estudio-${mes}.html`);
  } catch {
    return {
      estado: "error",
      mensaje: "No se pudo generar o descargar el informe. Inténtalo de nuevo."
    };
  }

  return {
    estado: "exito",
    mensaje: `Informe de ${formatearMes(mes)} generado correctamente.`
  };
}

function leerSesiones() {
  try {
    const sesiones = JSON.parse(localStorage.getItem(CLAVE_SESIONES));
    return Array.isArray(sesiones) ? sesiones : [];
  } catch {
    return [];
  }
}

function guardarSesiones(sesiones) {
  localStorage.setItem(CLAVE_SESIONES, JSON.stringify(sesiones));
}

function calcularRacha(sesiones) {
  const diasEstudiados = new Set(sesiones.map((sesion) => sesion.fecha));
  const hoy = new Date();

  // Si hoy está vacío, se empieza a contar desde ayer: el día aún no ha terminado.
  if (!diasEstudiados.has(fechaLocal(hoy))) {
    hoy.setDate(hoy.getDate() - 1);
  }

  let racha = 0;
  while (diasEstudiados.has(fechaLocal(hoy))) {
    racha++;
    hoy.setDate(hoy.getDate() - 1);
  }

  return racha;
}

function calcularMejorRacha(sesiones) {
  const hoy = fechaLocal();
  const diasEstudiados = [...new Set(
    sesiones
      .map((sesion) => sesion.fecha)
      .filter((fecha) => fecha <= hoy)
  )].sort();

  let mejorRacha = 0;
  let rachaActual = 0;
  let diaAnterior = null;

  diasEstudiados.forEach((fecha) => {
    if (diaAnterior && esDiaSiguiente(diaAnterior, fecha)) {
      rachaActual++;
    } else {
      rachaActual = 1;
    }

    mejorRacha = Math.max(mejorRacha, rachaActual);
    diaAnterior = fecha;
  });

  return mejorRacha;
}

function esDiaSiguiente(fechaAnterior, fechaSiguiente) {
  const [año, mes, dia] = fechaAnterior.split("-").map(Number);
  const siguiente = new Date(año, mes - 1, dia);
  siguiente.setDate(siguiente.getDate() + 1);
  return fechaLocal(siguiente) === fechaSiguiente;
}

function calcularMinutosSemana(sesiones) {
  const hoy = new Date();
  const diasDesdeLunes = hoy.getDay() === 0 ? 6 : hoy.getDay() - 1;
  const inicioSemana = new Date(hoy);
  inicioSemana.setDate(hoy.getDate() - diasDesdeLunes);
  const finSemana = new Date(inicioSemana);
  finSemana.setDate(inicioSemana.getDate() + 6);
  const primeraFecha = fechaLocal(inicioSemana);
  const ultimaFecha = fechaLocal(finSemana);

  return sesiones
    .filter((sesion) => sesion.fecha >= primeraFecha && sesion.fecha <= ultimaFecha && sesion.fecha <= fechaLocal(hoy))
    .reduce((total, sesion) => total + sesion.minutos, 0);
}

function calcularDiasEstudiadosMes(sesiones) {
  const hoy = fechaLocal();
  const mesActual = hoy.slice(0, 7);

  return new Set(
    sesiones
      .filter((sesion) => sesion.fecha.slice(0, 7) === mesActual && sesion.fecha <= hoy)
      .map((sesion) => sesion.fecha)
  ).size;
}

function obtenerMesesEstudiados(sesiones) {
  const hoy = fechaLocal();
  const meses = new Map();

  sesiones
    .filter((sesion) => sesion.fecha <= hoy)
    .forEach((sesion) => {
      const mes = sesion.fecha.slice(0, 7);

      if (!meses.has(mes)) {
        meses.set(mes, { minutos: 0, cursos: new Set() });
      }

      const datosDelMes = meses.get(mes);
      datosDelMes.minutos += Number(sesion.minutos);
      datosDelMes.cursos.add(sesion.tema.trim().toLocaleLowerCase());
    });

  return meses;
}

function formatearMes(mes) {
  const [año, numeroMes] = mes.split("-").map(Number);
  return new Intl.DateTimeFormat("es-ES", {
    month: "long",
    year: "numeric"
  }).format(new Date(año, numeroMes - 1, 1));
}

function mostrarMesesDestacados(sesiones) {
  const meses = [...obtenerMesesEstudiados(sesiones).entries()];

  if (meses.length === 0) {
    elementoMesMasMinutos.textContent = "Sin datos";
    elementoMesMasCursos.textContent = "Sin datos";
    return;
  }

  const mesMasMinutos = [...meses].sort((a, b) => {
    if (b[1].minutos !== a[1].minutos) return b[1].minutos - a[1].minutos;
    return b[0].localeCompare(a[0]);
  })[0];
  const mesMasCursos = [...meses].sort((a, b) => {
    if (b[1].cursos.size !== a[1].cursos.size) return b[1].cursos.size - a[1].cursos.size;
    return b[0].localeCompare(a[0]);
  })[0];

  elementoMesMasMinutos.textContent = `${formatearMes(mesMasMinutos[0])} · ${mesMasMinutos[1].minutos} min`;
  elementoMesMasCursos.textContent = `${formatearMes(mesMasCursos[0])} · ${mesMasCursos[1].cursos.size} cursos`;
}

function obtenerDetalleCelda(celda) {
  const fecha = formatearFecha(celda.fecha);
  if (celda.futura) return `${fecha}: Día futuro`;
  if (celda.minutos === 0) return `${fecha}: Sin estudiar`;
  return `${fecha}: ${celda.minutos} minutos`;
}

function mostrarMapaCalor(sesiones) {
  if (!mapaCalor) return;

  const mapa = construirMapaCalor(sesiones, new Date());
  const semanas = mapa.celdas.filter((_, indice) => indice % 7 === 0);

  mesesMapaCalor.innerHTML = semanas.map((celda, indice) => {
    const mes = celda.fecha.slice(0, 7);
    const mesAnterior = indice > 0 ? semanas[indice - 1].fecha.slice(0, 7) : null;
    const nombreMes = indice === 0 || mes !== mesAnterior
      ? formatearMes(mes).split(" de ")[0]
      : "";
    return `<span>${nombreMes}</span>`;
  }).join("");

  mapaCalor.innerHTML = mapa.celdas.map((celda) => `
    <button
      type="button"
      class="celda-calor nivel-${celda.nivel}${celda.futura ? " celda-calor--futura" : ""}"
      role="gridcell"
      aria-label="${escaparHTML(obtenerDetalleCelda(celda))}"
      title="${escaparHTML(obtenerDetalleCelda(celda))}"
    ></button>
  `).join("");
}

function mostrarMensajeInforme(estado, mensaje) {
  if (!estadoInforme) return;

  estadoInforme.textContent = mensaje;
  estadoInforme.dataset.estado = estado;
}

function mostrarExportacion(sesiones) {
  if (!selectorMesInforme) return;

  const estado = obtenerEstadoExportacion(sesiones, new Date());
  const mesSeleccionado = selectorMesInforme.value;

  selectorMesInforme.innerHTML = estado.meses.map((mes) => `
    <option value="${escaparHTML(mes.valor)}">${escaparHTML(mes.etiqueta)}</option>
  `).join("");

  if (estado.meses.some((mes) => mes.valor === mesSeleccionado)) {
    selectorMesInforme.value = mesSeleccionado;
  }

  selectorMesInforme.disabled = !estado.puedeExportar;
  botonExportarInforme.disabled = !estado.puedeExportar;

  if (!estado.puedeExportar) {
    mostrarMensajeInforme("vacio", estado.mensaje);
  } else if (estadoInforme.dataset.estado === "vacio") {
    mostrarMensajeInforme("", "");
  }
}

function prepararDescarga(html, nombre) {
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  return { blob, nombre };
}

function obtenerEntornoNavegador() {
  if (typeof document === "undefined") {
    throw new Error("La descarga solo está disponible en el navegador.");
  }

  return {
    documento: document,
    URL,
    setTimeout: (accion) => setTimeout(accion, 1000)
  };
}

function descargarInforme(html, nombre, entorno = obtenerEntornoNavegador()) {
  const { blob } = prepararDescarga(html, nombre);
  const url = entorno.URL.createObjectURL(blob);
  const enlace = entorno.documento.createElement("a");

  enlace.href = url;
  enlace.download = nombre;
  entorno.documento.body.appendChild(enlace);

  try {
    enlace.click();
  } finally {
    enlace.remove();
    entorno.setTimeout(() => entorno.URL.revokeObjectURL(url));
  }
}

function obtenerTopSesiones(sesiones) {
  const hoy = fechaLocal();

  return sesiones
    .filter((sesion) => sesion.fecha <= hoy)
    .sort((a, b) => {
      if (b.minutos !== a.minutos) return b.minutos - a.minutos;
      if (a.fecha !== b.fecha) return b.fecha.localeCompare(a.fecha);
      return b.creadaEn - a.creadaEn;
    })
    .slice(0, 3);
}

function mostrarTopSesiones(sesiones) {
  const mejoresSesiones = obtenerTopSesiones(sesiones);

  if (mejoresSesiones.length === 0) {
    topSesiones.innerHTML = '<p class="vacio">Todavía no hay sesiones registradas.</p>';
    return;
  }

  topSesiones.innerHTML = mejoresSesiones.map((sesion, indice) => `
    <article class="top-sesion">
      <span class="top-sesion__posicion">${indice + 1}</span>
      <div class="top-sesion__datos">
        <p class="top-sesion__tema">${escaparHTML(sesion.tema)}</p>
        <p class="top-sesion__fecha">${formatearFecha(sesion.fecha)}</p>
      </div>
      <p class="top-sesion__minutos">${sesion.minutos} min</p>
    </article>
  `).join("");
}

function mostrarSesiones() {
  const sesiones = leerSesiones().sort((a, b) => {
    if (a.fecha !== b.fecha) return b.fecha.localeCompare(a.fecha);
    return b.creadaEn - a.creadaEn;
  });

  elementoRacha.textContent = calcularRacha(sesiones);
  elementoMejorRacha.textContent = calcularMejorRacha(sesiones);
  elementoMinutosSemana.textContent = calcularMinutosSemana(sesiones);
  elementoDiasMes.textContent = calcularDiasEstudiadosMes(sesiones);
  mostrarMesesDestacados(sesiones);
  mostrarMapaCalor(sesiones);
  mostrarExportacion(sesiones);
  mostrarTopSesiones(sesiones);

  if (sesiones.length === 0) {
    listaSesiones.innerHTML = '<p class="vacio">Todavía no hay sesiones registradas.</p>';
    return;
  }

  listaSesiones.innerHTML = sesiones.map((sesion) => `
    <article class="sesion">
      <div>
        <p class="sesion__tema">${escaparHTML(sesion.tema)}</p>
        <p class="sesion__fecha">${formatearFecha(sesion.fecha)}</p>
      </div>
      <p class="sesion__minutos">${sesion.minutos} min</p>
    </article>
  `).join("");
}

function formatearFecha(fecha) {
  const [año, mes, dia] = fecha.split("-");
  return `${dia}/${mes}/${año}`;
}

function escaparHTML(texto) {
  return texto.replace(/[&<>'"]/g, (caracter) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#039;",
    '"': "&quot;"
  }[caracter]));
}

if (formulario) {
  campoFecha.value = fechaLocal();

  formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();

    const sesiones = leerSesiones();
    sesiones.push({
      fecha: campoFecha.value,
      tema: campoTema.value.trim(),
      minutos: Number(campoMinutos.value),
      creadaEn: Date.now()
    });

    guardarSesiones(sesiones);
    formulario.reset();
    campoFecha.value = fechaLocal();
    mostrarSesiones();
  });

  mostrarSesiones();
}

if (botonExportarInforme) {
  botonExportarInforme.addEventListener("click", () => {
    const resultado = ejecutarExportacion(
      leerSesiones(),
      selectorMesInforme.value,
      new Date(),
      descargarInforme
    );

    mostrarExportacion(leerSesiones());
    mostrarMensajeInforme(resultado.estado, resultado.mensaje);
  });
}

if (mapaCalor) {
  mapaCalor.addEventListener("click", (evento) => {
    const celda = evento.target.closest(".celda-calor");
    if (celda && detalleMapaCalor) {
      detalleMapaCalor.textContent = celda.getAttribute("aria-label");
    }
  });
}

if (typeof module !== "undefined") {
  module.exports = {
    crearRangoMapa,
    esFechaValida,
    agruparMinutosPorDiaMapa,
    calcularNivel,
    construirMapaCalor,
    obtenerDetalleCelda,
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
    ejecutarExportacion,
    prepararDescarga,
    descargarInforme
  };
}
