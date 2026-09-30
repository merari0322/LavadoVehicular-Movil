// formatos que comparten las pantallas de cliente y operario

// precio en pesos colombianos sin decimales: 35000 -> "$35.000"
export function formatCOP(value: number): string {
  const digits = Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `$${digits}`;
}

// fecha local en formato "aaaa-mm-dd" (el mismo que usan los datos y los filtros)
export function toISODate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function todayISO(): string {
  return toISODate(new Date());
}

// "aaaa-mm-dd" -> "dd/mm/aaaa"
export function isoToDisplay(iso: string): string {
  const [year, month, day] = iso.split('-');
  return year && month && day ? `${day}/${month}/${year}` : iso;
}

// "dd/mm/aaaa" -> "aaaa-mm-dd", o null si la fecha no existe
export function displayToISO(display: string): string | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(display);
  if (!match) return null;
  const [, day, month, year] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  const valid =
    date.getFullYear() === Number(year) && date.getMonth() === Number(month) - 1 && date.getDate() === Number(day);
  return valid ? `${year}-${month}-${day}` : null;
}

// mientras se escribe una fecha: 25022026 -> 25/02/2026
export function maskDate(text: string): string {
  const digits = text.replace(/\D/g, '').slice(0, 8);
  if (digits.length > 4) return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
  if (digits.length > 2) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return digits;
}

// iniciales de un nombre: "Laura Gómez" -> "LG"
export function initialsOf(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}
