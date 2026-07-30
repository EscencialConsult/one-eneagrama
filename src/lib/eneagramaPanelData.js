/**
 * Constantes del panel RRHH (PanelData.jsx) — copiadas literal de
 * AdminDashboard/paneldata/script.js (legacy). Contenido de negocio,
 * no se reescribe: solo cambia de dónde se consume (React en vez de DOM).
 */

export const TIPO_NOMBRES = {
  1: 'El Reformador', 2: 'El Ayudador', 3: 'El Triunfador',
  4: 'El Individualista', 5: 'El Investigador', 6: 'El Leal',
  7: 'El Entusiasta', 8: 'El Desafiador', 9: 'El Pacificador',
};

export const TIPO_CORTO = {
  1: 'Reformador', 2: 'Ayudador', 3: 'Triunfador',
  4: 'Individualista', 5: 'Investigador', 6: 'Leal',
  7: 'Entusiasta', 8: 'Desafiador', 9: 'Pacificador',
};

export const TIPO_SUBTITULO = {
  1: 'El Perfeccionista ético', 2: 'El Servidor empático', 3: 'El Ejecutor exitoso',
  4: 'El Artista auténtico', 5: 'El Experto analítico', 6: 'El Guardián leal',
  7: 'El Visionario optimista', 8: 'El Líder protector', 9: 'El Mediador pacífico',
};

export const TIPO_COLORS = {
  1: '#a8342c', 2: '#be4b73', 3: '#be8223',
  4: '#5f4b9b', 5: '#345a9e', 6: '#2d7360',
  7: '#c89123', 8: '#943030', 9: '#487c5c',
};

export const TRIADA = {
  1: 'Cuerpo', 2: 'Corazon', 3: 'Corazon', 4: 'Corazon',
  5: 'Cabeza', 6: 'Cabeza', 7: 'Cabeza', 8: 'Cuerpo', 9: 'Cuerpo',
};

export const TRIADA_COLORS = { Cuerpo: '#e17bd7', Corazon: '#e4c76a', Cabeza: '#6be1e3' };

export const TIPO_MOTIVADOR = {
  1: 'Hacer las cosas correctamente y mejorar el entorno',
  2: 'Ser necesario, querido y reconocido por dar',
  3: 'Lograr objetivos y ser valorado por sus resultados',
  4: 'Ser auténtico y expresar su mundo interior único',
  5: 'Comprender profundamente y preservar su autonomía',
  6: 'Sentir seguridad y certeza en su entorno',
  7: 'Vivir experiencias positivas y evitar el sufrimiento',
  8: 'Tener control, impacto y proteger a los suyos',
  9: 'Mantener la armonía y evitar el conflicto',
};

export const TIPO_PUNTO_CIEGO = {
  1: 'Rigidez: puede imponer sus estándares sin escuchar otras formas de hacer',
  2: 'Dependencia: puede no identificar sus propias necesidades reales',
  3: 'Imagen: puede priorizar la apariencia de éxito sobre el proceso genuino',
  4: 'Idealización: puede devaluar lo presente buscando lo que le falta',
  5: 'Desconexión: puede aislarse emocionalmente en momentos críticos',
  6: 'Desconfianza: puede paralizar decisiones por anticipar riesgos excesivos',
  7: 'Fuga: puede evitar el compromiso sostenido con lo difícil',
  8: 'Vulnerabilidad: puede no mostrar fragilidad cuando el equipo la necesita',
  9: 'Inercia: puede perder impulso propio al fusionarse con la agenda ajena',
};

export const TIPO_ROL_EQUIPO = {
  1: 'Guardián de calidad y procesos',
  2: 'Cohesionador emocional del equipo',
  3: 'Motor de resultados y visibilidad',
  4: 'Alma creativa e innovadora',
  5: 'Estratega y cerebro analítico',
  6: 'Sistema inmune y voz crítica',
  7: 'Combustible de ideas y energía',
  8: 'Columna vertebral en momentos de crisis',
  9: 'Mediador y pegamento humano',
};

export const TIPO_FORTALEZAS = {
  1: ['Estándares éticos elevados', 'Disciplina y organización', 'Detección temprana de errores', 'Procesos robustos'],
  2: ['Empatía profunda', 'Red de relaciones amplia', 'Calidez y contención grupal', 'Inteligencia emocional alta'],
  3: ['Energía contagiosa', 'Orientación a resultados', 'Resiliencia ante el fracaso', 'Adaptación al contexto'],
  4: ['Creatividad única', 'Empatía con el dolor ajeno', 'Visión estética y profunda', 'Autenticidad radical'],
  5: ['Análisis riguroso', 'Pensamiento sistémico', 'Independencia intelectual', 'Concentración excepcional'],
  6: ['Lealtad profunda', 'Anticipación de riesgos', 'Compromiso inquebrantable', 'Memoria organizacional'],
  7: ['Innovación y entusiasmo', 'Optimismo contagioso', 'Pensamiento lateral', 'Visión de oportunidades'],
  8: ['Decisión y valentía', 'Protección del equipo', 'Liderazgo en crisis', 'Ejecución sin rodeos'],
  9: ['Mediación natural', 'Capacidad de escucha', 'Presencia calmante', 'Visión integradora'],
};

