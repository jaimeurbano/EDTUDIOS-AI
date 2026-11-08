export const JS_CHALLENGES = [
  {
    id: 'js-lab-1',
    title: 'El doble exacto',
    level: 1,
    concept: 'Variables y operadores',
    brief: 'Imprime en consola el doble de `numero`. Debes obtener exactamente `42`.',
    starter: 'const numero = 21\n\n// Escribe tu código aquí\n',
    expected: ['42'],
    hint: 'Usa `console.log(numero * 2)`.',
    solution: 'const numero = 21\nconsole.log(numero * 2)\n',
  },
  {
    id: 'js-lab-2',
    title: 'FizzBuzz mini',
    level: 2,
    concept: 'Bucles y condicionales',
    brief:
      'Recorre del 1 al 15. Imprime `Fizz` si el número es múltiplo de 3, `Buzz` si es múltiplo de 5, `FizzBuzz` si es múltiplo de ambos, y el número en caso contrario. Un valor por línea.',
    starter: 'for (let i = 1; i <= 15; i++) {\n  // Tu lógica aquí\n}\n',
    expected: [
      '1',
      '2',
      'Fizz',
      '4',
      'Buzz',
      'Fizz',
      '7',
      '8',
      'Fizz',
      'Buzz',
      '11',
      'Fizz',
      '13',
      '14',
      'FizzBuzz',
    ],
    hint: 'Comprueba primero el caso de ambos (i % 3 === 0 && i % 5 === 0), luego cada uno por separado.',
    solution:
      "for (let i = 1; i <= 15; i++) {\n  if (i % 3 === 0 && i % 5 === 0) console.log('FizzBuzz')\n  else if (i % 3 === 0) console.log('Fizz')\n  else if (i % 5 === 0) console.log('Buzz')\n  else console.log(i)\n}\n",
  },
  {
    id: 'js-lab-3',
    title: 'Suma de pares',
    level: 2,
    concept: 'Arrays y reduce',
    brief:
      'Dado el array `numeros`, imprime la suma de todos sus elementos pares. Resultado esperado: `12`.',
    starter: 'const numeros = [1, 2, 3, 4, 5, 6]\n\n// Tu código aquí\n',
    expected: ['12'],
    hint: 'Puedes usar `filter(n => n % 2 === 0)` y luego `reduce((a, b) => a + b, 0)`.',
    solution:
      'const numeros = [1, 2, 3, 4, 5, 6]\nconst suma = numeros.filter((n) => n % 2 === 0).reduce((a, b) => a + b, 0)\nconsole.log(suma)\n',
  },
  {
    id: 'js-lab-4',
    title: 'Texto invertido',
    level: 2,
    concept: 'Strings y spread',
    brief: 'Imprime la palabra `codequest` invertida, en minúsculas y sin espacios.',
    starter: "const palabra = 'codequest'\n\n// Tu código aquí\n",
    expected: ['tseuqedoc'],
    hint: 'Convierte el string en array con `[...palabra]`, usa `reverse()` y `join("")`.',
    solution:
      "const palabra = 'codequest'\nconsole.log([...palabra].reverse().join(''))\n",
  },
  {
    id: 'js-lab-5',
    title: 'Nombres en mayúsculas',
    level: 3,
    concept: 'Objetos y map',
    brief:
      'Imprime los nombres de las personas en mayúsculas, separados por coma y sin espacios. Resultado: `ADA,GRACE,LINUS`.',
    starter:
      "const personas = [\n  { nombre: 'Ada' },\n  { nombre: 'Grace' },\n  { nombre: 'Linus' },\n]\n\n// Tu código aquí\n",
    expected: ['ADA,GRACE,LINUS'],
    hint: 'Usa `map` para transformar y `join(",")` para unir.',
    solution:
      "const personas = [\n  { nombre: 'Ada' },\n  { nombre: 'Grace' },\n  { nombre: 'Linus' },\n]\nconsole.log(personas.map((p) => p.nombre.toUpperCase()).join(','))\n",
  },
  {
    id: 'js-lab-6',
    title: 'Espera la promesa',
    level: 4,
    concept: 'Async / await',
    brief:
      'Dentro de `cargar()`, espera el resultado de `obtenerNivel()` e imprime el valor. Debe aparecer `7`.',
    starter:
      'function obtenerNivel() {\n  return Promise.resolve(7)\n}\n\nasync function cargar() {\n  // Tu código aquí\n}\n\ncargar()\n',
    expected: ['7'],
    hint: 'Usa `const nivel = await obtenerNivel()` y luego `console.log(nivel)`.',
    solution:
      'function obtenerNivel() {\n  return Promise.resolve(7)\n}\n\nasync function cargar() {\n  const nivel = await obtenerNivel()\n  console.log(nivel)\n}\n\ncargar()\n',
  },
]

