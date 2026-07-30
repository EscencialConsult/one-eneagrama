/**
 * Helper para invocar el cálculo legacy de Eneagrama desde React.
 * calculoEneagramaTotal.js (copiado intacto en public/legacy/) es la ÚNICA
 * fuente de cálculo del sistema — mismo criterio para el resultado
 * inmediato del Test y para el Informe/PDF (en el legacy estaban duplicados
 * con criterios distintos; acá se unifican).
 *
 * Expone window.CalculoEneagrama.calcularEneagrama(rawString) → {
 *   base, ala1, ala2, alaDominante, alaScore1, alaScore2,
 *   integracion, desintegracion, scores, rawScores
 * } (scores/rawScores son objetos {1: n, ..., 9: n}, no arrays)
 */
import { loadScript } from './loadScript.js';

let ready = null;

export function ensureEneagramaCalcLoaded() {
  if (!ready) ready = loadScript('/legacy/calculoEneagramaTotal.js');
  return ready;
}

export async function calcularEneagrama(rawString) {
  await ensureEneagramaCalcLoaded();
  if (!window.CalculoEneagrama) {
    throw new Error('calculoEneagramaTotal.js no expuso window.CalculoEneagrama');
  }
  return window.CalculoEneagrama.calcularEneagrama(rawString);
}

export default calcularEneagrama;
