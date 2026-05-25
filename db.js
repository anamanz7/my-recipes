// IndexedDB — wrapper con promesas, sin dependencias externas
// Stores: recipes, shopping, stats

const DB_NAME    = 'libro-recetas';
const DB_VERSION = 1;

let _db = null;

function openDB() {
  if (_db) return Promise.resolve(_db);
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = e => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('recipes')) {
        db.createObjectStore('recipes', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('shopping')) {
        const ss = db.createObjectStore('shopping', { keyPath: 'id', autoIncrement: true });
        ss.createIndex('section', 'section');
      }
      if (!db.objectStoreNames.contains('stats')) {
        db.createObjectStore('stats', { keyPath: 'key' });
      }
    };

    req.onsuccess = e => { _db = e.target.result; resolve(_db); };
    req.onerror   = e => reject(e.target.error);
  });
}

function tx(store, mode, fn) {
  return openDB().then(db => new Promise((resolve, reject) => {
    const t   = db.transaction(store, mode);
    const req = fn(t.objectStore(store));
    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
  }));
}

// ---- Recetas --------------------------------------------------------

export function getAllRecipes() {
  return openDB().then(db => new Promise((resolve, reject) => {
    const t   = db.transaction('recipes', 'readonly');
    const req = t.objectStore('recipes').getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
  }));
}

export function getRecipe(id) {
  return tx('recipes', 'readonly', s => s.get(id));
}

export function putRecipe(recipe) {
  return tx('recipes', 'readwrite', s => s.put(recipe));
}

export function deleteRecipe(id) {
  return tx('recipes', 'readwrite', s => s.delete(id));
}

// ---- Lista de la compra ---------------------------------------------

export function getAllShopping() {
  return openDB().then(db => new Promise((resolve, reject) => {
    const t   = db.transaction('shopping', 'readonly');
    const req = t.objectStore('shopping').getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
  }));
}

export function putShoppingItem(item) {
  return tx('shopping', 'readwrite', s => s.put(item));
}

export function deleteShoppingItem(id) {
  return tx('shopping', 'readwrite', s => s.delete(id));
}

export function clearShoppingDone() {
  return openDB().then(db => new Promise((resolve, reject) => {
    const t    = db.transaction('shopping', 'readwrite');
    const s    = t.objectStore('shopping');
    const req  = s.getAll();
    req.onsuccess = () => {
      const done = req.result.filter(i => i.done);
      let pending = done.length;
      if (!pending) { resolve(); return; }
      done.forEach(item => {
        const del = s.delete(item.id);
        del.onsuccess = () => { --pending === 0 && resolve(); };
        del.onerror   = () => reject(del.error);
      });
    };
    req.onerror = () => reject(req.error);
  }));
}

// ---- Stats ----------------------------------------------------------

export function getStat(key) {
  return tx('stats', 'readonly', s => s.get(key)).then(r => r ? r.value : 0);
}

export function setStat(key, value) {
  return tx('stats', 'readwrite', s => s.put({ key, value }));
}

export function incrementStat(key, by = 1) {
  return getStat(key).then(v => setStat(key, v + by));
}

// ---- Seed inicial ---------------------------------------------------
// Puebla la BD con las recetas de muestra si está vacía.
import { RECIPES } from './data.js';

export async function seedIfEmpty() {
  const existing = await getAllRecipes();
  if (existing.length > 0) return;
  for (const r of RECIPES) {
    await putRecipe({ ...r, createdAt: Date.now() });
  }
}
