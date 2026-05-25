# libro-recetas — Contexto Global para Claude Code

## 🍳 Qué es esta app

PWA (Progressive Web App) de recetas personales. Cuaderno digital offline-first para guardar, buscar y cocinar recetas.
- **URL producción**: https://anamanz7.github.io/my-recipes/
- **Repositorio**: repositorio independiente `my-recipes` (antes vivía en el portfolio como `/cookbook/`)
- **Stack**: HTML5 + CSS3 + Vanilla JS ES Modules — sin frameworks, sin build tools, sin dependencias npm
- **Idioma**: Español

---

## 📁 Estructura de archivos

```
index.html      ← Punto de entrada. Registra el SW. Renderizado en JS.
app.js          ← App principal: router, páginas, estado, event delegation
data.js         ← Recetas seed + categorías + arte SVG abstracto por receta
db.js           ← Wrapper IndexedDB (recipes, shopping, stats)
style.css       ← Todos los estilos (variables CSS en :root, 3 temas)
sw.js           ← Service Worker: cache shell + estrategia cache-first
manifest.json   ← PWA manifest (icons, scope /my-recipes/, display:standalone)
fonts/          ← Syne (variable font), usada en toda la app
icons/          ← SVG icons para la PWA (192 y 512)
```

---

## 🔢 Versioning

```js
// app.js línea 6
const VERSION = '0.1';
```
**IMPORTANTE**: incrementar `VERSION` en cada cambio significativo. Se muestra en la portada bajo el eyebrow `UN CUADERNO · 2026`.

---

## 🎨 Sistema de Diseño

### Temas (3) — seleccionables con los dots en la barra superior

| Código | Nombre | Descripción |
|---|---|---|
| `a` | Crema (claro) | Fondo beige cálido, predeterminado |
| `m` | Coral | Acento rojo coral |
| `c` | Tinta (oscuro) | Fondo oscuro tipo editorial |

Los temas se aplican con `data-theme="a|m|c"` en `<html>`. Definidos en `:root[data-theme="X"]` en `style.css`. Se persisten en `localStorage('theme')`.

### Paleta base (compartida entre temas)
```
--ink:   #2B0F0A   ← Texto principal / fondo oscuro
--coral: #D95A4E   ← Acento / marca
--sand:  #D9C8B4   ← Fondo claro / crema
```

### Tipografía
- **Syne** (variable font, `fonts/Syne-VariableFont_wght.ttf`) — toda la app, peso variable 400–800
- Editorial y limpia, sin serif

---

## 🏗️ Arquitectura — SPA con router hash

La app es una SPA completa. El `index.html` tiene solo el esqueleto; todo el contenido se inyecta por JS en `<main id="main">`.

### Router (`app.js`)
```
#/               → renderHome()
#/recetas        → renderIndex()         (con filtros y grid/list)
#/recetas/:id    → renderDetail(id)      (página de receta)
#/recetas/:id/cocinar  → renderCook(id)  (modo cocina paso a paso)
#/recetas/:id/editar   → renderForm(id)  (editar receta existente)
#/categorias     → renderCategories()
#/categorias/:slug → renderCategoryDetail(slug)
#/buscar         → renderSearch()        (búsqueda por nombre/ingrediente)
#/nueva          → renderForm(null)      (formulario nueva receta)
#/compra         → renderShopping()      (lista de la compra)
```

### Estado global (`state` en `app.js`)
```js
state.recipes        // array de todas las recetas (cargado desde IndexedDB)
state.theme          // tema activo: 'a' | 'm' | 'c'
state.servings       // { recipeId: number } — porciones ajustadas por receta
state.doneSteps      // { recipeId: Set<number> } — pasos completados
state.cookStep       // { recipeId: number } — paso actual en modo cocina
state.filter         // { category, maxTime, method } — filtros del índice
state.viewMode       // 'grid' | 'list' — vista del índice
state.searchQ        // string — query de búsqueda
state.shopping       // array de items de la lista de la compra
```

### Event delegation
Toda la interactividad usa **event delegation** en `#app`. Los elementos clicables tienen `data-action="acción"`. Un único listener en `app.js → handleAction()` gestiona todo.

---

## 💾 Base de datos — IndexedDB (`db.js`)

```
DB: 'libro-recetas' v1
Stores:
  recipes   — keyPath: 'id' (string slug)
  shopping  — keyPath: 'id' (autoIncrement), index: 'section'
  stats     — keyPath: 'key'
```

