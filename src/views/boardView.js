import datos from "../data/proyectos.json";
import { renderViewer } from "../components/viewers/ViewerFactory.js";

// Estado de los documentos activos en la mesa de análisis
let documentosEnPizarra = [];

export function inicializarPizarra() {
  const listaArrastrables = document.querySelector("#lista-arrastrables");
  const zonaSuelta = document.querySelector("#zona-suelta");
  const btnLimpiar = document.querySelector("#btn-limpiar-pizarra");
  const btnTogglePanel = document.querySelector("#btn-toggle-panel");
  const contenedorPizarra = document.querySelector(".contenedor-pizarra");
  const botonesSplit = document.querySelectorAll(".btn-split");
  const btnPantallaCompleta = document.querySelector("#btn-pantalla-completa");
  const vistaPizarra = document.querySelector("#vista-pizarra");

  // =============================================================
  // 1. PINTAR BARRA LATERAL (Con arrastre en PC y botón + en móvil)
  // =============================================================
  function pintarListaLateral() {
    if (!listaArrastrables) return;

    if (!datos || datos.length === 0) {
      listaArrastrables.innerHTML = `
        <p style="font-size: 0.8rem; color: #71717a; padding: 1rem 0;">
          No hay documentos disponibles en el archivo.
        </p>
      `;
      return;
    }

    listaArrastrables.innerHTML = datos
      .map(
        (item) => `
      <div class="item-arrastrable" draggable="true" data-id="${item.id}">
        <div class="info-arrastrable">
          <h4>${item.titulo || "Sin título"}</h4>
          <span class="badge-mini">${item.categoria || "General"}</span>
        </div>
        <!-- Botón táctil directo para móvil o clic rápido -->
        <button class="btn-toque-anadir" data-id="${item.id}" title="Añadir a la mesa">+</button>
      </div>
    `,
      )
      .join("");

    // Evento de toque / clic directo en el botón "+"
    listaArrastrables.querySelectorAll(".btn-toque-anadir").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        const doc = datos.find((d) => String(d.id) === String(id));
        if (
          doc &&
          !documentosEnPizarra.some((d) => String(d.id) === String(doc.id))
        ) {
          documentosEnPizarra.push(doc);
          agregarDocumentoAMesa(doc);
        }
      });
    });

    // Eventos de arrastre nativo para PC
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

  // =============================================================
  // 2. VENTANA DE DOCUMENTO EN LA MESA
  // =============================================================
  function crearHTMLPanel(doc) {
    return `
      <article class="panel-documento" data-id="${doc.id}">
        <header class="cabecera-panel">
          <div class="info-doc">
            <span class="badge-mini">${doc.categoria || "General"}</span>
            <h4 title="${doc.titulo}">${doc.titulo}</h4>
          </div>
          <div class="acciones-panel">
            <button class="btn-accion btn-minimizar" title="Minimizar">⎯</button>
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
    if (!zonaSuelta) return;
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

  // =============================================================
  // 3. EVENTOS DE SUELTA EN LA MESA (DROPZONE)
  // =============================================================
  if (zonaSuelta) {
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
  }

  // =============================================================
  // 4. CONTROLES DE LA HERRAMIENTA (SPLIT, PANEL, FULLSCREEN)
  // =============================================================
  botonesSplit.forEach((btn) => {
    btn.addEventListener("click", () => {
      botonesSplit.forEach((b) => b.classList.remove("activo"));
      btn.classList.add("activo");
      if (zonaSuelta) zonaSuelta.dataset.layout = btn.dataset.layout;
    });
  });

  if (btnTogglePanel && contenedorPizarra) {
    btnTogglePanel.addEventListener("click", () => {
      contenedorPizarra.classList.toggle("panel-oculto");
      const estaOculto = contenedorPizarra.classList.contains("panel-oculto");
      btnTogglePanel.textContent = estaOculto
        ? "▶ Mostrar Panel"
        : "◀ Ocultar Panel";
    });
  }

  if (btnPantallaCompleta && vistaPizarra) {
    btnPantallaCompleta.addEventListener("click", () => {
      if (!document.fullscreenElement) {
        vistaPizarra
          .requestFullscreen()
          .catch((err) => console.warn(err.message));
      } else {
        document.exitFullscreen();
      }
    });
  }

  if (btnLimpiar) {
    btnLimpiar.addEventListener("click", () => {
      documentosEnPizarra = [];
      zonaSuelta.innerHTML = "";
      actualizarEstadoVacio();
      actualizarPanelAnalisis();
    });
  }

  // =============================================================
  // 5. ANÁLISIS CONJUNTO MONOCROMÁTICO
  // =============================================================
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
      <h4>Modo Comparativo Activo (${documentosEnPizarra.length} documentos)</h4>
      <p>
        <strong>Categorías en contraste:</strong> ${categoriasInvolucradas.join(" · ")}
      </p>
      <p style="margin-top: 0.35rem;">
        <strong>Temas cruzados:</strong> ${tagsUnicas.join(" • ")}
      </p>
    `;
  }

  // Carga inmediata de la lista lateral al iniciar
  pintarListaLateral();
}
