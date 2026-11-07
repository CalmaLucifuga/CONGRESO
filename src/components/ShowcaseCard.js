import { Thumbnail } from "./Thumbnail.js";

/**
 * Tarjeta de exhibición visual para la página principal.
 * @param {Object} item - Objeto con los datos del documento
 * @param {boolean} esPrincipal - Si es true, aplica estilos de póster gigante
 */
export function ShowcaseCard(item, esPrincipal = false) {
  const claseDestacada = esPrincipal ? "showcase-card--hero" : "";
  const tipoDocumento = (item.tipo || "doc").toUpperCase();

  return `
    <article class="showcase-card ${claseDestacada}" data-id="${item.id}">
      <!-- Fondo: Miniatura o carátula generada por Thumbnail.js -->
      <div class="showcase-media">
        ${Thumbnail(item)}
      </div>

      <!-- Capa de información flotante con gradiente oscuro -->
      <div class="showcase-overlay">
        <!-- Barra superior: Tipo de archivo y categoría -->
        <header class="showcase-cabecera">
          <span class="showcase-badge-tipo badge-tipo--${(item.tipo || "default").toLowerCase()}">
            ${tipoDocumento}
          </span>
          <span class="showcase-categoria">${item.categoria || "General"}</span>
        </header>

        <!-- Parte inferior: Título, breve extracto y enlace directo -->
        <div class="showcase-contenido">
          <h3 class="showcase-titulo" title="${item.titulo}">
            ${item.titulo || "Sin título"}
          </h3>
          
          <p class="showcase-descripcion">
            ${item.descripcion || "Sin descripción disponible."}
          </p>

          <footer class="showcase-acciones">
            <a 
              href="${item.enlace || "#"}" 
              target="_blank" 
              rel="noopener noreferrer" 
              class="btn-showcase-accion"
            >
              Ver Archivo ↗
            </a>
          </footer>
        </div>
      </div>
    </article>
  `;
}
