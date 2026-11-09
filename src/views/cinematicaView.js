/**
 * DIRECTOR DE ESCENA: CINEMÁTICA DE TRASPASO HISTÓRICO (1988 -> 1990)
 * Controla la secuencia de la caída del gorro, el túnel de partículas y la foto del cambio de mando.
 */

let temporizadoresActivos = [];

/**
 * Limpia los temporizadores si el usuario salta la escena
 */
function cancelarTemporizadores() {
  temporizadoresActivos.forEach((id) => clearTimeout(id));
  temporizadoresActivos = [];
}

/**
 * Inicia la cinemática completa
 * @param {Function} onCompletar - Se ejecuta al terminar o al saltar (lleva a la Pestaña 3)
 */
export function reproducirCinematica(onCompletar) {
  const contenedor = document.querySelector("#vista-cinematica");
  if (!contenedor) return;

  cancelarTemporizadores();

  // Inyección de la estructura de la película histórica
  contenedor.innerHTML = `
    <div class="teatro-cinematica">
      
      <!-- Botón de salto accesible -->
      <button id="btn-saltar-cine" class="btn-saltar-cine" title="Saltar cinemática (Esc)">
        Saltar ✕
      </button>

      <!-- Túnel de partículas ascendentes (simula caída al vacío) -->
      <div class="camara-particulas-vertical" id="particulas-verticales">
        ${generarParticulasVerticales(25)}
      </div>

      <!-- ELEMENTO 1: El gorro militar que desciende -->
      <div class="actor-gorro-descenso" id="actor-gorro">
        <img 
          src="/fondos/gorro-pinochet.png" 
          alt="Gorro Militar" 
          class="img-gorro-cine"
          onerror="this.style.display='none'"
        />
      </div>

      <!-- ELEMENTO 2: Fotografía del Cambio de Mando 1990 con texto exterior -->
      <div class="actor-foto-traspaso" id="actor-foto">
        
        <!-- BLOQUE TIPOGRÁFICO EXTERIOR (Fuera de la imagen) -->
        <header class="encabezado-traspaso-1990">
          <h3 class="fecha-titular-1990">11 de marzo de 1990</h3>
          <p class="bajada-titular-1990">
            Pinochet inaugura el Congreso en Valparaíso, dando pie a su nueva democracia
          </p>
        </header>

        <!-- MARCO EXCLUSIVO DE LA FOTOGRAFÍA -->
        <div class="marco-traspaso-1990">
          <img 
            src="/fondos/cambio-mando-1990.jpg" 
            alt="11 de marzo de 1990: Pinochet inaugura el Congreso en Valparaíso" 
            class="img-foto-1990"
            onerror="this.src='https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=1200'"
          />
        </div>

      </div>
      </div>

    </div>
  `;

  // Mecanismo de Salto Inmediato
  function finalizar(saltado = false) {
    cancelarTemporizadores();
    window.removeEventListener("keydown", teclaEscapeHandler);
    if (typeof onCompletar === "function") {
      onCompletar(saltado);
    }
  }

  const btnSaltar = contenedor.querySelector("#btn-saltar-cine");
  if (btnSaltar) btnSaltar.addEventListener("click", () => finalizar(true));

  function teclaEscapeHandler(e) {
    if (e.key === "Escape") finalizar(true);
  }
  window.addEventListener("keydown", teclaEscapeHandler);

  // TIEMPO EXTENDIDO: 9.5 segundos para garantizar lectura calma y contemplativa
  const tFinal = setTimeout(() => {
    finalizar(false);
  }, 9500);

  temporizadoresActivos.push(tFinal);
}

/**
 * Generador de partículas con velocidad vertical ascendente
 */
function generarParticulasVerticales(cantidad) {
  let html = "";
  for (let i = 0; i < cantidad; i++) {
    const duracion = (1.4 + Math.random() * 1.8).toFixed(2);
    const retraso = -(Math.random() * 3).toFixed(2);
    const left = (Math.random() * 100).toFixed(1);
    const ancho = (1.5 + Math.random() * 3.5).toFixed(1);

    html += `
      <span 
        class="chispa-vertical" 
        style="
          --dur-caida: ${duracion}s;
          --ret-caida: ${retraso}s;
          --left-x: ${left}%;
          --ancho-p: ${ancho}px;
        "
      ></span>
    `;
  }
  return html;
}
