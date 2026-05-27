// =====================================================================
// libro-recetas — app principal
// Router hash + componentes + páginas + event delegation
// =====================================================================

const VERSION = '0.5';

import { CATEGORIES, METHODS, DIFFICULTIES, recipePhotoHtml } from './data.js';
import {
  seedIfEmpty, getAllRecipes, getRecipe, putRecipe, deleteRecipe,
  getAllShopping, putShoppingItem, deleteShoppingItem, clearShoppingDone,
  incrementStat, getStat,
} from './db.js';

// =====================================================================
// ESTADO
// =====================================================================
const state = {
  recipes:   [],
  // página detalle
  servings:  {},   // { recipeId: number }
  doneSteps: {},   // { recipeId: Set<number> }
  cookStep:  {},   // { recipeId: number }
  timerSec:  0,
  timerRunning: false,
  timerInterval: null,
  // índice
  filter:    { category: null, maxTime: null, method: null },
  viewMode:  'grid',
  // búsqueda
  searchQ:   '',
  // compra
  shopping:  [],
  showAddForm: false,
};

let _timerEl = null;

// =====================================================================
// UTILIDADES
// =====================================================================
function scaleQty(qty, base, servings) {
  if (!qty) return qty;
  const n = parseFloat(String(qty).replace(',', '.'));
  if (isNaN(n)) return qty;
  const v = (n / base) * servings;
  return Number.isInteger(v) ? String(v) : v.toFixed(1).replace('.', ',');
}

function fmtTime(secs) {
  const m = String(Math.floor(secs / 60)).padStart(2, '0');
  const s = String(secs % 60).padStart(2, '0');
  return `${m}:${s}`;
}

function pad(n, len = 2) { return String(n).padStart(len, '0'); }

function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function highlightMatch(text, q) {
  if (!q) return esc(text);
  const re = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return esc(text).replace(re, '<em class="match">$1</em>');
}


// =====================================================================
// COMPONENTES HTML
// =====================================================================
function eyebrow(text, cls = '') {
  return `<span class="eyebrow ${cls}">${esc(text)}</span>`;
}

function rule() { return `<hr class="rule">`; }

function backLink(text, href) {
  return `<a href="${href}" class="back-link"><span class="back-link__arrow">←</span> ${esc(text)}</a>`;
}

function chip(label, active, action, value) {
  return `<button class="chip${active ? ' active' : ''}" data-action="${action}" data-value="${esc(value)}">${esc(label)}</button>`;
}

function servingsWidget(recipeId, value) {
  return `<div class="servings-wrap">
    <button class="stepper" data-action="servings-dec" data-id="${recipeId}" ${value <= 1 ? 'disabled' : ''}>−</button>
    <div class="servings-value">
      <div class="servings-num">${value}</div>
      <div class="servings-label">Porciones</div>
    </div>
    <button class="stepper" data-action="servings-inc" data-id="${recipeId}">+</button>
  </div>`;
}

function ingredientList(recipe, servings) {
  return `<ul class="ingredient-list">
    ${recipe.ingredients.map(ing => `
      <li>
        <span class="ingredient-qty">${esc(scaleQty(ing.qty, recipe.servings, servings))} ${esc(ing.unit)}</span>
        <span class="ingredient-name">${esc(ing.name)}</span>
      </li>`).join('')}
  </ul>`;
}

function stepList(recipe, doneSet) {
  return `<ol class="step-list">
    ${recipe.steps.map((step, i) => {
      const done = doneSet.has(i);
      return `<li>
        <button class="step-btn" data-action="toggle-step" data-id="${recipe.id}" data-step="${i}" ${done ? 'data-done="true"' : ''}>
          <span class="step-num">${pad(i + 1)}</span>
          <div>
            <span class="step-heading">${esc(step.heading)}</span>
            <span class="step-desc">${esc(step.desc)}</span>
          </div>
        </button>
      </li>`;
    }).join('')}
  </ol>`;
}

function recipeCard(r, idx) {
  const photo = recipePhotoHtml(r, { className: 'recipe-card__photo' });
  return `<a href="#/recetas/${r.id}" class="recipe-card">
    ${photo}
    <div class="recipe-card__body">
      <div class="recipe-card__eyebrow">${pad(idx + 1)} · ${esc(r.category)}</div>
      <div class="recipe-card__title">${esc(r.title)}</div>
      <div class="recipe-card__meta">${r.time} min · ${esc(r.method)}</div>
    </div>
  </a>`;
}

function recipeRow(r, idx) {
  const thumb = recipePhotoHtml(r, { className: 'recipe-row__thumb', style: 'width:80px;height:60px;' });
  return `<a href="#/recetas/${r.id}" class="recipe-row">
    <span class="recipe-row__num">${pad(idx + 1)}</span>
    ${thumb}
    <div>
      <div class="recipe-row__title">${esc(r.title)}</div>
      <div class="recipe-row__blurb">${esc(r.blurb)}</div>
    </div>
    <span class="recipe-row__cat">${esc(r.category)}</span>
    <span class="recipe-row__arrow">→</span>
  </a>`;
}

// =====================================================================
// PÁGINAS
// =====================================================================

