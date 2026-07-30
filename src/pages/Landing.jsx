import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LightBulbIcon,
  ScaleIcon,
  GlobeAltIcon,
  SparklesIcon,
  HeartIcon,
  TrophyIcon,
  PaintBrushIcon,
  MagnifyingGlassIcon,
  ShieldCheckIcon,
  RocketLaunchIcon,
  BoltIcon,
  HandRaisedIcon,
} from '@heroicons/react/24/outline';
import { Session } from '../lib/session.js';
import Footer from '../components/Footer.jsx';
import LoginModal from '../components/LoginModal.jsx';

/* ═══════════════════════════════════════
   Canvas de estrellas — mismo patrón que la Landing de DISC
   ═══════════════════════════════════════ */
function StarsCanvas({ theme = 'dark', bounded = false }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: true });
    let W = 0,
      H = 0,
      DPR = Math.min(window.devicePixelRatio || 1, 2);
    let stars = [];
    let rafId = 0;

    function resize() {
      if (bounded && canvas.parentElement) {
        W = canvas.parentElement.clientWidth;
        H = canvas.parentElement.clientHeight;
      } else {
        W = window.innerWidth;
        H = document.documentElement.scrollHeight;
      }
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(W * DPR);
      canvas.height = Math.floor(H * DPR);
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

      const count = Math.floor((160 * (W * H)) / (1200 * 700));
      stars = Array.from({ length: Math.max(100, Math.min(300, count)) }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.35 + 0.25,
        a: Math.random() * 0.6 + 0.15,
        vx: (Math.random() - 0.5) * 0.06,
        vy: (Math.random() - 0.5) * 0.06,
        tw: Math.random() * 0.012 + 0.003,
      }));
    }

    const dotColor = theme === 'light' ? '30,41,59' : '254,254,255';
    const maxAlpha = theme === 'light' ? 0.32 : 0.85;

    function draw() {
      ctx.clearRect(0, 0, W, H);
      const g = ctx.createRadialGradient(W * 0.75, H * 0.15, 0, W * 0.75, H * 0.15, Math.max(W, H) * 0.8);
      g.addColorStop(0, 'rgba(225,123,215,0.10)');
      g.addColorStop(0.35, 'rgba(107,225,227,0.08)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);

      for (const s of stars) {
        s.x += s.vx;
        s.y += s.vy;
        if (s.x < -10) s.x = W + 10;
        if (s.x > W + 10) s.x = -10;
        if (s.y < -10) s.y = H + 10;
        if (s.y > H + 10) s.y = -10;
        s.a += Math.sin((s.x + s.y) * 0.002) * s.tw;
        const alpha = Math.max(0.08, Math.min(maxAlpha, s.a));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${dotColor},${alpha})`;
        ctx.fill();
      }
      rafId = requestAnimationFrame(draw);
    }

    resize();
    draw();
    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
    };
  }, [theme, bounded]);

  return <canvas ref={canvasRef} className="absolute inset-0 opacity-100" />;
}

/* Hook de scroll-reveal */
function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setVisible(true);
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, visible];
}

function Section({ id, children }) {
  const [ref, visible] = useReveal();
  return (
    <section
      id={id}
      ref={ref}
      className={
        'mx-auto max-w-[1180px] py-20 transition-[opacity,transform] duration-600 ease-out max-[560px]:py-[50px] motion-reduce:transition-none ' +
        (visible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 motion-reduce:translate-y-0 motion-reduce:opacity-100')
      }
    >
      {children}
    </section>
  );
}

/* ═══ Datos de contenido — 9 eneatipos (de Informe/eneagramaData.js) ═══ */
const TIPOS = [
  { n: 1, nombre: 'El Reformador', subtitulo: 'Idealista de sólidos principios', color: '#6e3eab', Icono: ScaleIcon },
  { n: 2, nombre: 'El Ayudador', subtitulo: 'Preocupado y orientado a los demás', color: '#953a90', Icono: HeartIcon },
  { n: 3, nombre: 'El Triunfador', subtitulo: 'Adaptable y orientado al éxito', color: '#e2b808', Icono: TrophyIcon },
  { n: 4, nombre: 'El Individualista', subtitulo: 'Romántico e introspectivo', color: '#47278c', Icono: PaintBrushIcon },
  { n: 5, nombre: 'El Investigador', subtitulo: 'Vehemente y cerebral', color: '#342f1d', Icono: MagnifyingGlassIcon },
  { n: 6, nombre: 'El Leal', subtitulo: 'Comprometido y orientado a la seguridad', color: '#6e3eab', Icono: ShieldCheckIcon },
  { n: 7, nombre: 'El Entusiasta', subtitulo: 'Productivo y ajetreado', color: '#e2b808', Icono: RocketLaunchIcon },
  { n: 8, nombre: 'El Desafiador', subtitulo: 'Poderoso y dominante', color: '#280640', Icono: BoltIcon },
  { n: 9, nombre: 'El Pacificador', subtitulo: 'Acomodadizo y humilde', color: '#47278c', Icono: HandRaisedIcon },
];

const INFO_CARDS = [
  {
    icon: LightBulbIcon,
    title: 'Nueve patrones, un mapa',
    text: 'El Eneagrama describe 9 estructuras de personalidad, cada una con su motivación, miedo y deseo básico. No sos un solo número: sos una combinación de tu tipo base, tus alas y tus niveles de salud.',
  },
  {
    icon: ScaleIcon,
    title: 'Alas y flechas de crecimiento',
    text: 'Cada tipo se apoya en los 2 tipos vecinos (alas) y tiene caminos de integración y desintegración hacia otros tipos — un mapa dinámico, no una etiqueta fija.',
  },
  {
    icon: GlobeAltIcon,
    title: 'Herramienta de autoconocimiento',
    text: 'Usado en desarrollo personal, liderazgo y equipos de trabajo para entender motivaciones profundas, mejorar la comunicación y anticipar reacciones bajo estrés.',
  },
];

const STEPS = [
  { n: '01', title: 'Recibís tu acceso', text: 'Tu administrador te crea un usuario y contraseña para ingresar a la plataforma de forma segura.' },
  { n: '02', title: 'Completás el test', text: 'Respondés 90 preguntas sobre tu forma de ser. Sin respuestas correctas o incorrectas.' },
  { n: '03', title: 'Obtenés tu informe', text: 'Se genera tu perfil Eneagrama con tipo base, alas, flechas de integración/desintegración y recomendaciones.' },
];

function Eyebrow({ dotClass, children }) {
  return (
    <div className="inline-flex items-center gap-2.5 rounded-full border border-slate-200 bg-white px-3.5 py-2.5 text-sm tracking-[.04em] text-slate-700 shadow-[0_2px_10px_rgba(0,0,0,.04)] max-[560px]:text-[13px]">
      <span className={`h-2 w-2 rounded-full ${dotClass}`} aria-hidden="true" />
      {children}
    </div>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [loginMode, setLoginMode] = useState(null); // null | 'user' | 'admin'

  // Redirección si ya hay sesión activa
  useEffect(() => {
    if (Session.isAuthenticated()) navigate(Session.dashboardRoute(), { replace: true });
  }, [navigate]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const openLogin = (mode) => (e) => {
    e.preventDefault();
    setLoginMode(mode);
  };

  return (
    <>
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(1200px 700px at 75% 15%, rgba(225,123,215,.14), transparent 55%), radial-gradient(1100px 700px at 12% 60%, rgba(107,225,227,.14), transparent 55%), radial-gradient(900px 600px at 55% 95%, rgba(228,199,106,.12), transparent 60%), linear-gradient(180deg, #ffffff, #eef2f7)',
        }}
      >
        <StarsCanvas theme="light" />
        <div className="bg-hex-pattern-light absolute -inset-[20%] -rotate-[8deg] opacity-[0.05]" />
      </div>

      <div className="relative z-[1] flex min-h-screen min-h-dvh flex-col">
        {/* HEADER */}
        <header
          className={
            'sticky top-0 z-[5] w-full px-[22px] pb-2 pt-[26px] backdrop-blur-[10px] transition-colors duration-300 max-[980px]:pt-[18px] ' +
            (scrolled ? 'border-b border-slate-200 bg-white/85 shadow-[0_10px_30px_rgba(0,0,0,.06)]' : 'bg-white/60')
          }
        >
          <div className="mx-auto flex max-w-[1180px] items-center justify-between gap-[18px] max-[980px]:gap-3">
            <div className="flex select-none items-center gap-3" aria-label="Marca ONE">
              <div
                className="relative h-[45px] w-[45px] shrink-0 overflow-hidden rounded-full bg-contain bg-center bg-no-repeat shadow-[0_0_0_1px_rgba(15,23,42,.10),0_0_30px_rgba(107,225,227,.20)] after:absolute after:inset-0 after:bg-[radial-gradient(circle_at_30%_30%,rgba(254,254,255,.14),transparent_55%)] after:content-['']"
                style={{ backgroundImage: "url('/img/one-iconocolor.png')" }}
                aria-hidden="true"
              />
              <div>
                <div className="font-title text-[22px] font-extrabold leading-[1.1] tracking-[.04em] text-slate-900 max-[560px]:text-lg">
                  ONE
                </div>
                <span className="mt-0.5 block text-xs font-medium tracking-[.02em] text-slate-500">
                  Evaluación Eneagrama
                </span>
              </div>
            </div>

            <nav aria-label="Navegación principal" className="max-[560px]:hidden">
              {[
                ['#inicio', 'Inicio'],
                ['#que-es-eneagrama', '¿Qué es el Eneagrama?'],
                ['#tipos', 'Los 9 Tipos'],
                ['#como-funciona', 'Cómo Funciona'],
              ].map(([href, label]) => (
                <a
                  key={href}
                  href={href}
                  className="rounded-full px-3 py-2.5 font-medium tracking-[.02em] text-slate-600 transition-colors hover:bg-slate-900/5 hover:text-slate-900"
                >
                  {label}
                </a>
              ))}
            </nav>

            <div>
              <a
                onClick={openLogin('admin')}
                href="#"
                className="inline-flex min-h-[46px] cursor-pointer select-none items-center justify-center gap-2.5 rounded-full border border-slate-300 bg-white px-[18px] py-2.5 font-semibold tracking-[.02em] text-slate-900 shadow-[0_6px_20px_rgba(0,0,0,.08)] transition-all duration-[180ms] hover:-translate-y-px hover:border-slate-400"
              >
                Acceder como Admin
              </a>
            </div>
          </div>
        </header>

        <main className="w-full flex-1 px-[22px] pb-[60px]">
          {/* HERO */}
          <section
            id="inicio"
            className="mx-auto grid w-full max-w-[1180px] min-h-[calc(100vh-96px)] min-h-[calc(100dvh-96px)] grid-cols-[1.05fr_.95fr] items-center gap-16 py-12 max-[980px]:grid-cols-1 max-[980px]:min-h-0 max-[980px]:gap-10 max-[980px]:py-8"
          >
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-one-cyan/30 bg-white px-4 py-2.5 text-sm font-medium tracking-[.02em] text-slate-700 shadow-[0_2px_10px_rgba(0,0,0,.04)]">
                Evaluación de personalidad Eneagrama
              </span>

              <h1 className="mb-5 mt-6 font-title text-[clamp(42px,5vw,64px)] font-extrabold leading-[1.05] tracking-[-.02em] text-slate-900">
                Descubrí tu eneatipo dominante.
              </h1>

              <p className="mb-8 max-w-[52ch] text-lg leading-[1.7] text-slate-600 max-[560px]:text-base">
                Plataforma de evaluación basada en el Eneagrama de la personalidad. Identificá tu tipo base entre
                los 9 posibles, tus alas y tus caminos de integración y desintegración.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <a
                  onClick={openLogin('user')}
                  href="#"
                  className="inline-flex min-h-14 cursor-pointer select-none items-center justify-center rounded-full bg-slate-900 px-[26px] py-3.5 font-semibold tracking-[.02em] text-white shadow-[0_10px_30px_rgba(0,0,0,.25)] transition-all duration-[180ms] hover:-translate-y-px hover:bg-slate-800 active:translate-y-0 max-[560px]:w-full"
                >
                  Realizar mi Evaluación Eneagrama →
                </a>
                <a
                  onClick={openLogin('admin')}
                  href="#"
                  className="inline-flex min-h-14 cursor-pointer select-none items-center justify-center rounded-full border border-slate-300 bg-white px-[26px] py-3.5 font-semibold tracking-[.02em] text-slate-900 transition-all duration-[180ms] hover:-translate-y-px hover:border-slate-400 active:translate-y-0 max-[560px]:w-full"
                >
                  Acceder como Admin
                </a>
              </div>

              <div className="mt-6 flex items-center gap-1.5 text-[13px] text-slate-500">
                Nueve tipos, un mapa hacia el autoconocimiento
                <SparklesIcon className="h-3.5 w-3.5 text-one-gold" />
              </div>
            </div>

            <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-[28px] border border-slate-200 bg-white p-8 shadow-[0_25px_60px_rgba(15,23,42,.10)] sm:p-11">
              <div
                className="pointer-events-none absolute inset-0"
                aria-hidden="true"
                style={{
                  background:
                    'radial-gradient(260px 260px at 50% 48%, rgba(107,225,227,.16), transparent 65%), radial-gradient(200px 200px at 78% 78%, rgba(225,123,215,.14), transparent 65%)',
                }}
              />
              <Eyebrow dotClass="bg-one-pink shadow-[0_0_18px_rgba(225,123,215,.55)]">Los 9 Eneatipos</Eyebrow>
              <img
                src="/img/eneagrama.png"
                alt="Rueda del Eneagrama"
                className="relative mt-7 w-full max-w-[420px]"
              />
            </div>
          </section>

          {/* ¿QUÉ ES EL ENEAGRAMA? */}
          <Section id="que-es-eneagrama">
            <div className="mb-12">
              <Eyebrow dotClass="bg-one-cyan shadow-[0_0_18px_rgba(107,225,227,.55)]">Autoconocimiento</Eyebrow>
              <h2 className="mb-3.5 mt-4 font-title text-[clamp(30px,3.5vw,46px)] font-extrabold leading-[1.1] tracking-[-.02em] text-slate-900">
                ¿Qué es el Eneagrama?
              </h2>
              <p className="m-0 max-w-[62ch] text-[17px] leading-[1.7] text-slate-600">
                El Eneagrama es un sistema de 9 tipos de personalidad, cada uno con una motivación profunda, un
                miedo básico y un deseo central que determinan cómo pensamos, sentimos y actuamos. No es un test
                de caja cerrada — describe patrones dinámicos que cambian según el nivel de salud psicológica de
                cada persona.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-[22px] max-[980px]:grid-cols-1">
              {INFO_CARDS.map((c) => (
                <article
                  key={c.title}
                  className="rounded-[18px] border border-slate-300 bg-white p-7 px-6 shadow-[0_8px_28px_rgba(15,23,42,.10)] transition-all duration-[180ms] hover:-translate-y-[3px] hover:border-slate-400 hover:shadow-[0_14px_38px_rgba(15,23,42,.16)]"
                >
                  <c.icon className="mb-3.5 h-7 w-7 text-one-cyan" />
                  <h3 className="mb-2.5 mt-0 font-title text-lg font-bold text-slate-900">{c.title}</h3>
                  <p className="m-0 text-sm leading-[1.65] text-slate-600">{c.text}</p>
                </article>
              ))}
            </div>
          </Section>

          {/* LOS 9 TIPOS */}
          <Section id="tipos">
            <div className="mb-12">
              <Eyebrow dotClass="bg-one-pink shadow-[0_0_18px_rgba(225,123,215,.55)]">Los nueve eneatipos</Eyebrow>
              <h2 className="mb-3.5 mt-4 font-title text-[clamp(30px,3.5vw,46px)] font-extrabold leading-[1.1] tracking-[-.02em] text-slate-900">
                Conocé cada tipo en detalle
              </h2>
              <p className="m-0 max-w-[62ch] text-[17px] leading-[1.7] text-slate-600">
                Tu informe completo — con descripciones, fortalezas y niveles de salud de cada tipo — se genera
                automáticamente al completar la evaluación.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-[18px] max-[980px]:grid-cols-2 max-[560px]:grid-cols-1">
              {TIPOS.map((t) => (
                <article
                  key={t.n}
                  className="flex items-center gap-3.5 rounded-[16px] border border-slate-300 bg-white p-5 shadow-[0_8px_28px_rgba(15,23,42,.08)] transition-all duration-[180ms] hover:-translate-y-[3px] hover:border-slate-400 hover:shadow-[0_14px_38px_rgba(15,23,42,.14)]"
                >
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px]"
                    style={{ backgroundColor: `${t.color}22`, border: `1px solid ${t.color}55` }}
                  >
                    <t.Icono className="h-6 w-6" style={{ color: t.color }} />
                  </div>
                  <div>
                    <h3 className="m-0 font-title text-[15px] font-bold text-slate-900">
                      Tipo {t.n} — {t.nombre}
                    </h3>
                    <p className="mb-0 mt-0.5 text-[12.5px] text-slate-500">{t.subtitulo}</p>
                  </div>
                </article>
              ))}
            </div>
          </Section>

          {/* CÓMO FUNCIONA */}
          <Section id="como-funciona">
            <div className="mb-12">
              <Eyebrow dotClass="bg-one-gold shadow-[0_0_18px_rgba(228,199,106,.55)]">Simple y rápido</Eyebrow>
              <h2 className="mb-3.5 mt-4 font-title text-[clamp(30px,3.5vw,46px)] font-extrabold leading-[1.1] tracking-[-.02em] text-slate-900">
                ¿Cómo funciona la evaluación?
              </h2>
              <p className="m-0 max-w-[62ch] text-[17px] leading-[1.7] text-slate-600">
                El test Eneagrama consta de 90 preguntas y genera un informe detallado con tu tipo base, alas y
                caminos de crecimiento.
              </p>
            </div>

            <div className="mb-10 flex items-start max-[980px]:flex-col max-[980px]:gap-4">
              {STEPS.map((step, i) => (
                <div key={step.n} className="contents">
                  {i > 0 && (
                    <div
                      className="mt-[-20px] h-0.5 w-10 min-w-10 self-center rounded-sm bg-gradient-to-r from-one-cyan/40 to-one-pink/40 max-[980px]:mt-0 max-[980px]:h-[30px] max-[980px]:w-0.5 max-[980px]:min-w-0"
                      aria-hidden="true"
                    />
                  )}
                  <article className="flex-1 rounded-[18px] border border-slate-300 bg-white p-7 px-6 shadow-[0_8px_28px_rgba(15,23,42,.10)] transition-all duration-[180ms] hover:-translate-y-[3px] hover:border-slate-400 hover:shadow-[0_14px_38px_rgba(15,23,42,.16)] max-[980px]:w-full">
                    <div className="mb-3.5 font-title text-4xl font-extrabold leading-none text-slate-300">
                      {step.n}
                    </div>
                    <h3 className="mb-2.5 mt-0 font-title text-lg font-bold text-slate-900">{step.title}</h3>
                    <p className="m-0 text-sm leading-[1.65] text-slate-600">{step.text}</p>
                  </article>
                </div>
              ))}
            </div>

            <div className="text-center">
              <a
                onClick={openLogin('user')}
                href="#"
                className="inline-flex min-h-14 cursor-pointer select-none items-center justify-center rounded-full bg-slate-900 px-[26px] py-3.5 font-semibold tracking-[.02em] text-white shadow-[0_10px_30px_rgba(0,0,0,.25)] transition-all duration-[180ms] hover:-translate-y-px hover:bg-slate-800 active:translate-y-0"
              >
                Comenzar mi Evaluación Eneagrama
              </a>
            </div>
          </Section>
        </main>

        <Footer />
      </div>

      {loginMode && (
        <LoginModal mode={loginMode} onClose={() => setLoginMode(null)} onModeChange={setLoginMode} />
      )}
    </>
  );
}
