// =========================================================
// IMPORTACIÓN MODULAR DE ESTILOS
// =========================================================
import "./styles/base.css";
import "./styles/components.css";
import "./styles/home.css";
import "./styles/board.css";
import "./styles/battlefield.css";

// Módulos de lógica y vistas
import { inicializarInicio } from "./views/homeView.js";
import { inicializarExplorador } from "./views/explorerView.js";
import { iniciarScrollEngine } from "./utils/scrollEngine.js";
import {
  iniciarVientoFondo,
  dispararRafagaBelica,
} from "./components/WindGusts.js";
import {
  iniciarFondoInmersivo,
  dispararOleadaMarea,
  activarTelonNegro,
} from "./components/ImmersiveBackground.js";

// 1. Activar fondo inmersivo y atmósfera bélica
iniciarFondoInmersivo();
iniciarVientoFondo();

// 2. Activar motor de cálculo de scroll
iniciarScrollEngine();

// 3. Inicializar vistas (Acto 2 y Acto 3)
inicializarInicio();
inicializarExplorador();

// -------------------------------------------------------------
// 4. REGISTRO DE JERARQUÍAS (TRÍPTICO EDITORIAL + HERRAMIENTAS)
// -------------------------------------------------------------
const cabecera = document.querySelector("#cabecera-principal");
const navNodosHome = document.querySelector("#nav-nodos-home");

const btnVolverHome = document.querySelector("#btn-volver-home");
const btnExplorador = document.querySelector("#btn-explorador");
const btnPizarra = document.querySelector("#btn-pizarra");

const nodoPortada = document.querySelector("#nodo-portada");
const nodoActualidad = document.querySelector("#nodo-actualidad");
const nodoInicio = document.querySelector("#nodo-inicio");

const vistas = {
  // TRÍPTICO EDITORIAL (HOME)
  portada: {
    el: document.querySelector("#vista-portada"),
    dominio: "editorial",
    nodo: nodoPortada,
  },
  actualidad: {
    el: document.querySelector("#vista-actualidad"),
    dominio: "editorial",
    nodo: nodoActualidad,
  },
  inicio: {
    el: document.querySelector("#vista-inicio"),
    dominio: "editorial",
    nodo: nodoInicio,
  },
  // HERRAMIENTAS OPERATIVAS
  explorador: {
    el: document.querySelector("#vista-explorador"),
    dominio: "operativo",
    btn: btnExplorador,
  },
  pizarra: {
    el: document.querySelector("#vista-pizarra"),
    dominio: "operativo",
    btn: btnPizarra,
  },
};

let pizarraYaIniciada = false;
let enTransicion = false;

const esperar = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * ENRUTADOR CON TRÍPTICO EDITORIAL Y REGLA DEL TELÓN NEGRO
 */
