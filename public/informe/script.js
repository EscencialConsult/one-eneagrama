/**
 * script.js - Orquestador del Informe de Eneagrama
 *
 * Adaptado del legacy (Apps Script → Supabase): la persistencia de la
 * respuesta y la subida del PDF a Storage ya ocurrieron una sola vez en
 * TestEneagrama.jsx (React). Esta página es puramente lectora: lee
 * eneagramaUserData de sessionStorage, calcula con CalculoEneagrama
 * (misma fuente única que usa el Test) y renderiza. El botón "Descargar
 * PDF" solo regenera el PDF localmente, sin volver a pegarle a Supabase.
 *
 * Flujo:
 * 1. Lee eneagramaUserData desde sessionStorage
 * 2. Calcula resultado con CalculoEneagrama.calcularEneagrama
 * 3. Renderiza el informe visual
 * 4. Botón PDF → genera PDF y lo descarga localmente
 */

(function () {
  'use strict';

  // ── Sample data (preview local sin sessionStorage) ───────────────────────
  var SAMPLE_DATA = {
    Nombre: 'Facundo',
    Apellido: 'Lazarte',
    Correo: 'facundoescencial@gmail.com',
    Fecha: '16/03/2026',
    Usuario_Admin: 'eneagramauser',
    Email_Admin: 'eneagrama@gmail.com',
    Respuestas: '{PI: 0m 3s - 1;1, 2;2, 3;3, 4;2, 5;3, 6;3} {PII: 0m 2s - 7;3, 8;3, 9;3, 10;3, 11;3, 12;2} {PIII: 0m 2s - 13;2, 14;2, 15;2, 16;2, 17;2, 18;1} {PIV: 0m 2s - 19;5, 20;1, 21;5, 22;1, 23;4, 24;1} {PV: 0m 2s - 25;5, 26;1, 27;5, 28;1, 29;5, 30;1} {PVI: 0m 3s - 31;5, 32;1, 33;5, 34;1, 35;5, 36;1} {PVII: 0m 3s - 37;5, 38;2, 39;5, 40;1, 41;5, 42;2} {PVIII: 0m 2s - 43;5, 44;2, 45;5, 46;1, 47;5, 48;1} {PIX: 0m 2s - 49;4, 50;3, 51;5, 52;1, 53;4, 54;1}'
  };

  // ── Estado ────────────────────────────────────────────────────────────
  var _userData  = null;
  var _resultado = null;

  // ════════════════════════════════════════════════════════════════════════
  // INIT
  // ════════════════════════════════════════════════════════════════════════

  document.addEventListener('DOMContentLoaded', function () {

    // 1. Cargar datos — caché del informe (localStorage, TTL 5 min)
    var _INFORME_CACHE_KEY = 'one_informe_' + (sessionStorage.getItem('userName') || 'anon');
    var _INFORME_TTL = 5 * 60 * 1000;

    function _saveInformeCache(data) {
      try { localStorage.setItem(_INFORME_CACHE_KEY, JSON.stringify({ ts: Date.now(), data: data })); } catch(e) {}
    }
    function _loadInformeCache() {
      try {
        var p = JSON.parse(localStorage.getItem(_INFORME_CACHE_KEY) || 'null');
        if (!p || Date.now() - p.ts > _INFORME_TTL) return null;
        return p.data;
      } catch(e) { return null; }
    }

    // Prioridad: sessionStorage → caché localStorage → sample
    var stored = sessionStorage.getItem('eneagramaUserData') || localStorage.getItem('eneagramaUserData');

    if (stored) {
      _userData = JSON.parse(stored);
      _saveInformeCache(_userData);
    } else {
      var cached = _loadInformeCache();
      _userData = cached || SAMPLE_DATA;
    }

    // 2. Calcular resultado (fuente única: calculoEneagramaTotal.js)
    _resultado = window.CalculoEneagrama.calcularEneagrama(_userData.Respuestas);

    var tipoData = ENEAGRAMA_DATA.tipos[_resultado.base];
    var ala1Data = ENEAGRAMA_DATA.tipos[_resultado.ala1];
    var ala2Data = ENEAGRAMA_DATA.tipos[_resultado.ala2];
    var intData  = ENEAGRAMA_DATA.tipos[_resultado.integracion];
    var desData  = ENEAGRAMA_DATA.tipos[_resultado.desintegracion];

    // 3. Datos personales
    var fullName = (_userData.Nombre + ' ' + _userData.Apellido).trim();
    setText('user-name',   fullName);
    setText('user-name-2', fullName);
    setText('user-email',  _userData.Correo);
    setText('user-date',   _userData.Fecha);

    // 4. Hero
    setText('tipo-numero',      _resultado.base);
    setText('tipo-nombre',      tipoData.nombre);
    setText('tipo-subtitulo',   tipoData.subtitulo);
    setText('tipo-descripcion', tipoData.descripcion);
    setText('tipo-pecado',      tipoData.pecadoCapital);
    setText('tipo-virtud',      tipoData.virtud);
    setText('tipo-emocion',     tipoData.emocionBasica);
    setText('tipo-icono',       tipoData.icono);

    document.documentElement.style.setProperty('--tipo-color',     tipoData.color);
    document.documentElement.style.setProperty('--tipo-color-alt', tipoData.colorAlt);

    // 5. Núcleo
    setText('tipo-motivacion', tipoData.motivacionProfunda);
    setText('tipo-miedo',      tipoData.miedoProfundo);
    setText('tipo-deseo',      tipoData.deseoBasico);

    // 6. Listas
    renderLista('lista-fortalezas', tipoData.fortalezas,      'strength-item');
    renderLista('lista-desarrollo', tipoData.areas_desarrollo, 'dev-item');

    // 7. Laboral
    setText('tipo-trabajo',     tipoData.en_trabajo);
    setText('tipo-equipo',      tipoData.en_equipo);
    setText('tipo-crecimiento', tipoData.camino_crecimiento);

    // 8. Niveles
    setText('nivel-sano',    tipoData.niveles.sano);
    setText('nivel-promedio',tipoData.niveles.promedio);
    setText('nivel-insano',  tipoData.niveles.insano);

    // 9. Alas
    setText('ala1-numero', _resultado.ala1);
    setText('ala1-nombre', ala1Data.nombre);
    setText('ala1-score',  _resultado.alaScore1 + '%');
    setText('ala2-numero', _resultado.ala2);
    setText('ala2-nombre', ala2Data.nombre);
    setText('ala2-score',  _resultado.alaScore2 + '%');

    var ala1Card = document.getElementById('ala1-card');
    var ala2Card = document.getElementById('ala2-card');
    if (ala1Card && ala2Card) {
      if (_resultado.alaDominante === _resultado.ala1) {
        ala1Card.classList.add('ala-dominante');
        setText('ala-dominante-label', 'Ala ' + _resultado.ala1 + ' — Influencia dominante');
      } else {
        ala2Card.classList.add('ala-dominante');
        setText('ala-dominante-label', 'Ala ' + _resultado.ala2 + ' — Influencia dominante');
      }
    }

    // 10. Flechas
    setText('int-numero', _resultado.integracion);
    setText('int-nombre', intData.nombre);
    setText('int-desc',
      'Bajo crecimiento y bienestar, el Tipo ' + _resultado.base +
      ' se mueve hacia las cualidades más sanas del Tipo ' + _resultado.integracion +
      ': ' + intData.descripcion.substring(0, 120) + '...');
    setText('des-numero', _resultado.desintegracion);
    setText('des-nombre', desData.nombre);
    setText('des-desc',
      'Bajo estrés o tensión, el Tipo ' + _resultado.base +
      ' puede caer en los patrones menos saludables del Tipo ' + _resultado.desintegracion + '.');

    // 11. Gráficos
    renderEneagramaWheel('eneagrama-wheel', _resultado);
    renderEneagramaBarChart('eneagrama-bars', _resultado.scores, _resultado.base);

    // 12. Score bar
    var scoreBar = document.getElementById('score-bar-fill');
    if (scoreBar) {
      setTimeout(function () {
        scoreBar.style.width = _resultado.scores[_resultado.base] + '%';
      }, 300);
    }
    setText('score-valor', _resultado.scores[_resultado.base] + '%');

    // 13. Tabla
    renderScoresTable('scores-table', _resultado.scores, _resultado.base, _resultado.ala1, _resultado.ala2);

    // 14. Barras alas
    setTimeout(function () {
      ['ala1', 'ala2'].forEach(function (p) {
        var bar   = document.getElementById(p + '-bar-fill');
        var score = document.getElementById(p + '-score');
        if (bar && score) {
          bar.style.transition = 'width 1.2s cubic-bezier(0.4,0,0.2,1) 0.5s';
          bar.style.width = score.textContent.replace('%', '') + '%';
        }
      });
    }, 600);

    // 15. Mostrar informe
    var loader = document.getElementById('loader');
    var report = document.getElementById('report');
    if (loader) loader.style.display = 'none';
    if (report) {
      report.style.opacity = '0';
      report.style.display = 'block';
      setTimeout(function () {
        report.style.transition = 'opacity 0.8s';
        report.style.opacity = '1';
      }, 50);
    }

    // 16. Exponer globalmente (lo usa pdfGenerator/main.js)
    window._eneagramaUserData  = _userData;
    window._eneagramaResultado = _resultado;

    // 17. Conectar botón PDF
    _conectarBotonPDF();

  });

  // ════════════════════════════════════════════════════════════════════════
  // BOTÓN PDF — solo regenera y descarga localmente, no sube a Storage
  // (la subida ya ocurrió una vez, al completar el test)
  // ════════════════════════════════════════════════════════════════════════

  function _conectarBotonPDF() {
    var btnPDF = document.getElementById('btn-generar-pdf');
    if (!btnPDF) return;

    btnPDF.onclick = function () {
      if (typeof window.generarPDFEneagrama !== 'function') {
        btnPDF.disabled = true;
        btnPDF.textContent = 'Cargando...';
        var intentos = 0;
        var iv = setInterval(function () {
          intentos++;
          if (typeof window.generarPDFEneagrama === 'function') {
            clearInterval(iv);
            btnPDF.disabled = false;
            btnPDF.innerHTML =
              '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">' +
              '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>' +
              '<polyline points="14 2 14 8 20 8"/></svg> Descargar PDF';
            window.generarPDFEneagrama(window._eneagramaUserData, window._eneagramaResultado);
          } else if (intentos > 50) {
            clearInterval(iv);
            btnPDF.disabled = false;
            btnPDF.textContent = 'Descargar PDF';
            window.print();
          }
        }, 100);
        return;
      }
      window.generarPDFEneagrama(window._eneagramaUserData, window._eneagramaResultado);
    };
  }

  // ════════════════════════════════════════════════════════════════════════
  // HELPERS — UI
  // ════════════════════════════════════════════════════════════════════════

  function setText(id, value) {
    var el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function renderLista(containerId, items, cls) {
    var container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    (items || []).forEach(function (item) {
      var li = document.createElement('li');
      li.className = cls || '';
      li.textContent = item;
      container.appendChild(li);
    });
  }

  function renderScoresTable(containerId, scores, base, ala1, ala2) {
    var tbody = document.getElementById(containerId);
    if (!tbody) return;
    var nombres = {
      1:'Reformador', 2:'Ayudador',      3:'Triunfador',
      4:'Individualista', 5:'Investigador', 6:'Leal',
      7:'Entusiasta',  8:'Desafiador',   9:'Pacificador'
    };
    var sorted = Object.entries(scores).sort(function (a, b) { return b[1] - a[1]; });
    tbody.innerHTML = '';
    sorted.forEach(function (entry) {
      var t      = parseInt(entry[0]);
      var score  = entry[1];
      var isBase = t === base;
      var isAla  = t === ala1 || t === ala2;
      var tr = document.createElement('tr');
      tr.className = isBase ? 'row-base' : (isAla ? 'row-ala' : '');
      tr.innerHTML =
        '<td class="td-num">' + t + '</td>' +
        '<td class="td-name">' + (nombres[t] || '') + '</td>' +
        '<td class="td-tag">' +
          (isBase ? '<span class="tag-base">TIPO BASE</span>' :
           isAla  ? '<span class="tag-ala">ALA</span>' : '') +
        '</td>' +
        '<td class="td-score">' +
          '<div class="score-mini-bar">' +
            '<div class="score-mini-fill" style="width:' + score + '%;background:' +
              (isBase ? 'var(--gold-500)' : 'var(--violet-600)') + '"></div>' +
          '</div>' +
          '<span class="score-val">' + score + '%</span>' +
        '</td>';
      tbody.appendChild(tr);
    });
  }

})();
