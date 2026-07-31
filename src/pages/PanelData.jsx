import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowsRightLeftIcon,
  CheckCircleIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  XMarkIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline';
import { CONFIG } from '../lib/config.js';
import { Session } from '../lib/session.js';
import { Auth } from '../lib/auth.js';
import { getRespuestasByAdmin } from '../lib/api.js';
import { sanitizeText } from '../lib/sanitize.js';
import { loadScript } from '../lib/loadScript.js';
import Footer from '../components/Footer.jsx';
import {
  TIPO_NOMBRES,
  TIPO_SUBTITULO,
  TIPO_CORTO,
  TIPO_COLORS,
  TIPO_MOTIVADOR,
  TIPO_PUNTO_CIEGO,
  TIPO_ROL_EQUIPO,
  TIPO_COMUNICACION,
  TIPO_BURNOUT_SENALES,
  TIPO_DESEMPENO_ESPERAR,
  TIPO_FEEDBACK_11,
  TIPO_RETENCION,
  TIPO_CONFLICTO_GESTION,
  TIPO_COMO_LIDERAR,
  TIPO_CAPACITACION,
  TIPO_DESCRIPCION,
  TIPO_FORTALEZAS,
  TIPO_DESARROLLO,
  TIPO_NIVEL_SANO,
  TIPO_NIVEL_INSANO,
  LIDERAZGO_POTENCIAL,
} from '../lib/eneagramaPanelData.js';
import {
  buildPerson,
  computeHeroStats,
  computeMainChartData,
  computeTriadasChartData,
  generateInsights,
  computeCompatibility,
  computeRRHHRows,
  computeEquiposProyecto,
  getPresentTypes,
  countByType,
  computeClimaRadar,
  computeEnergiaBar,
  computeConvivencia,
  computeDinamicas,
  computeClimaTriada,
  computeConfrontacion,
  computeRituales,
  computePuntosCriticos,
} from '../lib/panelInsights.js';

