import "./styles/base.css";
import "./styles/components.css";
import "./styles/home.css";
import "./styles/board.css";
import "./styles/battlefield.css";
import "./styles/cinematica.css";

// =========================================================
// 2. MÓDULOS DE LÓGICA Y VISTAS
// =========================================================
import { inicializarInicio } from "./views/homeView.js";
import { inicializarExplorador } from "./views/explorerView.js";
import { iniciarScrollEngine } from "./utils/scrollEngine.js";
import {
  iniciarVientoFondo,
  dispararRafagaBelica,
  pausarCenizas,
} from "./components/WindGusts.js";
import {
  iniciarFondoInmersivo,
  dispararOleadaMarea,
  fijarModoTelonNegro,
} from "./components/ImmersiveBackground.js";
import { reproducirCinematica } from "./views/cinematicaView.js";

// =========================================================
// 3. ARRANQUE CON REVELACIÓN TEATRAL
// =========================================================
// 1. Capturamos la promesa de carga del fondo WebGL
const promesaFondo = iniciarFondoInmersivo();

// 2. Arrancamos los demás motores y vistas
iniciarVientoFondo();
iniciarScrollEngine();
inicializarInicio();
inicializarExplorador();

// 3. Tiempo límite de seguridad (máximo 2.5s) y comprobación de fuentes
const tiempoLimiteSeguridad = new Promise((resolve) =>
  setTimeout(resolve, 2500),
);
const fuentesListas = document.fonts ? document.fonts.ready : Promise.resolve();

// 4. En cuanto todo está listo en GPU y tipografía, florece la atmósfera
Promise.race([
  Promise.all([promesaFondo, fuentesListas]),
  tiempoLimiteSeguridad,
]).then(() => {
  document.body.classList.add("escena-lista");
});

// =========================================================
// 4. REGISTRO DE ELEMENTOS Y VISTAS
// =========================================================
const cabecera = document.querySelector("#cabecera-principal");
const navNodosHome = document.querySelector("#nav-nodos-home");

const btnVolverHome = document.querySelector("#btn-volver-home");
const btnExplorador = document.querySelector("#btn-explorador");
const btnPizarra = document.querySelector("#btn-pizarra");

const nodoPortada = document.querySelector("#nodo-portada");
const nodoActualidad = document.querySelector("#nodo-actualidad");
const nodoInicio = document.querySelector("#nodo-inicio");

