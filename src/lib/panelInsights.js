/**
 * Funciones de análisis del panel RRHH — portadas desde
 * AdminDashboard/paneldata/script.js (legacy). El legacy manipulaba el DOM
 * directamente (innerHTML); acá son funciones puras data-in/data-out
 * consumidas por PanelData.jsx. Mismo cálculo, mismo criterio de negocio.
 */
import {
  TIPO_CORTO,
  TIPO_COLORS,
  TRIADA,
  TRIADA_COLORS,
  TIPO_ROL_EQUIPO,
  LIDERAZGO_POTENCIAL,
  COMPATIBILIDAD,
  TENSIONES,
  PROYECTOS_TIPO,
} from './eneagramaPanelData.js';

/** Arma un "person" a partir de una fila de eneagrama_respuestas ya con el cálculo persistido. */
export function buildPerson(row) {
  const nombre = `${row.Nombre || ''} ${row.Apellido || ''}`.trim() || row.User || 'Sin nombre';
  return {
    nombre,
    _nombre: row.Nombre || '',
    _apellido: row.Apellido || '',
    email: row.Email_User || '',
    fecha: row.Fecha || '',
    user: row.User || '',
    respuestas: row.Respuestas || '',
    tipo: row.TipoBase,
    scores: row.Puntajes || {},
    rawScores: row.PuntajesRaw || {},
    ala1: row.Ala1,
    ala2: row.Ala2,
    alaDominante: row.AlaDominante,
    alaScore1: row.Puntajes ? row.Puntajes[row.Ala1] : undefined,
    alaScore2: row.Puntajes ? row.Puntajes[row.Ala2] : undefined,
    integracion: row.Integracion,
    desintegracion: row.Desintegracion,
  };
}

export function countByType(persons) {
  const tc = {};
  for (let t = 1; t <= 9; t++) tc[t] = 0;
  persons.forEach((p) => {
    if (p.tipo) tc[p.tipo] = (tc[p.tipo] || 0) + 1;
  });
  return tc;
}

export function countByTriada(persons) {
  const tc = { Cuerpo: 0, Corazon: 0, Cabeza: 0 };
  persons.forEach((p) => {
    if (p.tipo) tc[TRIADA[p.tipo]]++;
  });
  return tc;
}

export function getPresentTypes(persons) {
  const tc = countByType(persons);
  return Object.entries(tc)
    .filter(([, v]) => v > 0)
    .map(([t]) => Number(t));
}

export function computeHeroStats(persons) {
  const total = persons.length;
  if (!total) return { total: 0, typesPresent: 0, dominant: null, dominantTriada: null, diversidad: 0 };
  const tc = countByType(persons);
  const typesPresent = Object.values(tc).filter((v) => v > 0).length;
  const dominant = Object.entries(tc).sort((a, b) => b[1] - a[1])[0];
  const triC = countByTriada(persons);
  const dominantTriada = Object.entries(triC).sort((a, b) => b[1] - a[1])[0];
  const diversidad = Math.min(
    100,
    Math.round((typesPresent / 9) * 100 * (1 - Math.abs(0.5 - dominant[1] / total)))
  );
  return { total, typesPresent, dominant, dominantTriada, diversidad };
}

export function computeMainChartData(persons) {
  const tc = countByType(persons);
  return {
    labels: Object.keys(tc).map((t) => `T${t}`),
    labelsRadar: Object.keys(tc).map((t) => TIPO_CORTO[t]),
    data: Object.values(tc),
    colors: Object.keys(tc).map((t) => TIPO_COLORS[t]),
  };
}

export function computeTriadasChartData(persons) {
  const tc = countByTriada(persons);
  const total = persons.length || 1;
  return {
    labels: ['Cuerpo', 'Corazón', 'Cabeza'],
    data: [tc.Cuerpo, tc.Corazon, tc.Cabeza],
    colors: [TRIADA_COLORS.Cuerpo, TRIADA_COLORS.Corazon, TRIADA_COLORS.Cabeza],
    legend: ['Cuerpo', 'Corazon', 'Cabeza'].map((n) => ({
      key: n,
      label: n === 'Corazon' ? 'Corazón' : n,
      color: TRIADA_COLORS[n],
      count: tc[n],
      pct: Math.round((tc[n] / total) * 100),
    })),
  };
}

