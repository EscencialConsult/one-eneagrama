/**
 * Importación masiva de usuarios por CSV — funciones puras portadas literal
 * de AdminDashboard/script.js (legacy). La UI de mapeo/preview se reescribió
 * en React (ImportUsuariosModal.jsx); esta lógica de parsing no cambia.
 */

export const IMPORT_FIELDS = [
  { key: 'usuario', label: 'Usuario', required: true },
  { key: 'password', label: 'Contraseña', required: true },
  { key: 'email', label: 'Email', required: true },
  { key: 'nombre', label: 'Nombre Completo', required: true },
];

export function downloadImportTemplate() {
  const csv =
    'Usuario,Contraseña,Email,Nombre Completo\r\n' +
    'usuario01,Clave1234,usuario01@empresa.com,Juan Pérez\r\n' +
    'usuario02,Clave5678,usuario02@empresa.com,María Gómez\r\n';
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'plantilla_importacion_usuarios.csv';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// Parser CSV manual (soporta comillas, comas dentro de comillas, comillas escapadas "" y CRLF/LF)
export function parseCSV(text) {
  const rows = [];
  let row = [],
    field = '',
    inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
      continue;
    }
    if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      row.push(field);
      field = '';
    } else if (c === '\r') {
      /* ignorado, lo maneja \n */
    } else if (c === '\n') {
      row.push(field);
      field = '';
      rows.push(row);
      row = [];
    } else {
      field += c;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((r) => !(r.length === 1 && r[0].trim() === ''));
}

/** Intenta adivinar la columna de cada campo por nombre de encabezado. */
export function guessMapping(headers) {
  const mapping = {};
  IMPORT_FIELDS.forEach((field, idx) => {
    const guess = headers.findIndex((h) => h.toLowerCase().includes(field.key === 'nombre' ? 'nombre' : field.key));
    if (guess !== -1) mapping[field.key] = String(guess);
    else if (field.required) mapping[field.key] = String(Math.min(idx, headers.length - 1));
    else mapping[field.key] = '';
  });
  return mapping;
}

export function buildImportedUser(row, mapping, packEnabled) {
  const get = (key) => {
    const colIndex = mapping[key];
    if (colIndex === undefined || colIndex === '') return '';
    return (row[Number(colIndex)] || '').trim();
  };
  return {
    usuario: get('usuario'),
    password: get('password'),
    email: get('email'),
    nombre: get('nombre'),
    pack: packEnabled ? '01' : '',
  };
}

/** Analiza cada fila importada contra los usuarios existentes y detecta duplicados/incompletos. */
export function analyzeImportRows(dataRows, mapping, packEnabled, existingUsers) {
  const seenInFile = new Set();
  return dataRows.map((row) => {
    const u = buildImportedUser(row, mapping, packEnabled);
    const usuarioKey = u.usuario.toLowerCase();
    const existeEnSistema =
      !!usuarioKey && existingUsers.some((existing) => existing.usuario.toLowerCase() === usuarioKey);
    const duplicadoEnArchivo = !!usuarioKey && seenInFile.has(usuarioKey);
    if (usuarioKey) seenInFile.add(usuarioKey);

    const incompleto = !u.usuario || !u.password || !u.email || !u.nombre;
    const invalido = incompleto || existeEnSistema || duplicadoEnArchivo;
    return { u, incompleto, existeEnSistema, duplicadoEnArchivo, invalido };
  });
}
