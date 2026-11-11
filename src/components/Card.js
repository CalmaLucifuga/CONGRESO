import { Thumbnail } from "./Thumbnail.js";

/**
 * Componente de Tarjeta de Documento (Explorador)
 * Monocromático, sin bordes y con revelado de detalles en hover.
 */
export function Card(item) {
  return `
    <article class="data-card" data-id="${item.id || ""}">
      <!-- 1. Miniatura siempre visible arriba -->
      ${Thumbnail(item)}

      <div class="card-cuerpo">
        <!-- 2. Información fija siempre visible -->
        <div class="card-cabecera-fija">
          <span class="badge">${item.categoria || "General"}</span>
          <h3>${item.titulo || "Sin título"}</h3>
        </div>

        <!-- 3. Cajón de detalles: OCULTO en reposo, SE REVELA en hover -->
        <div class="card-detalles-desplegable">
          <p class="card-descripcion">
            ${item.descripcion || item.descripción || "Sin descripción disponible."}
          </p>
          
          <div class="tags">
            ${(item.tags || []).map((tag) => `<span class="tag">${tag}</span>`).join("")}
          </div>

          <a 
            href="${item.enlace || "#"}" 
            target="_blank" 
            rel="noopener noreferrer" 
            class="btn-documento"
          >
            ${item.enlace ? "Ver Documento ↗" : "No disponible"}
          </a>
        </div>
      </div>
    </article>
  `;
}