/** Bloque de gestión genérico (Feedback 1:1, Retención, Conflicto, Cómo liderar, Capacitación...). */
function GestionBlock({ title, dataObj, presentTypes, typeCounts, accent }) {
  return (
    <div className="mb-8">
      <h3 className="mb-4 font-title text-lg font-bold">{title}</h3>
      {presentTypes.length === 0 ? (
        <p className="text-xs text-one-slate">Sin evaluados aún</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {presentTypes.map((t) => (
            <div key={t} className="rounded-2xl border border-white/10 p-5" style={{ backgroundColor: accent, borderTopColor: TIPO_COLORS[t], borderTopWidth: 2 }}>
              <div className="mb-2 flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-black text-white" style={{ backgroundColor: TIPO_COLORS[t] }}>
                  {t}
                </span>
                <span className="text-sm font-bold" style={{ color: TIPO_COLORS[t] }}>
                  {TIPO_CORTO[t]}
                </span>
                <span className="ml-auto text-[10px] text-one-slate">{typeCounts[t]} pers.</span>
              </div>
              <p className="text-xs leading-relaxed text-one-slate">{dataObj[t]}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Panel RRHH — reescritura en React de AdminDashboard/paneldata/ (legacy).
 * Fuente de datos: una sola consulta getRespuestasByAdmin(adminId) (en vez
 * de N fetches por usuario del legacy). Todo el análisis (insights,
 * compatibilidad, burnout, etc.) es visualización derivada de puntajes ya
 * calculados — no requiere tablas nuevas.
 */

const CHART_JS_CDN = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';

function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center">
      <div className="text-2xl font-black text-one-cyan">{value}</div>
      <div className="mt-1 text-xs uppercase tracking-wider text-one-slate">{label}</div>
    </div>
  );
}

export default function PanelData() {
  const navigate = useNavigate();
  const session = Session.get();

  const [persons, setPersons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState('bar');
  const [filterTipo, setFilterTipo] = useState('');
  const [search, setSearch] = useState('');
  const [modalIdx, setModalIdx] = useState(null);
  const [modalTab, setModalTab] = useState('perfil');
  const [tipoPopup, setTipoPopup] = useState(null); // tipo (1-9) para el popup "ver personas de este tipo"
  const [activeTab, setActiveTab] = useState('overview'); // overview | equipo | gestion | cultura

  const mainChartRef = useRef(null);
  const triadasChartRef = useRef(null);
  const climaChartRef = useRef(null);
  const energiaChartRef = useRef(null);
  const mainChartInstance = useRef(null);
  const triadasChartInstance = useRef(null);
  const climaChartInstance = useRef(null);
  const energiaChartInstance = useRef(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        await loadScript(CHART_JS_CDN);
        const rows = await getRespuestasByAdmin(session.adminId);
        setPersons(rows.filter((r) => r.TipoBase).map(buildPerson));
      } catch (error) {
        console.error('Error cargando panel RRHH:', error);
      } finally {
        setLoading(false);
      }
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredPersons = useMemo(() => {
    return persons.filter((p) => {
      if (filterTipo && p.tipo !== Number(filterTipo)) return false;
      if (search && !p.nombre.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [persons, filterTipo, search]);

  const hero = useMemo(() => computeHeroStats(persons), [persons]);
  const mainChartData = useMemo(() => computeMainChartData(filteredPersons), [filteredPersons]);
  const triadasChartData = useMemo(() => computeTriadasChartData(filteredPersons), [filteredPersons]);
  const insights = useMemo(() => generateInsights(persons), [persons]);
  const compat = useMemo(() => computeCompatibility(persons), [persons]);
  const rrhhRows = useMemo(() => computeRRHHRows(persons), [persons]);
  const equipos = useMemo(() => computeEquiposProyecto(persons), [persons]);
  const presentTypes = useMemo(() => getPresentTypes(persons), [persons]);
  const typeCounts = useMemo(() => countByType(persons), [persons]);
  const climaRadarData = useMemo(() => computeClimaRadar(persons), [persons]);
  const energiaBarData = useMemo(() => computeEnergiaBar(persons), [persons]);
  const convivencia = useMemo(() => computeConvivencia(persons), [persons]);
  const dinamicas = useMemo(() => computeDinamicas(persons), [persons]);
  const climaTriada = useMemo(() => computeClimaTriada(persons), [persons]);
  const confrontacion = useMemo(() => computeConfrontacion(persons), [persons]);
  const rituales = useMemo(() => computeRituales(persons), [persons]);
  const puntosCriticos = useMemo(() => computePuntosCriticos(persons), [persons]);

  const modalPerson = modalIdx !== null ? persons[modalIdx] : null;

  function openPersonModal(idx, tab) {
    setModalIdx(idx);
    setModalTab(tab || 'perfil');
  }

  function verInformeCompleto(p) {
    if (!p) return;
    const payload = { Nombre: p._nombre || '', Apellido: p._apellido || '', Correo: p.email || '', Fecha: p.fecha || '', User: p.user || '', Respuestas: p.respuestas || '' };
    localStorage.setItem('eneagramaUserData', JSON.stringify(payload));
    window.open(CONFIG.routes.informe, '_blank', 'noopener');
  }

  // Chart.js — bar/radar principal
  useEffect(() => {
    if (loading || !window.Chart || !mainChartRef.current) return;
    if (mainChartInstance.current) mainChartInstance.current.destroy();
    const ctx = mainChartRef.current.getContext('2d');
    const common = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
    };
    if (chartType === 'bar') {
      mainChartInstance.current = new window.Chart(ctx, {
        type: 'bar',
        data: { labels: mainChartData.labels, datasets: [{ data: mainChartData.data, backgroundColor: mainChartData.colors, borderRadius: 6 }] },
        options: {
          ...common,
          scales: {
            x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#a4a8c0' } },
            y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#a4a8c0', stepSize: 1 }, beginAtZero: true },
          },
        },
      });
    } else {
      mainChartInstance.current = new window.Chart(ctx, {
        type: 'radar',
        data: {
          labels: mainChartData.labelsRadar,
          datasets: [{ data: mainChartData.data, backgroundColor: 'rgba(107,225,227,0.12)', borderColor: '#6be1e3', borderWidth: 2, pointBackgroundColor: mainChartData.colors, pointRadius: 4 }],
        },
        options: {
          ...common,
          scales: { r: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#a4a8c0', backdropColor: 'transparent', stepSize: 1 }, pointLabels: { color: '#a4a8c0' } } },
        },
      });
    }
  }, [loading, chartType, mainChartData, activeTab]);

  // Chart.js — doughnut de tríadas
  useEffect(() => {
    if (loading || !window.Chart || !triadasChartRef.current) return;
    if (triadasChartInstance.current) triadasChartInstance.current.destroy();
    const ctx = triadasChartRef.current.getContext('2d');
    triadasChartInstance.current = new window.Chart(ctx, {
      type: 'doughnut',
      data: { labels: triadasChartData.labels, datasets: [{ data: triadasChartData.data, backgroundColor: triadasChartData.colors, borderWidth: 0, hoverOffset: 6 }] },
      options: { responsive: true, maintainAspectRatio: false, cutout: '65%', plugins: { legend: { display: false } } },
    });
  }, [loading, triadasChartData, activeTab]);

  // Chart.js — radar de clima organizacional
  useEffect(() => {
    if (loading || !window.Chart || !climaChartRef.current) return;
    if (climaChartInstance.current) climaChartInstance.current.destroy();
    const ctx = climaChartRef.current.getContext('2d');
    climaChartInstance.current = new window.Chart(ctx, {
      type: 'radar',
      data: { labels: climaRadarData.labels, datasets: [{ data: climaRadarData.data, backgroundColor: 'rgba(107,225,227,0.12)', borderColor: '#6be1e3', borderWidth: 2, pointBackgroundColor: '#6be1e3', pointRadius: 4 }] },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { r: { min: 0, max: 100, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#a4a8c0', backdropColor: 'transparent', stepSize: 25 }, pointLabels: { color: '#a4a8c0', font: { size: 10 } } } },
      },
    });
  }, [loading, climaRadarData, activeTab]);

  // Chart.js — barras de energía del equipo (personas por tipo)
  useEffect(() => {
    if (loading || !window.Chart || !energiaChartRef.current) return;
    if (energiaChartInstance.current) energiaChartInstance.current.destroy();
    const ctx = energiaChartRef.current.getContext('2d');
    energiaChartInstance.current = new window.Chart(ctx, {
      type: 'bar',
      data: { labels: energiaBarData.labels, datasets: [{ data: energiaBarData.data, backgroundColor: energiaBarData.colors, borderRadius: 6 }] },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#a4a8c0', font: { size: 10 } } },
          y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#a4a8c0', font: { size: 10 }, stepSize: 1 }, beginAtZero: true },
        },
      },
    });
  }, [loading, energiaBarData, activeTab]);

  function logout() {
    Auth.logout();
    navigate(CONFIG.routes.login);
  }

  return (
    <div className="isolate min-h-screen min-h-dvh overflow-x-hidden bg-black font-title text-white">
      <div className="fixed inset-0 -z-20 bg-gradient-to-br from-black via-one-ink to-black" />
      <div className="bg-hex-pattern fixed -inset-[20%] -z-10 -rotate-[8deg] opacity-16 mix-blend-screen" />

      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/60 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 lg:flex-row">
            <div>
              <h2 className="bg-gradient-to-r from-one-cyan to-one-pink bg-clip-text font-title text-xl font-bold text-transparent">
                Panel RRHH — Análisis del Equipo
              </h2>
              <p className="text-xs text-one-slate">{session ? `${session.userName} (${session.userEmail})` : ''}</p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {!loading && persons.length > 0 && (
                <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 p-1">
                  {[
                    ['overview', 'General'],
                    ['equipo', 'Equipo'],
                    ['gestion', 'Gestión'],
                    ['cultura', 'Cultura'],
                  ].map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => setActiveTab(key)}
                      className={
                        'cursor-pointer rounded-md px-3 py-1.5 text-xs font-bold transition-colors ' +
                        (activeTab === key ? 'bg-one-cyan/20 text-one-cyan' : 'text-one-slate hover:text-white')
                      }
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
              <Link
                to={CONFIG.routes.adminDashboard}
                className="rounded-full border border-white/15 bg-white/5 px-5 py-2 text-sm font-semibold transition-all hover:-translate-y-0.5 hover:bg-white/10"
              >
                ← Volver al panel
              </Link>
              <button
                className="rounded-full border border-red-500/40 bg-red-500/20 px-5 py-2 text-sm font-semibold transition-all hover:-translate-y-0.5 hover:border-red-500/60"
                onClick={logout}
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        {loading ? (
          <div className="flex min-h-[40vh] items-center justify-center text-one-slate">Cargando datos del equipo...</div>
        ) : persons.length === 0 ? (
          <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-center text-one-slate">
            <p className="text-lg font-semibold text-white">Todavía no hay evaluaciones completadas</p>
            <p className="max-w-md text-sm">Cuando tus usuarios completen el test Eneagrama, vas a ver acá el análisis del equipo.</p>
          </div>
        ) : (
          <>
          {activeTab === 'overview' && (
          <>
            {/* Hero stats */}
            <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
              <StatCard label="Evaluados" value={hero.total} />
              <StatCard label="Tipos presentes" value={`${hero.typesPresent}/9`} />
              <StatCard label="Tipo dominante" value={hero.dominant ? `T${hero.dominant[0]}` : '—'} />
              <StatCard label="Diversidad" value={`${hero.diversidad}/100`} />
            </div>

            {/* Charts */}
            <div className="mb-8 grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-title text-sm font-bold uppercase tracking-wider text-one-slate">Distribución por tipo</h3>
                  <div className="flex gap-2">
                    {['bar', 'radar'].map((t) => (
                      <button
                        key={t}
                        onClick={() => setChartType(t)}
                        className={
                          'rounded-full border px-3 py-1 text-xs font-semibold ' +
                          (chartType === t ? 'border-one-cyan/50 bg-one-cyan/15 text-one-cyan' : 'border-white/15 bg-white/5 text-gray-300')
                        }
                      >
                        {t === 'bar' ? 'Barras' : 'Radar'}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="h-64">
                  <canvas ref={mainChartRef} />
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <h3 className="mb-4 font-title text-sm font-bold uppercase tracking-wider text-one-slate">Tríadas</h3>
                <div className="flex items-center gap-6">
                  <div className="h-48 w-48 shrink-0">
                    <canvas ref={triadasChartRef} />
                  </div>
                  <div className="flex-1 space-y-2">
                    {triadasChartData.legend.map((l) => (
                      <div key={l.key} className="flex items-center gap-2 text-sm">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: l.color }} />
                        <span className="flex-1 font-semibold">{l.label}</span>
                        <span className="text-one-slate">{l.count} pers.</span>
                        <span className="text-one-cyan">{l.pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Insights */}
            <div className="mb-8">
              <h3 className="mb-4 font-title text-lg font-bold">Insights automáticos</h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {insights.map((ins, i) => (
                  <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-5" style={{ borderTopColor: ins.color, borderTopWidth: 2 }}>
                    <div className="mb-1.5 text-[10px] font-bold uppercase tracking-widest" style={{ color: ins.color }}>
                      {ins.tag}
                    </div>
                    <div className="mb-2 font-title text-sm font-bold">{ins.title}</div>
                    {ins.items ? (
                      <ul className="space-y-1.5 text-xs leading-relaxed text-one-slate">
                        {ins.items.map((item, ii) => (
                          <li key={ii} className="flex items-start gap-1.5">
                            {item.ok ? (
                              <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />
                            ) : (
                              <XCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                            )}
                            <span>{sanitizeText(item.label)}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div
                        className="text-xs leading-relaxed text-one-slate"
                        dangerouslySetInnerHTML={{ __html: sanitizeText(ins.text).replace(/·/g, '·<wbr>') }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Compatibilidad */}
            <div className="mb-8 grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <h3 className="mb-3 font-title text-sm font-bold uppercase tracking-wider text-one-slate">Potencial de liderazgo</h3>
                <div className="space-y-2">
                  {compat.leaders.length === 0 && <p className="text-xs text-one-slate">Sin perfiles identificados</p>}
                  {compat.leaders.map((p, i) => (
                    <div key={i} className="rounded-lg border border-white/10 bg-black/30 p-3 text-xs">
                      <strong>{sanitizeText(p.nombre)}</strong> — T{p.tipo} {TIPO_CORTO[p.tipo]}
                      <div className="mt-1 text-one-slate">
                        Potencial {p.lid.nivel}: {p.lid.razon}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <h3 className="mb-3 font-title text-sm font-bold uppercase tracking-wider text-one-slate">Duplas de alta sinergia</h3>
                <div className="space-y-2">
                  {compat.duplas.length === 0 && <p className="text-xs text-one-slate">Pocos evaluados para calcular duplas</p>}
                  {compat.duplas.map((d, i) => (
                    <div key={i} className="rounded-lg border border-white/10 bg-black/30 p-3 text-xs">
                      <strong>
                        {sanitizeText(d.a.nombre)} + {sanitizeText(d.b.nombre)}
                      </strong>
                      <div className="mt-1 text-one-slate">
                        T{d.a.tipo}+T{d.b.tipo}: {d.razon}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <h3 className="mb-3 font-title text-sm font-bold uppercase tracking-wider text-one-slate">Tensiones a gestionar</h3>
                <div className="space-y-2">
                  {compat.tensiones.length === 0 && <p className="text-xs text-one-slate">No se detectan tensiones significativas</p>}
                  {compat.tensiones.map((t, i) => (
                    <div key={i} className="rounded-lg border border-white/10 bg-black/30 p-3 text-xs">
                      <strong className="inline-flex items-center gap-1.5">
                        {sanitizeText(t.a.nombre)}
                        <ArrowsRightLeftIcon className="h-3.5 w-3.5 text-one-slate" />
                        {sanitizeText(t.b.nombre)}
                      </strong>
                      <div className="mt-1 text-one-slate">{t.razon}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <h3 className="mb-3 font-title text-sm font-bold uppercase tracking-wider text-one-slate">Gaps del equipo</h3>
                <div className="space-y-2">
                  {compat.gaps.length === 0 && (
                    <p className="flex items-center gap-1.5 text-xs text-green-400">
                      <CheckCircleIcon className="h-4 w-4" /> Todos los tipos están representados
                    </p>
                  )}
                  {compat.gaps.map((t) => (
                    <div key={t} className="rounded-lg border border-white/10 bg-black/30 p-3 text-xs">
                      <strong>
                        T{t} — {TIPO_CORTO[t]}
                      </strong>
                      <div className="mt-1 text-one-slate">Falta: {TIPO_ROL_EQUIPO[t]}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
          )}

          {activeTab === 'equipo' && (
            <div className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="font-title text-sm font-bold uppercase tracking-wider text-one-slate">Equipo evaluado</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Buscar..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="rounded-full border border-white/15 bg-black/40 px-3 py-1.5 text-xs text-white focus:border-one-cyan/50 focus:outline-none"
                  />
                  <select
                    value={filterTipo}
                    onChange={(e) => setFilterTipo(e.target.value)}
                    className="rounded-full border border-white/15 bg-black/40 px-3 py-1.5 text-xs text-white focus:border-one-cyan/50 focus:outline-none"
                  >
                    <option value="">Todos los tipos</option>
                    {presentTypes.map((t) => (
                      <option key={t} value={t}>
                        T{t} — {TIPO_CORTO[t]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {filteredPersons.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => openPersonModal(persons.indexOf(p), 'perfil')}
                    className="cursor-pointer rounded-xl border border-white/10 bg-black/30 p-4 text-left transition-all hover:-translate-y-0.5 hover:border-one-cyan/40"
                    style={{ borderTopColor: TIPO_COLORS[p.tipo], borderTopWidth: 2 }}
                  >
                    <div
                      className="mb-2 flex h-8 w-8 items-center justify-center rounded-full text-sm font-black text-white"
                      style={{ backgroundColor: TIPO_COLORS[p.tipo] }}
                    >
                      {p.tipo}
                    </div>
                    <div className="truncate text-sm font-semibold">{sanitizeText(p.nombre)}</div>
                    <div className="text-xs text-one-slate">
                      T{p.tipo} — {TIPO_CORTO[p.tipo]}
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full rounded-full" style={{ width: `${p.scores[p.tipo] || 0}%`, backgroundColor: TIPO_COLORS[p.tipo] }} />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'gestion' && (
          <>
            {/* Tabla de gestión RRHH */}
            <div className="mb-8 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
              <div className="border-b border-white/10 px-5 py-4">
                <h3 className="font-title text-sm font-bold uppercase tracking-wider text-one-slate">Gestión — vista rápida por persona</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-white/5">
                    <tr>
                      {['Persona', 'Tipo', 'Rol en el equipo', 'Motivador', 'Punto ciego', 'Liderazgo', ''].map((h) => (
                        <th key={h} className="px-4 py-3 text-left font-bold uppercase tracking-wider text-gray-400">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rrhhRows.map((p, i) => (
                      <tr key={i} className="border-t border-white/5 hover:bg-one-cyan/5">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-white">{sanitizeText(p.nombre)}</div>
                          <div className="text-[10px] text-one-slate">{sanitizeText(p.email)}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="rounded-full border px-2 py-1 text-[10px] font-bold"
                            style={{ color: TIPO_COLORS[p.tipo], backgroundColor: `${TIPO_COLORS[p.tipo]}22`, borderColor: `${TIPO_COLORS[p.tipo]}44` }}
                          >
                            T{p.tipo} {TIPO_CORTO[p.tipo]}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-one-slate">{p.rol}</td>
                        <td className="px-4 py-3 text-one-slate">{TIPO_MOTIVADOR[p.tipo]}</td>
                        <td className="px-4 py-3 text-orange-300">{TIPO_PUNTO_CIEGO[p.tipo]?.split(':')[0]}</td>
                        <td className="px-4 py-3">
                          <span
                            className={
                              'rounded-full px-2 py-1 text-[10px] font-bold ' +
                              (p.liderazgo?.nivel === 'Alto'
                                ? 'bg-green-500/15 text-green-300'
                                : p.liderazgo?.nivel === 'Medio'
                                  ? 'bg-yellow-500/15 text-yellow-300'
                                  : 'bg-white/10 text-gray-300')
                            }
                          >
                            {p.liderazgo?.nivel}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => openPersonModal(persons.indexOf(p), 'perfil')}
                            className="cursor-pointer rounded-md border border-one-cyan/25 bg-one-cyan/10 px-2.5 py-1 text-[10px] font-bold text-one-cyan transition-colors hover:bg-one-cyan/20"
                          >
                            Ver
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <GestionBlock title="Feedback 1:1 por tipo" dataObj={TIPO_FEEDBACK_11} presentTypes={presentTypes} typeCounts={typeCounts} accent="rgba(107,225,227,0.05)" />

            {/* Señales de burnout por tipo presente */}
            <div className="mb-8">
              <h3 className="mb-4 font-title text-lg font-bold">Señales de burnout a monitorear</h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {presentTypes.map((t) => (
                  <div key={t} className="rounded-2xl border border-red-500/15 bg-red-500/5 p-5" style={{ borderLeftColor: TIPO_COLORS[t], borderLeftWidth: 3 }}>
                    <div className="mb-2 flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-black text-white" style={{ backgroundColor: TIPO_COLORS[t] }}>
                        {t}
                      </span>
                      <span className="text-sm font-bold" style={{ color: TIPO_COLORS[t] }}>
                        {TIPO_CORTO[t]}
                      </span>
                    </div>
                    <ul className="space-y-1 text-xs text-one-slate">
                      {(TIPO_BURNOUT_SENALES[t] || []).map((s, i) => (
                        <li key={i} className="flex gap-1.5">
                          <ExclamationTriangleIcon className="h-3.5 w-3.5 shrink-0 text-red-400" />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <GestionBlock title="Estrategias de retención por tipo" dataObj={TIPO_RETENCION} presentTypes={presentTypes} typeCounts={typeCounts} accent="rgba(80,250,123,0.04)" />
            <GestionBlock title="Gestión de conflictos por tipo" dataObj={TIPO_CONFLICTO_GESTION} presentTypes={presentTypes} typeCounts={typeCounts} accent="rgba(228,199,106,0.04)" />
            <GestionBlock title="Cómo liderar cada tipo" dataObj={TIPO_COMO_LIDERAR} presentTypes={presentTypes} typeCounts={typeCounts} accent="rgba(107,225,227,0.04)" />

            {/* Desempeño esperado */}
            <div className="mb-8">
              <h3 className="mb-4 font-title text-lg font-bold">Qué esperar del desempeño por tipo</h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {presentTypes.map((t) => {
                  const d = TIPO_DESEMPENO_ESPERAR[t];
                  return (
                    <div key={t} className="rounded-2xl border border-white/10 bg-white/5 p-5" style={{ borderTopColor: TIPO_COLORS[t], borderTopWidth: 2 }}>
                      <div className="mb-2 flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-black text-white" style={{ backgroundColor: TIPO_COLORS[t] }}>
                          {t}
                        </span>
                        <span className="text-sm font-bold" style={{ color: TIPO_COLORS[t] }}>
                          {TIPO_CORTO[t]}
                        </span>
                      </div>
                      <p className="mb-2 flex items-center gap-1 text-[10px] font-bold uppercase text-green-400">
                        <CheckCircleIcon className="h-3.5 w-3.5" /> Fortaleza
                      </p>
                      <p className="mb-3 text-xs text-one-slate">{d.fortaleza}</p>
                      <p className="mb-2 flex items-center gap-1 text-[10px] font-bold uppercase text-orange-300">
                        <ExclamationTriangleIcon className="h-3.5 w-3.5" /> Limitación típica
                      </p>
                      <p className="text-xs text-one-slate">{d.limitacion}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Equipos de proyecto */}
            <div className="mb-8">
              <h3 className="mb-4 font-title text-lg font-bold">Composición ideal por tipo de proyecto</h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {equipos.map((proj, i) => (
                  <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <div className="mb-2 text-sm font-bold text-white">{proj.nombre}</div>
                    <div className="mb-2 flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${proj.strength}%`, backgroundColor: proj.strength >= 75 ? '#50fa7b' : proj.strength >= 50 ? '#e4c76a' : '#ff5555' }}
                        />
                      </div>
                      <span className="text-xs font-bold" style={{ color: proj.strength >= 75 ? '#50fa7b' : proj.strength >= 50 ? '#e4c76a' : '#ff5555' }}>
                        {proj.strength}%
                      </span>
                    </div>
                    <p className="mb-3 text-xs text-one-slate">{proj.razon}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {proj.available.map((t) => (
                        <span key={t} className="inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ color: TIPO_COLORS[t], backgroundColor: `${TIPO_COLORS[t]}22`, border: `1px solid ${TIPO_COLORS[t]}44` }}>
                          T{t} <CheckIcon className="h-3 w-3" />
                        </span>
                      ))}
                      {proj.missing.map((t) => (
                        <span key={t} className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-bold text-one-slate">
                          T{t} —
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <GestionBlock title="Capacitación por tipo" dataObj={TIPO_CAPACITACION} presentTypes={presentTypes} typeCounts={typeCounts} accent="rgba(228,199,106,0.04)" />
          </>
          )}

          {activeTab === 'cultura' && (
          <>
            {/* Guía de comunicación */}
            <div className="mb-8">
              <h3 className="mb-4 font-title text-lg font-bold">Guía de comunicación por tipo</h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {presentTypes.map((t) => (
                  <div key={t} className="rounded-2xl border border-white/10 bg-white/5 p-5" style={{ borderColor: `${TIPO_COLORS[t]}33` }}>
                    <div className="mb-2 flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-black text-white" style={{ backgroundColor: TIPO_COLORS[t] }}>
                        {t}
                      </span>
                      <span className="text-sm font-bold" style={{ color: TIPO_COLORS[t] }}>
                        {TIPO_CORTO[t]}
                      </span>
                    </div>
                    <p className="mb-3 text-xs text-one-slate">{TIPO_COMUNICACION[t]}</p>
                    <button
                      onClick={() => setTipoPopup(t)}
                      className="w-full cursor-pointer rounded-md border py-1.5 text-[11px] font-bold transition-colors"
                      style={{ borderColor: `${TIPO_COLORS[t]}44`, backgroundColor: `${TIPO_COLORS[t]}18`, color: TIPO_COLORS[t] }}
                    >
                      Ver {typeCounts[t]} persona{typeCounts[t] > 1 ? 's' : ''} de este tipo →
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-8 grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <h3 className="mb-4 font-title text-sm font-bold uppercase tracking-wider text-one-slate">Radar de clima organizacional</h3>
                <div className="h-64">
                  <canvas ref={climaChartRef} />
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <h3 className="mb-4 font-title text-sm font-bold uppercase tracking-wider text-one-slate">Energía del equipo por tipo</h3>
                <div className="h-64">
                  <canvas ref={energiaChartRef} />
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="mb-4 font-title text-lg font-bold">Convivencia</h3>
              <div className="grid gap-4 md:grid-cols-3">
                {convivencia.map((c, i) => (
                  <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-5" style={{ borderTopColor: c.color, borderTopWidth: 2 }}>
                    <div className="mb-1 text-[10px] font-bold uppercase tracking-widest" style={{ color: c.color }}>
                      {c.label}
                    </div>
                    <div className="mb-2 text-sm font-bold text-white">{c.title}</div>
                    <p className="text-xs leading-relaxed text-one-slate">{c.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <h3 className="mb-4 font-title text-lg font-bold">Dinámicas de equipo</h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {dinamicas.map((d, i) => (
                  <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <div className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-one-cyan">{d.t}</div>
                    <p className="text-xs leading-relaxed text-one-slate">{d.txt}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <h3 className="mb-4 font-title text-lg font-bold">Clima por tríada</h3>
              <div className="grid gap-4 lg:grid-cols-3">
                {climaTriada.map((tri) => (
                  <div key={tri.n} className="rounded-2xl border border-white/10 bg-white/5 p-5" style={{ borderLeftColor: tri.c, borderLeftWidth: 4 }}>
                    <div className="mb-3 flex items-center gap-2.5">
                      <div
                        className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-black"
                        style={{ backgroundColor: `${tri.c}22`, border: `2px solid ${tri.c}55`, color: tri.c }}
                      >
                        {tri.pct}%
                      </div>
                      <div>
                        <div className="text-sm font-bold" style={{ color: tri.c }}>
                          Centro {tri.n} · {tri.tipos}
                        </div>
                        <div className="text-[11px] text-one-slate">{tri.count} persona{tri.count > 1 ? 's' : ''} en el equipo</div>
                      </div>
                    </div>
                    <p className="mb-3 text-xs italic text-white">"{tri.clima}"</p>
                    <p className="mb-1 text-[10px] font-bold text-green-400">FORTALEZAS DEL CLIMA</p>
                    <p className="mb-3 text-xs text-one-slate">{tri.fortalezas}</p>
                    <p className="mb-1 text-[10px] font-bold text-orange-300">RIESGOS A MONITOREAR</p>
                    <p className="mb-3 text-xs text-one-slate">{tri.riesgos}</p>
                    <p className="mb-1 text-[10px] font-bold text-one-cyan">RECOMENDACIÓN</p>
                    <p className="text-xs text-one-slate">{tri.recomendacion}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <h3 className="mb-4 font-title text-lg font-bold">Poder y confrontación</h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {confrontacion.map((c, i) => (
                  <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-5" style={{ borderLeftColor: c.color, borderLeftWidth: 4 }}>
                    <div className="mb-2 text-sm font-bold" style={{ color: c.color }}>
                      {c.titulo}
                    </div>
                    <p className="text-xs leading-relaxed text-one-slate">{c.texto}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <h3 className="mb-4 font-title text-lg font-bold">Rituales sugeridos</h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {rituales.map((r, i) => (
                  <div
                    key={i}
                    className="rounded-2xl border bg-white/5 p-5"
                    style={{ borderColor: r.recomendada ? 'rgba(228,199,106,0.3)' : 'rgba(255,255,255,0.08)', borderTopWidth: r.recomendada ? 2 : 1, borderTopColor: r.recomendada ? '#e4c76a' : undefined }}
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <span className="text-sm font-bold" style={{ color: r.recomendada ? '#e4c76a' : '#a4a8c0' }}>
                        {r.t}
                      </span>
                      {r.recomendada && (
                        <span className="rounded-full border border-[#e4c76a44] bg-[#e4c76a26] px-2 py-0.5 text-[9px] font-bold text-[#e4c76a]">RECOMENDADO</span>
                      )}
                    </div>
                    <p className="text-xs leading-relaxed text-one-slate">{r.d}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <h3 className="mb-4 font-title text-lg font-bold">Puntos críticos de convivencia</h3>
              <div className="space-y-3">
                {puntosCriticos.map((p, i) => (
                  <div key={i} className="rounded-2xl border border-orange-500/20 bg-orange-500/5 p-5">
                    <div className="mb-1.5 text-sm font-bold text-orange-300">{p.title}</div>
                    <p className="text-xs leading-relaxed text-one-slate">{p.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
          )}
          </>
        )}
      </main>

      {/* Popup: personas de un tipo (desde la guía de comunicación) */}
      {tipoPopup && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/65 p-5 backdrop-blur-[8px]" onClick={(e) => e.target === e.currentTarget && setTipoPopup(null)}>
          <div className="w-full max-w-md rounded-2xl border border-white/12 bg-one-ink p-6" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
            <div className="mb-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full text-base font-black text-white" style={{ backgroundColor: TIPO_COLORS[tipoPopup] }}>
                  {tipoPopup}
                </div>
                <div>
                  <div className="text-sm font-bold">{TIPO_NOMBRES[tipoPopup]}</div>
                  <div className="text-xs text-one-slate">
                    {typeCounts[tipoPopup]} persona{typeCounts[tipoPopup] > 1 ? 's' : ''} · {TRIADA_LABEL[tipoPopup]}
                  </div>
                </div>
              </div>
              <button onClick={() => setTipoPopup(null)} className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/5 text-one-slate hover:text-white">
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
            <div className="mb-3 rounded-lg bg-white/5 p-2.5 text-xs leading-relaxed text-one-slate">{TIPO_COMUNICACION[tipoPopup]}</div>
            <div className="flex flex-col gap-1.5">
              {persons.filter((p) => p.tipo === tipoPopup).map((p, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
                  <div>
                    <div className="text-sm font-semibold">{sanitizeText(p.nombre)}</div>
                    <div className="text-[11px] text-one-slate">
                      {sanitizeText(p.email)} · {p.scores[p.tipo]}%
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setTipoPopup(null);
                      openPersonModal(persons.indexOf(p), 'perfil');
                    }}
                    className="shrink-0 cursor-pointer rounded-md px-2.5 py-1 text-[11px] font-bold"
                    style={{ border: `1px solid ${TIPO_COLORS[tipoPopup]}44`, backgroundColor: `${TIPO_COLORS[tipoPopup]}18`, color: TIPO_COLORS[tipoPopup] }}
                  >
                    Ver
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal: perfil RRHH / vista informe de una persona */}
      {modalPerson && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center bg-black/70 p-5 backdrop-blur-[10px]" onClick={(e) => e.target === e.currentTarget && setModalIdx(null)}>
          <div className="flex w-full max-w-2xl flex-col rounded-2xl border border-white/12 bg-one-ink" style={{ maxHeight: '85vh' }}>
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
              <h3 className="font-title text-sm font-bold">
                {sanitizeText(modalPerson.nombre)} · T{modalPerson.tipo} {TIPO_CORTO[modalPerson.tipo]}
              </h3>
              <button onClick={() => setModalIdx(null)} className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/5 text-one-slate hover:text-white">
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
            <div className="overflow-y-auto px-6 py-5">
              <div className="mb-4 flex gap-1.5">
                {['perfil', 'informe'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setModalTab(tab)}
                    className={
                      'cursor-pointer rounded-full border px-4 py-1.5 text-xs font-bold ' +
                      (modalTab === tab ? 'border-one-cyan/40 bg-one-cyan/15 text-one-cyan' : 'border-white/10 bg-transparent text-one-slate')
                    }
                  >
                    {tab === 'perfil' ? 'Perfil RRHH' : 'Vista Informe'}
                  </button>
                ))}
              </div>

              <PersonModalContent p={modalPerson} tab={modalTab} onVerInforme={() => verInformeCompleto(modalPerson)} />
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

const TRIADA_LABEL = { 1: 'Cuerpo', 2: 'Corazón', 3: 'Corazón', 4: 'Corazón', 5: 'Cabeza', 6: 'Cabeza', 7: 'Cabeza', 8: 'Cuerpo', 9: 'Cuerpo' };

function ScoreBars({ p }) {
  const maxScore = Math.max(...Object.values(p.scores), 1);
  return (
    <div className="flex items-end justify-between gap-1">
      {Array.from({ length: 9 }, (_, i) => i + 1).map((t) => {
        const sc = p.scores[t] || 0;
        const h = Math.round((sc / maxScore) * 50);
        const isBase = t === p.tipo;
        return (
          <div key={t} className="flex flex-1 flex-col items-center gap-1">
            <div className="flex h-[54px] w-full items-end justify-center">
              <div className="w-3.5 rounded-sm" style={{ height: `${h}px`, backgroundColor: isBase ? TIPO_COLORS[t] : 'rgba(255,255,255,0.12)' }} />
            </div>
            <div className="text-[10px] font-bold" style={{ color: isBase ? TIPO_COLORS[t] : '#a4a8c0' }}>
              {t}
            </div>
            <div className="text-[9px]" style={{ color: isBase ? TIPO_COLORS[t] : '#a4a8c0' }}>
              {sc}%
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ModalSection({ title, children }) {
  return (
    <div className="mb-4">
      <div className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-one-slate">{title}</div>
      <div className="text-xs leading-relaxed text-gray-200">{children}</div>
    </div>
  );
}

function PersonModalContent({ p, tab, onVerInforme }) {
  const color = TIPO_COLORS[p.tipo];
  const lid = LIDERAZGO_POTENCIAL[p.tipo];
  const a1c = TIPO_COLORS[p.ala1] || '#a4a8c0';
  const a2c = TIPO_COLORS[p.ala2] || '#a4a8c0';

  if (tab === 'informe') {
    return (
      <>
        <div className="mb-4 border-l-2 pl-3.5" style={{ borderColor: color }}>
          <div className="text-3xl font-black" style={{ color }}>{p.tipo}</div>
          <div className="text-base font-bold text-white">{TIPO_NOMBRES[p.tipo]}</div>
          <div className="text-xs text-one-slate">{sanitizeText(p.nombre)} · Evaluado: {p.fecha || 'Sin fecha'}</div>
        </div>

        <button
          onClick={onVerInforme}
          className="mb-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-one-cyan/35 bg-gradient-to-r from-one-cyan/10 to-one-pink/10 py-3 text-sm font-bold text-white transition-all hover:from-one-cyan/20 hover:to-one-pink/20"
        >
          <ArrowTopRightOnSquareIcon className="h-4 w-4" />
          Ver informe completo de {sanitizeText(p._nombre || p.nombre.split(' ')[0])}
        </button>

        <ModalSection title="Distribución de scores"><ScoreBars p={p} /></ModalSection>
        <ModalSection title="Score base">
          <div className="flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full" style={{ width: `${p.scores[p.tipo]}%`, background: `linear-gradient(90deg, ${color}, #e4c76a)` }} />
            </div>
            <span className="text-xs font-bold" style={{ color }}>{p.scores[p.tipo]}%</span>
          </div>
        </ModalSection>
        <ModalSection title="Fortalezas naturales">
          <ul className="list-disc space-y-1 pl-4">
            {(TIPO_FORTALEZAS[p.tipo] || []).map((f, i) => <li key={i}>{f}</li>)}
          </ul>
        </ModalSection>
        <ModalSection title="Áreas de desarrollo">{TIPO_DESARROLLO[p.tipo]}</ModalSection>
        <ModalSection title="Niveles de salud psicológica">
          <div className="grid gap-2 sm:grid-cols-3">
            <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-2.5"><div className="mb-1 text-[10px] font-bold text-green-400">Nivel Sano</div><div className="text-[11px] text-one-slate">{TIPO_NIVEL_SANO[p.tipo]}</div></div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-2.5"><div className="mb-1 text-[10px] font-bold text-one-slate">Nivel Promedio</div><div className="text-[11px] text-one-slate">{TIPO_ROL_EQUIPO[p.tipo]}. Opera con sus patrones automáticos.</div></div>
            <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-2.5"><div className="mb-1 text-[10px] font-bold text-red-300">Bajo estrés</div><div className="text-[11px] text-one-slate">{TIPO_NIVEL_INSANO[p.tipo]}</div></div>
          </div>
        </ModalSection>
        <ModalSection title="Integración y estrés">
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-2.5"><div className="text-[10px] font-bold text-emerald-400">↗ Crecimiento</div><div className="text-lg font-black text-emerald-400">{p.integracion}</div><div className="text-[11px] text-one-slate">Hacia {TIPO_CORTO[p.integracion]}</div></div>
            <div className="rounded-lg border border-one-pink/20 bg-one-pink/5 p-2.5"><div className="text-[10px] font-bold text-one-pink">↘ Estrés</div><div className="text-lg font-black text-one-pink">{p.desintegracion}</div><div className="text-[11px] text-one-slate">Hacia {TIPO_CORTO[p.desintegracion]}</div></div>
          </div>
        </ModalSection>
        <ModalSection title="En el trabajo">
          <p><strong className="text-[#e4c76a]">Motivación:</strong> {TIPO_MOTIVADOR[p.tipo]}</p>
          <p className="mt-1.5"><strong className="text-one-cyan">Rol:</strong> {TIPO_ROL_EQUIPO[p.tipo]}.</p>
        </ModalSection>
        <ModalSection title="Recomendaciones RRHH">{TIPO_FEEDBACK_11[p.tipo].slice(0, 200)}...</ModalSection>
      </>
    );
  }

  return (
    <>
      <div className="mb-4 border-l-2 pl-3.5" style={{ borderColor: color }}>
        <div className="text-3xl font-black" style={{ color }}>{p.tipo}</div>
        <div className="text-base font-bold text-white">{TIPO_NOMBRES[p.tipo]}</div>
        <div className="text-xs text-one-slate">{TIPO_SUBTITULO[p.tipo]}</div>
        <div className="mt-0.5 text-xs text-gray-300">{sanitizeText(p.nombre)} · {sanitizeText(p.email)}</div>
      </div>
      <ModalSection title="Scores"><ScoreBars p={p} /></ModalSection>
      <ModalSection title="Descripción">{TIPO_DESCRIPCION[p.tipo]}</ModalSection>
      <ModalSection title="Rol en el equipo">{TIPO_ROL_EQUIPO[p.tipo]}</ModalSection>
      <ModalSection title="Motivador principal">{TIPO_MOTIVADOR[p.tipo]}</ModalSection>
      <ModalSection title="Punto ciego"><span className="text-orange-300">{TIPO_PUNTO_CIEGO[p.tipo]}</span></ModalSection>
      <ModalSection title="Fortalezas">
        <div className="flex flex-wrap gap-1.5">
          {(TIPO_FORTALEZAS[p.tipo] || []).map((f, i) => (
            <span key={i} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px]">{f}</span>
          ))}
        </div>
      </ModalSection>
      <ModalSection title="Potencial de liderazgo">
        <strong style={{ color: lid.nivel === 'Alto' ? '#50fa7b' : lid.nivel === 'Medio' ? '#e4c76a' : '#a4a8c0' }}>{lid.nivel}</strong> — {lid.razon}
      </ModalSection>
      <ModalSection title="Alas">
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-white/10 bg-white/5 p-2.5">
            <div className="text-xl font-black" style={{ color: a1c }}>{p.ala1}</div>
            <div className="text-xs font-semibold" style={{ color: a1c }}>{TIPO_CORTO[p.ala1]}</div>
            <div className="text-[11px] text-one-slate">{p.alaScore1}% {p.alaDominante === p.ala1 && <strong className="text-[#e4c76a]">· Dom.</strong>}</div>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-2.5">
            <div className="text-xl font-black" style={{ color: a2c }}>{p.ala2}</div>
            <div className="text-xs font-semibold" style={{ color: a2c }}>{TIPO_CORTO[p.ala2]}</div>
            <div className="text-[11px] text-one-slate">{p.alaScore2}% {p.alaDominante === p.ala2 && <strong className="text-[#e4c76a]">· Dom.</strong>}</div>
          </div>
        </div>
      </ModalSection>
      <ModalSection title="Integración y estrés">
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-2.5"><div className="text-[10px] font-bold text-emerald-400">↗ Crecimiento</div><div className="text-lg font-black text-emerald-400">{p.integracion}</div><div className="text-[11px] text-one-slate">Hacia {TIPO_CORTO[p.integracion]}</div></div>
          <div className="rounded-lg border border-one-pink/20 bg-one-pink/5 p-2.5"><div className="text-[10px] font-bold text-one-pink">↘ Estrés</div><div className="text-lg font-black text-one-pink">{p.desintegracion}</div><div className="text-[11px] text-one-slate">Hacia {TIPO_CORTO[p.desintegracion]}</div></div>
        </div>
      </ModalSection>
      <ModalSection title="Cómo comunicarse">{TIPO_COMUNICACION[p.tipo]}</ModalSection>
      <ModalSection title="Feedback 1:1">{TIPO_FEEDBACK_11[p.tipo]}</ModalSection>
      <ModalSection title="Señales de burnout"><span className="text-orange-300">{(TIPO_BURNOUT_SENALES[p.tipo] || []).slice(0, 4).join(' · ')}</span></ModalSection>
      <ModalSection title="Cómo liderarlo/a">{TIPO_COMO_LIDERAR[p.tipo]}</ModalSection>
      <ModalSection title="Estrategia de retención">{TIPO_RETENCION[p.tipo]}</ModalSection>
      <ModalSection title="Gestión del conflicto">{TIPO_CONFLICTO_GESTION[p.tipo]}</ModalSection>
      <ModalSection title="Desarrollo recomendado">{TIPO_DESARROLLO[p.tipo]}</ModalSection>
    </>
  );
}
