// Esta función acorta y formatea nombres de rutas, mostrando solo las primeras 3 partes del nombre y añadiendo 'Cali' al final.
export function formatPlaceName(nombre: string | null | undefined): string {
  if (!nombre) return "";
  const partes = nombre.split(",").map((p) => p.trim());
  return `${partes.slice(0, 3).join(", ")}, Cali`;
}
