/**
 * Cargador de scripts legacy (jsPDF, Chart.js, calculoEneagramaTotal, etc.).
 *
 * ¿Por qué existe? En la versión AppScript cada página HTML cargaba sus
 * propias versiones por <script>. En la SPA replicamos ese comportamiento
 * cargando cada set de scripts al entrar a la página y limpiándolos al
 * salir, sin modificar los JS originales.
 */

const loaded = new Map(); // src → Promise

export function loadScript(src) {
  if (loaded.has(src)) return loaded.get(src);
  const p = new Promise((resolve, reject) => {
    const el = document.createElement('script');
    el.src = src;
    el.async = false; // respeta el orden, igual que <script> clásico
    el.dataset.legacy = 'true';
    el.onload = () => resolve(src);
    el.onerror = () => {
      loaded.delete(src);
      el.remove();
      reject(new Error(`No se pudo cargar ${src}`));
    };
    document.body.appendChild(el);
  });
  loaded.set(src, p);
  return p;
}

/** Carga una lista en orden estricto. */
export async function loadScripts(list) {
  for (const src of list) await loadScript(src);
}

/**
 * Carga un script ES module (ej. pdfGenerator/main.js, que usa `import`
 * internamente) inyectando un <script type="module"> real.
 *
 * No se puede usar `import()` dinámico de JS para esto: Vite en modo dev
 * prohíbe explícitamente importar archivos de `public/` desde código fuente
 * ("this file is in /public ... should not be imported from source code"),
 * aunque en el build de producción sí funcionaría. Inyectar el tag evita
 * el pipeline de Vite por completo — el navegador lo pide como un archivo
 * normal, igual en dev y en build.
 */
export function loadModuleScript(src) {
  if (loaded.has(src)) return loaded.get(src);
  const p = new Promise((resolve, reject) => {
    const el = document.createElement('script');
    el.type = 'module';
    el.src = src;
    el.dataset.legacy = 'true';
    el.onload = () => resolve(src);
    el.onerror = () => {
      loaded.delete(src);
      el.remove();
      reject(new Error(`No se pudo cargar ${src}`));
    };
    document.body.appendChild(el);
  });
  loaded.set(src, p);
  return p;
}

/**
 * Quita del documento los scripts legacy y los globales que registran,
 * para poder cargar otra versión en otra página.
 */
export function unloadLegacyScripts(globals = []) {
  document.querySelectorAll('script[data-legacy="true"]').forEach((el) => el.remove());
  loaded.clear();
  for (const g of globals) {
    try {
      delete window[g];
    } catch {
      window[g] = undefined;
    }
  }
}
