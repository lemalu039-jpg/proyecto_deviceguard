export function generarSerial() {
  const prefijo = "DEV";
  const numero = Math.floor(1000 + Math.random() * 9000);
  const año = new Date().getFullYear();

  return `${prefijo}-${año}-${numero}`;
}