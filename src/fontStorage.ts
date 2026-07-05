import { supabase } from './supabaseClient';

export interface StoredFont {
  id: string;      // ID de la fila en la tabla 'fonts'
  name: string;    // Nombre amigable
  url: string;     // URL pública o firmada del archivo en Storage
  fileName: string; // Nombre del archivo original
  createdAt: string;
}

/**
 * Guarda una nueva fuente en Supabase Storage y registra los metadatos en la DB
 */
export async function saveFont(file: File, userId: string): Promise<StoredFont> {
  // 1. Subir el archivo al bucket 'fonts' en una carpeta propia del usuario
  const filePath = `${userId}/${Date.now()}-${file.name}`;
  const { data: storageData, error: storageError } = await supabase.storage
    .from('fonts')
    .upload(filePath, file);

  if (storageError) throw storageError;

  // 2. Obtener la URL pública del archivo
  const { data: { publicUrl } } = supabase.storage
    .from('fonts')
    .getPublicUrl(filePath);

  // 3. Guardar metadatos en la tabla 'fonts'
  const { data: fontData, error: dbError } = await supabase
    .from('fonts')
    .insert({
      user_id: userId,
      name: file.name.replace(/\.[^/.]+$/, ""),
      file_path: filePath,
      file_name: file.name,
    })
    .select()
    .single();

  if (dbError) throw dbError;

  return {
    id: fontData.id,
    name: fontData.name,
    url: publicUrl,
    fileName: fontData.file_name,
    createdAt: fontData.created_at,
  };
}

/**
 * Recupera todas las fuentes del usuario autenticado
 */
export async function getAllFonts(userId: string): Promise<StoredFont[]> {
  const { data, error } = await supabase
    .from('fonts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Convertir paths en URLs públicas
  return data.map(font => ({
    ...font,
    url: supabase.storage.from('fonts').getPublicUrl(font.file_path).data.publicUrl
  }));
}

/**
 * Elimina una fuente de la DB y del Storage
 */
export async function deleteFont(fontId: string, filePath: string): Promise<void> {
  // 1. Eliminar de la DB
  const { error: dbError } = await supabase
    .from('fonts')
    .delete()
    .eq('id', fontId);

  if (dbError) throw dbError;

  // 2. Eliminar del Storage
  const { error: storageError } = await supabase.storage
    .from('fonts')
    .remove([filePath]);

  if (storageError) throw storageError;
}
