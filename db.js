// Supabase — wrapper con la misma API que el anterior IndexedDB
// Tablas: recipes, shopping_items, stats

import { sb } from './supabase.js';
import { RECIPES } from './data.js';

// ---- Recetas --------------------------------------------------------

export async function getAllRecipes() {
  const { data, error } = await sb.from('recipes').select('data').order('created_at');
  if (error) throw error;
  return data.map(r => r.data);
}

export async function getRecipe(id) {
  const { data, error } = await sb.from('recipes').select('data').eq('id', id).single();
  if (error) throw error;
  return data.data;
}

export async function putRecipe(recipe) {
  const { error } = await sb.from('recipes').upsert({
    id:         recipe.id,
    data:       recipe,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}

export async function deleteRecipe(id) {
  const { error } = await sb.from('recipes').delete().eq('id', id);
  if (error) throw error;
}

// ---- Lista de la compra ---------------------------------------------

export async function getAllShopping() {
  const { data, error } = await sb.from('shopping_items').select('*').order('id');
  if (error) throw error;
  return data;
}

export async function putShoppingItem(item) {
  if (item.id) {
    const { error } = await sb.from('shopping_items').upsert(item);
    if (error) throw error;
  } else {
    const { data, error } = await sb.from('shopping_items').insert(item).select().single();
    if (error) throw error;
    return data;
  }
}

export async function deleteShoppingItem(id) {
  const { error } = await sb.from('shopping_items').delete().eq('id', id);
  if (error) throw error;
}

export async function clearShoppingDone() {
  const { error } = await sb.from('shopping_items').delete().eq('done', true);
  if (error) throw error;
}

// ---- Stats ----------------------------------------------------------

export async function getStat(key) {
  const { data } = await sb.from('stats').select('value').eq('key', key).single();
  return data ? data.value : 0;
}

export async function setStat(key, value) {
  const { error } = await sb.from('stats').upsert({ key, value });
  if (error) throw error;
}

export async function incrementStat(key, by = 1) {
  const v = await getStat(key);
  await setStat(key, v + by);
}

// ---- Seed inicial ---------------------------------------------------

export async function seedIfEmpty() {
  try {
    const { count } = await sb.from('recipes').select('id', { count: 'exact', head: true });
    if (count > 0) return;
    for (const r of RECIPES) {
      await putRecipe({ ...r, createdAt: Date.now() });
    }
  } catch (err) {
    // If seeding fails (e.g. RLS not disabled, write permissions), skip silently.
    // The app will show the empty state but remain functional.
    console.warn('seedIfEmpty: no se pudo sembrar la BD —', err?.message ?? err);
  }
}