export const CSS_CHALLENGES = [
  {
    id: 'css-lab-1',
    title: 'Centra la tarjeta',
    level: 1,
    concept: 'Flexbox',
    brief:
      'Centra horizontal y verticalmente la tarjeta dentro del escenario. El escenario debe ocupar al menos 320px de alto.',
    starter: '.stage {\n  /* Tu CSS aquí */\n}\n\n.card {\n  padding: 24px 32px;\n}\n',
    html: '<div class="stage"><div class="card">Hola, CSS ✨</div></div>',
    objectives: [
      { label: 'El escenario usa display: flex', test: (css) => /display\s*:\s*flex/.test(css) },
      {
        label: 'Centra en el eje principal (justify-content)',
        test: (css) => /justify-content\s*:\s*center/.test(css),
      },
      {
        label: 'Centra en el eje cruzado (align-items)',
        test: (css) => /align-items\s*:\s*center/.test(css),
      },
      {
        label: 'Define una altura mínima de 320px',
        test: (css) => /min-height\s*:\s*(320px|20rem)/.test(css),
      },
    ],
    hint: 'Activa flex en `.stage`, usa `justify-content: center`, `align-items: center` y `min-height: 320px`.',
    solution:
      '.stage {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  min-height: 320px;\n}\n\n.card {\n  padding: 24px 32px;\n}\n',
  },
  {
    id: 'css-lab-2',
    title: 'Galería con Grid',
    level: 2,
    concept: 'CSS Grid',
    brief:
      'Convierte `.galeria` en una cuadrícula de 3 columnas iguales con 16px de separación.',
    starter: '.galeria {\n  /* Tu CSS aquí */\n}\n',
    html:
      '<div class="galeria">\n  <div class="item">01</div>\n  <div class="item">02</div>\n  <div class="item">03</div>\n  <div class="item">04</div>\n  <div class="item">05</div>\n  <div class="item">06</div>\n</div>',
    objectives: [
      { label: 'Usa display: grid', test: (css) => /display\s*:\s*grid/.test(css) },
      {
        label: 'Crea 3 columnas con repeat(3, 1fr)',
        test: (css) => /grid-template-columns\s*:\s*repeat\(\s*3\s*,\s*1fr\s*\)/.test(css),
      },
      { label: 'Aplica un gap de 16px', test: (css) => /gap\s*:\s*16px/.test(css) },
    ],
    hint: 'Usa `display: grid`, `grid-template-columns: repeat(3, 1fr)` y `gap: 16px`.',
    solution:
      '.galeria {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 16px;\n}\n',
  },
  {
    id: 'css-lab-3',
    title: 'Botón con vida',
    level: 2,
    concept: 'Transiciones',
    brief:
      'Estiliza `.boton` con fondo `#7cf5c4`, texto oscuro, padding, bordes redondeados y una transición. Al pasar el mouse debe elevarse 3px.',
    starter: '.boton {\n  /* Tu CSS aquí */\n}\n\n.boton:hover {\n  /* Tu CSS aquí */\n}\n',
    html: '<button class="boton">Pruébame</button>',
    objectives: [
      {
        label: 'Fondo #7cf5c4 y texto oscuro',
        test: (css) =>
          /background(-color)?\s*:\s*#7cf5c4/.test(css) && /color\s*:\s*#0[0-9a-f]{5}/.test(css),
      },
      { label: 'Padding y border-radius', test: (css) => /padding\s*:/.test(css) && /border-radius\s*:/.test(css) },
      { label: 'Declara una transition', test: (css) => /transition\s*:/.test(css) },
      {
        label: 'En :hover aplica translateY(-3px)',
        test: (css) => /\.boton:hover\s*\{[^}]*translateY\(\s*-3px\s*\)/.test(css),
      },
    ],
    hint: 'En `.boton:hover` usa `transform: translateY(-3px)`. La transición va en el estado base.',
    solution:
      '.boton {\n  background: #7cf5c4;\n  color: #08111f;\n  padding: 14px 24px;\n  border: 0;\n  border-radius: 999px;\n  font-weight: 700;\n  cursor: pointer;\n  transition: transform 180ms ease, box-shadow 180ms ease;\n}\n\n.boton:hover {\n  transform: translateY(-3px);\n  box-shadow: 0 12px 28px rgba(124, 245, 196, 0.35);\n}\n',
  },
  {
    id: 'css-lab-4',
    title: 'Tema con variables',
    level: 3,
    concept: 'Custom properties',
    brief:
      'Define `--brand` en `:root` y úsala como fondo de `.card`. Añade también `--radius` y aplícala al borde.',
    starter: ':root {\n  /* Define tus variables */\n}\n\n.card {\n  /* Usa las variables */\n}\n',
    html: '<div class="card">Diseño con tokens</div>',
    objectives: [
      { label: 'Define --brand en :root', test: (css) => /:root\s*\{[^}]*--brand\s*:/.test(css) },
      { label: 'Define --radius en :root', test: (css) => /:root\s*\{[^}]*--radius\s*:/.test(css) },
      {
        label: 'Usa var(--brand) como background',
        test: (css) => /background(-color)?\s*:\s*var\(\s*--brand\s*\)/.test(css),
      },
      {
        label: 'Usa var(--radius) en border-radius',
        test: (css) => /border-radius\s*:\s*var\(\s*--radius\s*\)/.test(css),
      },
    ],
    hint: 'Declara `--brand: #7cf5c4;` y `--radius: 18px;` en `:root`, y consúmelas con `var(...)`.',
    solution:
      ':root {\n  --brand: #7cf5c4;\n  --radius: 18px;\n}\n\n.card {\n  background: var(--brand);\n  color: #08111f;\n  padding: 28px;\n  border-radius: var(--radius);\n}\n',
  },
]

export const LAB_BASE_CSS = `
  * { box-sizing: border-box; }
  body {
    margin: 0;
    min-height: 100vh;
    display: grid;
    place-items: center;
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    background: #0b1120;
    color: #e8eefc;
    padding: 24px;
  }
  .stage {
    width: 100%;
    max-width: 560px;
    border: 1px dashed rgba(255, 255, 255, 0.15);
    border-radius: 16px;
  }
  .card {
    background: #7cf5c4;
    color: #08111f;
    border-radius: 14px;
    font-weight: 700;
  }
  .galeria { width: 100%; max-width: 560px; }
  .item {
    background: linear-gradient(135deg, #1e293b, #111827);
    border: 1px solid rgba(124, 245, 196, 0.25);
    border-radius: 12px;
    padding: 28px 0;
    text-align: center;
    color: #7cf5c4;
    font-weight: 700;
  }
  .boton { font-family: inherit; }
`
