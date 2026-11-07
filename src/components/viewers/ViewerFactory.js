import { renderPdfViewer } from "./PdfViewer.js";

/**
 * Visor de respaldo en caso de que el archivo no sea previsualizable
 */
function renderFallbackViewer(doc) {
  return `
    <div class="visor-fallback">
      <p>Este formato no dispone de visor interactivo en la mesa.</p>
      <a href="${doc.enlace || "#"}" target="_blank" class="btn-fallback">
        Abrir o descargar archivo externo
      </a>
    </div>
  `;
}

/**
 * Función principal de la fábrica (Factory).
 * Recibe el objeto documento y devuelve el HTML del visor correspondiente.
 */
export function renderViewer(doc) {
  if (!doc || !doc.enlace) {
    return renderFallbackViewer(doc);
  }

  // Extraer la extensión del archivo limpiando posibles parámetros o hashes
  const extension = doc.enlace
    .split(".")
    .pop()
    .toLowerCase()
    .split("#")[0]
    .split("?")[0];

  switch (extension) {
    case "pdf":
      return renderPdfViewer(doc);

    // Preparado para el futuro:
    // case 'csv':
    //   return renderCsvViewer(doc);
    // case 'png':
    // case 'jpg':
    //   return renderImageViewer(doc);

    default:
      return renderFallbackViewer(doc);
  }
}