// ---- HOME -----------------------------------------------------------
async function renderHome() {
  const recipes  = state.recipes;
  const count    = recipes.length;
  const cooked   = await getStat('cooked');
  const shopping = await getAllShopping();

  // Fecha y hora actuales
  const DAYS = ['DOMINGO','LUNES','MARTES','MIÉRCOLES','JUEVES','VIERNES','SÁBADO'];
  const now  = new Date();
  const dateStr = `${DAYS[now.getDay()]} · ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;

  // Receta destacada (la más reciente) y miniaturas (las dos anteriores)
  const featured = recipes.length ? recipes[recipes.length - 1] : null;
  const cardRecipes = recipes.length >= 3
    ? [recipes[recipes.length - 2], recipes[recipes.length - 3]]
    : recipes.length === 2
      ? [recipes[0], recipes[1]]
      : recipes.length === 1
        ? [recipes[0], null]
        : [null, null];

  // Lista de compra
  const pending     = shopping.filter(i => !i.done);
  const chipItems   = pending.slice(0, 4);
  const moreCount   = pending.length > 4 ? pending.length - 4 : 0;
  const shoppingHtml = shopping.length === 0
    ? `<span class="bento-shopping__count" style="opacity:0.5">Lista vacía</span>`
    : `<span class="bento-shopping__count">Faltan ${pending.length} de ${shopping.length}</span>
       <div class="bento-shopping__chips">
         ${chipItems.map(i => `<span class="bento-shopping__chip">${esc(i.name)}</span>`).join('')}
         ${moreCount ? `<span class="bento-shopping__chip">+ ${moreCount} más</span>` : ''}
       </div>`;

  // Nota — del campo notes de la receta destacada
  const noteText   = featured?.notes || 'Guarda trucos y apuntes mientras cocinas.';
  const noteSource = featured?.notes ? `— ${esc(featured.title).toUpperCase()}` : '';

  // Tarjeta destacada
  const featuredHtml = featured ? `
    <a href="#/recetas/${esc(featured.id)}" class="bento-featured">
      <span class="bento-date">DESTACADA · ESTA SEMANA</span>
      <div class="bento-featured__art">
        ${recipePhotoHtml(featured, { style: 'width:160px;height:160px' })}
      </div>
      <div class="bento-featured__meta">
        <span>${featured.time} min</span>
        <span>${featured.servings} pers</span>
      </div>
      <h2 class="bento-featured__title">${esc(featured.title)}</h2>
      <p class="bento-featured__desc">${esc(featured.blurb || '')}</p>
      <span class="bento-featured__btn">Ver receta →</span>
    </a>
  ` : `
    <div class="bento-featured" style="align-items:center;justify-content:center;text-align:center">
      <p style="font-size:18px;color:var(--accent)">Aún no hay recetas —<br><a href="#/nueva" style="color:var(--text)">añade la primera →</a></p>
    </div>
  `;

  // Miniaturas
  const miniCard = (r, light = false) => r ? `
    <a href="#/recetas/${esc(r.id)}" class="bento-card ${light ? 'bento-card--light' : ''}">
      <div class="bento-card__art">${recipePhotoHtml(r, { style: 'width:44px;height:44px' })}</div>
      <div class="bento-card__title">${esc(r.title)}</div>
      <div class="bento-card__meta">${esc(r.category)} · ${r.time} min</div>
    </a>
  ` : `<div class="bento-card bento-card--light" style="opacity:0.3"></div>`;

  return `<div class="bento-home">
    <header class="bento-nav">
      <a href="#/" class="bento-nav__logo">
        <span class="bento-nav__icon">✦</span>
        libro-recetas
      </a>
      <nav aria-label="Navegación principal">
        <ul class="bento-nav__links">
          <li><a href="#/recetas" class="bento-nav__link">Recetario</a></li>
          <li><a href="#/buscar" class="bento-nav__link">Buscar</a></li>
          <li><a href="#/compra" class="bento-nav__link">Compra</a></li>
          <li><a href="#/nueva" class="bento-nav__cta">+ Nueva</a></li>
        </ul>
      </nav>
    </header>

    <div class="bento-body">
      <div>
        <span class="bento-date">${dateStr}</span>
        <h1 class="bento-h1">¿Qué cocinas <em>hoy</em>?</h1>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <a href="#/recetas" data-action="filter-time" data-value="20" class="chip">algo rápido</a>
          <a href="#/recetas" class="chip">ver todo</a>
          <a href="#/categorias" class="chip">categorías</a>
          <a href="#/buscar" class="chip">buscar</a>
        </div>
      </div>

      <div class="bento-grid">
        ${featuredHtml}

        <div class="bento-right">
          <div class="bento-stats">
            <div class="bento-stat">
              <span class="bento-stat__num">${count}</span>
              <span class="bento-stat__label">RECETAS</span>
            </div>
            <div class="bento-stat">
              <span class="bento-stat__num">${CATEGORIES.length}</span>
              <span class="bento-stat__label">COLECCIONES</span>
            </div>
            <div class="bento-stat">
              <span class="bento-stat__num">${cooked || 0}</span>
              <span class="bento-stat__label">COCINADAS</span>
            </div>
          </div>

          <div class="bento-cards-row">
            ${miniCard(cardRecipes[0], false)}
            ${miniCard(cardRecipes[1], true)}
          </div>

          <div class="bento-bottom-row">
            <div class="bento-shopping">
              <span class="bento-date">LISTA DE LA COMPRA</span>
              ${shoppingHtml}
              <a href="#/compra" class="bento-shopping__link">Abrir →</a>
            </div>
            <div class="bento-note">
              <span class="bento-note__label">Tu nota</span>
              <p class="bento-note__text">"${esc(noteText)}"</p>
              ${noteSource ? `<span class="bento-note__source">${noteSource}</span>` : ''}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

// ---- ÍNDICE ---------------------------------------------------------
async function renderIndex() {
  const all = state.recipes;
  const f   = state.filter;

  let filtered = all;
  if (f.category) filtered = filtered.filter(r => r.category === f.category);
  if (f.maxTime)  filtered = filtered.filter(r => r.time <= f.maxTime);
  if (f.method)   filtered = filtered.filter(r => r.method === f.method);

  const cats = CATEGORIES.map(c =>
    chip(c.name, f.category === c.name, 'filter-category', c.name)
  ).join('');
  const timechips = [
    chip('< 20 min', f.maxTime === 20, 'filter-time', '20'),
    chip('< 30 min', f.maxTime === 30, 'filter-time', '30'),
  ].join('');
  const clearChip = (f.category || f.maxTime || f.method)
    ? chip('× Limpiar', false, 'filter-clear', '')
    : '';

  const grid = state.viewMode === 'grid'
    ? `<div class="recipes-grid">${filtered.map((r, i) => recipeCard(r, i)).join('')}</div>`
    : `<ul class="recipes-list">${filtered.map((r, i) => `<li>${recipeRow(r, i)}</li>`).join('')}</ul>`;

  return `<div class="index-page">
    <div class="page-topbar">
      ${backLink('Inicio', '#/')}
      ${eyebrow(`${pad(filtered.length, 2)} / ${pad(all.length, 2)} Recetas`)}
    </div>

    <h1 class="index-page__h1">
      Todo lo que sabes cocinar —
      <em class="not-italic accent">en una sola página.</em>
    </h1>

    <div class="filter-row">
      <div class="filter-chips">
        ${chip('Todas', !f.category && !f.maxTime && !f.method, 'filter-clear', '')}
        ${cats}
        ${timechips}
        ${clearChip}
      </div>
      <div class="view-toggle">
        ${chip('⊞', state.viewMode === 'grid', 'view-toggle', 'grid')}
        ${chip('☰', state.viewMode === 'list', 'view-toggle', 'list')}
      </div>
    </div>

    ${filtered.length
      ? grid
      : `<div class="empty-state"><p>Sin recetas con ese filtro.</p></div>`}
  </div>`;
}

// ---- CATEGORÍAS -----------------------------------------------------
async function renderCategories() {
  const recipes = state.recipes;

  const items = CATEGORIES.map(cat => {
    const catRecipes = recipes.filter(r => r.category === cat.name);
    const count = catRecipes.length;
    const thumbs = catRecipes.slice(0, 3).map(r =>
      recipePhotoHtml(r, { className: 'category-item__thumb' })
    ).join('');

    return `<a href="#/categorias/${encodeURIComponent(cat.name)}" class="category-item">
      <div class="category-item__row">
        <strong class="category-item__name">${cat.icon} ${esc(cat.name)}</strong>
        <span class="category-item__count">${pad(count)}</span>
      </div>
      ${count > 0
        ? `<div class="category-item__thumbs">${thumbs}</div>`
        : `<p class="category-item__empty">Aún por escribir.</p>`}
    </a>`;
  }).join('');

  return `<div class="categories-page">
    <div class="page-topbar">
      ${backLink('Inicio', '#/')}
    </div>
    ${eyebrow('02 · Categorías')}
    <h1 class="index-page__h1" style="margin-top:var(--sp-3)">
      Cómo lo agrupas —
      <em class="not-italic accent">cómo lo encuentras.</em>
    </h1>
    ${rule()}
    <div style="margin-top:var(--sp-3)">${items}</div>
  </div>`;
}

// ---- DETALLE CATEGORÍA -----------------------------------------------
async function renderCategoryDetail(slug) {
  const name    = decodeURIComponent(slug);
  const recipes = state.recipes.filter(r => r.category === name);

  const grid = `<div class="recipes-grid" style="margin-top:var(--sp-7)">
    ${recipes.map((r, i) => recipeCard(r, i)).join('')}
  </div>`;

  return `<div class="index-page">
    <div class="page-topbar">
      ${backLink('Categorías', '#/categorias')}
      ${eyebrow(`${recipes.length} recetas`)}
    </div>
    <h1 class="index-page__h1">${esc(name)}</h1>
    ${recipes.length ? grid : `<div class="empty-state"><p>Aún no hay recetas en esta categoría.</p></div>`}
  </div>`;
}

// ---- DETALLE RECETA (V1 Editorial) ----------------------------------
async function renderDetail(id) {
  const recipe = state.recipes.find(r => r.id === id);
  if (!recipe) return `<div class="empty-state"><p>Receta no encontrada.</p></div>`;

  const servings = state.servings[id] ?? recipe.servings;
  const doneSet  = state.doneSteps[id] ?? new Set();
  const doneCount = doneSet.size;

  const photo = recipePhotoHtml(recipe, { style: 'position:absolute;inset:0;width:100%;height:100%;' });

  return `<div class="detail-page">
    <div class="detail-hero">
      <div class="art-wrap">${photo}</div>
      <div class="detail-hero__overlay">
        <div class="detail-hero__top">
          ${backLink('Índice', '#/recetas')}
          <span class="eyebrow eyebrow--small" style="color:var(--color-ink)">${esc(recipe.category.toUpperCase())} · ${recipe.time} MIN</span>
        </div>
        <div class="detail-hero__bottom">
          <a href="#/recetas/${id}/editar" class="back-link" style="color:var(--color-ink)">
            <span>✎</span> Editar
          </a>
          <button class="back-link" data-action="delete-recipe" data-id="${id}" style="color:var(--color-ink);background:none;border:none;cursor:pointer">
            ✕ Borrar
          </button>
        </div>
      </div>
    </div>

    <div class="detail-body">
      <h1 class="detail-h1">
        ${esc(recipe.title)}${recipe.titleAccent ? ` — <em class="not-italic accent">${esc(recipe.titleAccent)}.</em>` : ''}
      </h1>
      <p class="detail-blurb">${esc(recipe.blurb)}</p>

      <div class="meta-row">
        ${[['Tiempo', `${recipe.time} min`], ['Método', recipe.method], ['Dificultad', recipe.difficulty], ['Categoría', recipe.category]]
          .map(([k, v]) => `<div>
            <div class="meta-item__label">${esc(k)}</div>
            <div class="meta-item__value">${esc(v)}</div>
          </div>`).join('')}
      </div>

      ${rule()}

      <div class="detail-columns section-gap">
        <section>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--sp-4)">
            ${eyebrow('Ingredientes')}
            ${servingsWidget(id, servings)}
          </div>
          ${ingredientList(recipe, servings)}
        </section>

        <section>
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:var(--sp-3);margin-bottom:var(--sp-5)">
            ${eyebrow(`Pasos · ${doneCount} de ${recipe.steps.length}`)}
            <a href="#/recetas/${id}/cocinar" style="font-size:13px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:var(--accent)">
              COCINAR EN MODO PANTALLA →
            </a>
          </div>
          ${stepList(recipe, doneSet)}
        </section>
      </div>

      ${recipe.notes ? `
        ${rule()}
        <div class="notes-block section-gap">
          ${eyebrow('Notas')}
          <p style="margin-top:var(--sp-3);font-size:20px;font-weight:700;line-height:1.45">${esc(recipe.notes)}</p>
        </div>` : ''}
    </div>
  </div>`;
}

// ---- MODO COCINA ----------------------------------------------------
async function renderCook(id) {
  const recipe = state.recipes.find(r => r.id === id);
  if (!recipe) return renderDetail(id);

  const step  = state.cookStep[id] ?? 0;
  const total = recipe.steps.length;
  const s     = recipe.steps[step];

  const progress = recipe.steps.map((_, i) =>
    `<div class="cook-progress__seg${i <= step ? ' done' : ''}"></div>`
  ).join('');

  const sidebar = `
    <div class="cook-sidebar" style="display:none" id="cook-sidebar-desktop">
      ${eyebrow('Ingredientes a mano')}
      ${ingredientList(recipe, recipe.servings)}
      <div style="margin-top:var(--sp-7)">
        ${eyebrow('Próximo paso')}
        <p style="margin-top:12px;font-size:18px;font-weight:700;line-height:1.4">
          ${step < total - 1 ? esc(recipe.steps[step + 1].heading) : '— último paso —'}
        </p>
      </div>
    </div>`;

  return `<div class="cook-page" id="cook-page">
    <div class="cook-topbar">
      <a href="#/recetas/${id}" class="back-link">
        <span class="accent">×</span> SALIR
      </a>
      ${eyebrow(`Paso ${pad(step + 1)} / ${pad(total)}`, 'eyebrow--small')}
    </div>

    <div class="cook-progress">${progress}</div>

    <div class="cook-meta">
      <strong style="font-size:18px;font-weight:800">${esc(recipe.title)}</strong>
      <span class="eyebrow eyebrow--small accent">${recipe.time} MIN · ${recipe.servings} PERS</span>
    </div>

    ${rule()}

    <div id="cook-body-wrapper" style="flex:1;display:flex;flex-direction:column;min-height:0">
      <div class="cook-step">
        <div class="cook-step__num">${pad(step + 1)}</div>
        <h1 class="cook-step__heading">${esc(s.heading)}.</h1>
        <p class="cook-step__desc">${esc(s.desc)}</p>
      </div>

      <div class="cook-timer">
        <span class="eyebrow eyebrow--small">TEMPORIZADOR</span>
        <div style="display:flex;gap:12px;align-items:center">
          <span class="cook-timer__display" id="timer-display">${fmtTime(state.timerSec)}</span>
          ${state.timerRunning
            ? `<button class="chip active" data-action="timer-pause">❚❚ PAUSA</button>`
            : state.timerSec > 0
              ? `<button class="chip" data-action="timer-start">▶ START</button>`
              : `<button class="chip" data-action="timer-set" data-value="600">10:00</button>`}
        </div>
      </div>

      <div class="cook-nav">
        <button class="cta cta--ghost" data-action="cook-prev" data-id="${id}" ${step === 0 ? 'disabled' : ''}>← Anterior</button>
        <button class="cta" data-action="cook-next" data-id="${id}" ${step === total - 1 ? 'disabled' : ''}>
          ${step === total - 1 ? 'Hecho' : 'Siguiente →'}
        </button>
      </div>
    </div>
    ${sidebar}
  </div>`;
}

// ---- FORMULARIO NUEVA / EDITAR --------------------------------------
async function renderForm(id = null) {
  const editing = id != null;
  let recipe = editing ? state.recipes.find(r => r.id === id) : null;
  if (editing && !recipe) return `<div class="empty-state"><p>Receta no encontrada.</p></div>`;

  const r = recipe || {
    id: '', title: '', titleAccent: '', category: CATEGORIES[0].name,
    method: METHODS[0], time: 30, servings: 2, difficulty: DIFFICULTIES[1],
    blurb: '', notes: '', photo: null, photoShape: 'circle', photoTone: 'beige',
    ingredients: [{ qty: '', unit: '', name: '' }],
    steps: [{ heading: '', desc: '' }],
  };

  const cats = CATEGORIES.map(c =>
    `<option value="${esc(c.name)}" ${r.category === c.name ? 'selected' : ''}>${esc(c.name)}</option>`
  ).join('');
  const methods = METHODS.map(m =>
    `<option value="${esc(m)}" ${r.method === m ? 'selected' : ''}>${esc(m)}</option>`
  ).join('');
  const diffs = DIFFICULTIES.map(d =>
    `<option value="${esc(d)}" ${r.difficulty === d ? 'selected' : ''}>${esc(d)}</option>`
  ).join('');

  const ingRows = r.ingredients.map((ing, i) => `
    <div class="form-ingredient-row" data-ing-idx="${i}">
      <input class="form-input form-input--inline" name="ing-qty-${i}" placeholder="Cant." value="${esc(ing.qty)}">
      <input class="form-input form-input--inline" name="ing-unit-${i}" placeholder="ud" value="${esc(ing.unit)}">
      <input class="form-input form-input--inline" name="ing-name-${i}" placeholder="Ingrediente" value="${esc(ing.name)}">
      <button type="button" class="form-delete-btn" data-action="remove-ing" data-idx="${i}">−</button>
    </div>`).join('');

  const stepRows = r.steps.map((step, i) => `
    <div class="form-step-row" data-step-idx="${i}">
      <span class="step-num">${pad(i + 1)}</span>
      <div style="flex:1">
        <input class="form-input" name="step-heading-${i}" placeholder="Título del paso —" value="${esc(step.heading)}" style="font-weight:800;font-size:18px;margin-bottom:6px">
        <textarea class="form-input form-textarea" name="step-desc-${i}" placeholder="Descripción…" rows="2">${esc(step.desc)}</textarea>
      </div>
      <button type="button" class="form-delete-btn" data-action="remove-step" data-idx="${i}">−</button>
    </div>`).join('');

  const photoPreview = recipePhotoHtml(r, { className: 'form-preview__photo' });

  return `<div class="form-page">
    <div class="page-topbar">
      <a href="${editing ? `#/recetas/${id}` : '#/'}" class="back-link">
        <span class="back-link__arrow">←</span> Cancelar
      </a>
      ${eyebrow(editing ? '✎ Editar receta' : '04 · Nueva receta')}
    </div>

    <h1 class="form-page__h1">
      ${editing ? `Editar — <em class="not-italic accent">${esc(r.title)}.</em>` : `Escribe — <em class="not-italic accent">una receta tuya.</em>`}
    </h1>

    ${rule()}

    <form id="recipe-form" data-editing="${editing}" data-edit-id="${id || ''}">
      <div class="form-page__cols">

        <div>
          <div>
            ${eyebrow('Título')}
            <input class="form-input form-input--big" name="title" placeholder="Nombre de la receta" value="${esc(r.title)}" required>
          </div>
          <div style="margin-top:var(--sp-5)">
            ${eyebrow('Subtítulo (parte en color acento)')}
            <input class="form-input form-input--big form-input--accent" name="titleAccent" placeholder="…y algo más" value="${esc(r.titleAccent)}">
          </div>

          <div class="form-meta-grid">
            <div>
              ${eyebrow('Categoría')}
              <select class="form-input form-select" name="category">${cats}</select>
            </div>
            <div>
              ${eyebrow('Método')}
              <select class="form-input form-select" name="method">${methods}</select>
            </div>
            <div>
              ${eyebrow('Dificultad')}
              <select class="form-input form-select" name="difficulty">${diffs}</select>
            </div>
            <div>
              ${eyebrow('Tiempo (min)')}
              <input class="form-input" name="time" type="number" min="1" max="480" value="${r.time}">
            </div>
            <div>
              ${eyebrow('Porciones')}
              <input class="form-input" name="servings" type="number" min="1" max="20" value="${r.servings}">
            </div>
          </div>

          <div style="margin-top:var(--sp-7)">
            ${eyebrow('Descripción breve')}
            <textarea class="form-input form-textarea" name="blurb" placeholder="1–2 frases sobre la receta —" rows="2">${esc(r.blurb)}</textarea>
          </div>

          <div style="margin-top:var(--sp-8)">
            <div class="form-section-header">
              ${eyebrow('Ingredientes')}
              <button type="button" class="form-add-btn" data-action="add-ing">+ AÑADIR</button>
            </div>
            <div id="ingredients-list">${ingRows}</div>
          </div>

          <div style="margin-top:var(--sp-8)">
            <div class="form-section-header">
              ${eyebrow('Pasos')}
              <button type="button" class="form-add-btn" data-action="add-step">+ AÑADIR</button>
            </div>
            <div id="steps-list">${stepRows}</div>
          </div>

          <div style="margin-top:var(--sp-7)">
            ${eyebrow('Notas personales')}
            <textarea class="form-input form-textarea" name="notes" placeholder="Un truco, una variación…" rows="3">${esc(r.notes || '')}</textarea>
          </div>

          <div style="margin-top:var(--sp-7)">
            ${eyebrow('Foto')}
            <input type="file" accept="image/*" name="photo" class="form-input" style="font-size:16px;padding:var(--sp-3) 0">
          </div>
        </div>

        <aside class="form-preview">
          ${eyebrow('Vista previa')}
          <div class="form-preview__card">
            ${photoPreview}
            <div style="padding:var(--sp-4) 0 var(--sp-2)">
              <span class="eyebrow eyebrow--small">${esc(r.category)} · ${r.time} MIN</span>
              <div style="font-size:24px;font-weight:800;margin-top:6px;line-height:1.1">
                ${esc(r.title)} <em class="not-italic accent">${esc(r.titleAccent)}.</em>
              </div>
              <p style="font-size:14px;font-weight:700;margin-top:10px">${r.ingredients.filter(i => i.name).length} ingredientes · ${r.steps.filter(s => s.heading).length} pasos</p>
            </div>
          </div>
          <button type="submit" class="cta" style="margin-top:var(--sp-5)">
            ${editing ? 'Guardar cambios' : 'Guardar receta'} →
          </button>
        </aside>
      </div>
    </form>
  </div>`;
}

// ---- BUSCAR ---------------------------------------------------------
async function renderSearch() {
  const q       = state.searchQ.trim().toLowerCase();
  const results = q
    ? state.recipes.filter(r =>
        r.title.toLowerCase().includes(q) ||
        r.ingredients.some(i => i.name.toLowerCase().includes(q)) ||
        r.category.toLowerCase().includes(q)
      )
    : [];

  const suggestions = ['limón', 'salmón', 'rápido', 'pasta', 'bowl'].map(s =>
    `<button class="chip" data-action="search-suggest" data-value="${esc(s)}">${esc(s)}</button>`
  ).join('');

  const resultList = results.map(r => {
    const thumb = recipePhotoHtml(r, { className: 'search-result__thumb' });
    return `<a href="#/recetas/${r.id}" class="search-result">
      ${thumb}
      <span class="search-result__title">${highlightMatch(r.title, state.searchQ)}</span>
      <span class="search-result__arrow accent">→</span>
    </a>`;
  }).join('');

  return `<div class="search-page">
    <div class="page-topbar">
      <a href="#/recetas" class="back-link"><span class="back-link__arrow">←</span> Cerrar</a>
    </div>
    ${eyebrow('Buscar · por ingrediente o nombre', 'eyebrow--small')}

    <div class="search-input-wrap">
      <input
        class="search-input"
        id="search-input"
        type="search"
        placeholder="¿Qué tienes en casa?"
        value="${esc(state.searchQ)}"
        autocomplete="off"
        autofocus
      >
    </div>

    <div class="search-suggestions">${suggestions}</div>

    ${q ? `
      <div style="margin-top:var(--sp-6)">
        ${eyebrow(`${results.length} resultado${results.length !== 1 ? 's' : ''}`, 'eyebrow--small')}
        <div style="margin-top:var(--sp-3)">${resultList || '<p class="accent" style="font-size:20px;margin-top:var(--sp-4)">Sin resultados.</p>'}</div>
      </div>` : ''}
  </div>`;
}

// ---- LISTA DE LA COMPRA ---------------------------------------------
async function renderShopping() {
  const items = state.shopping;
  const sections = ['Fresco', 'Despensa', 'Nevera'];

  const total  = items.length;
  const done   = items.filter(i => i.done).length;
  const remain = total - done;

  const sectionBlocks = sections.map(sec => {
    const secItems = items.filter(i => (i.section || 'Fresco') === sec);
    if (!secItems.length) return '';
    const rows = secItems.map(item =>
      `<button class="check-btn" data-action="toggle-shopping" data-id="${item.id}" ${item.done ? 'data-done="true"' : ''}>
        <div class="check-box">
          ${item.done ? `<svg width="14" height="10" viewBox="0 0 14 10"><polyline points="1,5 5,9 13,1" fill="none" stroke="var(--bg)" stroke-width="2" stroke-linecap="round"/></svg>` : ''}
        </div>
        <div>
          <span class="check-name">${esc(item.name)}</span>
          <span class="check-meta">${esc(item.qty || '')}${item.recipe ? ` · ${esc(item.recipe)}` : ''}</span>
        </div>
      </button>`
    ).join('');
    return `<div class="shopping-section">
      ${eyebrow(sec)}
      ${rule()}
      ${rows}
    </div>`;
  }).join('');

  const addForm = state.showAddForm ? `
    <div class="shopping-add-form">
      <div class="shopping-add-grid">
        <input class="form-input" id="add-name" placeholder="Ingrediente" style="font-weight:800">
        <input class="form-input" id="add-qty" placeholder="Cant." style="font-weight:700">
        <select class="form-input form-select" id="add-section">
          ${sections.map(s => `<option>${esc(s)}</option>`).join('')}
        </select>
      </div>
      <div style="display:flex;gap:var(--sp-3);margin-top:var(--sp-3)">
        <button class="cta" data-action="shopping-save" style="flex:1">Añadir</button>
        <button class="cta cta--ghost" data-action="shopping-cancel" style="flex:1">Cancelar</button>
      </div>
    </div>` : '';

  return `<div class="shopping-page">
    <div class="page-topbar">
      ${backLink('Inicio', '#/')}
      ${done > 0 ? `<button class="chip" data-action="shopping-clear-done">Limpiar hechos</button>` : ''}
    </div>

    ${eyebrow('03 · Compra')}
    <h1 class="index-page__h1" style="margin-top:var(--sp-3)">
      ${total} items —
      <em class="not-italic accent">faltan ${remain}.</em>
    </h1>

    ${addForm}
    ${rule()}
    ${sectionBlocks || `<div class="empty-state"><p>Lista vacía — añade ingredientes con el botón +.</p></div>`}

    <button class="fab" data-action="shopping-add">+ AÑADIR</button>
  </div>`;
}

// =====================================================================
// ROUTER
// =====================================================================
const ROUTES = [
  { pattern: /^\/$/, handler: () => renderHome() },
  { pattern: /^\/recetas$/, handler: () => renderIndex() },
  { pattern: /^\/recetas\/([^/]+)\/cocinar$/, handler: m => renderCook(m[1]) },
  { pattern: /^\/recetas\/([^/]+)\/editar$/, handler: m => renderForm(m[1]) },
  { pattern: /^\/recetas\/([^/]+)$/, handler: m => renderDetail(m[1]) },
  { pattern: /^\/categorias\/(.+)$/, handler: m => renderCategoryDetail(m[1]) },
  { pattern: /^\/categorias$/, handler: () => renderCategories() },
  { pattern: /^\/buscar$/, handler: () => renderSearch() },
  { pattern: /^\/nueva$/, handler: () => renderForm(null) },
  { pattern: /^\/compra$/, handler: () => renderShopping() },
];

async function navigate(path) {
  const main = document.getElementById('main');
  if (!main) return;

  for (const route of ROUTES) {
    const m = path.match(route.pattern);
    if (m) {
      try {
        main.innerHTML = await route.handler(m);
      } catch (err) {
        console.error(err);
        main.innerHTML = `<div class="empty-state"><p>Error cargando la página.</p></div>`;
      }
      window.scrollTo(0, 0);
      // auto-focus search
      const si = document.getElementById('search-input');
      if (si) {
        si.focus();
        si.addEventListener('input', e => {
          state.searchQ = e.target.value;
          navigate('/buscar');
        });
      }
      // auto-resize textareas
      document.querySelectorAll('.form-textarea').forEach(ta => {
        ta.style.height = 'auto';
        ta.style.height = ta.scrollHeight + 'px';
        ta.addEventListener('input', function () {
          this.style.height = 'auto';
          this.style.height = this.scrollHeight + 'px';
        });
      });
      return;
    }
  }
  // fallback: home
  main.innerHTML = await renderHome();
}

function currentPath() {
  return location.hash.slice(1) || '/';
}

// =====================================================================
// ACTIONS — event delegation
// =====================================================================
async function handleAction(action, el) {
  const id    = el.dataset.id;
  const value = el.dataset.value;
  const idx   = parseInt(el.dataset.idx, 10);

  switch (action) {

    // Filtros índice
    case 'filter-category':
      state.filter.category = state.filter.category === value ? null : value;
      navigate('/recetas');
      break;
    case 'filter-time':
      state.filter.maxTime = state.filter.maxTime === parseInt(value) ? null : parseInt(value);
      navigate('/recetas');
      break;
    case 'filter-clear':
      state.filter = { category: null, maxTime: null, method: null };
      navigate('/recetas');
      break;
    case 'view-toggle':
      state.viewMode = value;
      navigate('/recetas');
      break;

    // Porciones
    case 'servings-inc':
      state.servings[id] = (state.servings[id] ?? (state.recipes.find(r => r.id === id)?.servings ?? 2)) + 1;
      navigate(currentPath());
      break;
    case 'servings-dec':
      state.servings[id] = Math.max(1, (state.servings[id] ?? (state.recipes.find(r => r.id === id)?.servings ?? 2)) - 1);
      navigate(currentPath());
      break;

    // Marcar pasos
    case 'toggle-step': {
      if (!state.doneSteps[id]) state.doneSteps[id] = new Set();
      const stepIdx = parseInt(el.dataset.step, 10);
      if (state.doneSteps[id].has(stepIdx)) state.doneSteps[id].delete(stepIdx);
      else state.doneSteps[id].add(stepIdx);
      // Guardar en localStorage para persistir durante la sesión
      try { localStorage.setItem(`done:${id}`, JSON.stringify([...state.doneSteps[id]])); } catch {}
      navigate(currentPath());
      break;
    }

    // Modo cocina — navegación entre pasos
    case 'cook-next': {
      const recipe = state.recipes.find(r => r.id === id);
      if (!recipe) break;
      const cur = state.cookStep[id] ?? 0;
      if (cur < recipe.steps.length - 1) {
        state.cookStep[id] = cur + 1;
        navigate(currentPath());
      } else {
        // último paso: volver al detalle
        location.hash = `#/recetas/${id}`;
      }
      break;
    }
    case 'cook-prev': {
      const cur = state.cookStep[id] ?? 0;
      if (cur > 0) { state.cookStep[id] = cur - 1; navigate(currentPath()); }
      break;
    }

    // Timer
    case 'timer-set':
      clearInterval(state.timerInterval);
      state.timerSec     = parseInt(value, 10);
      state.timerRunning = false;
      navigate(currentPath());
      break;
    case 'timer-start':
      if (state.timerRunning) break;
      state.timerRunning = true;
      state.timerInterval = setInterval(() => {
        if (state.timerSec <= 0) {
          clearInterval(state.timerInterval);
          state.timerRunning = false;
          try { navigator.vibrate?.([300, 100, 300]); } catch {}
          const disp = document.getElementById('timer-display');
          if (disp) disp.textContent = '00:00';
          return;
        }
        state.timerSec--;
        const disp = document.getElementById('timer-display');
        if (disp) disp.textContent = fmtTime(state.timerSec);
      }, 1000);
      navigate(currentPath());
      break;
    case 'timer-pause':
      clearInterval(state.timerInterval);
      state.timerRunning = false;
      navigate(currentPath());
      break;

    // Borrar receta
    case 'delete-recipe':
      if (confirm(`¿Borrar la receta "${state.recipes.find(r => r.id === id)?.title}"?`)) {
        await deleteRecipe(id);
        state.recipes = await getAllRecipes();
        location.hash = '#/recetas';
      }
      break;

    // Formulario — añadir ingrediente / paso
    case 'add-ing': {
      const form = document.getElementById('recipe-form');
      if (!form) break;
      const existing = [...form.querySelectorAll('[data-ing-idx]')].map(e => parseInt(e.dataset.ingIdx, 10));
      const count = existing.length ? Math.max(...existing) + 1 : 0;
      const div   = document.createElement('div');
      div.className = 'form-ingredient-row';
      div.dataset.ingIdx = count;
      div.innerHTML = `
        <input class="form-input form-input--inline" name="ing-qty-${count}" placeholder="Cant.">
        <input class="form-input form-input--inline" name="ing-unit-${count}" placeholder="ud">
        <input class="form-input form-input--inline" name="ing-name-${count}" placeholder="Ingrediente">
        <button type="button" class="form-delete-btn" data-action="remove-ing" data-idx="${count}">−</button>`;
      document.getElementById('ingredients-list').appendChild(div);
      div.querySelector('input').focus();
      break;
    }
    case 'add-step': {
      const form = document.getElementById('recipe-form');
      if (!form) break;
      const existingS = [...form.querySelectorAll('[data-step-idx]')].map(e => parseInt(e.dataset.stepIdx, 10));
      const count = existingS.length ? Math.max(...existingS) + 1 : 0;
      const countDisplay = form.querySelectorAll('[data-step-idx]').length + 1;
      const div   = document.createElement('div');
      div.className = 'form-step-row';
      div.dataset.stepIdx = count;
      div.innerHTML = `
        <span class="step-num">${pad(countDisplay)}</span>
        <div style="flex:1">
          <input class="form-input" name="step-heading-${count}" placeholder="Título del paso —" style="font-weight:800;font-size:18px;margin-bottom:6px">
          <textarea class="form-input form-textarea" name="step-desc-${count}" placeholder="Descripción…" rows="2"></textarea>
        </div>
        <button type="button" class="form-delete-btn" data-action="remove-step" data-idx="${count}">−</button>`;
      document.getElementById('steps-list').appendChild(div);
      div.querySelector('input').focus();
      break;
    }
    case 'remove-ing':
      el.closest('[data-ing-idx]')?.remove();
      break;
    case 'remove-step':
      el.closest('[data-step-idx]')?.remove();
      break;

    // Compra
    case 'toggle-shopping': {
      const item = state.shopping.find(i => i.id === parseInt(id, 10));
      if (item) {
        item.done = !item.done;
        await putShoppingItem(item);
        navigate('/compra');
      }
      break;
    }
    case 'shopping-add':
      state.showAddForm = true;
      navigate('/compra');
      setTimeout(() => document.getElementById('add-name')?.focus(), 50);
      break;
    case 'shopping-cancel':
      state.showAddForm = false;
      navigate('/compra');
      break;
    case 'shopping-save': {
      const name = document.getElementById('add-name')?.value.trim();
      const qty  = document.getElementById('add-qty')?.value.trim();
      const sec  = document.getElementById('add-section')?.value || 'Fresco';
      if (!name) { document.getElementById('add-name')?.focus(); break; }
      await putShoppingItem({ name, qty, section: sec, done: false, recipe: '' });
      state.shopping = await getAllShopping();
      state.showAddForm = false;
      navigate('/compra');
      break;
    }
    case 'shopping-clear-done':
      await clearShoppingDone();
      state.shopping = await getAllShopping();
      navigate('/compra');
      break;

    // Búsqueda — sugerencias
    case 'search-suggest':
      state.searchQ = value;
      navigate('/buscar');
      break;
  }
}

