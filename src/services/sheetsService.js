// src/services/sheetsService.js
// ==========================================
// 📊 SERVICIO DE PERSISTENCIA EN GOOGLE SHEETS
// ==========================================

const SHEETS_API_URL = 'https://script.google.com/macros/s/AKfycbz84jBCg3sDh2E28u3ou5vHwUzfn9eAKKpoePde1Bhi-EpThWVGKINB5sSX6jfBa-z0Rw/exec';

/**
 * Get current user email from localStorage
 */
function getUserEmail() {
  try {
    const user = JSON.parse(localStorage.getItem('teclingo_user') || '{}');
    return user.email || '';
  } catch {
    return '';
  }
}

/**
 * Send data to Google Sheets via Apps Script (fire-and-forget)
 * @param {string} accion - Action name matching Code.gs router
 * @param {Object} datos - Data payload
 */
async function sendToSheets(accion, datos) {
  try {
    await fetch(SHEETS_API_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accion, datos })
    });
    console.log(`[Sheets] ${accion} sent successfully`);
  } catch (err) {
    console.warn(`[Sheets] ${accion} failed:`, err);
  }
}

/**
 * Register a grammar analysis
 * @param {Object} params - { textoOriginal, erroresEncontrados, textoCorregido, nivel }
 */
export async function saveGrammarLog({ textoOriginal, erroresEncontrados, textoCorregido, nivel }) {
  const email = getUserEmail();
  if (!email) return;
  await sendToSheets('registrarGramatica', {
    email,
    textoOriginal,
    erroresEncontrados: String(erroresEncontrados),
    textoCorregido,
    nivel: nivel || 'B1'
  });
}

/**
 * Register a TOEFL score
 * @param {Object} params - { seccion, puntaje, nivel, detalles, tiempoCompletado }
 */
export async function saveTOEFLScore({ seccion, puntaje, nivel, detalles, tiempoCompletado }) {
  const email = getUserEmail();
  if (!email) return;
  await sendToSheets('registrarTOEFL', {
    email,
    seccion,
    puntaje: String(puntaje),
    nivel: nivel || 'B1',
    detalles: detalles || '',
    tiempoCompletado: tiempoCompletado || ''
  });
}

/**
 * Register a pronunciation result
 * @param {Object} params - { palabra, puntaje, feedback, ipaDetectado, mejoras }
 */
export async function savePronunciationResult({ palabra, puntaje, feedback, ipaDetectado, mejoras }) {
  const email = getUserEmail();
  if (!email) return;
  await sendToSheets('registrarPronunciacion', {
    email,
    palabra,
    puntaje: String(puntaje),
    feedback: feedback || '',
    ipaDetectado: ipaDetectado || '',
    mejoras: mejoras || ''
  });
}

/**
 * Register user activity (practice session, streak, etc.)
 * @param {string} tipo - Activity type
 * @param {string} detalle - Activity detail
 */
export async function saveActivity(tipo, detalle) {
  const email = getUserEmail();
  if (!email) return;
  await sendToSheets('registrarActividad', {
    email,
    tipo,
    detalle
  });
}

export default {
  saveGrammarLog,
  saveTOEFLScore,
  savePronunciationResult,
  saveActivity
};
