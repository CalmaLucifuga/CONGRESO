import { suscribirScroll } from "../utils/scrollEngine.js";

/**
 * MOTOR BÉLICO CON ESCUADRÓN DE REFUERZO TEMPORAL
 * Conserva el 100% de las partículas activas y suma una oleada adicional sin teletransportaciones.
 */

let fuerzaObjetivo = 1.0;
let multiplicadorViento = 1.0;
let chispasExtra = []; // Partículas temporales de refuerzo
let contenedorGlobal = null;
let canvasGlobal = null;

/**
 * DISPARADOR DE RÁFAGA BÉLICA: Inyecta refuerzos sin tocar las que ya vuelan
 */
export function dispararRafagaBelica(duracionMs = 2000) {
  // 1. Aceleración cinética de la corriente
  fuerzaObjetivo = 3.6;

  // 2. ESCUADRÓN DE REFUERZO DE CHISPAS:
  if (canvasGlobal) {
    for (let i = 0; i < 35; i++) {
      const nuevaChispa = new Chispa(canvasGlobal);
      nuevaChispa.x = canvasGlobal.width + Math.random() * 80;
      nuevaChispa.y = Math.random() * (canvasGlobal.height * 1.15);
      nuevaChispa.esTemporal = true; // Se destruirá al salir de pantalla
      chispasExtra.push(nuevaChispa);
    }
  }

  // 3. ESCUADRÓN DE REFUERZO DE CENIZAS (Capa temporal en el DOM)
  if (contenedorGlobal) {
    const capaExtra = document.createElement("div");
    capaExtra.className = "capa-briznas-papel capa-briznas-refuerzo";
    capaExtra.innerHTML = generarBriznas(10);
    contenedorGlobal.appendChild(capaExtra);

    // Se eliminan limpiamente de la memoria al completar su vuelo
    setTimeout(() => {
      capaExtra.remove();
    }, duracionMs + 1000);
  }
}

/**
 * CONTROL DE CENIZAS Y RESIDUOS LATERALES:
 * Apaga todo lo que venga de la derecha durante la cinemática del gorro,
 * dejando protagonismo absoluto a las partículas verticales que suben desde abajo.
 */
export function pausarCenizas(pausar = true) {
  if (!contenedorGlobal) return;

  // 1. Ocultar las cenizas y fragmentos de papel quemado de la derecha
  const capasCenizas = contenedorGlobal.querySelectorAll(".capa-briznas-papel");
  capasCenizas.forEach((capa) => {
    capa.style.display = pausar ? "none" : "";
  });

  // 2. Ocultar las chispas horizontales de la derecha para evitar cruces visuales
  const canvasChispas = contenedorGlobal.querySelector("#canvas-chispas");
  if (canvasChispas) {
    canvasChispas.style.display = pausar ? "none" : "";
  }

  // 3. Ocultar las corrientes de viento laterales
  const svgViento = contenedorGlobal.querySelector(".svg-corrientes-viento");
  if (svgViento) {
    svgViento.style.display = pausar ? "none" : "";
  }
}

// Clase única para chispas con física térmica y estela
class Chispa {
  constructor(canvas) {
    this.canvas = canvas;
    this.esTemporal = false;
    this.reiniciar(true);
  }

  reiniciar(inicioAleatorio = false) {
    this.x = inicioAleatorio
      ? Math.random() * this.canvas.width
      : this.canvas.width + Math.random() * 60;
    this.y = inicioAleatorio
      ? Math.random() * this.canvas.height
      : Math.random() * (this.canvas.height * 1.15);

    this.esCercana = Math.random() > 0.6;

    if (this.esCercana) {
      this.vxBase = -(4.2 + Math.random() * 4.8);
      this.vyBase = -(1.2 + Math.random() * 2.2);
      this.grosor = 3.0 + Math.random() * 3.5;
      this.vidaMaxima = 65 + Math.random() * 50;
    } else {
      this.vxBase = -(2.2 + Math.random() * 2.6);
      this.vyBase = -(0.6 + Math.random() * 1.4);
      this.grosor = 1.2 + Math.random() * 1.5;
      this.vidaMaxima = 85 + Math.random() * 90;
    }

    this.vida = inicioAleatorio ? Math.random() * this.vidaMaxima : 0;
    this.faseWobble = Math.random() * Math.PI * 2;
  }

  actualizar(multViento) {
    this.vida++;
    this.faseWobble += 0.055;
    const wobbleY = Math.sin(this.faseWobble) * (this.esCercana ? 1.3 : 0.6);

    const vx = this.vxBase * multViento;
    const vy = (this.vyBase + wobbleY) * multViento;

    this.x += vx;
    this.y += vy;

    const fueraDePantalla =
      this.vida >= this.vidaMaxima || this.x < -140 || this.y < -140;

    if (fueraDePantalla && !this.esTemporal) {
      this.reiniciar(false);
    }

    return {
      vx,
      vy,
      progresoVida: this.vida / this.vidaMaxima,
      terminada: fueraDePantalla,
    };
  }