export async function navegarA(nombreVista, conPreDelay = false) {
  if (enTransicion) return;

  const entradaActual = Object.entries(vistas).find(
    ([_, v]) => v.el && !v.el.classList.contains("vista-oculta"),
  );

  if (entradaActual && entradaActual[0] === nombreVista) return;

  const vistaDestino = vistas[nombreVista];
  if (!vistaDestino) return;

  enTransicion = true;

  // Ráfaga bélica de refuerzos en cada viaje
  dispararRafagaBelica();

  // REGLA DE ORO DEL TELÓN NEGRO:
  // Se activa ÚNICAMENTE en la Pestaña 2 ('actualidad').
  // En Portada (1) e Inicio (3) se apaga, mostrando el Fondo A.
  activarTelonNegro(nombreVista === "actualidad");

  const origenEsEditorial = entradaActual
    ? entradaActual[1].dominio === "editorial"
    : false;
  const destinoEsEditorial = vistaDestino.dominio === "editorial";
  const esViajeEditorial = origenEsEditorial && destinoEsEditorial;

  // -----------------------------------------------------------
  // CANAL A: TRANSICIÓN ENTRE LAS PESTAÑAS DEL HOME (1, 2 y 3)
  // -----------------------------------------------------------
  if (esViajeEditorial) {
    if (conPreDelay) {
      await esperar(500); // Calma tensa al pulsar "CONGRESO"
    }

    if (entradaActual && entradaActual[1].el) {
      const elActual = entradaActual[1].el;
      elActual.classList.add("editorial-salida");
      await esperar(420);
      elActual.classList.remove("editorial-salida");
      elActual.classList.add("vista-oculta");
    }

    // GESTIÓN DE VISIBILIDAD DE CONTROLES
    // Pestañas 1 y 2 son limpias (sin cabecera). La cabecera solo se muestra en la Pestaña 3 (inicio)
    const esLimpia = nombreVista === "portada" || nombreVista === "actualidad";
    if (cabecera) cabecera.classList.toggle("vista-oculta", esLimpia);

    // Los 3 círculos se ocultan en la portada y aparecen en Actualidad e Inicio
    if (navNodosHome)
      navNodosHome.classList.toggle("vista-oculta", nombreVista === "portada");

    // Actualizamos cuál de los 3 círculos está activo
    if (nodoPortada)
      nodoPortada.classList.toggle("activo", nombreVista === "portada");
    if (nodoActualidad)
      nodoActualidad.classList.toggle("activo", nombreVista === "actualidad");
    if (nodoInicio)
      nodoInicio.classList.toggle("activo", nombreVista === "inicio");

    await esperar(40);

    if (vistaDestino.el) {
      vistaDestino.el.classList.remove("vista-oculta");
      vistaDestino.el.classList.add("editorial-entrada");
      await esperar(550);
      vistaDestino.el.classList.remove("editorial-entrada");
    }

    // -----------------------------------------------------------
    // CANAL B: TRANSICIÓN HACIA HERRAMIENTAS (CON OLEADA AL 85%)
    // -----------------------------------------------------------
  } else {
    if (entradaActual && entradaActual[1].el) {
      const elActual = entradaActual[1].el;
      elActual.classList.add("operativa-salida");
      await esperar(180);
      elActual.classList.remove("operativa-salida");
      elActual.classList.add("vista-oculta");
    }

    dispararOleadaMarea();

    if (destinoEsEditorial) {
      const esLimpia =
        nombreVista === "portada" || nombreVista === "actualidad";
      if (cabecera) cabecera.classList.toggle("vista-oculta", esLimpia);
      if (navNodosHome)
        navNodosHome.classList.toggle(
          "vista-oculta",
          nombreVista === "portada",
        );
      if (nodoPortada)
        nodoPortada.classList.toggle("activo", nombreVista === "portada");
      if (nodoActualidad)
        nodoActualidad.classList.toggle("activo", nombreVista === "actualidad");
      if (nodoInicio)
        nodoInicio.classList.toggle("activo", nombreVista === "inicio");
      if (btnVolverHome) btnVolverHome.classList.add("activo");
      if (btnExplorador) btnExplorador.classList.remove("activo");
      if (btnPizarra) btnPizarra.classList.remove("activo");
    } else {
      if (navNodosHome) navNodosHome.classList.add("vista-oculta");
      if (cabecera) cabecera.classList.remove("vista-oculta");
      if (btnVolverHome) btnVolverHome.classList.remove("activo");
      if (btnExplorador)
        btnExplorador.classList.toggle("activo", nombreVista === "explorador");
      if (btnPizarra)
        btnPizarra.classList.toggle("activo", nombreVista === "pizarra");
    }

    await esperar(1600); // Esperar al 30% del reflujo marino

    if (vistaDestino.el) {
      vistaDestino.el.classList.remove("vista-oculta");
      vistaDestino.el.classList.add("operativa-entrada-izquierda");
      await esperar(1250); // Entrada lenta de los datos
      vistaDestino.el.classList.remove("operativa-entrada-izquierda");
    }
  }

  enTransicion = false;
}

// -------------------------------------------------------------
// 5. OYENTES DE CONTROLES
// -------------------------------------------------------------

// Los 3 Círculos Anónimos del Home
if (nodoPortada)
  nodoPortada.addEventListener("click", () => navegarA("portada"));
if (nodoActualidad)
  nodoActualidad.addEventListener("click", () => navegarA("actualidad"));
if (nodoInicio) nodoInicio.addEventListener("click", () => navegarA("inicio"));

// Barra de Herramientas
if (btnVolverHome)
  btnVolverHome.addEventListener("click", () => navegarA("inicio"));
if (btnExplorador)
  btnExplorador.addEventListener("click", () => navegarA("explorador"));

if (btnPizarra) {
  btnPizarra.addEventListener("click", async () => {
    navegarA("pizarra");
    if (!pizarraYaIniciada) {
      const moduloPizarra = await import("./views/boardView.js");
      moduloPizarra.inicializarPizarra();
      pizarraYaIniciada = true;
    }
  });
}

// Disparador 1: Clic en "CONGRESO" (Viaja a Actualidad con pre-delay)
const triggerCongreso = document.querySelector("#titulo-portada-trigger");
if (triggerCongreso) {
  triggerCongreso.addEventListener("click", () => navegarA("actualidad", true));
  triggerCongreso.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      navegarA("actualidad", true);
    }
  });
}

// Disparador 2: Clic en "ACTUALIDAD" (Viaja al Despacho/Inicio)
const triggerActualidad = document.querySelector("#trigger-actualidad");
if (triggerActualidad) {
  triggerActualidad.addEventListener("click", () => navegarA("inicio"));
  triggerActualidad.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      navegarA("inicio");
    }
  });
}

// Arranque inicial en Portada limpia
if (cabecera) cabecera.classList.add("vista-oculta");
if (navNodosHome) navNodosHome.classList.add("vista-oculta");
if (nodoPortada) nodoPortada.classList.add("activo");
if (nodoActualidad) nodoActualidad.classList.remove("activo");
if (nodoInicio) nodoInicio.classList.remove("activo");