export const TIPO_DESARROLLO = {
  1: 'Trabajar la flexibilidad: aceptar que hay múltiples formas correctas de hacer. Practicar la autocompasión y la tolerancia al error propio y ajeno.',
  2: 'Aprender a reconocer y comunicar sus propias necesidades. Dar sin esperar reciprocidad inmediata. Practicar el límite como acto de cuidado.',
  3: 'Desacelerar para conectar con el proceso, no solo el resultado. Cultivar la autenticidad más allá de la imagen. Aprender a fallar sin colapsar.',
  4: 'Desarrollar tolerancia a la frustración y capacidad de valorar lo cotidiano. Anclar proyectos creativos en planes concretos y plazos reales.',
  5: 'Practicar la presencia emocional y la participación activa en el equipo. Compartir conocimiento antes de sentirlo "completo" o definitivo.',
  6: 'Desarrollar confianza en su propio juicio. Tomar decisiones con información suficiente, no perfecta. Distinguir riesgo real de riesgo imaginado.',
  7: 'Trabajar la capacidad de cierre y compromiso sostenido. Tolerar la incomodidad del proceso profundo sin escapar hacia nuevas ideas.',
  8: 'Cultivar la vulnerabilidad estratégica. Escuchar antes de actuar en situaciones de alta carga emocional. Delegar desde la confianza.',
  9: 'Reconectar con sus propias prioridades. Desarrollar iniciativa y capacidad de sostener posición ante el conflicto sin disolverse.',
};

export const TIPO_COMUNICACION = {
  1: 'Sé directo/a y fundamentado/a. Valorá su criterio antes de proponer cambios. Evitá la crítica sin contexto ni evidencia.',
  2: 'Reconocé su aporte genuinamente antes de pedir algo. Conectá desde lo personal antes de ir al contenido técnico.',
  3: 'Sé concreto/a y orientado/a a resultados. Mostrá cómo su rol impacta en los objetivos del equipo y del negocio.',
  4: 'Conectá con el significado de lo que se pide. Validá su perspectiva única antes de pedir alineamiento o cambio.',
  5: 'Dales tiempo y espacio antes de responder. Presentá la información estructurada, con evidencia y sin presión social.',
  6: 'Sé consistente y predecible. Anticipá los posibles problemas y mostrá que los consideraste. Evitá la ambigüedad.',
  7: 'Sé entusiasta y abierto/a a ideas. Evitá los "no" sin alternativas. Vinculá tareas a oportunidades y a futuro positivo.',
  8: 'Sé directo/a y sin rodeos. Respetá su autoridad. Presentá los desafíos como oportunidades de impacto real.',
  9: 'Dales tiempo para procesar. Pedí su opinión explícitamente y esperá. Evitá presionarlos cuando hay conflicto abierto.',
};

export const TIPO_ROLES_IDEALES = {
  1: 'Control de calidad · Compliance · Auditoría · Procesos · Mejora continua',
  2: 'RRHH · Bienestar · Atención al cliente · Capacitación · Onboarding',
  3: 'Ventas · Liderazgo de proyectos · Representación externa · Desarrollo de negocio',
  4: 'Creatividad · Diseño · Marca · Cultura organizacional · Innovación',
  5: 'Investigación · Estrategia · Data · Desarrollo de producto · Arquitectura',
  6: 'Seguridad · Planificación · Soporte · Gestión de riesgos · Legales',
  7: 'Comunicación · Marketing · Exploración de mercado · Nuevos negocios',
  8: 'Dirección ejecutiva · Gestión de crisis · Negociación · Expansión',
  9: 'Mediación · Coordinación · Soporte · Trabajo en equipo · Facilitación',
};

export const LIDERAZGO_POTENCIAL = {
  8: { nivel: 'Alto', razon: 'Liderazgo natural en crisis, decisión y protección del equipo.' },
  3: { nivel: 'Alto', razon: 'Orientación a resultados y capacidad de inspirar al equipo.' },
  1: { nivel: 'Alto', razon: 'Estándares éticos y construcción de sistemas robustos.' },
  7: { nivel: 'Medio', razon: 'Visión innovadora y energía para movilizar al equipo.' },
  6: { nivel: 'Medio', razon: 'Lealtad, anticipación de riesgos y cohesión grupal.' },
  2: { nivel: 'Medio', razon: 'Liderazgo relacional y capacidad de sostener emocionalmente al equipo.' },
  9: { nivel: 'Medio', razon: 'Mediación e integración de perspectivas diversas y antagónicas.' },
  5: { nivel: 'Situacional', razon: 'Liderazgo experto en proyectos de alta complejidad técnica.' },
  4: { nivel: 'Situacional', razon: 'Liderazgo creativo en contextos de innovación y cultura.' },
};