  dibujar(ctx, fisica, multViento) {
    const { vx, vy, progresoVida } = fisica;

    let r, g, b, alpha;
    if (progresoVida < 0.22) {
      r = 255;
      g = 245;
      b = 210;
      alpha = 1.0;
    } else if (progresoVida < 0.6) {
      r = 255;
      g = 145;
      b = 30;
      alpha = 0.95;
    } else {
      r = 215;
      g = 50;
      b = 15;
      alpha = (1.0 - progresoVida) * 2.5;
    }

    const factorRastro = this.esCercana ? 6.2 : 3.6;
    const longitud =
      (6.0 + Math.abs(vx) * factorRastro) * (0.75 + multViento * 0.35);

    const xFin = this.x - vx * (longitud * 0.22);
    const yFin = this.y - vy * (longitud * 0.22);

    if (this.esCercana) {
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(xFin, yFin);
      ctx.strokeStyle = `rgba(255, 95, 15, ${alpha * 0.4})`;
      ctx.lineWidth = this.grosor * (1.8 + multViento * 0.3);
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(xFin, yFin);
    ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
    ctx.lineWidth = this.grosor;
    ctx.stroke();
  }
}

export function iniciarVientoFondo() {
  const escenario = document.querySelector("#escenario-artistico");
  if (!escenario) return;

  escenario.innerHTML = "";

  const contenedorViento = document.createElement("div");
  contenedorViento.className = "escenario-viento-activo";
  contenedorGlobal = contenedorViento;

  contenedorViento.innerHTML = `
    <svg class="svg-corrientes-viento" viewBox="0 0 1440 900" preserveAspectRatio="none">
      <defs>
        <linearGradient id="gradienteRafaga" x1="100%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stop-color="#8c6d48" stop-opacity="0"/>
          <stop offset="35%" stop-color="#9a5a32" stop-opacity="0.30"/>
          <stop offset="75%" stop-color="#7a4220" stop-opacity="0.20"/>
          <stop offset="100%" stop-color="#8c6d48" stop-opacity="0"/>
        </linearGradient>
      </defs>

      <path class="linea-viento corriente-rapida-1" d="M 1600,200 C 1100,100 600,350 -200,150" stroke="url(#gradienteRafaga)" stroke-width="2.5" fill="none"/>
      <path class="linea-viento corriente-rapida-2" d="M 1700,500 C 1000,350 500,650 -300,400" stroke="url(#gradienteRafaga)" stroke-width="3.5" fill="none"/>
      <path class="linea-viento corriente-rapida-3" d="M 1600,750 C 900,600 400,850 -100,700" stroke="url(#gradienteRafaga)" stroke-width="2.5" fill="none"/>
    </svg>

    <div class="capa-humo-polvora">
      <div class="nube-humo nube-densa-1"></div>
      <div class="nube-humo nube-densa-2"></div>
      <div class="nube-humo nube-densa-3"></div>
      <div class="resplandor-belico"></div>
    </div>

    <canvas id="canvas-chispas"></canvas>

    <!-- Cenizas base permanentes -->
    <div class="capa-briznas-papel">
      ${generarBriznas(10)}
    </div>
  `;

  escenario.appendChild(contenedorViento);

  const canvas = contenedorViento.querySelector("#canvas-chispas");
  canvasGlobal = canvas;
  const ctx = canvas.getContext("2d", { alpha: true });

  function redimensionarCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener("resize", redimensionarCanvas);
  redimensionarCanvas();

  const TOTAL_CHISPAS = 32;
  const chispasBase = [];
  for (let i = 0; i < TOTAL_CHISPAS; i++) {
    chispasBase.push(new Chispa(canvas));
  }

  suscribirScroll((estado) => {
    const impulso = 1.0 + Math.min(estado.velocidad / 18, 2.0);
    if (impulso > fuerzaObjetivo) {
      fuerzaObjetivo = impulso;
    }
  });

  function animarAtmocel() {
    fuerzaObjetivo = Math.max(1.0, fuerzaObjetivo * 0.95);
    multiplicadorViento += (fuerzaObjetivo - multiplicadorViento) * 0.07;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = "lighter";
    ctx.lineCap = "round";

    for (let i = 0; i < chispasBase.length; i++) {
      const c = chispasBase[i];
      const fisica = c.actualizar(multiplicadorViento);
      c.dibujar(ctx, fisica, multiplicadorViento);
    }

    for (let i = chispasExtra.length - 1; i >= 0; i--) {
      const c = chispasExtra[i];
      const fisica = c.actualizar(multiplicadorViento);
      c.dibujar(ctx, fisica, multiplicadorViento);

      if (fisica.terminada) {
        chispasExtra.splice(i, 1);
      }
    }

    ctx.globalCompositeOperation = "source-over";
    requestAnimationFrame(animarAtmocel);
  }

  requestAnimationFrame(animarAtmocel);
}

function generarBriznas(cantidad) {
  let html = "";
  const tipos = ["pagina-chamuscada", "brasa-papel", "escama-ceniza"];

  for (let i = 0; i < cantidad; i++) {
    const tipo = tipos[i % tipos.length];
    const duracion = (4.0 + Math.random() * 3.0).toFixed(2);
    const retraso = -(Math.random() * 8).toFixed(2);
    const topInicial = (Math.random() * 110 - 10).toFixed(1);
    const escala = (0.6 + Math.random() * 0.8).toFixed(2);

    html += `
      <div 
        class="brizna-pergamino ${tipo}" 
        style="
          --duracion-vuelo: ${duracion}s;
          --retraso-vuelo: ${retraso}s;
          --top-inicial: ${topInicial}%;
          --escala-brizna: ${escala};
        "
      >
        <span class="fragmento-papel"></span>
      </div>
    `;
  }
  return html;
}
