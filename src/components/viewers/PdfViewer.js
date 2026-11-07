/**
 * Visor interactivo de PDF utilizando el motor nativo del navegador.
 * Cero librerías externas pesadas y acelerado por hardware.
 */
export function renderPdfViewer(doc) {
  if (!doc.enlace) {
    return `
      <div class="visor-vacio">
        <p>No hay un archivo PDF asociado a este documento.</p>
      </div>
    `;
  }

  // Parámetros de la URL para optimizar la vista dentro del panel:
  // - toolbar=1: mantiene herramientas de zoom, búsqueda y páginas
  // - navpanes=0: oculta el panel lateral del visor por defecto para ganar ancho de lectura
  const urlOptimizada = `${doc.enlace}#toolbar=1&navpanes=0`;

  return `
    <div class="contenedor-visor-pdf">
      <iframe
        src="${urlOptimizada}"
        title="Documento: ${doc.titulo}"
        class="iframe-pdf"
        loading="lazy"
      >
        <p>Tu navegador no soporta la previsualización integrada. 
          <a href="${doc.enlace}" target="_blank" rel="noopener">Descargar PDF</a>.
        </p>
      </iframe>
    </div>
  `;
}