export const COMPATIBILIDAD = {
  '1-7': 'Complementarios: el 1 aporta rigor, el 7 aporta visión y espontaneidad.',
  '2-8': 'El 2 humaniza al 8, el 8 da dirección al 2. Alta sinergia.',
  '3-6': 'El 3 impulsa resultados, el 6 cuida los riesgos. Dupla ejecutora.',
  '4-5': 'Creatividad más análisis. Proyectos únicos y bien fundamentados.',
  '5-8': 'El 5 aporta estrategia, el 8 ejecución. Alta potencia operativa.',
  '6-9': 'Lealtad más armonía. Equipo sólido y estable bajo presión.',
  '7-1': 'Entusiasmo más estándares. Innovación con calidad.',
  '2-4': 'Empatía profunda compartida. Altamente sintonizados emocionalmente.',
  '3-8': 'Dos motores de acción. Necesitan acordar dirección para no chocar.',
  '1-4': 'Perfeccionismo más profundidad. Tensión creativa muy productiva.',
};

export const TENSIONES = {
  '1-9': 'El 1 exige, el 9 evita conflicto. Necesitan claridad de expectativas y acuerdos explícitos.',
  '3-4': 'El 3 busca imagen, el 4 busca autenticidad. Tensión de valores puede ser desgastante.',
  '5-2': 'El 5 necesita autonomía, el 2 necesita conexión. Gestionar ritmos y espacio personal.',
  '6-7': 'El 6 anticipa riesgos, el 7 los ignora. Requieren acuerdos explícitos sobre gestión del riesgo.',
  '8-2': 'El 8 confronta, el 2 evita. Pueden malinterpretarse mutuamente en situaciones de estrés.',
  '1-8': 'Dos tipos que buscan control desde lógicas distintas. Necesitan roles bien definidos.',
  '9-8': 'El 9 evita, el 8 confronta directamente. Pueden frustrarse y alejarse sin resolución.',
};

export const TIPO_DESCRIPCION = {
  1: 'Persona principios-centrada, con alto sentido del deber y compromiso con la excelencia. Trabaja con rigor y disciplina, y su aporte al equipo es sostener los estándares de calidad.',
  2: 'Persona orientada a las relaciones, con una capacidad innata para percibir las necesidades ajenas. Su aporte al equipo es la cohesión emocional y la creación de vínculos de confianza.',
  3: 'Persona orientada al logro y la eficacia. Tiene una energía contagiosa y una capacidad notable para adaptarse a lo que el contexto demanda. Mueve al equipo hacia sus objetivos.',
  4: 'Persona con una vida interior rica y una sensibilidad especial para captar lo esencial. Aporta creatividad, autenticidad y profundidad emocional al equipo.',
  5: 'Persona analítica y estratégica, con una mente rigurosa y capacidad de concentración excepcional. Aporta el pensamiento profundo y la planificación de largo plazo.',
  6: 'Persona leal, comprometida y con alta capacidad de anticipar riesgos. Es la "memoria del equipo" y sostiene la cohesión y la responsabilidad colectiva.',
  7: 'Persona entusiasta, creativa y generadora de ideas. Aporta energía positiva, visión de oportunidades y la capacidad de mantener el espíritu de equipo alto.',
  8: 'Persona con una presencia natural de liderazgo. Toma decisiones con rapidez y valentía, protege a su equipo y genera un ambiente de acción y propósito.',
  9: 'Persona con una capacidad especial para crear armonía y mediar en los conflictos. Aporta calma, escucha genuina y una visión integradora de todas las perspectivas.',
};

export const TIPO_NIVEL_SANO = {
  1: 'Principios firmes con apertura. Acepta la imperfección y guía con sabiduría práctica sin imposición.',
  2: 'Ayuda desde la fortaleza, no la necesidad. Tiene límites claros y cuidado genuino sin manipulación.',
  3: 'Auténtico en sus logros. Inspira con resultados reales y valora el proceso tanto como el destino.',
  4: 'Creativo y emocionalmente equilibrado. Transforma su profundidad en arte y conexión real.',
  5: 'Comparte su conocimiento con generosidad. Equilibra análisis con acción y presencia.',
  6: 'Confía en sí mismo y en los demás. Actúa con valentía y sostiene al equipo con lealtad genuina.',
  7: 'Presente en el momento. Integra la profundidad con el disfrute genuino sin escapismo.',
  8: 'Líder que protege y da poder a otros. Usa su fortaleza para el bien común, no para el control.',
  9: 'Presente y conectado. Toma posición con claridad y mantiene la paz desde la fortaleza interior.',
};

