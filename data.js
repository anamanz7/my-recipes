// Recetas seed + arte SVG abstracto por receta
// Exporta: RECIPES, CATEGORIES, SHOPPING, artSvg()

export const RECIPES = [
  {
    id: 'poke',
    title: 'Poke bowl de salmón',
    titleAccent: 'mango y edamame',
    category: 'Bowls',
    method: 'Sin horno',
    time: 25,
    servings: 2,
    difficulty: 'Fácil',
    blurb: 'Arroz tibio, salmón curado en soja, mango, edamame, sésamo. Cena de viernes sin pensar.',
    photo: null,
    photoShape: 'circle',
    photoTone: 'orange',
    ingredients: [
      { qty: '180', unit: 'g',     name: 'arroz para sushi' },
      { qty: '220', unit: 'g',     name: 'salmón fresco' },
      { qty: '1',   unit: '',      name: 'mango maduro' },
      { qty: '120', unit: 'g',     name: 'edamame desvainado' },
      { qty: '½',   unit: '',      name: 'pepino' },
      { qty: '2',   unit: 'cdas',  name: 'soja' },
      { qty: '1',   unit: 'cda',   name: 'aceite de sésamo' },
      { qty: '1',   unit: 'cdita', name: 'sésamo tostado' },
    ],
    steps: [
      { heading: 'Cocer el arroz',   desc: 'Lava el arroz hasta que el agua salga clara. Cuece con un 20 % más de agua, 12 minutos. Reposo tapado, 10 min más.' },
      { heading: 'Marinar el salmón', desc: 'Corta el salmón en dados de 1 cm. Mézclalo con la soja y el aceite de sésamo y déjalo 10 minutos en la nevera.' },
      { heading: 'Cortar los toppings', desc: 'Mango en bastones, pepino en medias lunas finas. Edamame, descongelado.' },
      { heading: 'Montar el bowl',   desc: 'Arroz tibio en la base. Coloca cada topping en su zona. Sésamo por encima.' },
    ],
    notes: 'Si lo dejas marinar más de 30 min, el salmón empieza a cocerse en la soja. No pasa nada — solo cambia la textura.',
  },
  {
    id: 'gnocchi',
    title: 'Ñoquis con pollo',
    titleAccent: 'y salsa de yogur',
    category: 'Pasta',
    method: 'Sartén',
    time: 30,
    servings: 2,
    difficulty: 'Fácil',
    blurb: 'Ñoquis dorados en mantequilla, pollo a la sartén, salsa fría de yogur y limón.',
    photo: null,
    photoShape: 'ovals',
    photoTone: 'ink',
    ingredients: [
      { qty: '400', unit: 'g',      name: 'ñoquis frescos' },
      { qty: '300', unit: 'g',      name: 'pechuga de pollo' },
      { qty: '150', unit: 'g',      name: 'yogur griego' },
      { qty: '1',   unit: '',       name: 'limón' },
      { qty: '1',   unit: 'diente', name: 'ajo' },
      { qty: '20',  unit: 'g',      name: 'mantequilla' },
      { qty: '',    unit: 'al gusto', name: 'menta fresca' },
    ],
    steps: [
      { heading: 'Pollo en dados',    desc: 'Corta la pechuga en cubos de 2 cm. Sal, pimienta, un chorro de aceite. A la sartén bien caliente hasta dorar.' },
      { heading: 'Salsa fría',        desc: 'Yogur, ralladura y zumo de medio limón, el ajo machacado, menta picada. Sal y reserva en la nevera.' },
      { heading: 'Saltear los ñoquis', desc: 'En la misma sartén, mantequilla y los ñoquis directos del paquete. Tres minutos por cara, sin tocarlos.' },
      { heading: 'Mezclar y servir',  desc: 'Junta el pollo y los ñoquis. Sirve sobre una base de salsa. Más menta encima.' },
    ],
    notes: 'Truco: no hace falta hervir los ñoquis antes. La sartén caliente les da costra y los cocina por dentro.',
  },
  {
    id: 'zucchini',
    title: 'Calabacín en airfryer',
    titleAccent: 'con atún y limón',
    category: 'Cenas rápidas',
    method: 'Airfryer',
    time: 18,
    servings: 1,
    difficulty: 'Muy fácil',
    blurb: 'Tres ingredientes que ya tienes en casa. Sale en 18 minutos, ensucias un bol.',
    photo: null,
    photoShape: 'slices',
    photoTone: 'beige',
    ingredients: [
      { qty: '1',   unit: '',        name: 'calabacín grande' },
      { qty: '1',   unit: 'lata',    name: 'atún en aceite' },
      { qty: '½',   unit: '',        name: 'limón' },
      { qty: '',    unit: 'al gusto', name: 'orégano' },
      { qty: '',    unit: 'al gusto', name: 'aceite, sal' },
    ],
    steps: [
      { heading: 'Cortar el calabacín', desc: 'Rodajas de 1 cm. Mézclalas con un chorro de aceite, sal y orégano.' },
      { heading: 'Airfryer 180 °C',     desc: '12 minutos. A los 6, dale la vuelta. Quieres bordes dorados, centro tierno.' },
      { heading: 'Montar',              desc: 'Calabacín tibio en el plato. Atún escurrido encima. Ralla limón por encima. Pimienta.' },
    ],
    notes: 'Si el atún es de calidad, no le pongas nada más. Si es del normal, prueba con una pizca de pimentón.',
  },
  {
    id: 'lemon-pasta',
    title: 'Pasta al limón',
    titleAccent: 'con parmesano',
    category: 'Pasta',
    method: 'Olla',
    time: 20,
    servings: 2,
    difficulty: 'Fácil',
    blurb: 'Cuatro ingredientes. La salsa se hace con el agua de la pasta.',
    photo: null,
    photoShape: 'swirl',
    photoTone: 'peach',
    ingredients: [
      { qty: '200', unit: 'g',  name: 'spaghetti' },
      { qty: '1',   unit: '',   name: 'limón (zumo + ralladura)' },
      { qty: '60',  unit: 'g',  name: 'parmesano rallado' },
      { qty: '40',  unit: 'g',  name: 'mantequilla' },
      { qty: '',    unit: 'al gusto', name: 'pimienta negra' },
    ],
    steps: [
      { heading: 'Cocer la pasta', desc: 'Al dente. Reserva una taza de agua de cocción antes de escurrir.' },
      { heading: 'Salsa',         desc: 'En la misma olla escurrida: mantequilla, ralladura, zumo de medio limón y media taza de agua de la pasta. Remueve hasta emulsionar.' },
      { heading: 'Mezclar',       desc: 'Pasta de vuelta, parmesano fuera del fuego. Si queda seca, más agua de cocción. Pimienta generosa.' },
    ],
    notes: 'Si añades el queso con el fuego encendido se hace grumos. Fuego apagado, siempre.',
  },
  {
    id: 'toast',
    title: 'Tostada de aguacate',
    titleAccent: 'y tomate concassé',
    category: 'Brunch',
    method: 'Tostadora',
    time: 10,
    servings: 1,
    difficulty: 'Muy fácil',
    blurb: 'La tostada de cada mañana, pero hecha bien. Tomate sin piel, aguacate machacado.',
    photo: null,
    photoShape: 'stacked',
    photoTone: 'coral',
    ingredients: [
      { qty: '2',   unit: 'rebanadas', name: 'pan de masa madre' },
      { qty: '1',   unit: '',          name: 'aguacate maduro' },
      { qty: '1',   unit: '',          name: 'tomate de pera' },
      { qty: '½',   unit: '',          name: 'lima' },
      { qty: '',    unit: 'al gusto',  name: 'sal en escamas' },
    ],
    steps: [
      { heading: 'Tomate concassé', desc: 'Cruz en la base, escaldar 30 seg, agua fría. Pela, despepita, cubitos pequeños.' },
      { heading: 'Aguacate',        desc: 'Machaca con tenedor, zumo de lima y sal. Que quede grueso, no puré.' },
      { heading: 'Montar',          desc: 'Pan tostado, aguacate generoso, tomate por encima, escamas de sal al final.' },
    ],
    notes: '',
  },
  {
    id: 'chickpeas',
    title: 'Ensalada de garbanzos',
    titleAccent: 'pepino y feta',
    category: 'Bowls',
    method: 'Sin cocina',
    time: 15,
    servings: 2,
    difficulty: 'Muy fácil',
    blurb: 'Garbanzos de bote, lo que tengas en la nevera, vinagreta de mostaza.',
    photo: null,
    photoShape: 'dots',
    photoTone: 'beige',
    ingredients: [
      { qty: '1',   unit: 'bote',   name: 'garbanzos cocidos (400 g)' },
      { qty: '1',   unit: '',       name: 'pepino' },
      { qty: '120', unit: 'g',      name: 'feta' },
      { qty: '½',   unit: '',       name: 'cebolla morada' },
      { qty: '',    unit: 'al gusto', name: 'perejil fresco' },
      { qty: '2',   unit: 'cdas',   name: 'aceite' },
      { qty: '1',   unit: 'cdita',  name: 'mostaza Dijon' },
      { qty: '1',   unit: 'cda',    name: 'vinagre de manzana' },
    ],
    steps: [
      { heading: 'Enjuagar y secar', desc: 'Garbanzos al colador, agua fría, secarlos bien con un paño. Sin secar quedan blandos.' },
      { heading: 'Cortar',           desc: 'Pepino en medias lunas, cebolla en pluma fina, feta en dados, perejil picado.' },
      { heading: 'Vinagreta',        desc: 'Mostaza, vinagre, aceite, sal. Bate con tenedor hasta que emulsione.' },
      { heading: 'Mezclar',          desc: 'Todo en un bol grande. Mezclar con cuidado para no romper el feta.' },
    ],
    notes: 'Aguanta dos días en la nevera y mejora al día siguiente.',
  },
  {
    id: 'curry',
    title: 'Curry rápido de coco',
    titleAccent: 'y garbanzos',
    category: 'Cenas rápidas',
    method: 'Sartén',
    time: 25,
    servings: 2,
    difficulty: 'Fácil',
    blurb: 'Una lata de coco, una lata de garbanzos, pasta de curry. Cena de martes.',
    photo: null,
    photoShape: 'curry',
    photoTone: 'red',
    ingredients: [
      { qty: '1',   unit: 'lata',  name: 'leche de coco' },
      { qty: '1',   unit: 'bote',  name: 'garbanzos cocidos' },
      { qty: '2',   unit: 'cdas',  name: 'pasta de curry rojo' },
      { qty: '1',   unit: '',      name: 'cebolla' },
      { qty: '',    unit: 'al gusto', name: 'espinacas frescas' },
      { qty: '',    unit: 'al gusto', name: 'lima, cilantro' },
    ],
    steps: [
      { heading: 'Sofrito',           desc: 'Cebolla picada en aceite hasta translúcida. Suma la pasta de curry y dora un minuto.' },
      { heading: 'Coco + garbanzos',  desc: 'Vierte la leche de coco y los garbanzos escurridos. Hierve a fuego medio 10 minutos.' },
      { heading: 'Verdes',            desc: 'Espinacas al final, dos minutos. Apaga y termina con lima y cilantro.' },
    ],
    notes: 'Sirve con arroz basmati o pan plano. Aguanta 3 días.',
  },
  {
    id: 'salmon',
    title: 'Salmón al horno',
    titleAccent: 'con miel y soja',
    category: 'Cenas rápidas',
    method: 'Horno',
    time: 20,
    servings: 2,
    difficulty: 'Fácil',
    blurb: 'Lomo de salmón, glaseado de miel y soja, horno fuerte 12 minutos.',
    photo: null,
    photoShape: 'fish',
    photoTone: 'coral',
    ingredients: [
      { qty: '2',   unit: 'lomos',  name: 'salmón con piel' },
      { qty: '2',   unit: 'cdas',   name: 'miel' },
      { qty: '2',   unit: 'cdas',   name: 'soja' },
      { qty: '1',   unit: 'cdita',  name: 'jengibre rallado' },
      { qty: '1',   unit: 'diente', name: 'ajo' },
    ],
    steps: [
      { heading: 'Glaseado',   desc: 'Miel, soja, jengibre, ajo machacado. Mezcla en un bol.' },
      { heading: 'Marinar',    desc: 'Salmón en una fuente. Cubre con el glaseado. 10 minutos a temperatura ambiente.' },
      { heading: 'Horno fuerte', desc: '220 °C, 12 minutos. A los 6, vuelve a pintar con el glaseado de la fuente.' },
    ],
    notes: 'El centro debe quedar rosa translúcido. Si se pasa, queda seco.',
  },
  {
    id: 'hojaldre-tomate',
    title: 'Hojaldre de tomate',
    titleAccent: 'con ricota y albahaca',
    category: 'Brunch',
    method: 'Horno',
    time: 35,
    servings: 2,
    difficulty: 'Fácil',
    blurb: 'Base crujiente de hojaldre, pesto y tomate en rodajas. Se termina fuera del horno con ricota, parmesano y albahaca.',
    photo: null,
    photoShape: 'slices',
    photoTone: 'red',
    ingredients: [
      { qty: '1',  unit: 'lámina',  name: 'hojaldre rectangular' },
      { qty: '2',  unit: 'cdas',    name: 'pesto' },
      { qty: '2',  unit: '',        name: 'tomates medianos' },
      { qty: '1',  unit: '',        name: 'huevo batido' },
      { qty: '80', unit: 'g',       name: 'ricota' },
      { qty: '',   unit: 'al gusto', name: 'parmesano rallado' },
      { qty: '',   unit: 'al gusto', name: 'pistachos troceados (opcional)' },
      { qty: '',   unit: 'al gusto', name: 'albahaca fresca' },
      { qty: '',   unit: 'al gusto', name: 'sal y aceite' },
    ],
    steps: [
      { heading: 'Preparar la base',   desc: 'Extiende la lámina de hojaldre sobre papel de horno. Cubre con el pesto, dejando un borde de 1–2 cm libre.' },
      { heading: 'Colocar el tomate',  desc: 'Corta los tomates en rodajas finas. Colócalas encima del pesto, ligeramente superpuestas.' },
      { heading: 'Doblar y pintar',    desc: 'Dobla los bordes del hojaldre hacia dentro. Pinta el borde con huevo batido y añade sal y un chorrito de aceite por encima del tomate.' },
      { heading: 'Horno 180 °C',       desc: '25 minutos, hasta que el hojaldre esté dorado y crujiente por los bordes.' },
      { heading: 'Acabado fuera del horno', desc: 'Añade la ricota a cucharadas, parmesano rallado, los pistachos troceados y unas hojas de albahaca frescas.' },
    ],
    notes: 'La ricota y la albahaca van siempre después de hornear — el calor residual es suficiente y así conservan textura y aroma.',
  },
];