// =====================================================================
// INIT
// =====================================================================
async function init() {
  const main = document.getElementById('main');

  try {
    await seedIfEmpty();
    state.recipes  = await getAllRecipes();
    state.shopping = await getAllShopping();
  } catch (err) {
    console.error('Error al conectar con la base de datos:', err);
    if (main) main.innerHTML = `
      <div class="empty-state" style="padding:var(--sp-8) var(--sp-5);text-align:center">
        <p style="font-size:20px;font-weight:700;margin-bottom:var(--sp-4)">Sin conexión</p>
        <p style="color:var(--soft);margin-bottom:var(--sp-6)">No se pudo cargar el recetario.<br>Comprueba tu conexión a internet.</p>
        <button class="cta" onclick="location.reload()">Reintentar →</button>
      </div>`;
    return;
  }

  // Restaurar pasos completados desde localStorage
  state.recipes.forEach(r => {
    try {
      const saved = localStorage.getItem(`done:${r.id}`);
      if (saved) state.doneSteps[r.id] = new Set(JSON.parse(saved));
    } catch {}
  });

  // Navegación por hash
  window.addEventListener('hashchange', () => navigate(currentPath()));
  navigate(currentPath());

  // Event delegation global en #app
  document.getElementById('app').addEventListener('click', async e => {
    // Acciones
    const actionEl = e.target.closest('[data-action]');
    if (actionEl) {
      e.preventDefault();
      await handleAction(actionEl.dataset.action, actionEl);
      return;
    }
  });

  // Submit del formulario de receta
  document.getElementById('app').addEventListener('submit', async e => {
    if (e.target.id !== 'recipe-form') return;
    e.preventDefault();
    await saveRecipeForm(e.target);
  });

  
    
}