const vistas = {
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
  cinematica: {
    el: document.querySelector("#vista-cinematica"),
    dominio: "cinematica",
  },
  inicio: {
    el: document.querySelector("#vista-inicio"),
    dominio: "editorial",
    nodo: nodoInicio,
  },
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

// =========================================================
// 5. ENRUTADOR CENTRAL DE TRANSICIONES
// =========================================================
export async function navegarA(nombreVista, conPreDelay = false) {
  if (enTransicion) return;

  const entradaActual = Object.entries(vistas).find(
    ([_, v]) => v.el && !v.el.classList.contains("vista-oculta"),
  );

  if (entradaActual && entradaActual[0] === nombreVista) return;

  const vistaDestino = vistas[nombreVista];
  if (!vistaDestino) return;

  enTransicion = true;

  // ===========================================================
  // CASO EXCLUSIVO: CINEMÁTICA DEL GORRO (ENTRE PESTAÑA 2 Y 3)
  // ===========================================================
  if (nombreVista === "cinematica") {
    // 1. Apagamos TODO lo que cruza desde la derecha
    pausarCenizas(true);

    // 2. El fondo de WebGL conquista el 100% de la pantalla
    fijarModoTelonNegro("total");

    if (entradaActual && entradaActual[1].el) {
      entradaActual[1].el.classList.add("actualidad-salida-arriba");
    }
    if (cabecera) cabecera.classList.add("vista-oculta");
    if (navNodosHome) navNodosHome.classList.add("vista-oculta");

    await esperar(800);

    if (entradaActual && entradaActual[1].el) {
      entradaActual[1].el.classList.remove("actualidad-salida-arriba");
      entradaActual[1].el.classList.add("vista-oculta");
    }

    vistaDestino.el.classList.remove("vista-oculta");
    enTransicion = false;

    // 3. Al terminar la película y dar paso a la Pestaña 3:
    reproducirCinematica(() => {
      // REACTIVAMOS las cenizas y partículas de la derecha para la Pestaña 3
      pausarCenizas(false);

      vistaDestino.el.classList.add("vista-oculta");
      navegarA("inicio");
    });
    return;
  }

  // Si salimos de la cinemática por cualquier vía, garantizamos cenizas activas
  pausarCenizas(false);

  const elCinematica = document.querySelector("#vista-cinematica");
  if (elCinematica) elCinematica.classList.add("vista-oculta");

  // Ráfaga normal para las demás transiciones
  dispararRafagaBelica();

  // Control del telón negro: solo activo en la Pestaña 2
  if (nombreVista === "actualidad") {
    fijarModoTelonNegro("parcial");
  } else {
    fijarModoTelonNegro("apagado");
  }

  const origenEsEditorial = entradaActual
    ? entradaActual[1].dominio === "editorial"
    : false;
  const destinoEsEditorial = vistaDestino.dominio === "editorial";
  const esViajeEditorial = origenEsEditorial && destinoEsEditorial;

  // -----------------------------------------------------------
  // CANAL A: TRANSICIÓN ENTRE PESTAÑAS DEL HOME (PORTADA / ACTUALIDAD / INICIO)
  // -----------------------------------------------------------
  if (esViajeEditorial) {
    if (conPreDelay) {
      await esperar(500); // Calma previa al pulsar "CONGRESO"
    }

    if (entradaActual && entradaActual[1].el) {
      const elActual = entradaActual[1].el;
      elActual.classList.add("editorial-salida");
      await esperar(420);
      elActual.classList.remove("editorial-salida");
      elActual.classList.add("vista-oculta");
    }

    const esLimpia = nombreVista === "portada" || nombreVista === "actualidad";
    if (cabecera) cabecera.classList.toggle("vista-oculta", esLimpia);
    if (navNodosHome)
      navNodosHome.classList.toggle("vista-oculta", nombreVista === "portada");

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
    // CANAL B: TRANSICIÓN OPERATIVA (HERRAMIENTAS CON OLEADA)
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

    await esperar(1600); // Reflujo al 30%

    if (vistaDestino.el) {
      vistaDestino.el.classList.remove("vista-oculta");
      vistaDestino.el.classList.add("operativa-entrada-izquierda");
      await esperar(1250);
      vistaDestino.el.classList.remove("operativa-entrada-izquierda");
    }
  }

  enTransicion = false;
}

// =========================================================
// 6. OYENTES DE EVENTOS Y BOTONES
// =========================================================

// Círculos anónimos del Home
if (nodoPortada)
  nodoPortada.addEventListener("click", () => navegarA("portada"));
if (nodoActualidad)
  nodoActualidad.addEventListener("click", () => navegarA("actualidad"));
if (nodoInicio) nodoInicio.addEventListener("click", () => navegarA("inicio"));

// Barra de herramientas superior
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

// Disparador 1: "CONGRESO" (Viaja a Actualidad)
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

// Disparador 2: "ACTUALIDAD" (Dispara la cinemática histórica)
const triggerActualidad = document.querySelector("#trigger-actualidad");
if (triggerActualidad) {
  triggerActualidad.addEventListener("click", () => navegarA("cinematica"));
  triggerActualidad.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      navegarA("cinematica");
    }
  });
}

// =========================================================
// 7. ESTADO INICIAL GARANTIZADO AL ENTRAR
// =========================================================
if (cabecera) cabecera.classList.add("vista-oculta");
if (navNodosHome) navNodosHome.classList.add("vista-oculta");
if (nodoPortada) nodoPortada.classList.add("activo");
if (nodoActualidad) nodoActualidad.classList.remove("activo");
if (nodoInicio) nodoInicio.classList.remove("activo");

import datos from "./data/proyectos.json";

// =========================================================
// BUSCADOR EN VIVO DE LA CABECERA BLANCA
// =========================================================
const inputBusquedaCabecera = document.querySelector(
  "#input-buscador-cabecera",
);
const dropdownResultados = document.querySelector(
  "#dropdown-resultados-cabecera",
);
const logoNavCongreso = document.querySelector("#logo-nav-congreso");