export const TIPO_NIVEL_INSANO = {
  1: 'Rigidez extrema, crítica destructiva y resentimiento acumulado que paraliza el equipo.',
  2: 'Manipulación a través del servicio, dependencia emocional y reproches encubiertos.',
  3: 'Engaño, imagen vacía y agotamiento por un ritmo insostenible de logros.',
  4: 'Ensimismamiento, envidia paralizante y parálisis creativa profunda.',
  5: 'Aislamiento total, acaparamiento de recursos e información y desconexión emocional.',
  6: 'Paranoia, sabotaje pasivo o sumisión extrema ante cualquier figura de autoridad.',
  7: 'Escapismo compulsivo, impulsividad y superficialidad que destruye proyectos.',
  8: 'Control total, intimidación sistemática y negación absoluta de la vulnerabilidad propia.',
  9: 'Disociación, negligencia propia total y rendición ante la voluntad ajena.',
};

export const ENEAGRAMA_INTEGRACION = { 1: 7, 2: 4, 3: 6, 4: 1, 5: 8, 6: 9, 7: 5, 8: 2, 9: 3 };
export const ENEAGRAMA_DESINTEGRACION = { 1: 4, 2: 8, 3: 9, 4: 2, 5: 7, 6: 3, 7: 1, 8: 5, 9: 6 };

export const TIPO_FEEDBACK_11 = {
  1: 'Presentá el feedback con datos concretos y criterios objetivos. Reconocé su esfuerzo por la calidad antes de señalar áreas de mejora. El T1 necesita sentir que la crítica es justa y fundamentada, no arbitraria. Nunca uses un tono condescendiente — lo percibe como falta de respeto a su integridad. Separar siempre la persona de la conducta.',
  2: 'Iniciá validando su contribución emocional al equipo. El T2 necesita sentir que su presencia importa más allá de lo que produce. Luego abrí el espacio para hablar de sus propias necesidades no cubiertas. Preguntale explícitamente qué necesita — no espera que se lo adivinen, pero tampoco lo pide solo. Terminar reforzando el vínculo.',
  3: 'Sé directo/a con los logros primero — el T3 necesita sentir que su trabajo es genuinamente valorado antes de recibir cualquier ajuste. Enfocá las mejoras como una forma de elevar aún más su impacto, no como errores. Evitá el feedback en público que pueda afectar su imagen. Conectá cada cambio pedido con el resultado esperado.',
  4: 'Empezá reconociendo su singularidad y profundidad de perspectiva. El T4 necesita sentir que su mirada única es vista y valorada antes de abrirse al feedback. Evitá compararlo/a con otros — lo percibe como invalidación de su identidad. Usá preguntas exploratorias más que afirmaciones. Dale tiempo para procesar emocionalmente.',
  5: 'Mandá los puntos con anticipación para que llegue preparado/a. El T5 procesa mejor cuando tiene tiempo. En la reunión, respetá el silencio — es señal de que está procesando, no de desinterés. Presentá el feedback como datos objetivos, no como juicios de valor. Evitá el exceso de emocionalidad en la conversación.',
  6: 'Antes del feedback, establecé el marco seguro: "Esta conversación es para ayudarte a crecer, no es una evaluación negativa." El T6 necesita certeza sobre las intenciones detrás del encuentro. Sé específico/a y evitá la ambigüedad. No dejes puntos sin resolver al final. Confirmá acuerdos por escrito.',
  7: 'Mantené la energía positiva incluso al hablar de áreas de mejora. Formulá los desafíos como oportunidades de crecimiento y nuevas experiencias. El T7 responde bien cuando siente que el cambio lo lleva a algo mejor. Evitá reuniones largas y cargadas — preferí encuentros cortos y frecuentes. Conectá el feedback con su proyección futura.',
  8: 'Sé absolutamente directo/a — el T8 no tolera el rodeo ni los eufemismos. Tratalé como un igual, no como un subordinado. Reconocé su poder y autoridad antes de hablar de ajustes. El feedback indirecto o "suavizado" lo interpreta como debilidad o falta de honestidad. Ir al grano y respetar su tiempo.',
  9: 'Creá un espacio calmado y sin urgencia artificial. El T9 necesita tiempo para procesar y no se abre bajo presión. Pedí su opinión explícitamente y esperá — puede tener insights profundos que no comparte si no se lo preguntás. Evitá acumular feedback durante meses y descargarlo todo junto. Frecuencia y suavidad son clave.',
};