export const CATEGORIES = [
  { name: 'Bowls',         icon: '🥣' },
  { name: 'Pasta',         icon: '🍝' },
  { name: 'Cenas rápidas', icon: '⚡' },
  { name: 'Brunch',        icon: '🍳' },
  { name: 'Postres',       icon: '🍮' },
];

export const METHODS = ['Sin horno','Sin cocina','Sartén','Olla','Airfryer','Horno','Tostadora'];
export const DIFFICULTIES = ['Muy fácil','Fácil','Media','Difícil'];

// =====================================================================
// Arte SVG abstracto — placeholder mientras no hay foto
// =====================================================================

const TONES = {
  ink:    { bg: '#2B0F0A', shape: '#D95A4E', tint: '#D9C8B4' },
  coral:  { bg: '#D95A4E', shape: '#D9C8B4', tint: '#2B0F0A' },
  beige:  { bg: '#D9C8B4', shape: '#2B0F0A', tint: '#D95A4E' },
  peach:  { bg: '#F2B680', shape: '#D95A4E', tint: '#2B0F0A' },
  orange: { bg: '#F2884B', shape: '#2B0F0A', tint: '#D9C8B4' },
  red:    { bg: '#F20505', shape: '#D9C8B4', tint: '#2B0F0A' },
};