/** Réplica de generateInsights() del legacy — mismos criterios de negocio. */
export function generateInsights(persons) {
  const total = persons.length;
  if (!total) {
    return [{ tag: 'Sin datos', title: 'Sin evaluados', text: 'Cuando los usuarios completen el test verás el análisis aquí.', color: '#a4a8c0' }];
  }
  const tc = countByType(persons);
  const triC = countByTriada(persons);
  const topType = Object.entries(tc).sort((a, b) => b[1] - a[1])[0];
  const topTriada = Object.entries(triC).sort((a, b) => b[1] - a[1])[0];
  const absent = Object.entries(tc).filter(([, v]) => v === 0).map(([t]) => t);
  const hasLeader = persons.some((p) => [1, 3, 8].includes(p.tipo));
  const hasCohesion = persons.some((p) => [2, 6, 9].includes(p.tipo));
  const hasCreative = persons.some((p) => [4, 5, 7].includes(p.tipo));
  const avgScore = Math.round(persons.reduce((s, p) => s + (p.scores[p.tipo] || 0), 0) / persons.length);
  const domLabel = topTriada[0] === 'Corazon' ? 'Corazón' : topTriada[0];

  const typeInsightMap = {
    1: 'Alto estándar y rigor en procesos. Puede volverse rígido ante el cambio.',
    2: 'Alta empatía y cohesión emocional. Puede tener dificultad para el feedback directo.',
    3: 'Orientado a resultados con alta energía. Riesgo: priorizar imagen sobre proceso genuino.',
    4: 'Alta creatividad y profundidad. Necesita estructura para concretar ideas en resultados.',
    5: 'Análisis riguroso y estratégico. Puede tener dificultad para la acción rápida bajo incertidumbre.',
    6: 'Alta lealtad y anticipación de riesgos. Puede necesitar trabajo en autonomía bajo presión.',
    7: 'Creatividad y entusiasmo naturales. El principal desafío es sostener compromisos hasta el cierre.',
    8: 'Alta determinación y ejecución. Necesita trabajo en escucha activa y vulnerabilidad.',
    9: 'Excelente mediación y armonía. Puede necesitar líderes que tomen posición clara.',
  };
  const triadaMap = {
    Cuerpo: `${Math.round((triC.Cuerpo / total) * 100)}% procesa desde el instinto y la acción directa. Son ejecutores naturales. La emoción subyacente es la ira: necesita canales de expresión saludables.`,
    Corazon: `${Math.round((triC.Corazon / total) * 100)}% toma decisiones desde las emociones y la imagen. Alta inteligencia relacional. Necesitan entornos de reconocimiento genuino para rendir a su mejor nivel.`,
    Cabeza: `${Math.round((triC.Cabeza / total) * 100)}% analiza antes de actuar. Alta capacidad estratégica. Pueden necesitar estructura para pasar del análisis a la acción.`,
  };
  const comunicacionMap = {
    Cuerpo: 'El equipo valora mensajes concretos y orientados a la acción. Las conversaciones más efectivas van directo al punto y tienen responsabilidades claras.',
    Corazon: 'El equipo valora la conexión personal antes del contenido. Los mensajes impactan más cuando incluyen reconocimiento genuino y contexto relacional.',
    Cabeza: 'El equipo necesita datos y fundamentos antes de comprometerse. La estructura, la evidencia y la anticipación de riesgos multiplican la adhesión.',
  };

  let recomendacion;
  const absentNums = absent.map(Number);
  if (absentNums.includes(8) || absentNums.includes(3)) {
    recomendacion = 'El equipo carece de perfiles de alta ejecución (T3 o T8). Considerar roles de liderazgo externo o desarrollar esa capacidad en perfiles actuales.';
  } else if (triC.Cabeza > total * 0.6) {
    recomendacion = 'El equipo es altamente analítico. Para proyectos de ejecución rápida, incorporar facilitadores que aceleren la toma de decisiones.';
  } else if (triC.Corazon > total * 0.6) {
    recomendacion = 'Excelente clima relacional. Para proyectos técnicos complejos, asegurarse de tener perfiles analíticos en roles clave.';
  } else {
    recomendacion = 'El equipo tiene buena diversidad de perfiles. Capitalizar esa diversidad con retroalimentación cruzada entre tipos y sesiones de Eneagrama aplicado.';
  }

  return [
    { tag: 'Composición', color: TIPO_COLORS[topType[0]], title: `Predomina Tipo ${topType[0]} — ${TIPO_CORTO[topType[0]]}`, text: `${topType[1]} de ${total} personas (${Math.round((topType[1] / total) * 100)}%). ${typeInsightMap[Number(topType[0])]}` },
    { tag: 'Tríada dominante', color: TRIADA_COLORS[topTriada[0]], title: `Centro ${domLabel} predominante`, text: triadaMap[topTriada[0]] || '' },
    ...(absent.length
      ? [{ tag: 'Gaps del equipo', color: '#ffb86c', title: `${absent.length} eneatipo${absent.length > 1 ? 's' : ''} ausente${absent.length > 1 ? 's' : ''}`, text: `Sin T${absent.join(', T')}. Puntos ciegos: ${absent.slice(0, 2).map((t) => TIPO_ROL_EQUIPO[t]).join(' · ')}.` }]
      : []),
    {
      tag: 'Fortalezas colectivas',
      color: '#50fa7b',
      title: 'Capacidades naturales del equipo',
      items: [
        { ok: hasLeader, label: hasLeader ? 'Liderazgo y ejecución (T1, T3 o T8)' : 'Falta perfil de liderazgo' },
        { ok: hasCohesion, label: hasCohesion ? 'Cohesión y lealtad (T2, T6 o T9)' : 'Falta cohesionador emocional' },
        { ok: hasCreative, label: hasCreative ? 'Creatividad e innovación (T4, T5 o T7)' : 'Falta perfil creativo/analítico' },
      ],
    },
    { tag: 'Score promedio', color: '#e4c76a', title: `Score base promedio del equipo: ${avgScore}%`, text: 'Un score >50% indica claridad tipológica: cada persona tiene un patrón predominante bien definido, lo que facilita predecir comportamientos bajo presión y diseñar estrategias de gestión personalizadas.' },
    { tag: 'Comunicación', color: '#e17bd7', title: 'Estilo comunicacional predominante', text: comunicacionMap[topTriada[0]] || '' },
    { tag: 'Recomendación', color: '#6be1e3', title: 'Próximos pasos sugeridos', text: recomendacion },
  ];
}

