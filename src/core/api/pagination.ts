// lee varias páginas de un listado paginado del backend (MOV-13): security-service y
// notification-service devuelven como máximo 100 por página, así que pedir 200 no traía más
export const MAX_PAGE_SIZE = 100;

export interface Page<T> {
  items: T[];
  totalPages: number;
}

// pide la página 0 y luego las siguientes hasta la última o hasta maxPages (para no cargar sin fin)
export async function fetchAllPages<T>(fetchPage: (page: number) => Promise<Page<T>>, maxPages: number): Promise<T[]> {
  const first = await fetchPage(0);
  const items = [...first.items];
  const last = Math.min(first.totalPages, maxPages);
  for (let page = 1; page < last; page += 1) {
    items.push(...(await fetchPage(page)).items);
  }
  return items;
}
