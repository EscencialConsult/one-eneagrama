/**
 * Capa de datos — reemplaza las llamadas GET/POST a Google Apps Script.
 * Cada función replica una acción que antes resolvía el .gs, apuntando
 * a las tablas eneagrama_*.
 */
import { supabase } from './supabase.js';

/* ═══ RESPUESTAS (tabla eneagrama_respuestas) ═══ */

/** Última respuesta de un usuario (era: GET apiVisualizacion?user=...). */
export async function getRespuestaByUsuario(userName, adminId) {
  let query = supabase
    .from('eneagrama_respuestas')
    .select('*')
    .ilike('usuario_user', String(userName || '').trim())
    .order('fecha', { ascending: false })
    .limit(1);
  if (adminId) query = query.eq('admin_id', adminId);

  const { data, error } = await query;
  if (error) throw error;
  if (!data || !data.length) return { success: false, data: null };
  return { success: true, data: mapRespuesta(data[0]) };
}

/** Todas las respuestas de un admin (fuente única del panel RRHH). */
export async function getRespuestasByAdmin(adminId) {
  const { data, error } = await supabase
    .from('eneagrama_respuestas')
    .select('*')
    .eq('admin_id', adminId)
    .order('fecha', { ascending: false });
  if (error) throw error;
  return (data || []).map(mapRespuesta);
}

/**
 * Guarda la fila del test, ya con el cálculo (puntajes/tipo_base/alas/flechas)
 * hecho por src/lib/eneagramaCalc.js — a diferencia de DISC, acá el cálculo
 * se persiste en el insert (lo necesita PanelData.jsx para filtrar por tipo).
 */
export async function guardarRespuesta({
  adminId,
  usuarioAdmin,
  emailAdmin,
  usuarioUser,
  nombre,
  apellido,
  emailUser,
  respuestas,
  resultado, // shape de calcularEneagrama(): {base, ala1, ala2, alaDominante, integracion, desintegracion, scores, rawScores}
}) {
  const { data, error } = await supabase
    .from('eneagrama_respuestas')
    .insert({
      admin_id: adminId || null,
      usuario_admin: usuarioAdmin || '',
      email_admin: emailAdmin || '',
      usuario_user: usuarioUser || '',
      nombre: nombre || 'SinNombre',
      apellido: apellido || 'SinApellido',
      email_user: emailUser || 'SinEmail',
      respuestas,
      puntajes: resultado?.scores || null,
      puntajes_raw: resultado?.rawScores || null,
      tipo_base: resultado?.base ?? null,
      ala1: resultado?.ala1 ?? null,
      ala2: resultado?.ala2 ?? null,
      ala_dominante: resultado?.alaDominante ?? null,
      integracion: resultado?.integracion ?? null,
      desintegracion: resultado?.desintegracion ?? null,
    })
    .select('id, eneagrama_id')
    .single();
  if (error) throw error;
  return { success: true, row: data.id, eneagrama_id: data.eneagrama_id };
}

/**
 * Supabase Storage rechaza claves con tildes/ñ u otros caracteres no-ASCII
 * ("Invalid key") — se vio con nombres reales como "Pérez". Se normaliza
 * sacando diacríticos y reemplazando todo lo que no sea [A-Za-z0-9._-] por "_".
 */
const COMBINING_DIACRITICS = new RegExp('[̀-ͯ]', 'g');

function sanitizeStorageKey(name) {
  return name
    .normalize('NFD')
    .replace(COMBINING_DIACRITICS, '')
    .replace(/[^A-Za-z0-9._-]/g, '_');
}