/** Réplica de renderCompatibility() del legacy: líderes, duplas, tensiones y gaps. */
export function computeCompatibility(persons) {
  if (!persons.length) return { leaders: [], duplas: [], tensiones: [], gaps: [] };
  const tc = countByType(persons);

  const order = { Alto: 0, Medio: 1, Situacional: 2 };
  const leaders = persons
    .filter((p) => p.tipo)
    .map((p) => ({ ...p, lid: LIDERAZGO_POTENCIAL[p.tipo] }))
    .filter((p) => ['Alto', 'Medio'].includes(p.lid.nivel))
    .sort((a, b) => order[a.lid.nivel] - order[b.lid.nivel])
    .slice(0, 5);

  const duplas = [];
  const tensiones = [];
  for (let i = 0; i < persons.length; i++) {
    for (let j = i + 1; j < persons.length; j++) {
      const a = persons[i];
      const b = persons[j];
      if (!a.tipo || !b.tipo) continue;
      const k = `${Math.min(a.tipo, b.tipo)}-${Math.max(a.tipo, b.tipo)}`;
      if (COMPATIBILIDAD[k]) duplas.push({ a, b, razon: COMPATIBILIDAD[k] });
      if (TENSIONES[k]) tensiones.push({ a, b, razon: TENSIONES[k] });
    }
  }

  const gaps = Object.entries(tc)
    .filter(([, v]) => v === 0)
    .map(([t]) => Number(t));

  return { leaders, duplas: duplas.slice(0, 4), tensiones: tensiones.slice(0, 4), gaps };
}

/** Fila para la tabla de gestión RRHH. */
export function computeRRHHRows(persons) {
  return persons.map((p) => ({
    ...p,
    liderazgo: p.tipo ? LIDERAZGO_POTENCIAL[p.tipo] : null,
    rol: p.tipo ? TIPO_ROL_EQUIPO[p.tipo] : '',
  }));
}

/** Composición de los 6 proyectos-tipo contra los tipos presentes en el equipo. */
export function computeEquiposProyecto(persons) {
  const tiposPresentes = getPresentTypes(persons);
  return PROYECTOS_TIPO.map((proj) => {
    const available = proj.tipos.filter((t) => tiposPresentes.includes(t));
    const missing = proj.tipos.filter((t) => !tiposPresentes.includes(t));
    const strength = Math.round((available.length / proj.tipos.length) * 100);
    return { ...proj, available, missing, strength };
  });
}

