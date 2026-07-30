import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CONFIG } from '../lib/config.js';
import { Session } from '../lib/session.js';
import { loadScript, loadScripts, loadModuleScript, unloadLegacyScripts } from '../lib/loadScript.js';
import { guardarRespuesta, guardarPdf } from '../lib/api.js';
import Footer from '../components/Footer.jsx';

/**
 * Test de Eneagrama — 90 preguntas (9 tipos × 10), réplica exacta del
 * contenido de Test/script.js (legacy). El cálculo, la rueda, las barras
 * y el PDF se generan con los mismos módulos legacy copiados intactos a
 * public/legacy/ — acá solo cambia el "cableado": una sola persistencia
 * (guardarRespuesta + guardarPdf a Supabase) en vez de la duplicación
 * PASO1/PASO2 vía iframe que tenía el legacy.
 */

const QperPage = 10;
const PAGE_LABELS = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9'];

// ── Preguntas — copiadas literal de Test/script.js (legacy), ty nunca se toca ──
const QUESTIONS = [
  // ── TIPO 1 — El Perfeccionista ──────────────────────────────
  { t: 'Cuando notás un error o algo que podría hacerse mejor, ¿sentís una tensión interna que no se calma hasta que lo corregís o lo señalás?', ty: 1 },
  { t: '¿Te resulta difícil relajarte cuando sabés que hay tareas pendientes o cosas que podrían hacerse mejor?', ty: 1 },
  { t: '¿Tenés un crítico interno que constantemente evalúa si estás haciendo las cosas de manera correcta?', ty: 1 },
  { t: '¿Sentís resentimiento cuando otros no cumplen con los mismos estándares de responsabilidad que vos mantenés?', ty: 1 },
  { t: '¿Experimentás frustración cuando las reglas o procedimientos no se siguen adecuadamente?', ty: 1 },
  { t: '¿Sentís que hay una forma correcta de hacer las cosas y te frustrás cuando no se respeta?', ty: 1 },
  { t: '¿Cuando terminás una tarea, solés revisarla varias veces para asegurarte de que no haya errores?', ty: 1 },
  { t: '¿Sentís tensión interna cuando alguien hace algo de manera incorrecta o ineficiente frente a vos?', ty: 1 },
  { t: '¿Te resulta difícil disfrutar el tiempo libre cuando sentís que podrías estar siendo más productivo?', ty: 1 },
  { t: '¿Tenés estándares muy altos para vos mismo que a veces te resultan difíciles de sostener?', ty: 1 },

  // ── TIPO 2 — El Ayudador ────────────────────────────────────
  { t: '¿Tendés a anticipar las necesidades de los demás antes de que te las expresen, sintiendo satisfacción al ayudarlos?', ty: 2 },
  { t: '¿Sentís incomodidad o frustración cuando tus esfuerzos por ayudar a otros no son reconocidos o valorados?', ty: 2 },
  { t: '¿Te sentís más valorado cuando estás siendo útil o indispensable para alguien?', ty: 2 },
  { t: '¿Te resulta más fácil identificar las necesidades ajenas que reconocer las tuyas propias?', ty: 2 },
  { t: '¿Sentís que das más en las relaciones de lo que recibís, pero te cuesta expresarlo directamente?', ty: 2 },
  { t: '¿Modificás tu comportamiento para ser querido o aceptado por las personas importantes en tu vida?', ty: 2 },
  { t: '¿Cuando percibís que alguien cercano está mal, sentís una urgencia interna de ayudar aunque no te hayan pedido que lo hagas?', ty: 2 },
  { t: '¿Te cuesta decir que no cuando alguien te pide un favor, incluso cuando no tenés tiempo o energía?', ty: 2 },
  { t: '¿Tu bienestar emocional depende en gran parte de que las personas cercanas estén bien?', ty: 2 },
  { t: '¿Sentís que tu valor como persona está ligado a cuánto podés hacer por los demás?', ty: 2 },

  // ── TIPO 3 — El Triunfador ──────────────────────────────────
  { t: '¿Sentís que tu valor como persona está directamente relacionado con lo que lográs o lo que otros perciben de vos?', ty: 3 },
  { t: '¿Adaptás tu comportamiento o presentación según el contexto para causar una mejor impresión?', ty: 3 },
  { t: '¿Medís tu autoestima en función de tus logros y el reconocimiento que recibís?', ty: 3 },
  { t: '¿Te sentís incómodo con el fracaso al punto de evitar situaciones donde podrías no destacar?', ty: 3 },
  { t: '¿Te enfocás intensamente en tus metas, a veces descuidando tu bienestar emocional o relaciones personales?', ty: 3 },
  { t: '¿Te resulta difícil desconectar del trabajo o pausar tu búsqueda de objetivos para simplemente estar?', ty: 3 },
  { t: '¿Te comparás frecuentemente con otros en términos de logros o éxito para medir tu progreso?', ty: 3 },
  { t: '¿Presentás versiones distintas de vos mismo según el contexto, asegurándote de que siempre quede la mejor imagen posible?', ty: 3 },
  { t: '¿Te resulta difícil descansar genuinamente cuando sentís que otros avanzan más rápido que vos?', ty: 3 },
  { t: '¿A veces sentís que si dejaras de lograr cosas o de ser exitoso, no sabrías muy bien quién sos realmente sin eso?', ty: 3 },

  // ── TIPO 4 — El Individualista ──────────────────────────────
  { t: '¿Sentís que hay algo único y diferente en vos que te distingue de las demás personas?', ty: 4 },
  { t: '¿Experimentás emociones intensas que parecen más profundas que las de quienes te rodean?', ty: 4 },
  { t: '¿Sentís nostalgia por experiencias o conexiones que parecen más auténticas o significativas que tu realidad actual?', ty: 4 },
  { t: '¿Sentís que algo esencial falta en tu vida, incluso cuando las cosas van objetivamente bien?', ty: 4 },
  { t: '¿Tendés a idealizar lo que no tenés mientras desvalorizás lo que está presente en tu vida?', ty: 4 },
  { t: '¿Sentís atracción por la belleza, el arte o experiencias que expresan profundidad emocional?', ty: 4 },
  { t: '¿Sentís que pocas personas realmente comprenden la profundidad de tus experiencias internas?', ty: 4 },
  { t: '¿A veces te quedás atrapado en emociones difíciles más tiempo del que considerarías razonable?', ty: 4 },
  { t: '¿Buscás crear experiencias que reflejen auténticamente quién sos sin importar la opinión ajena?', ty: 4 },
  { t: '¿Sentís una tensión permanente entre querer pertenecer y necesitar ser diferente al mismo tiempo?', ty: 4 },

  // ── TIPO 5 — El Investigador ────────────────────────────────
  { t: '¿Sentís que las interacciones sociales prolongadas te consumen energía de una manera que requiere tiempo a solas para poder recuperarte?', ty: 5 },
  { t: '¿Cuando alguien invade tu espacio, tiempo o privacidad sin avisar, sentís una incomodidad interna intensa que resulta difícil de ignorar?', ty: 5 },
  { t: '¿Sentís que actuar sin entender completamente una situación es casi intolerable, incluso cuando el tiempo o las circunstancias te presionan para actuar?', ty: 5 },
  { t: '¿Preferís tener pocos compromisos sociales para proteger tu tiempo y energía, y sentís alivio cuando planes se cancelan?', ty: 5 },
  { t: '¿Antes de compartir una idea o posición, necesitás haberla procesado completamente en privado, sintiéndote expuesto si te piden opinar sin preparación?', ty: 5 },
  { t: '¿Mantenés compartimentos claros entre las distintas áreas de tu vida (trabajo, familia, amigos) para que no se mezclen ni invadan entre sí?', ty: 5 },
  { t: '¿Preferís dominar completamente un tema antes de considerarte en condiciones de opinar, actuar o comprometerte con él?', ty: 5 },
  { t: '¿En situaciones de alta intensidad emocional, tu tendencia es retirarte internamente, analizar desde la distancia y desconectarte del componente emocional?', ty: 5 },
  { t: '¿Sentís que dar demasiado de tu tiempo o energía emocional a otros te deja vaciado, y necesitás soledad para volver a ser vos?', ty: 5 },
  { t: '¿Valorás tu autonomía e independencia al punto de preferir arreglarte solo antes que depender de otros o exponerte a sus demandas?', ty: 5 },

  // ── TIPO 6 — El Leal ────────────────────────────────────────
  { t: '¿Te encontrás frecuentemente anticipando posibles problemas o escenarios negativos antes de tomar decisiones?', ty: 6 },
  { t: '¿Buscás constantemente respaldo o confirmación antes de comprometerte con decisiones importantes?', ty: 6 },
  { t: '¿Cuestionás las intenciones de los demás hasta que demuestran ser confiables?', ty: 6 },
  { t: '¿Sentís tensión entre confiar en figuras de autoridad y cuestionarlas al mismo tiempo?', ty: 6 },
  { t: '¿Planificás con anticipación y detalle para minimizar riesgos e imprevistos, sintiéndote más seguro cuanto más preparado estés?', ty: 6 },
  { t: '¿Te cuesta confiar en tu propio juicio, buscando validación externa frecuentemente?', ty: 6 },
  { t: '¿Antes de tomar una decisión importante, necesitás consultar con personas de confianza para validarla?', ty: 6 },
  { t: '¿Tendés a imaginar lo que podría salir mal en una situación incluso cuando todo parece estar bien?', ty: 6 },
  { t: '¿La lealtad y la confianza son valores tan fundamentales para vos que una traición en ese plano te resulta casi imperdonable?', ty: 6 },
  { t: '¿Sentís incomodidad ante la ambigüedad o cuando no sabés exactamente qué esperar de una situación?', ty: 6 },

  // ── TIPO 7 — El Entusiasta ──────────────────────────────────
  { t: '¿Solés tener múltiples planes e ideas emocionantes, sintiendo inquietud cuando la rutina se vuelve monótona?', ty: 7 },
  { t: '¿Te cuesta permanecer enfocado en una sola actividad cuando surgen nuevas oportunidades interesantes?', ty: 7 },
  { t: '¿Evitás conscientemente situaciones o emociones que puedan resultar dolorosas o limitantes?', ty: 7 },
  { t: '¿Mantenés múltiples opciones abiertas porque comprometerte con una sola te genera ansiedad?', ty: 7 },
  { t: '¿Cuando algo va mal o es doloroso, tu mente busca automáticamente el lado positivo o una salida antes de procesar realmente lo que sentís?', ty: 7 },
  { t: '¿Preferís mantener las conversaciones ligeras y optimistas, evitando temas pesados o dolorosos?', ty: 7 },
  { t: '¿Sentís que el dolor, la tristeza o los límites son estados que hay que superar rápidamente, no explorar ni sostener por mucho tiempo?', ty: 7 },
  { t: '¿Te aburris rápidamente de las rutinas y buscás activamente nuevas experiencias o proyectos?', ty: 7 },
  { t: '¿Te resulta difícil comprometerte con una sola opción cuando hay muchas posibilidades disponibles?', ty: 7 },
  { t: '¿Preferís mantener tu agenda flexible en lugar de planificar todo con anticipación detallada?', ty: 7 },

  // ── TIPO 8 — El Desafiador ──────────────────────────────────
  { t: '¿Cuando entrás a una situación nueva o de tensión, tendés a ocupar el espacio con decisión y seguridad de manera casi automática?', ty: 8 },
  { t: '¿Valorás la honestidad directa y te incomoda cuando las personas son evasivas o indecisas?', ty: 8 },
  { t: '¿Sentís la necesidad de proteger a quienes percibís como vulnerables o en desventaja?', ty: 8 },
  { t: '¿Te resulta difícil mostrar vulnerabilidad, prefiriendo proyectar fortaleza en todo momento?', ty: 8 },
  { t: '¿Cuando hay un problema, preferís hablarlo de frente antes que dejarlo sin resolver?', ty: 8 },
  { t: '¿Tenés poca paciencia con la debilidad o la victimización, tanto en vos como en otros?', ty: 8 },
  { t: '¿Cuando alguien es injusto o deshonesto, tendés a confrontarlo directamente sin rodeos?', ty: 8 },
  { t: '¿Te incomoda profundamente depender de otros o necesitar apoyo externo para lograr tus objetivos?', ty: 8 },
  { t: '¿En situaciones de conflicto, tendés a intensificar la confrontación antes que buscar una salida?', ty: 8 },
  { t: '¿Tendés a ocupar el espacio con seguridad y decisión cuando entrás a una situación nueva?', ty: 8 },

  // ── TIPO 9 — El Pacificador ─────────────────────────────────
  { t: '¿Preferís mantener la armonía y evitar conflictos, incluso si eso significa postergar tus propias necesidades?', ty: 9 },
  { t: '¿Te cuesta expresar tus opiniones cuando difieren de las del grupo o podrían generar tensión?', ty: 9 },
  { t: '¿Postergás la toma de decisiones importantes o te distraés con tareas menos relevantes?', ty: 9 },
  { t: '¿Adoptás las opiniones o preferencias de otros para mantener la paz, aunque no coincidan con las tuyas?', ty: 9 },
  { t: '¿Te fusionás con las agendas de otros, perdiendo contacto con tus propias prioridades y deseos?', ty: 9 },
  { t: '¿Encontrás difícil identificar qué es realmente importante para vos entre todas las demandas externas?', ty: 9 },
  { t: '¿Cuando hay tensión entre personas cercanas, sentís la necesidad de mediar y restaurar la armonía?', ty: 9 },
  { t: '¿A veces te dás cuenta de que perdiste de vista tus propias necesidades por enfocarte en las de otros?', ty: 9 },
  { t: '¿Te resulta difícil mantener impulso en proyectos propios cuando no hay presión externa que te mueva?', ty: 9 },
  { t: '¿Preferís encontrar puntos en común con las personas antes que enfatizar diferencias que separan?', ty: 9 },
];