// =====================================================================
// COMPRIMIR IMAGEN (Canvas → JPEG, max 900px, q=0.75)
// Evita que base64 de fotos de móvil supere el límite de Supabase
// =====================================================================
async function compressImage(file, maxWidth = 900, quality = 0.75) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = e => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        const canvas = document.createElement('canvas');
        canvas.width  = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

// =====================================================================
// GUARDAR FORMULARIO
// =====================================================================
async function saveRecipeForm(form) {
  const fd      = new FormData(form);
  const editing = form.dataset.editing === 'true';
  const editId  = form.dataset.editId;

  // Leer ingredientes directamente del DOM (sin depender de nombres FormData)
  const ingredients = [];
  form.querySelectorAll('[data-ing-idx]').forEach(row => {
    const inputs = row.querySelectorAll('input');
    const qty  = (inputs[0]?.value || '').trim();
    const unit = (inputs[1]?.value || '').trim();
    const name = (inputs[2]?.value || '').trim();
    if (name) ingredients.push({ qty, unit, name });
  });

  // Leer pasos directamente del DOM
  const steps = [];
  form.querySelectorAll('[data-step-idx]').forEach(row => {
    const heading = (row.querySelector('input')?.value || '').trim();
    const desc    = (row.querySelector('textarea')?.value || '').trim();
    if (heading) steps.push({ heading, desc });
  });

  const title = (fd.get('title') || '').trim();
  if (!title) { alert('El título es obligatorio.'); return; }
  if (!steps.length) { alert('Añade al menos un paso.'); return; }

  // Generar id desde el título
  const id = editing
    ? editId
    : title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now();

  // Foto
  let photo = editing ? (state.recipes.find(r => r.id === editId)?.photo || null) : null;
  const photoFile = form.querySelector('[name="photo"]')?.files?.[0];
  if (photoFile) {
    photo = await compressImage(photoFile);
  }

  const recipe = {
    id,
    title,
    titleAccent: (fd.get('titleAccent') || '').trim(),
    category:    fd.get('category') || CATEGORIES[0].name,
    method:      fd.get('method')   || METHODS[0],
    difficulty:  fd.get('difficulty') || DIFFICULTIES[1],
    time:        parseInt(fd.get('time'), 10)     || 30,
    servings:    parseInt(fd.get('servings'), 10) || 2,
    blurb:       (fd.get('blurb') || '').trim(),
    notes:       (fd.get('notes') || '').trim(),
    photo,
    photoShape:  editing ? (state.recipes.find(r => r.id === editId)?.photoShape || 'circle') : 'circle',
    photoTone:   editing ? (state.recipes.find(r => r.id === editId)?.photoTone  || 'beige')  : 'beige',
    ingredients,
    steps,
    createdAt:   editing ? (state.recipes.find(r => r.id === editId)?.createdAt || Date.now()) : Date.now(),
    updatedAt:   Date.now(),
  };

  try {
    await putRecipe(recipe);
  } catch (err) {
    alert(`No se pudo guardar la receta. Comprueba la conexión.\n(${err?.message ?? err})`);
    return;
  }
  state.recipes = await getAllRecipes();
  location.hash = `#/recetas/${id}`;
}

// Arrancar
init();