// ═══════════════════════════════════════════════════════════════════════
// CULTURA — réplica de renderCultura() y sub-funciones del legacy
// ═══════════════════════════════════════════════════════════════════════

/** Radar de clima organizacional (6 ejes derivados de la composición tipológica). */
export function computeClimaRadar(persons) {
  const total = persons.length || 1;
  const tc = countByType(persons);
  const c = (types) => Math.min(100, Math.round((types.reduce((s, t) => s + (tc[t] || 0), 0) / total) * 100 + 15));
  return {
    labels: ['Creatividad', 'Ejecución', 'Cohesión', 'Analítica', 'Adaptabilidad', 'Gest. conflicto'],
    data: [c([4, 7, 5]), c([3, 8, 1]), c([2, 6, 9]), c([5, 1, 6]), c([7, 9, 3]), c([8, 1, 6])],
  };
}

/** Barras de "energía del equipo" — cantidad de personas por tipo (reusa countByType). */
export function computeEnergiaBar(persons) {
  const tc = countByType(persons);
  return {
    labels: Object.keys(tc).map((t) => `T${t}`),
    data: Object.values(tc),
    colors: Object.keys(tc).map((t) => TIPO_COLORS[t]),
  };
}

/** Réplica de renderConvivencia(): qué une al equipo, fricción natural, acción prioritaria. */
export function computeConvivencia(persons) {
  const total = persons.length;
  if (!total) return [];
  const tc = countByTriada(persons);
  const dom = Object.entries(tc).sort((a, b) => b[1] - a[1])[0][0];
  const tipos = getPresentTypes(persons);
  let tension = 'No se detectan tensiones de alta intensidad con la composición actual. Monitorear silos entre tríadas.';
  if (tipos.includes(1) && tipos.includes(9)) tension = 'Tensión entre el perfeccionismo (T1) y la tendencia a evitar el conflicto (T9). Pueden acumularse frustraciones sin expresarse durante semanas.';
  else if (tipos.includes(3) && tipos.includes(4)) tension = 'Tensión entre la imagen del éxito (T3) y la necesidad de autenticidad (T4). Pueden chocar en torno a los valores reales del equipo.';
  else if (tipos.includes(8) && tipos.includes(2)) tension = 'Tensión entre la confrontación directa (T8) y la búsqueda de armonía (T2). Necesitan acuerdos explícitos y permanentes de comunicación.';
  const uneMap = {
    Cuerpo: 'El equipo se une desde la acción concreta y los resultados tangibles. La lealtad se construye en la práctica compartida, no en las palabras.',
    Corazon: 'El equipo se une desde las relaciones y el reconocimiento mutuo. El vínculo emocional y la sensación de pertenencia son el pegamento grupal.',
    Cabeza: 'El equipo se une desde el pensamiento compartido y el análisis de la realidad. El respeto intelectual mutuo es el fundamento de la confianza.',
  };
  const accMap = {
    Cuerpo: 'Crear espacios de reflexión y revisión estratégica periódica. El equipo tiende a actuar antes de pensar, lo que puede generar correcciones costosas en tiempo y recursos.',
    Corazon: 'Instalar conversaciones de feedback directo y constructivo. El equipo puede evitar la confrontación necesaria para crecer, acumulando tensión sin resolución.',
    Cabeza: 'Diseñar instancias de prototipado rápido y toma de decisiones con información incompleta. Reducir la parálisis por análisis con metodologías ágiles y plazos.',
  };
  return [
    { color: '#6be1e3', label: 'Qué une al equipo', title: 'Fortaleza de convivencia', text: uneMap[dom] },
    { color: '#ffb86c', label: 'Punto de fricción natural', title: 'Tensión latente', text: tension },
    { color: '#50fa7b', label: 'Acción prioritaria', title: 'Recomendación de clima', text: accMap[dom] },
  ];
}