export const TIPO_BURNOUT_SENALES = {
  1: ['Se vuelve hipercrítico/a con el trabajo propio y del equipo', 'Perfeccionismo paralizante: nada está bien', 'Irritabilidad y rigidez extrema ante cualquier cambio', 'Dificultad total para delegar', 'Resentimiento acumulado hacia quienes no tienen sus estándares', 'Insomnio y tensión corporal crónica'],
  2: ['Agotamiento emocional por sobre-ayuda sostenida', 'Resentimiento encubierto cuando no recibe reconocimiento', 'Comienza a quejarse del equipo en privado', 'Dificultad para decir que no a cualquier pedido', 'Descuido de su propia salud y necesidades', 'Llanto o emocionalidad sin causa aparente'],
  3: ['Adicción al trabajo sin descanso real', 'Vacío emocional tras lograr objetivos importantes', 'Cambios de humor cuando los resultados no son visibles', 'Desconexión total de las relaciones personales', 'Imagen de "todo bien" que oculta agotamiento profundo', 'Dificultad para parar aunque el cuerpo lo pida'],
  4: ['Melancolía prolongada y retiro social', 'Retiro de actividades que antes disfrutaba', 'Sensación intensa de no ser comprendido/a', 'Intensificación de la autocrítica destructiva', 'Envidia que paraliza en lugar de motivar', 'Dificultad para producir o crear'],
  5: ['Aislamiento extremo — evita reuniones y contacto', 'Dificultad para terminar proyectos iniciados', 'Acaparamiento de información sin compartirla', 'Incapacidad de conectar con el equipo incluso cuando quiere', 'Parálisis por análisis — no puede decidir', 'Sensación de estar siempre al límite de sus recursos'],
  6: ['Hipervigilancia y ansiedad que afecta el sueño', 'Cuestionamiento excesivo de sus propias decisiones', 'Búsqueda compulsiva de validación externa', 'Pensamiento catastrófico frecuente sobre el futuro', 'Dificultad para confiar incluso en personas de confianza', 'Parálisis ante cualquier cambio o incertidumbre'],
  7: ['Hiperactividad sin foco real', 'Inicio de múltiples proyectos sin cerrar ninguno', 'Evasión sistemática de conversaciones difíciles', 'Irritabilidad cuando se le imponen límites o estructura', 'Distracción compulsiva — no puede quedarse quieto/a', 'Negación del propio agotamiento'],
  8: ['Agresividad o control excesivo sobre el equipo', 'Incapacidad total para delegar o confiar en otros', 'Sensación de que "nadie lo/la puede"', 'Aislamiento detrás de una fortaleza que no se puede penetrar', 'Impulsos de renunciar o confrontar sin filtro', 'Dolores físicos por tensión acumulada'],
  9: ['Inercia y procrastinación extrema', 'Dificultad para tomar decisiones simples del día a día', 'Desconexión de sus propias metas y deseos', 'Fusión total con las necesidades ajenas', 'Cansancio que no desaparece con el descanso', 'Sensación de invisibilidad y sin importancia'],
};

export const TIPO_RETENCION = {
  1: 'Darles proyectos donde puedan aplicar sus estándares de excelencia con autonomía. Reconocer públicamente su ética de trabajo y su rigor. Ofrecerles participación en el diseño de procesos. Darles claridad de criterios y expectativas. Evitar entornos de trabajo mediocre, caótico o donde se premia la apariencia sobre la sustancia.',
  2: 'Generar entornos donde se sientan valorados/as y necesarios/as de forma genuina. Reconocer su contribución emocional explícitamente y con frecuencia. Brindarles oportunidades de acompañar, capacitar o cuidar a otros. Involucrarlos en iniciativas de bienestar. Evitar roles aislados, puramente técnicos o donde nadie los vea.',
  3: 'Ofrecer visibilidad, reconocimiento de logros y métricas claras de éxito. Darles objetivos ambiciosos y los recursos para alcanzarlos. Vincularlos a proyectos de alto impacto y visibilidad externa. Posibilidades reales de crecimiento y ascenso. Evitar entornos sin metas, sin reconocimiento o donde el mérito no sea visible.',
  4: 'Crear espacio para la expresión creativa y auténtica dentro del trabajo. Validar su perspectiva única y diferencial. Darles proyectos con significado profundo, no solo funcional. Libertad para innovar en el cómo. Evitar entornos homogéneos, corporativos rígidos o donde no puedan diferenciarse.',
  5: 'Respetar profundamente su autonomía y espacio de pensamiento. Darles acceso a información, recursos y tiempo de calidad. Asignarles proyectos de alta complejidad intelectual. Permitirles trabajar con independencia. Evitar entornos de alta exposición, demanda social constante o donde deban estar "siempre disponibles".',
  6: 'Generar entornos de certeza, claridad y consistencia. Ser predecible en las expectativas y en los cambios. Darles rol en la anticipación y gestión de riesgos — que sientan que cuidan algo importante. Reconocer su lealtad explícitamente. Evitar contextos de alta ambigüedad, cambio abrupto sin comunicación o liderazgo inconsistente.',
  7: 'Ofrecer variedad, nuevos proyectos y oportunidades de aprendizaje constante. Darles libertad para innovar y explorar. Vincularlos a iniciativas de futuro y expansión. Posibilidades de moverse entre roles. Evitar roles rutinarios, rígidos o sin espacio para la creatividad y la novedad.',
  8: 'Darles autoridad real, responsabilidad de alto impacto y autonomía genuina para tomar decisiones. Reconocer su liderazgo explícita y públicamente. Posiciones de poder real, no cosmético. Respetarlos como pares. Evitar microgestión, contextos donde su poder sea ignorado o donde deban reportar a personas que perciben como débiles.',
  9: 'Crear entornos de armonía y buen clima como norma, no como excepción. Darles roles de coordinación, mediación y facilitación donde su presencia calmante sea valorada. Asegurar explícitamente que su opinión es escuchada y tiene peso real. Evitar entornos de conflicto constante, alta presión o donde se sientan invisibles.',
};

