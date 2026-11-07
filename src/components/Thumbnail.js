/**
 * Iconos vectoriales limpios (SVG) para los estados de respaldo
 */
const ICONOS_TIPO = {
  pdf: `
    <svg viewBox="0 0 24 24" width="36" height="36" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <line x1="16" y1="13" x2="8" y2="13"></line>
      <line x1="16" y1="17" x2="8" y2="17"></line>
      <polyline points="10 9 9 9 8 9"></polyline>
    </svg>
  `,
  video: `
    <svg viewBox="0 0 24 24" width="36" height="36" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <polygon points="23 7 16 12 23 17 23 7"></polygon>
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
    </svg>
  `,
  enlace: `
    <svg viewBox="0 0 24 24" width="36" height="36" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="2" y1="12" x2="22" y2="12"></line>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
    </svg>
  `,
  default: `
    <svg viewBox="0 0 24 24" width="36" height="36" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
      <polyline points="13 2 13 9 20 9"></polyline>
    </svg>
  `,
};

/**
 * Genera el banner de respaldo cuando no hay miniatura
 */
function renderFallback(tipoNormalizado) {
  const icono = ICONOS_TIPO[tipoNormalizado] || ICONOS_TIPO.default;
  const etiqueta = tipoNormalizado.toUpperCase();

  return `
    <div class="thumbnail-placeholder tipo-${tipoNormalizado}">
      <span class="thumbnail-icono">${icono}</span>
      <span class="thumbnail-tipo-badge">${etiqueta}</span>
    </div>
  `;
}

/**
 * Componente principal de miniatura / carátula
 */
export function Thumbnail(item) {
  const tipo = (item.tipo || "default").toLowerCase();

  // Si no se proporcionó miniatura en el JSON, mostramos directamente el respaldo
  if (!item.miniatura) {
    return `
      <div class="contenedor-thumbnail">
        ${renderFallback(tipo)}
      </div>
    `;
  }

  // Si tiene miniatura declarada, renderizamos la imagen con fallback ante fallos (onerror)
  return `
    <div class="contenedor-thumbnail">
      <img 
        src="${item.miniatura}" 
        alt="Carátula de ${item.titulo || "documento"}"
        class="img-thumbnail"
        loading="lazy"
        decoding="async"
        onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
      />
      <!-- Este bloque está oculto por defecto y solo se muestra si la imagen falla -->
      <div class="thumbnail-fallback-error" style="display: none; width: 100%; height: 100%;">
        ${renderFallback(tipo)}
      </div>
    </div>
  `;
}