const totalPages = Math.ceil(QUESTIONS.length / QperPage); // 9

const LEGACY_SCRIPTS = [
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  '/legacy/calculoEneagramaTotal.js',
  '/legacy/eneagramaData.js',
  '/legacy/eneagramaWheel.js',
  '/legacy/eneagramaBarChart.js',
];

export default function TestEneagrama() {
  const navigate = useNavigate();
  const session = Session.get();

  const [screen, setScreen] = useState('registration'); // registration | test | sending | result
  const [userName, setUserName] = useState('');
  const [userLastName, setUserLastName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [curPage, setCurPage] = useState(0);
  const [answers, setAnswers] = useState({});
  const [pageTimes, setPageTimes] = useState({});
  const [pageStart, setPageStart] = useState(null);
  const [sendError, setSendError] = useState('');
  const [resultado, setResultado] = useState(null);
  const [scriptsReady, setScriptsReady] = useState(false);

  const wheelRef = useRef(null);
  const barsRef = useRef(null);

  // Precarga los scripts legacy de cálculo/gráficos apenas se monta la página
  useEffect(() => {
    loadScripts(LEGACY_SCRIPTS)
      .then(() => setScriptsReady(true))
      .catch((err) => console.error('Error cargando scripts legacy:', err));
    return () => unloadLegacyScripts(['CalculoEneagrama', 'EneagramaCalc', 'ENEAGRAMA_DATA', 'renderEneagramaWheel', 'renderEneagramaBarChart', 'generarPDFEneagrama', 'jspdf']);
  }, []);

  function fmtTime(s) {
    return Math.floor(s / 60) + 'm ' + (s % 60) + 's';
  }

  function buildRespuestas(finalAnswers, finalPageTimes) {
    const parts = [];
    for (let pg = 0; pg < totalPages; pg++) {
      const s0 = pg * QperPage;
      const s1 = Math.min(s0 + QperPage, QUESTIONS.length);
      const lbl = PAGE_LABELS[pg] || 'P' + (pg + 1);
      const qp = [];
      for (let i = s0; i < s1; i++) qp.push(i + 1 + ';' + (finalAnswers[i] || 0));
      parts.push('{' + lbl + ': ' + fmtTime(finalPageTimes[pg] || 0) + ' - ' + qp.join(', ') + '}');
    }
    return parts.join(' ');
  }

  function recordTime(pg, times) {
    if (pageStart === null) return times;
    const s = Math.floor((Date.now() - pageStart) / 1000);
    return { ...times, [pg]: (times[pg] || 0) + s };
  }

  function handleStartTest(e) {
    e.preventDefault();
    if (!userName.trim() || !userLastName.trim() || !userEmail.trim()) {
      alert('Por favor, completá todos los campos');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail.trim())) {
      alert('Por favor, ingresá un correo electrónico válido');
      return;
    }
    setScreen('test');
    setPageStart(Date.now());
  }

  function handleAnswer(qi, value) {
    setAnswers((prev) => ({ ...prev, [qi]: value }));
  }

  function isPageComplete(page, currentAnswers) {
    const s0 = page * QperPage;
    for (let i = s0; i < s0 + QperPage && i < QUESTIONS.length; i++) {
      if (currentAnswers[i] === undefined) return false;
    }
    return true;
  }

  function handleNext() {
    const times = recordTime(curPage, pageTimes);
    setPageTimes(times);
    if (curPage < totalPages - 1) {
      setCurPage(curPage + 1);
      setPageStart(Date.now());
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      finishTest(times);
    }
  }

  function handlePrev() {
    const times = recordTime(curPage, pageTimes);
    setPageTimes(times);
    if (curPage > 0) {
      setCurPage(curPage - 1);
      setPageStart(Date.now());
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  async function finishTest(finalPageTimes) {
    setScreen('sending');
    setSendError('');
    try {
      await loadScripts(LEGACY_SCRIPTS);

      const respuestas = buildRespuestas(answers, finalPageTimes);
      const calc = window.CalculoEneagrama.calcularEneagrama(respuestas);
      setResultado(calc);

      const now = new Date();
      const fecha = now.toLocaleString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });

      const userData = {
        Nombre: userName.trim(),
        Apellido: userLastName.trim(),
        Correo: userEmail.trim(),
        Fecha: fecha,
        Usuario_Admin: session?.usuarioAdmin || '',
        Email_Admin: session?.emailAdmin || '',
        User: session?.userName || '',
        Respuestas: respuestas,
      };
      sessionStorage.setItem('eneagramaUserData', JSON.stringify(userData));

      // Persistencia única: guarda la respuesta + el cálculo en Supabase
      const saved = await guardarRespuesta({
        adminId: session?.adminId || null,
        usuarioAdmin: session?.usuarioAdmin || '',
        emailAdmin: session?.emailAdmin || '',
        usuarioUser: session?.userName || '',
        nombre: userName.trim(),
        apellido: userLastName.trim(),
        emailUser: userEmail.trim(),
        respuestas,
        resultado: calc,
      });

      // Renderiza rueda y barras offscreen para que pdfGenerator las capture como imagen
      if (window.renderEneagramaWheel && wheelRef.current) {
        window.renderEneagramaWheel('eneagrama-wheel-offscreen', calc);
      }
      if (window.renderEneagramaBarChart && barsRef.current) {
        window.renderEneagramaBarChart('eneagrama-bars-offscreen', calc.scores, calc.base);
      }

      await loadModuleScript('/legacy/pdfGenerator/main.js');
      await new Promise((resolve) => {
        let tries = 0;
        const iv = setInterval(() => {
          tries++;
          if (typeof window.generarPDFEneagrama === 'function' || tries > 100) {
            clearInterval(iv);
            resolve();
          }
        }, 50);
      });

      if (typeof window.generarPDFEneagrama === 'function') {
        window.generarPDFEneagrama(userData, calc, async (pdfBase64) => {
          if (!pdfBase64) return;
          try {
            const nombreArchivo = `Informe_Eneagrama_${userName}_${userLastName}_${new Date().toISOString().slice(0, 10)}.pdf`;
            await guardarPdf({
              rowId: saved.row,
              eneagramaId: saved.eneagrama_id,
              pdfBase64,
              pdfNombre: nombreArchivo,
            });
          } catch (err) {
            console.error('Error subiendo PDF a Storage:', err);
          }
        });
      }

      setScreen('result');
    } catch (error) {
      console.error('Error al finalizar el test:', error);
      setSendError('Ocurrió un error al procesar tu evaluación. Por favor, intentá de nuevo.');
      setScreen('result');
    }
  }

  const doneCount = Object.keys(answers).length;
  const pct = Math.round((doneCount / QUESTIONS.length) * 100);
  const s0 = curPage * QperPage;
  const pageComplete = isPageComplete(curPage, answers);
  const tipoNombre = resultado && window.ENEAGRAMA_DATA ? window.ENEAGRAMA_DATA.tipos[resultado.base]?.nombre : '';

  return (
    <div className="isolate min-h-screen min-h-dvh overflow-x-hidden bg-black font-title text-white">
      <div className="fixed inset-0 -z-20 bg-gradient-to-br from-black via-one-ink to-black" />
      <div className="bg-hex-pattern fixed -inset-[20%] -z-10 -rotate-[8deg] opacity-16 mix-blend-screen" />

      {/* Contenedores offscreen para que pdfGenerator capture rueda y barras */}
      <div ref={wheelRef} id="eneagrama-wheel-offscreen" className="fixed left-[-9999px] top-0 h-[420px] w-[420px]" />
      <div ref={barsRef} id="eneagrama-bars-offscreen" className="fixed left-[-9999px] top-0 h-[300px] w-[600px]" />

      <main className="mx-auto flex min-h-screen min-h-dvh max-w-3xl flex-col justify-center px-4 py-10">
        {screen === 'registration' && (
          <div className="mx-auto w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
            <h1 className="mb-2 text-center font-title text-2xl font-extrabold">Evaluación Eneagrama</h1>
            <p className="mb-6 text-center text-sm text-one-slate">90 preguntas · ~10-15 minutos</p>
            <form onSubmit={handleStartTest} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-300">Nombre</label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-white focus:border-one-cyan/50 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-300">Apellido</label>
                <input
                  type="text"
                  value={userLastName}
                  onChange={(e) => setUserLastName(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-white focus:border-one-cyan/50 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-300">Email</label>
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-white focus:border-one-cyan/50 focus:outline-none"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={!scriptsReady}
                className="w-full rounded-full border border-one-cyan/40 bg-gradient-to-r from-one-cyan/20 to-one-pink/20 px-6 py-3 font-bold transition-all hover:border-one-cyan/60 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {scriptsReady ? 'Comenzar evaluación →' : 'Cargando...'}
              </button>
            </form>
          </div>
        )}

        {screen === 'test' && (
          <div>
            <div className="mb-6">
              <div className="mb-2 flex items-center justify-between text-sm text-one-slate">
                <span>
                  Página {curPage + 1} de {totalPages}
                </span>
                <span>{pct}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full bg-gradient-to-r from-one-cyan to-one-pink transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>

            <div className="space-y-5">
              {QUESTIONS.slice(s0, Math.min(s0 + QperPage, QUESTIONS.length)).map((q, idx) => {
                const qi = s0 + idx;
                return (
                  <div
                    key={qi}
                    className={
                      'rounded-2xl border p-5 transition-colors ' +
                      (answers[qi] !== undefined ? 'border-one-cyan/40 bg-one-cyan/5' : 'border-white/10 bg-white/5')
                    }
                  >
                    <p className="mb-4 text-sm leading-relaxed text-gray-200">{q.t}</p>
                    <div className="flex items-center justify-between gap-2">
                      {[1, 2, 3, 4, 5].map((v) => (
                        <label key={v} className="flex flex-1 cursor-pointer flex-col items-center gap-1.5">
                          <input
                            type="radio"
                            name={`q${qi}`}
                            value={v}
                            checked={answers[qi] === v}
                            onChange={() => handleAnswer(qi, v)}
                            className="h-5 w-5 accent-[#6be1e3]"
                          />
                          <span className="text-xs text-one-slate">{v}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 flex items-center justify-between gap-4">
              {curPage > 0 ? (
                <button
                  onClick={handlePrev}
                  className="rounded-full border border-white/20 bg-white/5 px-6 py-2.5 text-sm font-semibold transition-all hover:bg-white/10"
                >
                  ← Anterior
                </button>
              ) : (
                <span />
              )}
              <button
                onClick={handleNext}
                disabled={!pageComplete}
                className="rounded-full border border-one-cyan/40 bg-gradient-to-r from-one-cyan/20 to-one-pink/20 px-6 py-2.5 text-sm font-bold transition-all hover:border-one-cyan/60 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {curPage === totalPages - 1 ? 'Enviar datos →' : 'Siguiente →'}
              </button>
            </div>
          </div>
        )}

        {screen === 'sending' && (
          <div className="flex flex-col items-center justify-center gap-5 text-center">
            <img
              src="/img/one-iconocolor.png"
              className="h-20 w-20 animate-spin rounded-full"
              style={{ animationDuration: '1.5s' }}
              alt=""
            />
            <p className="font-title text-base font-semibold">Generando tu informe...</p>
            <p className="text-sm text-one-slate">Por favor esperá unos segundos</p>
          </div>
        )}

        {screen === 'result' && (
          <div className="mx-auto w-full max-w-lg rounded-3xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-xl">
            {sendError ? (
              <p className="text-red-400">{sendError}</p>
            ) : resultado ? (
              <>
                <p className="mb-2 text-sm uppercase tracking-widest text-one-gold">Evaluación completada</p>
                <h2 className="mb-1 font-title text-5xl font-black text-one-gold">{resultado.base}</h2>
                <p className="mb-6 font-title text-xl font-bold">{tipoNombre}</p>
                <p className="mb-6 text-sm text-one-slate">
                  Tu PDF se descargó automáticamente. Podés volver a verlo cuando quieras desde tu panel.
                </p>
              </>
            ) : (
              <p className="text-one-slate">Procesando resultado...</p>
            )}
            <button
              onClick={() => navigate(CONFIG.routes.userboard)}
              className="w-full rounded-full border border-one-cyan/40 bg-gradient-to-r from-one-cyan/20 to-one-pink/20 px-6 py-3 font-bold transition-all hover:border-one-cyan/60"
            >
              Volver a mi panel
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