export const TIPO_CONFLICTO_GESTION = {
  1: 'En conflicto, el T1 tiende a creer que tiene la razón objetiva y que el otro está equivocado. Puede volverse rígido/a y moralista. Necesita que el otro reconozca el error antes de poder avanzar. Estrategia: presentar los hechos con neutralidad, separar la persona de la conducta, y ofrecer criterios objetivos como árbitro neutral.',
  2: 'El T2 evita el conflicto directo pero acumula resentimiento durante semanas o meses. Puede volverse indirecto/a o usar la culpa de manera encubierta. Estrategia: crear un espacio seguro donde pueda expresar sus necesidades sin sentir que "pide demasiado" o que va a dañar la relación al hacerlo.',
  3: 'El T3 en conflicto puede volverse esquivo/a para proteger su imagen pública. Prioriza resolver rápido para seguir avanzando, incluso si la resolución es superficial. Estrategia: abordar el conflicto en privado, enmarcarlo como un obstáculo a superar juntos, y vincular la resolución a un mejor resultado colectivo.',
  4: 'El T4 puede intensificar el conflicto emocionalmente y quedarse en él más tiempo del necesario. Necesita ser profundamente escuchado/a antes de poder resolver. Estrategia: validar su experiencia emocional sin necesariamente darle la razón en los hechos. Separar el reconocimiento del acuerdo.',
  5: 'El T5 se retira del conflicto y necesita tiempo para procesar. Puede parecer indiferente cuando en realidad está procesando internamente con alta intensidad. Estrategia: darle espacio y tiempo sin presión, luego retomar la conversación en un contexto calmado y estructurado, preferentemente por escrito primero.',
  6: 'El T6 en conflicto puede dudar de sus propias percepciones y alternar entre confrontar y retirarse según el nivel de ansiedad. Estrategia: ser claro/a y tranquilizador/a sobre las intenciones. Mostrar que el conflicto es manejable y no amenaza la relación ni la pertenencia al grupo.',
  7: 'El T7 tiende a reencuadrar el conflicto o evitarlo cambiando de tema hacia algo más positivo. Puede parecer que no le importa cuando en realidad teme la pérdida de armonía y disfrute. Estrategia: invitarlo/a a quedarse en el tema sin juzgar la evasión, y conectar la resolución con un mejor futuro.',
  8: 'El T8 confronta directamente y puede escalar rápido, subiendo la intensidad emocional. Respeta profundamente a quien le responde con firmeza y claridad. Estrategia: no ceder ante la presión, mantener la calma y la posición propia sin atacar su autoridad. La firmeza respetuosa genera más respeto que la sumisión.',
  9: 'El T9 evita el conflicto a toda costa y puede parecer de acuerdo cuando en realidad no lo está — el disenso no expresado se convierte en inercia o retiro pasivo. Estrategia: crear espacio explícito para su desacuerdo, preguntar directamente qué piensa, y no interpretar el silencio como acuerdo.',
};

export const TIPO_COMO_LIDERAR = {
  1: 'Liderá con criterio y claridad. Establecé estándares de calidad explícitos. Dale participación en la definición de procesos — siente que el trabajo se hace "bien" si tuvo parte en el diseño. Reconocé su ética y rigor antes de pedir cambios. No improvises frente a él/ella: la falta de preparación lo/la irrita profundamente.',
  2: 'Liderá desde el vínculo y el reconocimiento genuino. El T2 necesita sentir que te importa como persona, no solo como recurso. Preguntale cómo está, qué necesita. Reconocé públicamente su aporte al equipo. Dale roles de mentoría o cuidado de otros. Evitá liderazgos distantes, puramente transaccionales.',
  3: 'Liderá desde los resultados y el reconocimiento del logro. Dale objetivos claros, métricas de éxito y visibilidad. Celebrá sus victorias públicamente. Conectá su trabajo con el impacto de la organización. Dale autonomía para elegir el cómo — solo pedile el qué y el cuándo. Evitá el micromanagement.',
  4: 'Liderá desde el significado y la autenticidad. El T4 necesita sentir que su trabajo tiene propósito real. Dale proyectos que lo/la desafíen creativamente. Involucralé en decisiones sobre cultura, valores e identidad de equipo. Evitá el liderazgo corporativo frío — necesita sentir que hay un ser humano del otro lado.',
  5: 'Liderá desde el respeto a su autonomía e inteligencia. Dale contexto completo y tiempo para procesar. Evitá las reuniones largas sin agenda. Respetá su espacio y sus tiempos — no lo/la interrumpas cuando está en foco. Dale acceso a recursos y reconocé su expertise públicamente. No le pidas que "sea más social" sin un contexto de confianza.',
  6: 'Liderá con consistencia, transparencia y claridad. El T6 necesita predecibilidad para confiar. Comunicá los cambios con anticipación y con contexto completo. Incluilo/a en la anticipación de riesgos — se sentirá parte de la solución. Reconocé su lealtad. Nunca lo/la dejes en la ambigüedad sobre su posición o el futuro del equipo.',
  7: 'Liderá desde la inspiración y las posibilidades. Conectá su trabajo con una visión emocionante de futuro. Dale variedad, nuevos proyectos y libertad creativa. Sostené los compromisos con energía positiva, no con control. Ayudalo/a a cerrar ciclos — es su punto más difícil. Celebrá las ideas aunque no todas se ejecuten.',
  8: 'Liderá desde la firmeza y el respeto mutuo. El T8 no tolera los liderazgos débiles o indirectos. Sé directo/a, decidido/a y claro/a en lo que esperás. Demostrá que podés sostener tu posición aunque te confronte. Dale poder real, no cosmético. Involucralé en las decisiones grandes — no le presentes el resultado sin el proceso.',
  9: 'Liderá con paciencia y presencia. Dale tiempo para procesar, no lo/la apures. Pedí su opinión explícitamente — no asumas su acuerdo por su silencio. Reconocé su capacidad de ver todos los puntos de vista. Ayudalo/a a priorizar y a tomar posición. Creá entornos de armonía y claridad de roles donde no tenga que estar resolviendo tensiones constantemente.',
};

