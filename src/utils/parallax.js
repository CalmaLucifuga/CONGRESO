/**
 * Parallax de desplazamiento vertical (Rueda del ratón / Scroll)
 * Mueve la textura de fondo en dirección contraria al rodar la rueda.
 */
export function iniciarParallax() {
  let enFotograma = false;

  // Factor de intensidad:
  // 0.25 significa que por cada 100px que bajas con la rueda, el fondo sube 25px.
  // (Puedes subirlo a 0.35 si quieres más movimiento, o bajarlo a 0.15 si lo quieres más sutil).
  const VELOCIDAD = 0.25;

  function actualizarFondo() {
    // Calculamos el valor negativo para que al bajar (scrollY positivo), el fondo suba
    const desplazamientoY = -(window.scrollY * VELOCIDAD);
    document.documentElement.style.setProperty(
      "--scroll-offset",
      `${desplazamientoY.toFixed(1)}px`,
    );
    enFotograma = false;
  }

  // Escuchamos el scroll generado por la rueda del ratón
  window.addEventListener(
    "scroll",
    () => {
      if (!enFotograma) {
        window.requestAnimationFrame(actualizarFondo);
        enFotograma = true;
      }
    },
    { passive: true },
  );

  // Posición inicial al cargar la página
  actualizarFondo();
}
