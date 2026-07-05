import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'fonts_studio_pro_db';
const STORE_NAME = 'user_fonts';

export interface StoredFont {
  id: string;      // ID único (ej: font-12345)
  name: string;    // Nombre amigable (ej: "Mi Fuente Pro")
  data: ArrayBuffer; // El archivo real en binario
  fileName: string; // Nombre del archivo original
  createdAt: number;
}

/**
 * Inicializa y abre la conexión con la base de datos local del navegador
 */
async function getDB(): Promise<IDBPDatabase> {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    },
  });
}

/**
 * Guarda una nueva fuente en IndexedDB
 */
export async function saveFont(file: File): Promise<StoredFont> {
  const db = await getDB();
  const arrayBuffer = await file.arrayBuffer();
  
  const newFont: StoredFont = {
    id: `font-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    name: file.name.replace(/\.[^/.]+$/, ""), // Quita la extensión
    data: arrayBuffer,
    fileName: file.name,
    createdAt: Date.now(),
  };

  await db.put(STORE_NAME, newFont);
  return newFont;
}

/**
 * Recupera todas las fuentes almacenadas localmente
 */
export async function getAllFonts(): Promise<StoredFont[]> {
  const db = await getDB();
  return db.getAll(STORE_NAME);
}

/**
 * Elimina una fuente por su ID
 */
export async function deleteFont(id: string): Promise<void> {
  const db = await getDB();
  await db.delete(STORE_NAME, id);
}