/** Réplica de renderDinamicas(): 6 ejes de dinámica de equipo. */
export function computeDinamicas(persons) {
  if (!persons.length) return [];
  const tc = countByTriada(persons);
  const total = persons.length || 1;
  const dom = Object.entries(tc).sort((a, b) => b[1] - a[1])[0][0];
  const typeCount = countByType(persons);
  const leaders = persons.filter((p) => LIDERAZGO_POTENCIAL[p.tipo]?.nivel === 'Alto');

  return [
    {
      t: 'Toma de decisiones',
      txt: {
        Cuerpo: 'El equipo decide rápido y desde el instinto. Las reuniones tienden a ser cortas y orientadas a la acción. El riesgo es la falta de reflexión suficiente antes de actuar.',
        Corazon: 'El equipo necesita consenso emocional antes de decidir. Las reuniones requieren tiempo para el diálogo y la validación mutua.',
        Cabeza: 'El equipo analiza profundamente antes de decidir. Puede necesitar plazos explícitos para evitar la postergación de decisiones importantes.',
      }[dom],
    },
    {
      t: 'Comportamiento bajo presión',
      txt: typeCount[8]
        ? 'Con T8 presente, el equipo se intensifica bajo presión: el liderazgo se vuelve más directivo. Eficaz en crisis pero desgastante en el largo plazo.'
        : typeCount[6]
          ? 'Con T6 presente, el equipo hipervigilar los riesgos bajo presión. Requiere liderazgo claro, tranquilizador y consistente.'
          : typeCount[9]
            ? 'Con T9 presente, el equipo puede dispersarse bajo presión. Necesitan un líder que ayude a priorizar y sostener la dirección.'
            : 'El equipo no tiene un perfil de respuesta a la presión claramente definido. Recomendamos simular escenarios de crisis para identificar los patrones emergentes.',
    },
    {
      t: 'Poder y autoridad informal',
      txt: typeCount[8] && typeCount[1]
        ? 'Coexisten dos tipos de autoridad: la del poder directo (T8) y la de los principios (T1). Pueden generar tensión si no acuerdan criterios explícitos.'
        : typeCount[8]
          ? 'El T8 tiende a concentrar el poder informalmente. Importante distribuir la autoridad para evitar dependencia de una sola persona.'
          : typeCount[1]
            ? 'La autoridad se construye desde la ética y los criterios. El T1 ejerce influencia a través de estándares, no de jerarquía.'
            : 'El equipo tiene una distribución de poder más horizontal. Definir roles de liderazgo explícitamente para situaciones de crisis.',
    },
    {
      t: 'Aprendizaje colectivo',
      txt: tc.Cabeza > total * 0.5 && tc.Corazon > 0
        ? 'El equipo combina capacidad analítica y emocional. Puede generar aprendizaje desde la experiencia práctica y desde la reflexión teórica.'
        : tc.Cabeza > total * 0.5
          ? 'El equipo aprende mejor desde el análisis de casos y la revisión estructurada. Responde bien a capacitación con fundamentos sólidos.'
          : tc.Corazon > total * 0.5
            ? 'El equipo aprende mejor desde la experiencia compartida y la conexión emocional con el aprendizaje.'
            : 'Estilo mixto. Combinar formatos expositivos con instancias de práctica y reflexión colectiva.',
    },
    {
      t: 'Innovación y cambio',
      txt: typeCount[7] || typeCount[4]
        ? 'Alta capacidad de generar ideas nuevas. El desafío es estructurar la innovación para que llegue a la implementación.'
        : typeCount[5]
          ? 'La innovación en este equipo es profunda y analítica. Necesita facilitadores que aceleren el paso de la idea al prototipo.'
          : 'El equipo puede resistir el cambio. Introducir novedades con fundamentos sólidos, gradualmente y con participación.',
    },
    {
      t: 'Liderazgo emergente',
      txt: leaders.length === 0
        ? 'No se identifican perfiles de liderazgo alto. Se recomienda trabajar en el desarrollo de capacidades de conducción en los perfiles existentes.'
        : leaders.length === 1
          ? `${leaders[0].nombre} (T${leaders[0].tipo}) concentra el liderazgo natural. Importante desarrollar co-liderazgo para evitar dependencia de una sola persona.`
          : `${leaders.map((p) => `${p.nombre} (T${p.tipo})`).join(' y ')} tienen potencial alto. El equipo puede distribuir el liderazgo según el contexto, lo que aumenta la resiliencia.`,
    },
  ];
}

