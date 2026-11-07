import { Thumbnail } from "./Thumbnail.js";

export function Card(item) {
  return `
    <article class="data-card" data-id="${item.id || ""}">
      <!-- 1. Miniatura o Carátula de respaldo generada por Thumbnail.js -->
      ${Thumbnail(item)}

      <!-- 2. Información textual del documento -->
      <div class="card-cuerpo">
        <span class="badge">${item.categoria || "General"}</span>
        <h3>${item.titulo || "Sin título"}</h3>
        <p>${item.descripcion || item.descripción || "Sin descripción disponible."}</p>
        
        <div class="tags">
          ${(item.tags || []).map((tag) => `<span class="tag">${tag}</span>`).join("")}
        </div>

        <a href="${item.enlace || "#"}" target="_blank" rel="noopener noreferrer">
          ${item.enlace ? "Ver Documento" : "No disponible"}
        </a>
      </div>
    </article>
  `;
}