export const TIPO_DESEMPENO_ESPERAR = {
  1: { fortaleza: 'Alta calidad en la ejecución, procesos claros y documentados, cumplimiento riguroso de compromisos.', limitacion: 'Puede bloquear la entrega perfecta por sobre optimizar. Dificultad para aceptar soluciones "suficientemente buenas". Puede generar tensión con el equipo cuando sus estándares no son compartidos.', indicadores: 'Evaluar por calidad del output, precisión, y capacidad de mejorar procesos sin paralizar la operación.' },
  2: { fortaleza: 'Altísima efectividad en roles relacionales, cohesión del equipo, retención de talento, resolución informal de conflictos.', limitacion: 'Puede sacrificar rendimiento propio por ayudar a otros. Dificultad con metas individuales cuando hay necesidades grupales urgentes.', indicadores: 'Evaluar por impacto relacional, clima del equipo y capacidad de establecer límites sin dejar de cuidar.' },
  3: { fortaleza: 'Entrega de resultados con energía y consistencia, alta adaptabilidad al contexto y capacidad de movilizar al equipo.', limitacion: 'Puede priorizar la apariencia del logro sobre el proceso real. Riesgo de burnout por sobre exigencia autogenerada.', indicadores: 'Evaluar resultados concretos, pero también el proceso y la sostenibilidad. Cuidar que no infle métricas.' },
  4: { fortaleza: 'Innovación genuina, calidad estética y conceptual elevada, aporte único de perspectivas que otros no ven.', limitacion: 'Irregularidad en la producción: picos de brillantez y valles de parálisis. Dificultad con tareas rutinarias o sin significado.', indicadores: 'Evaluar por la calidad del aporte creativo y por la capacidad de completar proyectos, no solo de iniciarlos.' },
  5: { fortaleza: 'Análisis profundo, estrategia de largo plazo, resolución de problemas complejos, pensamiento sistémico.', limitacion: 'Puede tardar más de lo necesario en decidir o actuar. Dificultad para comunicar su trabajo a no-expertos.', indicadores: 'Evaluar por calidad del análisis, claridad en la comunicación de sus conclusiones y capacidad de pasar a la acción.' },
  6: { fortaleza: 'Confiabilidad extrema, cumplimiento de compromisos, anticipación de riesgos, construcción de confianza institucional.', limitacion: 'Puede paralizar proyectos por exceso de análisis de riesgo. Necesita más validación que otros antes de avanzar.', indicadores: 'Evaluar por consistencia, lealtad institucional y capacidad de tomar decisiones bajo incertidumbre razonable.' },
  7: { fortaleza: 'Alta generación de ideas, energía y entusiasmo que mueve al equipo, visión de oportunidades, innovación.', limitacion: 'Dificultad para cerrar proyectos. Puede dispersarse y dejar cosas incompletas. Bajo umbral de aburrimiento.', indicadores: 'Evaluar por tasa de cierre de proyectos iniciados, no solo por la calidad de las ideas generadas.' },
  8: { fortaleza: 'Ejecución rápida, decisión en momentos de crisis, capacidad de movilizar recursos y personas hacia objetivos.', limitacion: 'Puede generar tensión por el estilo directivo. Dificultad para delegar o confiar en el proceso de otros.', indicadores: 'Evaluar por impacto real, capacidad de construir equipo y resultados sostenibles, no solo de crisis resueltas.' },
  9: { fortaleza: 'Coordinación efectiva, mediación de conflictos, integración de perspectivas diversas, clima laboral positivo.', limitacion: 'Puede perder iniciativa propia y diluirse en las agendas ajenas. Dificultad para medir su propio impacto.', indicadores: 'Evaluar por impacto en la cohesión del equipo, capacidad de iniciativa propia y efectividad en la coordinación.' },
};