function artBody(shape, shapeColor, tint) {
  switch (shape) {
    case 'circle':
      return `<circle cx="100" cy="105" r="68" fill="${shapeColor}"/>
              <circle cx="80" cy="95" r="9" fill="${tint}"/>
              <circle cx="115" cy="85" r="6" fill="${tint}"/>
              <circle cx="120" cy="120" r="11" fill="${tint}"/>
              <circle cx="85" cy="125" r="7" fill="${tint}"/>`;
    case 'ovals':
      return `<ellipse cx="60" cy="70" rx="22" ry="14" fill="${shapeColor}" transform="rotate(-12 60 70)"/>
              <ellipse cx="120" cy="60" rx="22" ry="14" fill="${shapeColor}" transform="rotate(8 120 60)"/>
              <ellipse cx="155" cy="105" rx="22" ry="14" fill="${shapeColor}" transform="rotate(-22 155 105)"/>
              <ellipse cx="80" cy="130" rx="22" ry="14" fill="${shapeColor}" transform="rotate(14 80 130)"/>
              <ellipse cx="135" cy="150" rx="22" ry="14" fill="${shapeColor}" transform="rotate(-6 135 150)"/>`;
    case 'slices':
      return `<circle cx="55" cy="100" r="22" fill="${shapeColor}"/>
              <circle cx="55" cy="100" r="10" fill="${tint}"/>
              <circle cx="100" cy="100" r="22" fill="${shapeColor}"/>
              <circle cx="100" cy="100" r="10" fill="${tint}"/>
              <circle cx="145" cy="100" r="22" fill="${shapeColor}"/>
              <circle cx="145" cy="100" r="10" fill="${tint}"/>`;
    case 'swirl':
      return `<path d="M40 60 C 60 40, 140 40, 160 60 S 160 140, 140 160 S 60 160, 40 140" fill="none" stroke="${shapeColor}" stroke-width="9" stroke-linecap="round"/>
              <path d="M70 90 C 85 80, 115 80, 130 90 S 130 130, 115 140 S 85 140, 70 130" fill="none" stroke="${shapeColor}" stroke-width="9" stroke-linecap="round"/>`;
    case 'stacked':
      return `<rect x="30" y="80" width="140" height="40" fill="${shapeColor}"/>
              <rect x="35" y="58" width="130" height="22" fill="${tint}"/>
              <rect x="50" y="46" width="100" height="14" fill="${shapeColor}" opacity="0.6"/>`;
    case 'dots':
      return [[55,55],[90,50],[130,60],[160,75],[60,90],[100,85],[140,95],[170,110],[50,120],[85,115],[120,125],[155,140],[75,150],[110,155],[145,170]]
        .map(([cx,cy]) => `<circle cx="${cx}" cy="${cy}" r="8" fill="${shapeColor}"/>`)
        .join('');
    case 'curry':
      return `<circle cx="95" cy="110" r="68" fill="${shapeColor}"/>
              <circle cx="95" cy="110" r="50" fill="${tint}" opacity="0.45"/>
              <path d="M150 50 L175 65 L162 90 Z" fill="${shapeColor}"/>`;
    case 'fish':
      return `<ellipse cx="100" cy="100" rx="75" ry="35" fill="${shapeColor}"/>
              <line x1="40" y1="100" x2="160" y2="100" stroke="${tint}" stroke-width="3" opacity="0.6"/>
              <line x1="50" y1="85" x2="155" y2="85" stroke="${tint}" stroke-width="3" opacity="0.6"/>
              <line x1="50" y1="115" x2="155" y2="115" stroke="${tint}" stroke-width="3" opacity="0.6"/>`;
    default:
      return `<circle cx="100" cy="100" r="60" fill="${shapeColor}"/>`;
  }
}

// Devuelve un string de SVG inline para usar como fondo de foto
export function artSvg(recipe) {
  const tone = TONES[recipe.photoTone] || TONES.coral;
  const grain = `<pattern id="g${recipe.id}" patternUnits="userSpaceOnUse" width="3" height="3">
    <rect width="3" height="3" fill="transparent"/>
    <circle cx="1" cy="1" r="0.4" fill="rgba(0,0,0,0.07)"/>
  </pattern>`;
  const body  = artBody(recipe.photoShape, tone.shape, tone.tint);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice" width="100%" height="100%" style="display:block;position:absolute;inset:0">
    <defs>${grain}</defs>
    <rect width="200" height="200" fill="${tone.bg}"/>
    ${body}
    <rect width="200" height="200" fill="url(#g${recipe.id})"/>
  </svg>`;
}

// Devuelve HTML para el bloque de foto (SVG art + imagen real si existe)
export function recipePhotoHtml(recipe, { className = '', style = '' } = {}) {
  const art = artSvg(recipe);
  const img = recipe.photo
    ? `<img src="${recipe.photo}" alt="${recipe.title}" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:1;">`
    : '';
  return `<div class="${className}" style="position:relative;overflow:hidden;${style}">${art}${img}</div>`;
}