const TRIADA_DESC = {
  Cuerpo: {
    tipos: 'T1, T8, T9',
    clima: 'Clima de acción y práctica. El equipo genera confianza haciendo cosas juntos, no solo hablando.',
    fortalezas: 'Alta resiliencia en crisis · Lealtad demostrada en la práctica · Comunicación directa y sin rodeos · Capacidad de ejecución sostenida',
    riesgos: 'Puede acumular tensión sin expresarla · Dificultad para introspección colectiva · Puede actuar antes de reflexionar suficientemente',
    recomendacion: 'Incluir instancias de retrospectiva estructurada. Dar canales seguros para expresar emociones sin que parezca "debilidad". Celebrar el proceso, no solo el resultado.',
  },
  Corazon: {
    tipos: 'T2, T3, T4',
    clima: 'Clima de conexión y reconocimiento. El equipo genera confianza a través de las relaciones y la imagen compartida.',
    fortalezas: 'Alta inteligencia emocional colectiva · Capacidad de motivar y movilizar emocionalmente · Adaptabilidad social · Cuidado mutuo genuino',
    riesgos: 'Puede evitar conflictos necesarios · Dependencia del reconocimiento externo · Puede priorizar la imagen sobre la sustancia',
    recomendacion: 'Instalar conversaciones de feedback directo. Separar la valoración personal de la evaluación del trabajo. Cultivar la autenticidad por encima de la imagen.',
  },
  Cabeza: {
    tipos: 'T5, T6, T7',
    clima: 'Clima de análisis y anticipación. El equipo genera confianza a través del conocimiento compartido y la preparación.',
    fortalezas: 'Alta capacidad de planificación estratégica · Anticipación de riesgos y oportunidades · Innovación fundamentada · Adaptabilidad intelectual',
    riesgos: 'Parálisis por análisis · Dificultad para actuar con información incompleta · Puede generar distancia emocional con el equipo',
    recomendacion: 'Instaurar metodologías de toma de decisión con tiempo límite. Equilibrar el análisis con la acción mediante prototipos rápidos. Fortalecer la dimensión emocional del vínculo.',
  },
};

/** Réplica de renderClimaTriada(): una tarjeta por tríada presente en el equipo. */
export function computeClimaTriada(persons) {
  const tc = countByTriada(persons);
  const total = persons.length || 1;
  return ['Cuerpo', 'Corazon', 'Cabeza']
    .filter((n) => tc[n] > 0)
    .map((n) => ({
      n: n === 'Corazon' ? 'Corazón' : n,
      c: TRIADA_COLORS[n],
      count: tc[n],
      pct: Math.round((tc[n] / total) * 100),
      ...TRIADA_DESC[n],
    }));
}

/** Réplica de renderConfrontacion(): patrones de poder/confrontación por tipo presente. */
export function computeConfrontacion(persons) {
  const tc = countByType(persons);
  const items = [];
  if (tc[8]) items.push({ color: TIPO_COLORS[8], titulo: `Poder directo: T8 presente (${tc[8]} pers.)`, texto: 'El T8 ejerce poder de forma directa, visible y sin rodeos. Puede dominar informalmente el espacio de decisión. Es honesto en la confrontación pero puede intimidar sin querer. Recomendación: darle autoridad formal para que el poder informal no genere resentimiento en el equipo.' });
  if (tc[1]) items.push({ color: TIPO_COLORS[1], titulo: `Autoridad por principios: T1 presente (${tc[1]} pers.)`, texto: 'El T1 ejerce autoridad a través de la ética y los estándares. Puede generar tensión cuando percibe que otros no cumplen con sus criterios. Su confrontación es "justa" desde su perspectiva pero puede percibirse como rígida. Recomendación: crear espacios para negociar criterios y estándares colectivamente.' });
  if (tc[6]) items.push({ color: TIPO_COLORS[6], titulo: `Control a través de la anticipación: T6 presente (${tc[6]} pers.)`, texto: 'El T6 puede confrontar cuando percibe que los riesgos no están siendo considerados. Puede generar fricción al señalar problemas que otros no ven. Su confrontación nace de la preocupación, no de la agresión. Recomendación: validar su función de "sistema inmune" del equipo y crear canales formales para sus alertas.' });
  if (tc[9]) items.push({ color: TIPO_COLORS[9], titulo: `Resistencia pasiva: T9 presente (${tc[9]} pers.)`, texto: 'El T9 rara vez confronta directamente pero puede resistir pasivamente decisiones con las que no acuerda. Su "acuerdo" no siempre es real. La resistencia aparece como inercia, postergación o falta de compromiso. Recomendación: crear instancias donde el desacuerdo sea explícitamente bienvenido y seguro.' });
  if (tc[4]) items.push({ color: TIPO_COLORS[4], titulo: `Confrontación desde la autenticidad: T4 presente (${tc[4]} pers.)`, texto: 'El T4 confronta cuando siente que se está violando algo genuino o auténtico. Puede intensificar emocionalmente las situaciones de conflicto. Su confrontación es profunda y no superficial. Recomendación: crear espacios de diálogo donde la profundidad emocional sea bienvenida y no percibida como exagerada.' });
  if (!items.length) items.push({ color: '#a4a8c0', titulo: 'Sin patrones de confrontación dominantes identificados', texto: 'La composición actual no presenta perfiles con patrones de confrontación o poder de alta intensidad. El equipo probablemente tiene un estilo más horizontal y colaborativo. Monitorear la aparición de liderazgos informales no reconocidos.' });
  return items;
}

