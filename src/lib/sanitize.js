/**
 * Sanitización de texto de usuario antes de insertarlo vía dangerouslySetInnerHTML.
 * div.textContent → div.innerHTML fuerza el escape de entidades HTML.
 * (En DISC esta función vivía embebida en AdminDashboard.jsx; acá se extrae
 * a su propio módulo para que sea más descubrible — mismo comportamiento.)
 */
export function sanitizeText(str) {
  const div = document.createElement('div');
  div.textContent = String(str || '');
  return div.innerHTML;
}

export default sanitizeText;