// Al hacer clic en el logo "CONGRESO" de la barra, volvemos a la Portada
if (logoNavCongreso) {
  logoNavCongreso.addEventListener("click", () => {
    navegarA("portada");
  });
}

// Búsqueda reactiva mientras el usuario escribe
if (inputBusquedaCabecera && dropdownResultados) {
  inputBusquedaCabecera.addEventListener("input", (e) => {
    const termino = e.target.value.toLowerCase().trim();

    if (termino.length === 0) {
      dropdownResultados.classList.add("vista-oculta");
      dropdownResultados.innerHTML = "";
      return;
    }

    // Filtrar documentos por título, descripción o categoría
    const coincidentes = datos.filter((doc) => {
      const tit = (doc.titulo || "").toLowerCase();
      const desc = (doc.descripcion || "").toLowerCase();
      const cat = (doc.categoria || "").toLowerCase();
      return (
        tit.includes(termino) || desc.includes(termino) || cat.includes(termino)
      );
    });

    if (coincidentes.length === 0) {
      dropdownResultados.innerHTML = `
        <div style="padding: 0.8rem; text-align: center; color: #71717a; font-size: 0.8rem;">
          No se encontraron documentos
        </div>
      `;
    } else {
      dropdownResultados.innerHTML = coincidentes
        .slice(0, 5)
        .map(
          (doc) => `
        <div class="item-resultado-rapido" data-enlace="${doc.enlace}">
          <span class="titulo-item-rapido">${doc.titulo}</span>
          <span class="categoria-item-rapido">${doc.categoria} · Abrir Documento ↗</span>
        </div>
      `,
        )
        .join("");

      // Clic para abrir el documento directamente
      dropdownResultados
        .querySelectorAll(".item-resultado-rapido")
        .forEach((item) => {
          item.addEventListener("click", () => {
            const enlace = item.dataset.enlace;
            if (enlace && enlace !== "#") {
              window.open(enlace, "_blank");
            }
            dropdownResultados.classList.add("vista-oculta");
            inputBusquedaCabecera.value = "";
          });
        });
    }

    dropdownResultados.classList.remove("vista-oculta");
  });

  // Cerrar el desplegable si se hace clic fuera de la cabecera
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".utilidad-derecha-buscador")) {
      dropdownResultados.classList.add("vista-oculta");
    }
  });
}

// =========================================================
// INTERACCIÓN MÓVIL: CAJÓN IZQUIERDO Y BUSCADOR DERECHO
// =========================================================
const btnHamburguesa = document.querySelector("#btn-hamburguesa-movil");
const btnLupaMovil = document.querySelector("#btn-lupa-movil");
const backdropMovil = document.querySelector("#backdrop-movil");

const drawerMenu = document.querySelector("#drawer-menu-movil");
const btnCerrarMenu = document.querySelector("#btn-cerrar-menu-movil");

const drawerBuscador = document.querySelector("#drawer-buscador-movil");
const btnCerrarBuscador = document.querySelector("#btn-cerrar-buscador-movil");
const inputBuscadorDrawer = document.querySelector("#input-buscador-drawer");
const resultadosDrawer = document.querySelector("#resultados-drawer-movil");

// Botones dentro del cajón izquierdo
const btnMovilHome = document.querySelector("#btn-movil-home");
const btnMovilExplorador = document.querySelector("#btn-movil-explorador");
const btnMovilPizarra = document.querySelector("#btn-movil-pizarra");

function cerrarTodosDrawers() {
  if (drawerMenu) drawerMenu.classList.add("vista-oculta");
  if (drawerBuscador) drawerBuscador.classList.add("vista-oculta");
  if (backdropMovil) backdropMovil.classList.add("vista-oculta");
}

// 1. Abrir Cajón Izquierdo (Menú con Blur)
if (btnHamburguesa && drawerMenu && backdropMovil) {
  btnHamburguesa.addEventListener("click", () => {
    cerrarTodosDrawers();
    drawerMenu.classList.remove("vista-oculta");
    backdropMovil.classList.remove("vista-oculta");
  });
}

