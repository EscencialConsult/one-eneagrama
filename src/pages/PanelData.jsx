import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowsRightLeftIcon,
  CheckCircleIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { CONFIG } from '../lib/config.js';
import { Session } from '../lib/session.js';
import { Auth } from '../lib/auth.js';
import { getRespuestasByAdmin } from '../lib/api.js';
import { sanitizeText } from '../lib/sanitize.js';
import { loadScript } from '../lib/loadScript.js';
import Footer from '../components/Footer.jsx';
import {
  TIPO_CORTO,
  TIPO_COLORS,
  TIPO_MOTIVADOR,
  TIPO_PUNTO_CIEGO,
  TIPO_ROL_EQUIPO,
  TIPO_COMUNICACION,
  TIPO_BURNOUT_SENALES,
  TIPO_DESEMPENO_ESPERAR,
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
} from '../lib/panelInsights.js';

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

  const mainChartRef = useRef(null);
  const triadasChartRef = useRef(null);
  const mainChartInstance = useRef(null);
  const triadasChartInstance = useRef(null);

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
  }, [loading, chartType, mainChartData]);

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
  }, [loading, triadasChartData]);

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
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div>
              <h2 className="bg-gradient-to-r from-one-cyan to-one-pink bg-clip-text font-title text-xl font-bold text-transparent">
                Panel RRHH — Análisis del Equipo
              </h2>
              <p className="text-xs text-one-slate">{session ? `${session.userName} (${session.userEmail})` : ''}</p>
            </div>
            <div className="flex items-center gap-3">
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

            {/* Team grid */}
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
                  <div key={i} className="rounded-xl border border-white/10 bg-black/30 p-4" style={{ borderTopColor: TIPO_COLORS[p.tipo], borderTopWidth: 2 }}>
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
                  </div>
                ))}
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

            {/* Tabla de gestión RRHH */}
            <div className="mb-8 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
              <div className="border-b border-white/10 px-5 py-4">
                <h3 className="font-title text-sm font-bold uppercase tracking-wider text-one-slate">Gestión — vista rápida por persona</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-white/5">
                    <tr>
                      {['Persona', 'Tipo', 'Rol en el equipo', 'Motivador', 'Punto ciego', 'Liderazgo'].map((h) => (
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

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
                    <p className="text-xs text-one-slate">{TIPO_COMUNICACION[t]}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
