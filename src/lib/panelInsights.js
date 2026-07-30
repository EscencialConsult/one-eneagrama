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
    email: row.Email_User || '',
    fecha: row.Fecha || '',
    user: row.User || '',
    tipo: row.TipoBase,
    scores: row.Puntajes || {},
    rawScores: row.PuntajesRaw || {},
    ala1: row.Ala1,
    ala2: row.Ala2,
    alaDominante: row.AlaDominante,
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