/** Réplica de renderRituales(): 8 rituales sugeridos, marcados como "recomendado" según composición. */
export function computeRituales(persons) {
  const typeCount = countByType(persons);
  return [
    { t: '🔁 Retrospectivas periódicas', d: 'Instancia mensual de revisión colectiva: qué funcionó, qué no, qué cambiar. Especialmente recomendada para equipos con T1, T6 o T8. Formato: 45 min, facilitador neutral, preguntas abiertas. Evitar que se convierta en un espacio de crítica sin propuesta.', recomendada: !!(typeCount[1] || typeCount[6] || typeCount[8]) },
    { t: '🌟 Reconocimiento explícito y frecuente', d: 'Práctica semanal de reconocimiento de aportes específicos — no genéricos. Crítica para equipos con T2, T3 o T4. Puede ser informal (en reuniones) o formal (tablero de reconocimiento). La frecuencia importa más que la solemnidad.', recomendada: !!(typeCount[2] || typeCount[3] || typeCount[4]) },
    { t: '🧭 Check-in emocional al inicio de reuniones', d: '2-3 minutos donde cada persona comparte brevemente su estado. Desbloquea la comunicación para equipos con T9, T2 y T6. Normaliza la vulnerabilidad. Recomendado para equipos donde las tensiones no se expresan directamente.', recomendada: !!(typeCount[9] || typeCount[2] || typeCount[6]) },
    { t: '🎯 Definición colectiva de estándares', d: 'Reunión anual o semestral para acordar los criterios de calidad y éxito del equipo. Esencial para equipos con T1 y T8. Evita conflictos por estándares implícitos no compartidos. El proceso de acuerdo es tan importante como el resultado.', recomendada: !!(typeCount[1] || typeCount[8]) },
    { t: '💡 Espacio de innovación sin presión de resultado', d: 'Bloque mensual de 60-90 min para explorar ideas sin presión de implementación inmediata. Ideal para equipos con T7, T4 y T5. Debe tener reglas explícitas: no juzgar, no requerir viabilidad inmediata, registrar todo.', recomendada: !!(typeCount[7] || typeCount[4] || typeCount[5]) },
    { t: '📊 Dashboard de avance compartido', d: 'Visibilidad permanente del progreso colectivo hacia las metas. Fundamental para T3 y T1. Reduce la ansiedad del T6. Puede ser digital o físico. La transparencia en el avance genera confianza y motivación colectiva.', recomendada: !!(typeCount[3] || typeCount[1] || typeCount[6]) },
    { t: '🤝 Conversaciones 1:1 regulares', d: 'Encuentros individuales mensuales entre líder y cada persona del equipo. Críticas para T2, T4 y T9, que necesitan espacio personal para abrirse. Agenda sugerida: estado personal, avances, obstáculos, necesidades. Sin agenda formal rígida.', recomendada: !!(typeCount[2] || typeCount[4] || typeCount[9]) },
    { t: '🌅 Cierre de ciclos y celebraciones', d: 'Instancia explícita de cierre al terminar proyectos o períodos. Imprescindible para equipos con T7 (que saltan al siguiente) y T3 (que minimizan logros). Incluir: qué se logró, qué se aprendió, cómo afectó al equipo. Celebrar antes de avanzar.', recomendada: !!(typeCount[7] || typeCount[3]) },
  ];
}