export const TIPO_CAPACITACION = {
  1: 'Metodologías: casos de estudio con criterios claros, análisis de errores y mejora continua. Contenidos que resuenan: ética profesional, gestión de calidad, liderazgo desde principios. Evitar: dinámicas caóticas o sin estructura, facilitadores que no tienen dominio del tema.',
  2: 'Metodologías: aprendizaje colaborativo, roleplay de situaciones relacionales, grupos pequeños. Contenidos que resuenan: comunicación empática, bienestar organizacional, liderazgo de equipos. Evitar: capacitaciones puramente técnicas sin componente humano, entornos competitivos y fríos.',
  3: 'Metodologías: formatos intensivos con resultados visibles y tangibles, coaching ejecutivo, casos de éxito. Contenidos que resuenan: liderazgo de alto desempeño, presentación ejecutiva, negociación. Evitar: capacitaciones largas sin aplicación práctica inmediata ni métricas de impacto.',
  4: 'Metodologías: talleres experienciales, arte-terapia organizacional, exploración creativa con libertad de expresión. Contenidos que resuenan: creatividad aplicada, innovación, cultura organizacional e identidad. Evitar: capacitaciones estandarizadas y corporativas que no dejan espacio a la expresión individual.',
  5: 'Metodologías: autoaprendizaje, lecturas profundas, clases magistrales de alta calidad, investigación propia. Contenidos que resuenan: estrategia, pensamiento sistémico, análisis de datos, tecnología avanzada. Evitar: dinámicas grupales forzadas, roleplay emocional, contenidos superficiales sin fundamento.',
  6: 'Metodologías: capacitación estructurada con bibliografía sólida, mentoring de personas confiables, grupos estables. Contenidos que resuenan: gestión de riesgos, toma de decisiones bajo incertidumbre, liderazgo transformacional. Evitar: capacitaciones caóticas, cambios de facilitador frecuentes, contenidos sin respaldo.',
  7: 'Metodologías: experiencias inmersivas, hackathons, formatos cortos y variados, gamificación. Contenidos que resuenan: innovación, design thinking, emprendimiento, tendencias del futuro. Evitar: capacitaciones largas y lineales sin variedad, contenidos densos y repetitivos, entornos sin energía.',
  8: 'Metodologías: workshops intensivos de alto impacto, conversaciones directas con expertos, coaching ejecutivo. Contenidos que resuenan: liderazgo en crisis, negociación avanzada, gestión del poder e influencia. Evitar: capacitaciones que los traten como aprendices en lugar de líderes, dinámicas infantilizantes.',
  9: 'Metodologías: aprendizaje experiencial en grupos armoniosos, facilitadores empáticos, proceso gradual sin urgencia. Contenidos que resuenan: mediación de conflictos, facilitación grupal, desarrollo personal, propósito. Evitar: capacitaciones de alta presión, competitivas o que requieran posicionamiento público forzado.',
};

/** Proyectos-tipo usados en "Equipos de proyecto" (composición ideal por perfil). */
export const PROYECTOS_TIPO = [
  { nombre: 'Proyecto de transformación / cambio organizacional', tipos: [8, 1, 3, 7], razon: 'Necesita liderazgo fuerte (T8), rigor metodológico (T1), motor de ejecución (T3) y generación de adhesión (T7).' },
  { nombre: 'Proyecto creativo / de innovación', tipos: [4, 7, 5, 3], razon: 'Requiere alma creativa (T4), entusiasmo e ideas (T7), análisis profundo (T5) y capacidad de llevar la idea al resultado (T3).' },
  { nombre: 'Proyecto de mejora de procesos / calidad', tipos: [1, 5, 6, 9], razon: 'Necesita estándares altos (T1), análisis sistémico (T5), anticipación de riesgos (T6) y mediación de resistencias (T9).' },
  { nombre: 'Proyecto de alta exposición / ventas', tipos: [3, 8, 7, 2], razon: 'Requiere orientación a resultados (T3), decisión y cierre (T8), entusiasmo (T7) y construcción de relaciones (T2).' },
  { nombre: 'Proyecto de alta complejidad técnica', tipos: [5, 1, 6, 3], razon: 'Necesita profundidad analítica (T5), rigor (T1), gestión de riesgos (T6) y entrega de resultados (T3).' },
  { nombre: 'Proyecto de bienestar / cultura interna', tipos: [2, 9, 4, 6], razon: 'Requiere empatía y cuidado (T2), mediación (T9), creatividad cultural (T4) y responsabilidad institucional (T6).' },
];
