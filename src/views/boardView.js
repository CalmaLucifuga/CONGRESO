import datos from "../data/proyectos.json";
import { renderViewer } from "../components/viewers/ViewerFactory.js";

// Estado de los documentos activos en la mesa
let documentosEnPizarra = [];

export function inicializarPizarra() {
  // Elementos del DOM de la Pizarra
  const listaArrastrables = document.querySelector("#lista-arrastrables");
  const zonaSuelta = document.querySelector("#zona-suelta");
  const btnLimpiar = document.querySelector("#btn-limpiar-pizarra");
  const btnTogglePanel = document.querySelector("#btn-toggle-panel");
  const contenedorPizarra = document.querySelector(".contenedor-pizarra");
  const botonesSplit = document.querySelectorAll(".btn-split");
  const btnPantallaCompleta = document.querySelector("#btn-pantalla-completa");
  const vistaPizarra = document.querySelector("#vista-pizarra");

  // -------------------------------------------------------------
  // 1. PINTAR BARRA LATERAL (Documentos Arrastrables)
  // -------------------------------------------------------------
  function pintarListaLateral() {
    if (!listaArrastrables) {
      console.error(
        "Error: No se encontró el elemento #lista-arrastrables en index.html",
      );
      return;
    }

    if (!datos || datos.length === 0) {
      listaArrastrables.innerHTML = `
        <p style="font-size: 0.85rem; color: #ef4444;">
          No se encontraron proyectos en proyectos.json
        </p>
      `;
      return;
    }

    listaArrastrables.innerHTML = datos
      .map(
        (item) => `
      <div 
        class="item-arrastrable" 
        draggable="true" 
        data-id="${item.id}"
      >
        <h4>${item.titulo || "Sin título"}</h4>
        <span class="badge-mini">${item.categoria || "General"}</span>
      </div>
    `,
      )
      .join("");

    // Activar eventos de inicio y fin de arrastre
    listaArrastrables.querySelectorAll(".item-arrastrable").forEach((ficha) => {
      ficha.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData("text/plain", ficha.dataset.id);
        ficha.classList.add("arrastrando");
      });

      ficha.addEventListener("dragend", () => {
        ficha.classList.remove("arrastrando");
      });
    });
  }

  // -------------------------------------------------------------
  // 2. CONTROLES DE ESPACIO Y SPLIT (Nuevas funciones)
  // -------------------------------------------------------------

  // A. Conmutador de Split (Columnas / Filas / Grid)
  botonesSplit.forEach((btn) => {
    btn.addEventListener("click", () => {
      // Marcar botón activo
      botonesSplit.forEach((b) => b.classList.remove("activo"));
      btn.classList.add("activo");

      // Asignar el atributo a la zona de suelta: CSS se encarga del resto
      const modoElegido = btn.dataset.layout; // 'horizontal', 'vertical' o 'grid'
      zonaSuelta.dataset.layout = modoElegido;
    });
  });

  // B. Ocultar / Mostrar Panel Lateral (Modo Foco)
  if (btnTogglePanel && contenedorPizarra) {
    btnTogglePanel.addEventListener("click", () => {
      contenedorPizarra.classList.toggle("panel-oculto");
      const estaOculto = contenedorPizarra.classList.contains("panel-oculto");
      btnTogglePanel.textContent = estaOculto
        ? "▶ Mostrar Panel"
        : "◀ Ocultar Panel";
    });
  }

  // C. Modo Pantalla Completa
  if (btnPantallaCompleta && vistaPizarra) {
    btnPantallaCompleta.addEventListener("click", () => {
      if (!document.fullscreenElement) {
        vistaPizarra.requestFullscreen().catch((err) => {
          console.warn(
            "El navegador bloqueó la pantalla completa:",
            err.message,
          );
        });
      } else {
        document.exitFullscreen();
      }
    });
  }

  // -------------------------------------------------------------
  // 3. RENDERIZADO DE PANELES EN LA MESA (Con Visores)
  // -------------------------------------------------------------
  function crearHTMLPanel(doc) {
    return `
      <article class="panel-documento" data-id="${doc.id}">
        <header class="cabecera-panel">
          <div class="info-doc">
            <span class="badge-mini">${doc.categoria || "General"}</span>
            <h4 title="${doc.titulo}">${doc.titulo}</h4>
          </div>
          <div class="acciones-panel">
            <button class="btn-accion btn-minimizar" title="Minimizar / Expandir visor">⎯</button>
            <a href="${doc.enlace}" target="_blank" rel="noopener" class="btn-accion" title="Abrir en pestaña nueva">↗</a>
            <button class="btn-accion btn-cerrar" title="Cerrar de la mesa">✕</button>
          </div>
        </header>

        <div class="cuerpo-panel">
          ${renderViewer(doc)}
        </div>

        <footer class="pie-panel">
          <small>Tags: ${(doc.tags || []).join(", ")}</small>
        </footer>
      </article>
    `;
  }

  function conectarEventosPanel(panelElemento, docId) {
    const btnCerrar = panelElemento.querySelector(".btn-cerrar");
    const btnMinimizar = panelElemento.querySelector(".btn-minimizar");

    btnCerrar.addEventListener("click", () => {
      documentosEnPizarra = documentosEnPizarra.filter(
        (d) => String(d.id) !== String(docId),
      );
      panelElemento.remove();
      actualizarEstadoVacio();
      actualizarPanelAnalisis();
    });

    btnMinimizar.addEventListener("click", () => {
      panelElemento.classList.toggle("panel-minimizado");
    });
  }

  function actualizarEstadoVacio() {
    const hayVacio = zonaSuelta.querySelector(".mensaje-zona-vacia");
    if (documentosEnPizarra.length === 0) {
      if (!hayVacio) {
        zonaSuelta.innerHTML = `
          <div class="mensaje-zona-vacia">
            <span class="icono-drop">📥</span>
            <p>Arrastra y suelta documentos aquí para compararlos</p>
          </div>
        `;
      }
    } else if (hayVacio) {
      hayVacio.remove();
    }
  }

  function agregarDocumentoAMesa(doc) {
    actualizarEstadoVacio();
    const template = document.createElement("template");
    template.innerHTML = crearHTMLPanel(doc).trim();
    const nuevoPanel = template.content.firstElementChild;

    zonaSuelta.appendChild(nuevoPanel);
    conectarEventosPanel(nuevoPanel, doc.id);
    actualizarPanelAnalisis();
  }

  // -------------------------------------------------------------
  // 4. EVENTOS DE ARRASTRE Y SUELTA (Drag & Drop)
  // -------------------------------------------------------------
  zonaSuelta.addEventListener("dragover", (e) => {
    e.preventDefault();
    zonaSuelta.classList.add("dragover-activo");
  });

  zonaSuelta.addEventListener("dragleave", () => {
    zonaSuelta.classList.remove("dragover-activo");
  });

  zonaSuelta.addEventListener("drop", (e) => {
    e.preventDefault();
    zonaSuelta.classList.remove("dragover-activo");

    const idArrastrado = e.dataTransfer.getData("text/plain");
    const docEncontrado = datos.find(
      (d) => String(d.id) === String(idArrastrado),
    );

    if (docEncontrado) {
      const yaExiste = documentosEnPizarra.some(
        (d) => String(d.id) === String(docEncontrado.id),
      );
      if (!yaExiste) {
        documentosEnPizarra.push(docEncontrado);
        agregarDocumentoAMesa(docEncontrado);
      }
    }
  });

  // -------------------------------------------------------------
  // 5. ANÁLISIS CONJUNTO Y LIMPIEZA
  // -------------------------------------------------------------
  function actualizarPanelAnalisis() {
    const panel = document.querySelector("#panel-metricas");
    if (!panel) return;

    if (documentosEnPizarra.length < 2) {
      panel.classList.add("vista-oculta");
      return;
    }

    panel.classList.remove("vista-oculta");
    const todasLasTags = documentosEnPizarra.flatMap((d) => d.tags || []);
    const tagsUnicas = [...new Set(todasLasTags)];
    const categoriasInvolucradas = [
      ...new Set(documentosEnPizarra.map((d) => d.categoria)),
    ];

    panel.innerHTML = `
      <h4>📊 Modo Comparativo Activo (${documentosEnPizarra.length} documentos en paralelo)</h4>
      <p style="font-size: 0.9rem; margin-top: 0.5rem; color: #94a3b8;">
        <strong>Categorías en contraste:</strong> ${categoriasInvolucradas.join(" vs ")}
      </p>
      <p style="font-size: 0.9rem; margin-top: 0.25rem; color: #94a3b8;">
        <strong>Puntos de contacto (Tags):</strong> ${tagsUnicas.join(" • ")}
      </p>
    `;
  }

  btnLimpiar.addEventListener("click", () => {
    documentosEnPizarra = [];
    zonaSuelta.innerHTML = "";
    actualizarEstadoVacio();
    actualizarPanelAnalisis();
  });

  // Arrancar la barra lateral al cargar la pizarra
  pintarListaLateral();
}