/** Sube el PDF del informe a Storage (era: POST accion=guardarPdf → Drive). */
export async function guardarPdf({ rowId, eneagramaId, pdfBase64, pdfNombre }) {
  const bytes = Uint8Array.from(atob(pdfBase64), (c) => c.charCodeAt(0));
  const path = `${eneagramaId || rowId}/${sanitizeStorageKey(pdfNombre)}`;

  const { error: uploadError } = await supabase.storage
    .from('eneagrama_informes')
    .upload(path, bytes, { contentType: 'application/pdf', upsert: true });
  if (uploadError) throw uploadError;

  const { error: updateError } = await supabase
    .from('eneagrama_respuestas')
    .update({ pdf_path: path })
    .eq('id', rowId);
  if (updateError) throw updateError;

  return { success: true, path };
}

/** URL pública de un PDF guardado. */
export function getPdfUrl(path) {
  if (!path) return '';
  return supabase.storage.from('eneagrama_informes').getPublicUrl(path).data.publicUrl;
}

/** Mapea una fila de Supabase al shape que consume el frontend. */
function mapRespuesta(row) {
  return {
    id: row.id,
    eneagrama_id: row.eneagrama_id,
    Fecha: row.fecha,
    Admin_Email: row.email_admin,
    Admin_Usuario: row.usuario_admin,
    User: row.usuario_user,
    Nombre: row.nombre,
    Apellido: row.apellido,
    Email_User: row.email_user,
    Respuestas: row.respuestas,
    Puntajes: row.puntajes,
    PuntajesRaw: row.puntajes_raw,
    TipoBase: row.tipo_base,
    Ala1: row.ala1,
    Ala2: row.ala2,
    AlaDominante: row.ala_dominante,
    Integracion: row.integracion,
    Desintegracion: row.desintegracion,
    pdf_path: row.pdf_path,
  };
}

/* ═══ ADMINS (tabla eneagrama_admins) ═══ */

export async function getAdmins() {
  const { data, error } = await supabase
    .from('eneagrama_admins')
    .select('*')
    .order('fecha_alta', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function createAdmin({ usuario, password, email, packStatus, nameEmpresa, logoLink }) {
  const { data, error } = await supabase
    .from('eneagrama_admins')
    .insert({
      usuario_admin: usuario,
      pass_admin: password,
      email_admin: email,
      pack_status: packStatus || '',
      name_empresa: nameEmpresa || '',
      logo_empresa_link: logoLink || '',
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateAdmin(id, fields) {
  const { data, error } = await supabase.from('eneagrama_admins').update(fields).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteAdmin(id) {
  const { error } = await supabase.from('eneagrama_admins').delete().eq('id', id);
  if (error) throw error;
  return { success: true };
}

/** Sube el logo de una empresa a Storage y devuelve la URL pública. */
export async function uploadLogo(adminId, file) {
  const ext = (file.name.split('.').pop() || 'png').toLowerCase();
  const path = `${adminId}/logo.${ext}`;

  const { error } = await supabase.storage
    .from('eneagrama_logos')
    .upload(path, file, { contentType: file.type || 'image/png', upsert: true });
  if (error) throw error;

  // Cache-bust: mismo path siempre, así que sumamos ?t= para que el navegador
  // no muestre el logo viejo cuando se reemplaza.
  const { data } = supabase.storage.from('eneagrama_logos').getPublicUrl(path);
  return `${data.publicUrl}?t=${Date.now()}`;
}

/* ═══ USUARIOS (tabla eneagrama_usuarios) ═══ */

export async function getUsuariosByAdmin(adminId) {
  const { data, error } = await supabase
    .from('eneagrama_usuarios')
    .select('*')
    .eq('admin_id', adminId)
    .order('fecha_alta', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function createUsuario({ adminId, usuario, password, email, nombre, packStatus }) {
  const { data, error } = await supabase
    .from('eneagrama_usuarios')
    .insert({
      admin_id: adminId,
      usuario_user: usuario,
      pass_user: password,
      email_user: email || '',
      nombre: nombre || '',
      pack_status: packStatus || '',
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateUsuario(id, fields) {
  const { data, error } = await supabase.from('eneagrama_usuarios').update(fields).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteUsuario(id) {
  const { error } = await supabase.from('eneagrama_usuarios').delete().eq('id', id);
  if (error) throw error;
  return { success: true };
}
