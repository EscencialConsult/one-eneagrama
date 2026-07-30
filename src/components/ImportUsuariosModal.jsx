import { useMemo, useState } from 'react';
import {
  IMPORT_FIELDS,
  downloadImportTemplate,
  parseCSV,
  guessMapping,
  analyzeImportRows,
} from '../lib/csvImport.js';
import { getUsuariosByAdmin, createUsuario } from '../lib/api.js';
import { sanitizeText } from '../lib/sanitize.js';

/**
 * Wizard de importación masiva de usuarios por CSV — reescritura en React
 * del modal de AdminDashboard/script.js (legacy). El parsing (parseCSV,
 * analyzeImportRows) es el mismo código, solo cambia el mecanismo de UI
 * (useState en vez de manipulación directa del DOM).
 */
export default function ImportUsuariosModal({ adminId, onClose, onDone }) {
  const [step, setStep] = useState('file'); // file | map | progress | result
  const [hasHeaders, setHasHeaders] = useState(true);
  const [packLider, setPackLider] = useState(false);
  const [fileError, setFileError] = useState('');
  const [headers, setHeaders] = useState([]);
  const [dataRows, setDataRows] = useState([]);
  const [mapping, setMapping] = useState({});
  const [existingUsers, setExistingUsers] = useState([]);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [result, setResult] = useState(null); // { created, skipped, errors }

  const analyzed = useMemo(
    () => (dataRows.length ? analyzeImportRows(dataRows, mapping, packLider, existingUsers) : []),
    [dataRows, mapping, packLider, existingUsers]
  );
  const validCount = analyzed.filter((a) => !a.invalido).length;
  const skipCount = analyzed.length - validCount;

  async function handleFile(file) {
    setFileError('');
    if (!file) return;
    if (!/\.csv$/i.test(file.name)) {
      setFileError('El archivo debe ser un .csv');
      return;
    }

    const [text, users] = await Promise.all([
      file.text(),
      getUsuariosByAdmin(adminId).then((rows) =>
        rows.map((r) => ({ usuario: String(r.usuario_user || '') }))
      ),
    ]);

    const rows = parseCSV(text);
    if (rows.length === 0) {
      setFileError('El archivo está vacío o no se pudo leer');
      return;
    }

    let h, d;
    if (hasHeaders) {
      h = rows[0].map((v, i) => (v && v.trim() ? v.trim() : 'Columna ' + (i + 1)));
      d = rows.slice(1);
    } else {
      h = Array.from({ length: rows[0].length }, (_, i) => 'Columna ' + (i + 1));
      d = rows;
    }
    if (d.length === 0) {
      setFileError('No hay filas de datos para importar');
      return;
    }

    setHeaders(h);
    setDataRows(d);
    setMapping(guessMapping(h));
    setExistingUsers(users);
    setStep('map');
  }

  async function handleImport() {
    setStep('progress');
    setProgress({ done: 0, total: validCount });
    const created = [];
    const errors = [];
    const toImport = analyzed.filter((a) => !a.invalido);

    for (let i = 0; i < toImport.length; i++) {
      const { u } = toImport[i];
      try {
        await createUsuario({
          adminId,
          usuario: u.usuario,
          password: u.password,
          email: u.email,
          nombre: u.nombre,
          packStatus: u.pack,
        });
        created.push(u.usuario);
      } catch (error) {
        errors.push({ usuario: u.usuario, message: error.message || 'Error desconocido' });
      }
      setProgress({ done: i + 1, total: toImport.length });
    }

    setResult({ created: created.length, skipped: skipCount, errors });
    setStep('result');
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget && step !== 'progress') onClose();
      }}
    >
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/15 bg-gradient-to-br from-one-ink to-black shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 bg-gradient-to-r from-one-cyan/10 to-one-pink/10 px-6 py-4">
          <h3 className="font-title text-lg font-bold text-white">Importar Usuarios desde CSV</h3>
          {step !== 'progress' && (
            <button onClick={onClose} className="text-gray-400 transition-colors hover:text-white">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        <div className="p-6 text-white">
          {step === 'file' && (
            <div className="space-y-4">
              <button
                type="button"
                onClick={downloadImportTemplate}
                className="flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold transition-all hover:bg-white/10"
              >
                Descargar plantilla CSV
              </button>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-300">Archivo CSV</label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => handleFile(e.target.files?.[0])}
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white file:mr-3 file:rounded-full file:border-0 file:bg-one-cyan/20 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-one-cyan"
                />
                {fileError && <p className="mt-2 text-sm text-red-400">{fileError}</p>}
              </div>

              <label className="flex items-center gap-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={hasHeaders}
                  onChange={(e) => setHasHeaders(e.target.checked)}
                  className="h-4 w-4 rounded border-white/20 bg-black/40"
                />
                La primera fila tiene encabezados
              </label>
            </div>
          )}

          {step === 'map' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {IMPORT_FIELDS.map((field) => (
                  <div key={field.key}>
                    <label className="mb-1.5 block text-xs font-semibold text-gray-300">{field.label}</label>
                    <select
                      value={mapping[field.key] ?? ''}
                      onChange={(e) => setMapping({ ...mapping, [field.key]: e.target.value })}
                      className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white focus:border-one-cyan/50 focus:outline-none"
                    >
                      {!field.required && <option value="">— No usar —</option>}
                      {headers.map((h, i) => (
                        <option key={i} value={String(i)}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              <label className="flex items-center gap-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={packLider}
                  onChange={(e) => setPackLider(e.target.checked)}
                  className="h-4 w-4 rounded border-white/20 bg-black/40"
                />
                Habilitar Pack Líder para todos los importados
              </label>

              <div className="overflow-hidden rounded-xl border border-white/10">
                <table className="w-full text-sm">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-bold uppercase text-gray-400">Usuario</th>
                      <th className="px-3 py-2 text-left text-xs font-bold uppercase text-gray-400">Contraseña</th>
                      <th className="px-3 py-2 text-left text-xs font-bold uppercase text-gray-400">Email</th>
                      <th className="px-3 py-2 text-left text-xs font-bold uppercase text-gray-400">Nombre</th>
                      <th className="px-3 py-2 text-left text-xs font-bold uppercase text-gray-400">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analyzed.slice(0, 8).map(({ u, incompleto, existeEnSistema, duplicadoEnArchivo }, i) => (
                      <tr key={i} className="border-t border-white/5">
                        <td className="px-3 py-2 text-gray-200">{sanitizeText(u.usuario) || '—'}</td>
                        <td className="px-3 py-2 font-mono text-gray-500">{u.password ? '••••••' : '—'}</td>
                        <td className="px-3 py-2 text-gray-200">{sanitizeText(u.email) || '—'}</td>
                        <td className="px-3 py-2 text-gray-200">{sanitizeText(u.nombre) || '—'}</td>
                        <td className="px-3 py-2">
                          {incompleto ? (
                            <span className="text-red-400">Faltan datos</span>
                          ) : existeEnSistema ? (
                            <span className="text-yellow-400">Ya existe</span>
                          ) : duplicadoEnArchivo ? (
                            <span className="text-yellow-400">Repetido en el archivo</span>
                          ) : (
                            <span className="text-green-400">Se importa</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-gray-400">
                Mostrando {Math.min(8, analyzed.length)} de {dataRows.length} filas · {validCount} usuarios listos
                para crear
                {skipCount > 0 ? ` · ${skipCount} se omitirán (datos incompletos, o usuario ya existe / repetido)` : ''}
              </p>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-full border border-white/20 bg-white/5 px-6 py-2.5 text-sm font-semibold transition-all hover:bg-white/10"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={validCount === 0}
                  onClick={handleImport}
                  className="flex-1 rounded-full border border-one-cyan/40 bg-gradient-to-r from-one-cyan/20 to-one-pink/20 px-6 py-2.5 text-sm font-bold transition-all hover:border-one-cyan/60 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {validCount > 0 ? `Importar ${validCount} usuario${validCount === 1 ? '' : 's'}` : 'Nada para importar'}
                </button>
              </div>
            </div>
          )}

          {step === 'progress' && (
            <div className="py-8 text-center">
              <p className="mb-3 font-semibold">
                Importando usuarios... {progress.done}/{progress.total}
              </p>
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full bg-gradient-to-r from-one-cyan to-one-pink transition-all"
                  style={{ width: `${progress.total ? (progress.done / progress.total) * 100 : 0}%` }}
                />
              </div>
            </div>
          )}

          {step === 'result' && result && (
            <div className="space-y-4 text-center">
              <p className="text-lg font-bold text-green-400">{result.created} usuarios creados</p>
              {result.skipped > 0 && <p className="text-sm text-yellow-400">{result.skipped} omitidos</p>}
              {result.errors.length > 0 && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-left text-xs text-red-300">
                  {result.errors.map((e, i) => (
                    <div key={i}>
                      {sanitizeText(e.usuario)}: {sanitizeText(e.message)}
                    </div>
                  ))}
                </div>
              )}
              <button
                type="button"
                onClick={onDone}
                className="w-full rounded-full border border-one-cyan/40 bg-gradient-to-r from-one-cyan/20 to-one-pink/20 px-6 py-2.5 text-sm font-bold transition-all hover:border-one-cyan/60"
              >
                Listo
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