if (btnCerrarMenu) btnCerrarMenu.addEventListener("click", cerrarTodosDrawers);

// Navegación desde el cajón izquierdo móvil
if (btnMovilHome) {
  btnMovilHome.addEventListener("click", () => {
    cerrarTodosDrawers();
    navegarA("inicio");
  });
}

if (btnMovilExplorador) {
  btnMovilExplorador.addEventListener("click", () => {
    cerrarTodosDrawers();
    navegarA("explorador");
  });
}

if (btnMovilPizarra) {
  btnMovilPizarra.addEventListener("click", () => {
    cerrarTodosDrawers();
    navegarA("pizarra");
  });
}

// 2. Abrir Cajón Derecho (Buscador estilo referencia)
if (btnLupaMovil && drawerBuscador && backdropMovil) {
  btnLupaMovil.addEventListener("click", () => {
    cerrarTodosDrawers();
    drawerBuscador.classList.remove("vista-oculta");
    backdropMovil.classList.remove("vista-oculta");
    renderizarSugerenciasIniciales();
    setTimeout(() => {
      if (inputBuscadorDrawer) inputBuscadorDrawer.focus();
    }, 150);
  });
}

if (btnCerrarBuscador)
  btnCerrarBuscador.addEventListener("click", cerrarTodosDrawers);
if (backdropMovil) backdropMovil.addEventListener("click", cerrarTodosDrawers);

// Cargar sugerencias por defecto en el cajón de búsqueda
function renderizarSugerenciasIniciales() {
  if (!resultadosDrawer) return;
  const categoriasUnicas = [
    ...new Set(datos.map((d) => d.categoria || "General")),
  ];
  resultadosDrawer.innerHTML = categoriasUnicas
    .slice(0, 6)
    .map(
      (cat) => `
    <div class="item-sugerencia-drawer" data-categoria="${cat}">
      ${cat}
    </div>
  `,
    )
    .join("");

  // Tocar una categoría abre el explorador filtrado
  resultadosDrawer
    .querySelectorAll(".item-sugerencia-drawer")
    .forEach((item) => {
      item.addEventListener("click", () => {
        const cat = item.dataset.categoria;
        cerrarTodosDrawers();
        navegarA("explorador");
        const filtroSelect = document.querySelector("#filtro-categoria");
        if (filtroSelect) {
          filtroSelect.value = cat;
          filtroSelect.dispatchEvent(new Event("change"));
        }
      });
    });
}

// Búsqueda en vivo dentro del cajón móvil
if (inputBuscadorDrawer && resultadosDrawer) {
  inputBuscadorDrawer.addEventListener("input", (e) => {
    const termino = e.target.value.toLowerCase().trim();

    if (termino.length === 0) {
      renderizarSugerenciasIniciales();
      return;
    }

    const coincidentes = datos.filter((d) => {
      const tit = (d.titulo || "").toLowerCase();
      const desc = (d.descripcion || "").toLowerCase();
      const cat = (d.categoria || "").toLowerCase();
      return (
        tit.includes(termino) || desc.includes(termino) || cat.includes(termino)
      );
    });

    if (coincidentes.length === 0) {
      resultadosDrawer.innerHTML = `
        <div style="padding: 1rem 0; color: #71717a; font-size: 0.85rem;">
          No se encontraron coincidencias.
        </div>
      `;
    } else {
      resultadosDrawer.innerHTML = coincidentes
        .slice(0, 6)
        .map(
          (d) => `
        <div class="item-resultado-rapido" data-enlace="${d.enlace}">
          <span class="titulo-item-rapido">${d.titulo}</span>
          <span class="categoria-item-rapido">${d.categoria} · Ver PDF ↗</span>
        </div>
      `,
        )
        .join("");

      resultadosDrawer
        .querySelectorAll(".item-resultado-rapido")
        .forEach((item) => {
          item.addEventListener("click", () => {
            const enlace = item.dataset.enlace;
            if (enlace && enlace !== "#") window.open(enlace, "_blank");
            cerrarTodosDrawers();
          });
        });
    }
  });
}
