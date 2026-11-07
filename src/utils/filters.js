// Quita tildes, mayúsculas y espacios extra: "Análisis" -> "analisis"
function normalizar(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

/**
 * Filtra el catálogo combinando búsqueda de texto y categoría
 */
export function filtrarDatos(datos, busqueda, categoriaSeleccionada) {
  const termino = normalizar(busqueda);

  return datos.filter((item) => {
    // 1. Validar categoría
    const cumpleCategoria =
      categoriaSeleccionada === "todas" ||
      item.categoria === categoriaSeleccionada;

    // 2. Validar texto (revisa en título, descripción y lista de tags)
    const titulo = normalizar(item.titulo);
    const descripcion = normalizar(item.descripcion);
    const tags = item.tags.map((tag) => normalizar(tag)).join(" ");

    const cumpleTexto =
      termino === "" ||
      titulo.includes(termino) ||
      descripcion.includes(termino) ||
      tags.includes(termino);

    // Debe cumplir ambas condiciones
    return cumpleCategoria && cumpleTexto;
  });
}
