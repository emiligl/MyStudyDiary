const CLAVE_SESIONES = "diario-de-estudio-sesiones";

const formulario = document.querySelector("#formulario-sesion");
const campoFecha = document.querySelector("#fecha");
const campoTema = document.querySelector("#tema");
const campoMinutos = document.querySelector("#minutos");
const listaSesiones = document.querySelector("#lista-sesiones");
const topSesiones = document.querySelector("#top-sesiones");
const elementoRacha = document.querySelector("#racha");
const elementoMejorRacha = document.querySelector("#mejor-racha");
const elementoMinutosSemana = document.querySelector("#minutos-semana");
const elementoDiasMes = document.querySelector("#dias-mes");
const elementoMesMasMinutos = document.querySelector("#mes-mas-minutos");
const elementoMesMasCursos = document.querySelector("#mes-mas-cursos");

function fechaLocal(fecha = new Date()) {
  const año = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${año}-${mes}-${dia}`;
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