### Funciones exportadas
```js
// Recetas
getAllRecipes()            → Promise<Recipe[]>
getRecipe(id)             → Promise<Recipe>
putRecipe(recipe)         → Promise
deleteRecipe(id)          → Promise

// Compra
getAllShopping()           → Promise<ShoppingItem[]>
putShoppingItem(item)     → Promise
deleteShoppingItem(id)    → Promise
clearShoppingDone()       → Promise   ← borra solo los marcados como done

// Stats
getStat(key)              → Promise<number>
incrementStat(key, by?)   → Promise

// Seed
seedIfEmpty()             → Promise   ← puebla con RECIPES de data.js si BD vacía
```

---

## 📦 Estructura de una Receta

```js
{
  id:           'slug-unico',           // generado del título al guardar
  title:        'Nombre de la receta',
  titleAccent:  'parte en color acento',  // opcional, aparece en cursiva acento
  category:     'Bowls',               // de CATEGORIES en data.js
  method:       'Sartén',              // de METHODS en data.js
  difficulty:   'Fácil',              // de DIFFICULTIES en data.js
  time:         25,                    // minutos (number)
  servings:     2,                     // porciones base (number)
  blurb:        'Descripción breve',
  notes:        'Truco o nota',        // opcional
  photo:        null,                  // o data URL base64 (foto real)
  photoShape:   'circle',             // shape del arte SVG placeholder
  photoTone:    'beige',              // paleta del arte SVG placeholder
  ingredients:  [{ qty, unit, name }],
  steps:        [{ heading, desc }],
  createdAt:    1234567890,           // Date.now()
  updatedAt:    1234567890,
}
```

### Categorías disponibles (CATEGORIES en data.js)
`Bowls`, `Pasta`, `Cenas rápidas`, `Brunch`, `Postres`

### Métodos disponibles (METHODS en data.js)
`Sin horno`, `Sin cocina`, `Sartén`, `Olla`, `Airfryer`, `Horno`, `Tostadora`

### Dificultades (DIFFICULTIES en data.js)
`Muy fácil`, `Fácil`, `Media`, `Difícil`

---

## 🖼️ Arte SVG abstracto (placeholder de foto)

Cada receta tiene arte SVG generado en `data.js → artSvg(recipe)` cuando no hay foto real. Se controla con dos campos de la receta:

- `photoShape`: `circle`, `ovals`, `slices`, `swirl`, `stacked`, `dots`, `curry`, `fish`
- `photoTone`: `ink`, `coral`, `beige`, `peach`, `orange`, `red`

Para usar siempre `recipePhotoHtml(recipe, { className, style })` — devuelve el arte SVG + imagen real superpuesta si existe.

---

## 📱 PWA y Service Worker

- Scope: `/my-recipes/` (importante para el SW)
- Cache strategy: **cache-first** para el shell, network-fallback para el resto
- El SW se registra en `index.html` con `{ scope: '/my-recipes/' }`
- Para invalidar caché al desplegar: cambiar `CACHE = 'my-recipes-v2'` en `sw.js`

---

## ⚙️ Funciones JS clave

| Función | Descripción |
|---|---|
| `init()` | Arranque: seed BD, cargar estado, aplicar tema, iniciar router |
| `navigate(path)` | Renderiza la página del path hash dado |
| `handleAction(action, el)` | Dispatcher central de todas las acciones de UI |
| `saveRecipeForm(form)` | Lee el form, valida, guarda en IndexedDB, navega al detalle |
| `scaleQty(qty, base, servings)` | Escala cantidades según porciones ajustadas |
| `applyTheme(t)` | Cambia tema en `<html>`, guarda en localStorage |

---

## 🛠️ Desarrollo local

```bash
cd /Users/anamanzanaresgonzalez/my-recipes
python3 -m http.server 8000
# → http://localhost:8000
```

**Nota**: el SW se registra en `/my-recipes/` — en localhost la ruta será diferente, el SW puede dar warnings pero la app funciona.

---

## 📝 Convenciones de código

- **Indentación**: 2 espacios
- **JS**: ES Modules (`import`/`export`), sin bundler, sin TypeScript
- **HTML generado**: siempre escapar con `esc()` antes de insertar en innerHTML
- **Commits**: descriptivos en español
- Las recetas seed de `data.js` no se modifican directamente; se editan desde la UI

---

## 📋 TODOs / Mejoras Pendientes

- [ ] Añadir más recetas seed a `data.js`
- [ ] Modo de importar/exportar recetas (JSON)
- [ ] Añadir fotos reales a las recetas seed
- [ ] Colecciones/listas personalizadas (más allá de categorías)
- [ ] Compartir receta (Web Share API)
- [ ] Timer persistente entre navegación de pasos en modo cocina
