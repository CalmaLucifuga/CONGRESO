import datos from "../data/proyectos.json";
import { Card } from "../components/Card.js";
import { filtrarDatos } from "../utils/filters.js";

export function inicializarExplorador() {
  const contenedor = document.querySelector("#contenedor-datos");
  const inputBuscador = document.querySelector("#buscador");
  const selectCategoria = document.querySelector("#filtro-categoria");
  const contador = document.querySelector("#contador-resultados");

  // Llenar categorías en el select
  const categoriasUnicas = [...new Set(datos.map((d) => d.categoria))];
  categoriasUnicas.forEach((cat) => {
    const opcion = document.createElement("option");
    opcion.value = cat;
    opcion.textContent = cat;
    selectCategoria.appendChild(opcion);
  });

  // Función para pintar tarjetas
  function render(lista) {
    contador.textContent = `Mostrando ${lista.length} de ${datos.length} documentos`;

    if (lista.length === 0) {
      contenedor.innerHTML = `
        <div class="sin-resultados">
          <p>No se encontraron documentos con esos criterios.</p>
        </div>
      `;
      return;
    }

    contenedor.innerHTML = lista.map((item) => Card(item)).join("");
  }

  // Filtrado reactivo
  function aplicarFiltros() {
    const termino = inputBuscador.value;
    const categoria = selectCategoria.value;
    const datosFiltrados = filtrarDatos(datos, termino, categoria);
    render(datosFiltrados);
  }

  inputBuscador.addEventListener("input", aplicarFiltros);
  selectCategoria.addEventListener("change", aplicarFiltros);

  // Primer renderizado
  render(datos);
}
