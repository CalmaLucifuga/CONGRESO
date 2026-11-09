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
  // ACTO 2 (PESTAÑA 2): CRÓNICA HISTÓRICA — TRASLADO DEL CONGRESO
  // Limitado al 58% de ancho a la izquierda para respetar la marea
  // -------------------------------------------------------------
  if (contenedorActualidad) {
    contenedorActualidad.innerHTML = `
      <section class="pantalla-actualidad cronica-congreso">
        
        <!-- Distintivo superior sobrio -->
        <div class="actualidad-emblema-wrapper">
          <span class="emblema-punto"></span>
          <span class="subtexto-institucional">GÉNESIS & DESPLAZAMIENTO DEL PODER LEGISLATIVO</span>
        </div>

        <!-- HITO 1: 1983 - 1986 -->
        <article class="hito-cronica">
          <h2 class="ano-cronica">1983 — 1986</h2>
          <p class="texto-cronica">
            La oposición encomienda movilizaciones masivas contra el régimen de Augusto Pinochet en el centro cívico de Santiago, impactando la cotidianidad con barricadas, cortes de tránsito y duros choques con Carabineros y el Ejército.
          </p>
          <div class="cita-dictamen">
            <p>Se concluye que la excesiva concentración física de los poderes del Estado (Congreso, ministerios y La Moneda):</p>
            <p class="dictamen-mayuscula">"DIFICULTABAN EL CONTROL POLÍTICO SOBRE LA CLASE TRABAJADORA Y MANIFESTANTES".</p>
          </div>
        </article>

        <!-- HITO 2: 1987 (Con ranura para fotografía a la derecha) -->
        <article class="hito-cronica hito-con-foto">
          <div class="cuerpo-hito">
            <h2 class="ano-cronica">1987</h2>
            <p class="texto-cronica">
              A pesar de todas las quejas y rechazo, bajo el marco legislativo de la Junta Militar se promulga en la Ley N° 18.678: 
              <em class="ley-cita">"La sede del Congreso Nacional será la ciudad de Valparaíso"</em>, logrando así desconectar la fuerza de la oposición, atomizar la vida política y restar la fiscalización frente al Poder Ejecutivo a través del Congreso.
            </p>
          </div>

          <!-- ESPACIO RESERVADO PARA FOTO DEL GORRO DE PINOCHET -->
          <aside class="espacio-foto-relieve">
            <div class="marco-foto-historica">
              <!-- Puedes guardar tu foto como /fondos/gorro-pinochet.png o .jpg en public/ -->
              <img 
                src="/fondos/gorro-pinochet.png" 
                alt="Emblema / Gorro Militar Pinochet" 
                class="img-historica"
                onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
              />
              <div class="foto-placeholder" style="display: none;">
                <span class="icono-placeholder">🎖️</span>
                <span>[ Foto: Gorro Militar ]</span>
              </div>
            </div>
            <figcaption class="pie-foto-historica">Ley N° 18.678</figcaption>
          </aside>
        </article>

        <!-- HITO 3: 1988 -->
        <article class="hito-cronica">
          <h2 class="ano-cronica">1988</h2>
          <p class="texto-cronica">
            El Hospital Enrique Deformes, un edificio histórico de salud pública, es el sacrificado para albergar en su posición al nuevo Congreso de Valparaíso. La resistencia de los médicos, gremios de salud y ciudadanos para la reparación y reapertura del hospital, tras el terremoto de 1985, fueron en vano.
          </p>
        </article>

        <!-- DISPARADOR FINAL: Salto a la tercera pestaña -->
        <div class="bloque-trigger-actualidad">
          <div class="linea-cierre-cronica"></div>
          <h2 
            id="trigger-actualidad" 
            class="titulo-actualidad-interactivo" 
            role="button" 
            tabindex="0" 
            title="Haz clic para entrar al despacho completo"
          >
            ACTUALIDAD
          </h2>
          <div class="indicador-ingreso-actualidad">
            <span class="texto-ingreso">[ INGRESAR AL ARCHIVO COMPLETO ]</span>
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
