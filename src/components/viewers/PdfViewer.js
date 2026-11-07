/**
 * Visor de PDF con detección móvil:
 * En PC incrusta el iframe nativo interactivo.
 * En Móviles ofrece apertura directa sin bloqueos táctiles.
 */
export function renderPdfViewer(doc) {
  if (!doc.enlace) {
    return `
      <div class="visor-vacio">
        <p>No hay un archivo PDF asociado a este documento.</p>
      </div>
    `;
  }

  const esMovil = window.innerWidth < 850;

  if (esMovil) {
    return `
      <div class="visor-movil-pdf">
        <span class="icono-doc-movil">📄</span>
        <h4>Documento PDF</h4>
        <p class="subtexto-doc-movil">${doc.titulo}</p>
        <a href="${doc.enlace}" target="_blank" rel="noopener" class="btn-abrir-pdf-movil">
          Abrir en Visor Nativo ↗
        </a>
      </div>
    `;
  }

  const urlOptimizada = `${doc.enlace}#toolbar=1&navpanes=0`;

  return `
    <div class="contenedor-visor-pdf">
      <iframe
        src="${urlOptimizada}"
        title="Documento: ${doc.titulo}"
        class="iframe-pdf"
        loading="lazy"
      ></iframe>
    </div>
  `;
}
