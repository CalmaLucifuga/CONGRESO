import datos from "../data/proyectos.json";
import { ShowcaseCard } from "../components/ShowcaseCard.js";

export function inicializarInicio() {
  const contenedorActualidad = document.querySelector("#vista-actualidad");
  const contenedorInicio = document.querySelector("#vista-inicio");

  // Agrupar dinámicamente por categoría
  const categoriasMap = datos.reduce((acumulador, doc) => {
    const cat = doc.categoria || "General";
    if (!acumulador[cat]) acumulador[cat] = [];
    acumulador[cat].push(doc);
    return acumulador;
  }, {});

  const listaCategorias = Object.keys(categoriasMap);

  // -------------------------------------------------------------
  // 1. ACTO 2 (PESTAÑA 2): VISTA LIMPIA CON TELÓN NEGRO
  // Sin atajos ni barras, culminando en la palabra "ACTUALIDAD"
  // -------------------------------------------------------------
  if (contenedorActualidad) {
    contenedorActualidad.innerHTML = `
      <section class="pantalla-actualidad">
        
        <div class="actualidad-emblema-wrapper">
          <span class="emblema-punto"></span>
          <span class="subtexto-institucional">CRÓNICA & CONTEXTO HISTÓRICO</span>
        </div>

        <div class="bloque-tesis-actualidad">
          <h2>El Testimonio del Presente</h2>
          <p class="parrafo-actualidad">
            Frente al estruendo del conflicto y la fragilidad de la memoria, 
            este archivo resguarda los registros, resoluciones y debates que definen 
            nuestra época antes de que sean consumidos por el fuego de la historia.
          </p>
        </div>

        <!-- EL DISPARADOR FINAL: Texto monumental "ACTUALIDAD" -->
        <div class="bloque-trigger-actualidad">
          <h2 
            id="trigger-actualidad" 
            class="titulo-actualidad-interactivo" 
            role="button" 
            tabindex="0" 
            title="Haz clic para abrir el archivo completo"
          >
            ACTUALIDAD
          </h2>

          <div class="indicador-ingreso-actualidad">
            <span class="texto-ingreso">[ HAZ CLIC PARA ABRIR EL DESPACHO COMPLETO ]</span>
            <span class="flecha-ingreso">→</span>
          </div>
        </div>

      </section>
    `;
  }

  // -------------------------------------------------------------
  // 2. ACTO 3 (PESTAÑA 3): EL DESPACHO COMPLETO
  // Aquí es donde viven los atajos y las colecciones clasificadas
  // -------------------------------------------------------------
  if (contenedorInicio) {
    contenedorInicio.innerHTML = `
      <section class="seccion-inicio">
        
        <header class="despacho-cabecera">
          <span class="despacho-badge">DESPACHO & ÍNDICE GENERAL</span>
          <h2>Archivo Documental Clasificado</h2>
          <p>Centro de consulta, lectura individual y análisis cruzado de evidencia histórica.</p>
        </header>

        <!-- Los atajos viven exclusivamente aquí en el Acto 3 -->
        <div class="banner-atajos">
          <div class="atajo-card" id="atajo-explorador">
            <span class="atajo-icono">🔍</span>
            <h4>Explorador Documental</h4>
            <p>Búsqueda individual por palabras clave, áreas temáticas y lectura directa de PDFs.</p>
            <button class="btn-atajo">Ir al Explorador →</button>
          </div>

          <div class="atajo-card" id="atajo-pizarra">
            <span class="atajo-icono">📋</span>
            <h4>Pizarra de Trabajo</h4>
            <p>Mesa de análisis comparativo con visores paralelos en pantalla dividida.</p>
            <button class="btn-atajo btn-atajo--secundario">Abrir Pizarra →</button>
          </div>
        </div>

        <!-- Fondos temáticos por categorías -->
        <div class="contenedor-fondos">
          ${listaCategorias
            .map((cat) => {
              const docs = categoriasMap[cat];
              return `
              <section class="bloque-categoria" data-categoria="${cat}">
                <header class="cabecera-categoria">
                  <span class="sello-categoria">✦ FONDO CLASIFICADO ✦</span>
                  <h3>${cat}</h3>
                  <p class="contador-categoria">${docs.length} documento(s) archivado(s)</p>
                  <div class="linea-categoria"></div>
                </header>

                <div class="grid-documentos-inicio">
                  ${docs.map((doc) => ShowcaseCard(doc, false)).join("")}
                </div>
              </section>
            `;
            })
            .join("")}
        </div>

      </section>
    `;

    // Conectar botones de los atajos del Acto 3
    contenedorInicio
      .querySelector("#atajo-explorador button")
      .addEventListener("click", () => {
        document.querySelector("#btn-explorador").click();
      });

    contenedorInicio
      .querySelector("#atajo-pizarra button")
      .addEventListener("click", () => {
        document.querySelector("#btn-pizarra").click();
      });
  }
}
