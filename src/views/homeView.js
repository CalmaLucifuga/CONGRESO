import datos from "../data/proyectos.json";

export function inicializarInicio() {
  const contenedorActualidad = document.querySelector("#vista-actualidad");
  const contenedorInicio = document.querySelector("#vista-inicio");

  // Primer y segundo documento de proyectos.json para el díptico editorial
  const doc1 = datos[0] || {
    titulo: "Ensayo Central",
    miniatura: "/fondos/24000001-large.png",
    enlace: "#",
  };
  const doc2 = datos[1] || {
    titulo: "Documento Complementario",
    miniatura:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1000",
    enlace: "#",
  };

  // =============================================================
  // 1. ACTO 2 (PESTAÑA 2): CRÓNICA HISTÓRICA A LA IZQUIERDA
  // Ocupa el 58% para convivir con la marea de la derecha
  // =============================================================
  if (contenedorActualidad) {
    contenedorActualidad.innerHTML = `
      <section class="pantalla-actualidad cronica-congreso">
        
        <!-- Distintivo superior -->
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

        <!-- HITO 2: 1987 (Con foto sticker del gorro militar a la derecha) -->
        <article class="hito-cronica hito-con-foto">
          <div class="cuerpo-hito">
            <h2 class="ano-cronica">1987</h2>
            <p class="texto-cronica">
              A pesar de todas las quejas y rechazo, bajo el marco legislativo de la Junta Militar se promulga en la Ley N° 18.678: 
              <em class="ley-cita">"La sede del Congreso Nacional será la ciudad de Valparaíso"</em>, logrando así desconectar la fuerza de la oposición, atomizar la vida política y restar la fiscalización frente al Poder Ejecutivo a través del Congreso.
            </p>
          </div>

          <!-- ESPACIO RESERVADO: FOTO STICKER RECORTADA SIN MARCO -->
          <aside class="espacio-foto-relieve">
            <div class="marco-foto-historica">
              <img 
                src="/fondos/gorro-pinochet.png" 
                alt="Emblema / Gorro Militar" 
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

        <!-- DISPARADOR HACIA LA CINEMÁTICA: ACTUALIDAD -->
        <div class="bloque-trigger-actualidad">
          <div class="linea-cierre-cronica"></div>
          <h2 
            id="trigger-actualidad" 
            class="titulo-actualidad-interactivo" 
            role="button" 
            tabindex="0" 
            title="Haz clic para continuar"
          >
            ACTUALIDAD
          </h2>
          <div class="indicador-ingreso-actualidad">
            <span class="texto-ingreso">[ AVANZAR EN EL TIEMPO ]</span>
            <span class="flecha-ingreso">→</span>
          </div>
        </div>

      </section>
    `;
  }

  // =============================================================
  // 2. ACTO 3 (PESTAÑA 3): DÍPTICO CONTENIDO (IZQUIERDA Y DERECHA)
  // Con ancho acotado, márgenes y cubículo con blur
  // =============================================================
  if (contenedorInicio) {
    contenedorInicio.innerHTML = `
      <section class="seccion-inicio escaparate-split-layout">
        <div class="split-contenedor-editorial">
          
          <!-- MITAD IZQUIERDA: Imagen con botón "VER AQUÍ" -->
          <div class="columna-split columna-imagen-preview">
            <img 
              src="${doc1.miniatura || "/fondos/24000001-large.png"}" 
              alt="${doc1.titulo}" 
              class="img-split-ensayo"
              onerror="this.src='https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=1000'"
            />
            
            <div class="overlay-boton-ver">
              <a 
                href="${doc1.enlace || "#"}" 
                target="_blank" 
                rel="noopener noreferrer" 
                class="btn-ver-aqui"
              >
                <span class="texto-carrusel">VER AQUÍ</span>
              </a>
            </div>
          </div>

          <!-- MITAD DERECHA: Cubículo con fondo blur y descripción -->
          <div class="columna-split columna-datos-blur">
            <div class="tarjeta-blur-contenido">
              <span class="badge-split-editorial">DOCUMENTO I — ARCHIVO CENTRAL</span>
              <h2 class="titulo-split-editorial">VER PRIMERO</h2>
              <div class="linea-adorno-split"></div>
              
              <p class="descripcion-split-editorial">
                ${doc1.descripcion || "Análisis documental crítico y registro histórico central de la colección legislativa."}
              </p>

              <div class="tags-split-editorial">
                ${(doc1.tags || ["HISTORIA", "CONGRESO", "ARCHIVO"])
                  .slice(0, 3)
                  .map((tag) => `<span class="tag-split">${tag}</span>`)
                  .join("")}
              </div>
            </div>
          </div>

        </div>
      </section>
    `;
  }
}
