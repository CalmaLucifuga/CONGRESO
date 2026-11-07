/**
 * MOTOR DE MOVIMIENTO Y SCROLL (Scroll Engine)
 * Arquitectura desacoplada: calcula la física de la página y la distribuye
 * tanto a Variables CSS (:root) como a módulos de JavaScript suscriptores.
 */

const suscriptores = new Set();
let activo = false;
let ticking = false;
let ultimoScrollY = 0;

// Estado centralizado
const estado = {
  scrollY: 0,
  progreso: 0, // De 0.0000 (inicio) a 1.0000 (final de página)
  direccion: 1, // 1 = bajando con la rueda | -1 = subiendo
  velocidad: 0, // Píxeles por fotograma
};

/**
 * Calcula la física del scroll y distribuye las señales
 */
function actualizarMetricas() {
  const scrollYActual = window.scrollY;
  const alturaMaxScroll =
    document.documentElement.scrollHeight - window.innerHeight;

  // 1. Progreso normalizado de 0.0000 a 1.0000 (protegido contra división por cero)
  const progresoCalculado =
    alturaMaxScroll > 0
      ? Math.min(Math.max(scrollYActual / alturaMaxScroll, 0), 1)
      : 0;

  // 2. Dirección del desplazamiento
  const direccionCalculada = scrollYActual >= ultimoScrollY ? 1 : -1;

  // 3. Velocidad instantánea
  const velocidadCalculada = Math.abs(scrollYActual - ultimoScrollY);

  // Actualizar estado interno
  estado.scrollY = scrollYActual;
  estado.progreso = progresoCalculado;
  estado.direccion = direccionCalculada;
  estado.velocidad = velocidadCalculada;
  ultimoScrollY = scrollYActual;

  // 4. Inyección en variables globales de CSS (:root)
  const rootStyle = document.documentElement.style;
  rootStyle.setProperty("--progreso", estado.progreso.toFixed(4));
  rootStyle.setProperty("--direccion", estado.direccion);
  rootStyle.setProperty("--scroll-y", `${estado.scrollY}px`);

  // 5. Notificar a módulos de JS que estén suscritos (Canvas, SVG, etc.)
  suscriptores.forEach((callback) => {
    try {
      callback(estado);
    } catch (error) {
      console.error("Error en un suscriptor del Scroll Engine:", error);
    }
  });

  ticking = false;
}

/**
 * Solicita cálculo sincronizado con la tasa de refresco del monitor
 */
function solicitarFotograma() {
  if (!ticking) {
    window.requestAnimationFrame(actualizarMetricas);
    ticking = true;
  }
}

/**
 * Arranca el motor de cálculo
 */
export function iniciarScrollEngine() {
  if (activo) return;
  activo = true;

  window.addEventListener("scroll", solicitarFotograma, { passive: true });
  window.addEventListener("resize", solicitarFotograma, { passive: true });

  // Disparo inicial de sincronización
  actualizarMetricas();
}

/**
 * API para que cualquier impulso artístico en JS se suscriba al motor.
 * @param {Function} callback - Recibe el objeto { progreso, direccion, scrollY, velocidad }
 * @returns {Function} - Función para cancelar la suscripción (limpieza de memoria)
 */
export function suscribirScroll(callback) {
  if (typeof callback === "function") {
    suscriptores.add(callback);
    // Llamada inmediata con el estado actual
    callback(estado);
  }

  return () => suscriptores.delete(callback);
}

/**
 * Lectura instantánea del estado sin esperar eventos
 */
export function obtenerEstadoScroll() {
  return { ...estado };
}