/** Réplica de renderPuntosCriticos(): alertas de convivencia derivadas de la composición del equipo. */
export function computePuntosCriticos(persons) {
  if (!persons.length) return [];
  const puntos = [];
  const tc = countByType(persons);
  const triC = countByTriada(persons);
  const total = persons.length;
  const maxTriada = Math.max(...Object.values(triC));
  if (maxTriada > total * 0.65) {
    const [domT] = Object.entries(triC).find(([, v]) => v === maxTriada);
    const label = domT === 'Corazon' ? 'Corazón' : domT;
    const otras = domT === 'Cuerpo' ? 'Cabeza o Corazón' : domT === 'Corazon' ? 'Cabeza o Cuerpo' : 'Corazón o Cuerpo';
    puntos.push({ title: `Desequilibrio de tríadas: ${label} predomina con ${Math.round((maxTriada / total) * 100)}%`, text: `Un equipo con más del 65% de un solo centro puede tener puntos ciegos importantes en los otros dos. Recomendamos complementar con perfiles del centro ${otras} para mayor equilibrio sistémico.` });
  }
  const criticalAbsent = [3, 8].filter((t) => !tc[t]);
  if (criticalAbsent.length) {
    puntos.push({ title: `Ausencia de perfiles de alta ejecución (T${criticalAbsent.join(', T')})`, text: `Los Tipos ${criticalAbsent.join(' y ')} aportan decisión, orientación a resultados y respuesta rápida ante la adversidad. Su ausencia puede ralentizar significativamente la ejecución en proyectos de alta presión o en momentos de crisis.` });
  }
  const tensions = [];
  for (let i = 0; i < persons.length; i++) {
    for (let j = i + 1; j < persons.length; j++) {
      const a = persons[i];
      const b = persons[j];
      const k = `${Math.min(a.tipo, b.tipo)}-${Math.max(a.tipo, b.tipo)}`;
      if (TENSIONES[k]) tensions.push(`${a.nombre} (T${a.tipo}) y ${b.nombre} (T${b.tipo})`);
    }
  }
  if (tensions.length) {
    puntos.push({ title: `${tensions.length} par${tensions.length > 1 ? 'es' : ''} con tensión tipológica identificada`, text: `Los siguientes pares merecen atención especial en la gestión de la convivencia: ${tensions.slice(0, 4).join(' · ')}. Se recomienda diseñar instancias de feedback cruzado facilitado y definir acuerdos de comunicación explícitos.` });
  }
  if ((tc[9] || 0) > total * 0.3) puntos.push({ title: `Alta presencia de T9 (${tc[9]} personas · ${Math.round((tc[9] / total) * 100)}%)`, text: 'Los T9 tienden a evitar el conflicto y pueden no expresar su desacuerdo abiertamente. En equipo de alta concentración T9, las tensiones quedan subterráneas y pueden explotar de forma imprevista. Crear mecanismos de feedback anónimos y reuniones estructuradas ayuda a que sus perspectivas reales emerjan.' });
  if ((tc[6] || 0) > total * 0.3) puntos.push({ title: `Alta presencia de T6 (${tc[6]} personas · ${Math.round((tc[6] / total) * 100)}%)`, text: 'Alta capacidad de anticipar riesgos, pero el equipo puede paralizarse ante la incertidumbre o el cambio. El liderazgo debe ser especialmente claro, consistente y tranquilizador. Evitar cambios abruptos sin comunicación previa y sin contexto sólido.' });
  if ((tc[7] || 0) > total * 0.3) puntos.push({ title: `Alta presencia de T7 (${tc[7]} personas · ${Math.round((tc[7] / total) * 100)}%)`, text: 'Alta creatividad e innovación, pero puede haber dificultad para cerrar proyectos y sostener compromisos de largo plazo. Es fundamental tener mecanismos de seguimiento, cierre de ciclos y celebración de cierres para no acumular proyectos iniciados sin terminar.' });
  if (!puntos.length) puntos.push({ title: 'El equipo no presenta alertas críticas de convivencia', text: 'La composición actual no genera tensiones de alta intensidad evidentes. Para mantener el buen clima, recomendamos instancias regulares de retroalimentación entre tipos y actividades de integración basadas en el Eneagrama aplicado al contexto organizacional.' });
  return puntos;
}
