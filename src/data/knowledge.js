// Base de conocimiento del mentor de CodeQuest.
// Permite respuestas útiles sin conexión ni API key. Si el estudiante configura
// un proveedor compatible con OpenAI, el mentor usará IA generativa.

const f = '```'

export const KNOWLEDGE = [
  {
    id: 'saludo',
    keywords: ['hola', 'buenas', 'hey', 'saludos', 'buenos dias', 'buenas tardes', 'buenas noches'],
    title: '¡Hola, futuro dev!',
    answer:
      'Soy **Mentor**, tu asistente de CodeQuest. Puedo explicarte conceptos, revisar errores, darte pistas sin arruinarte la pregunta y proponerte ejercicios.\n\nPrueba con:\n- *“Explícame las promesas con un ejemplo”*\n- *“¿Por qué mi `map` devuelve undefined?”*\n- *“Diferencia entre `ref` y `reactive` en Vue”*\n- *“¿Cómo centro un div con flexbox?”*\n\n¿Qué quieres dominar hoy?',
    related: ['como-estudiar', 'let-const-var'],
  },
  {
    id: 'como-estudiar',
    keywords: ['estudiar', 'aprender', 'metodo', 'rutina', 'consejos', 'organizar', 'practicar'],
    title: 'Cómo aprender programación de verdad',
    answer:
      'La programación no se aprende leyendo: se aprende **escribiendo y equivocándose**. Te propongo este ciclo de 30 minutos:\n\n1. **10 min de concepto** — lee o mira un ejemplo pequeño.\n2. **15 min de práctica** — resuelve un quiz y escribe el código a mano.\n3. **5 min de explicación** — cuéntale a alguien (o al mentor) lo que aprendiste.\n\nClaves que marcan la diferencia:\n- **Repetición espaciada:** vuelve a un tema a los 2, 7 y 15 días. CodeQuest ya lo hace por ti.\n- **Errores como pistas:** lee el mensaje completo y ubica la línea.\n- **Un proyecto pequeño:** un contador, una lista de tareas, una galería. Aprenderás más que con 10 tutoriales.\n- **No copies sin entender:** después de copiar, borra y reescribe.',
    related: ['depuracion', 'saludo'],
  },
  {
    id: 'let-const-var',
    keywords: ['let', 'const', 'var', 'variable', 'declarar', 'scope', 'alcance', 'reasignar', 'hoisting'],
    title: 'let, const y var',
    answer:
      `En JavaScript moderno usa **const** por defecto y **let** solo cuando necesites reasignar.\n\n${f}js\nconst nombre = 'Ada'      // no se puede reasignar\nlet contador = 0          // sí se puede reasignar\ncontador = contador + 1\n\nconst lista = [1, 2]\nlista.push(3)             // ✅ el contenido sí puede mutar\n// lista = [4]            // ❌ error: reasignación\n${f}\n\n**Diferencias clave**\n- \`const\` y \`let\` tienen **alcance de bloque** (\`{}\`).\n- \`var\` tiene alcance de función y sufre *hoisting* (se eleva como \`undefined\`).\n- \`const\` no hace inmutable un objeto: congela la **referencia**, no el contenido.\n\nRegla práctica: **const → let → nunca var**.`,
    related: ['scope', 'objetos'],
  },
  {
    id: 'scope',
    keywords: ['scope', 'alcance', 'bloque', 'global', 'local', 'hoisting', 'elevacion'],
    title: 'Scope: dónde vive cada variable',
    answer:
      `El **scope** es la zona donde una variable existe y puede usarse.\n\n${f}js\nlet global = 'todos me ven'\n\nfunction ejemplo() {\n  let local = 'solo aquí dentro'\n  if (true) {\n    let bloque = 'solo en este if'\n    console.log(global, local, bloque) // ✅\n  }\n  // console.log(bloque) // ❌ ReferenceError\n}\n${f}\n\n- **Global:** accesible desde cualquier parte (evita abusar).\n- **De función:** vive dentro de la función.\n- **De bloque:** cualquier \`{}\` con \`let\` o \`const\`.\n\nEl *hoisting* eleva las declaraciones al inicio de su scope, pero \`let\` y \`const\` quedan en una “zona muerta temporal” hasta que se ejecuta su línea.`,
    related: ['let-const-var', 'closures'],
  },
  {
    id: 'funciones',
    keywords: ['funcion', 'function', 'parametro', 'argumento', 'return', 'arrow', 'devolver', 'callback'],
    title: 'Funciones y arrow functions',
    answer:
      `Una función agrupa lógica reutilizable y puede **devolver** un valor.\n\n${f}js\n// Declaración\nfunction sumar(a, b) {\n  return a + b\n}\n\n// Arrow function\nconst sumar2 = (a, b) => a + b\n\n// Sin parámetros\nconst saludar = () => 'Hola'\n\n// Callback: función que se pasa a otra\nconst numeros = [1, 2, 3]\nconst dobles = numeros.map((n) => n * 2)\n${f}\n\n**Diferencias importantes de las arrows**\n- No tienen su propio \`this\` (lo heredan del contexto).\n- No se pueden usar como constructor con \`new\`.\n- Si el cuerpo va entre \`{}\`, necesitas \`return\` explícito.\n\nSi una arrow devuelve un objeto literal, envuélvelo: \`() => ({ ok: true })\`.`,
    related: ['this', 'arrays'],
  },
  {
    id: 'arrays',
    keywords: ['array', 'arreglo', 'map', 'filter', 'reduce', 'find', 'foreach', 'some', 'every', 'push', 'pop', 'ordenar', 'sort'],
    title: 'Arrays: map, filter y reduce',
    answer:
      `Los métodos de array evitan los bucles manuales y expresan **qué** quieres, no **cómo**.\n\n${f}js\nconst numeros = [1, 2, 3, 4]\n\n// map: transforma cada elemento → mismo tamaño\nnumeros.map((n) => n * 2)          // [2, 4, 6, 8]\n\n// filter: conserva los que cumplen → puede reducir\nnumeros.filter((n) => n % 2 === 0) // [2, 4]\n\n// reduce: acumula un único valor\nnumeros.reduce((acc, n) => acc + n, 0) // 10\n\n// find: primer elemento que cumple\nnumeros.find((n) => n > 2)         // 3\n\n// some / every: devuelven booleano\nnumeros.some((n) => n > 3)         // true\n${f}\n\n**Errores típicos**\n- Olvidar el \`return\` en un callback con llaves.\n- Usar \`map\` cuando solo quieres filtrar (o \`forEach\` cuando necesitas un array nuevo).\n- Ordenar números sin comparador: \`sort((a, b) => a - b)\`.\n\n\`map\`, \`filter\` y \`reduce\` **no mutan** el array original.`,
    related: ['funciones', 'objetos'],
  },
  {
    id: 'objetos',
    keywords: ['objeto', 'object', 'propiedad', 'clave', 'destructuring', 'spread', 'json', 'optional chaining', 'desestructurar'],
    title: 'Objetos, spread y desestructuración',
    answer:
      `Un objeto agrupa datos con **clave: valor**.\n\n${f}js\nconst usuario = { nombre: 'Ada', rol: 'dev', nivel: 3 }\n\n// Acceso\nusuario.nombre        // 'Ada'\nusuario['rol']        // 'dev'\n\n// Desestructuración\nconst { nombre, nivel = 1 } = usuario\n\n// Spread: copia superficial\nconst actualizado = { ...usuario, nivel: 4 }\n\n// Optional chaining: evita errores si falta algo\nusuario.perfil?.ciudad // undefined, sin romper\n${f}\n\n**Ojo:** el spread copia solo el primer nivel. Los objetos anidados se comparten por referencia:\n\n${f}js\nconst copia = { ...usuario }\ncopia.direccion.calle = 'Otra' // ⚠️ también cambia el original\n${f}\n\nPara copias profundas usa \`structuredClone(usuario)\` (entornos modernos).`,
    related: ['let-const-var', 'arrays'],
  },
  {
    id: 'closures',
    keywords: ['closure', 'clausura', 'cierre', 'contador', 'estado privado', 'lexico'],
    title: 'Closures: funciones que recuerdan',
    answer:
      `Un **closure** ocurre cuando una función interna recuerda variables de su función externa, aunque esta ya haya terminado.\n\n${f}js\nfunction crearContador() {\n  let cuenta = 0\n  return function () {\n    cuenta++\n    return cuenta\n  }\n}\n\nconst contador = crearContador()\ncontador() // 1\ncontador() // 2\n// cuenta no es accesible desde fuera: estado privado\n${f}\n\nSon la base de:\n- **Estado privado** en módulos y fábricas.\n- **Callbacks** que conservan datos.\n- **Hooks** y composables en Vue.\n\nError clásico en bucles con \`var\`:\n\n${f}js\nfor (var i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i)) // 3, 3, 3\n}\n// Con let imprime 0, 1, 2: cada iteración crea su propio scope\n${f}`,
    related: ['scope', 'funciones'],
  },
  {
    id: 'this',
    keywords: ['this', 'contexto', 'bind', 'call', 'apply', 'arrow'],
    title: 'this en JavaScript',
    answer:
      `\`this\` depende de **cómo se invoca** la función, no de dónde está escrita (salvo en arrows).\n\n${f}js\nconst persona = {\n  nombre: 'Ada',\n  saludar() {\n    console.log(this.nombre)\n  },\n}\npersona.saludar() // 'Ada'\n\nconst suelto = persona.saludar\n// suelto() // this ya no es persona\n\n// Arrow: hereda el this del contexto\nconst objeto = {\n  nombre: 'Grace',\n  saludar: () => console.log(this.nombre), // this NO es objeto\n}\n${f}\n\n**Reglas rápidas**\n- Método de objeto → \`this\` es el objeto.\n- Función suelta en modo estricto → \`undefined\`.\n- Arrow function → \`this\` léxico (el del scope donde se creó).\n- \`bind\`, \`call\` y \`apply\` permiten fijarlo manualmente.\n\nEn Vue con Composition API casi no necesitas \`this\`: usas \`ref\` y funciones directamente.`,
    related: ['funciones', 'vue-ref-reactive'],
  },
  {
    id: 'promesas',
    keywords: ['promesa', 'promise', 'async', 'await', 'asincrono', 'then', 'catch', 'fetch', 'api'],
    title: 'Promesas y async/await',
    answer:
      `Una **promesa** representa un valor que estará disponible ahora, después o nunca.\n\n${f}js\n// then/catch\nfetch('/api/datos')\n  .then((res) => res.json())\n  .then((datos) => console.log(datos))\n  .catch((error) => console.error(error))\n\n// async/await: misma idea, más legible\nasync function cargar() {\n  try {\n    const res = await fetch('/api/datos')\n    if (!res.ok) throw new Error('Respuesta no válida')\n    const datos = await res.json()\n    return datos\n  } catch (error) {\n    console.error('Falló:', error)\n  }\n}\n${f}\n\n**Reglas**\n- \`await\` solo dentro de una función \`async\` (o en un módulo moderno).\n- Una función \`async\` **siempre** devuelve una promesa.\n- Usa \`Promise.all\` para tareas independientes en paralelo.\n- No olvides \`try/catch\` para manejar rechazos.`,
    related: ['event-loop', 'errores'],
  },
  {
    id: 'event-loop',
    keywords: ['event loop', 'evento', 'microtarea', 'macrotarea', 'settimeout', 'orden', 'asincronia', 'call stack'],
    title: 'El event loop explicado simple',
    answer:
      `JavaScript tiene **un solo hilo**, pero puede delegar tareas al navegador. El *event loop* decide qué se ejecuta después.\n\nOrden de prioridad:\n1. **Código síncrono** (call stack).\n2. **Microtareas:** promesas (\`.then\`, \`await\`) y \`queueMicrotask\`.\n3. **Macrotareas:** \`setTimeout\`, eventos, \`setInterval\`.\n\n${f}js\nconsole.log('A')\nsetTimeout(() => console.log('B'), 0)\nPromise.resolve().then(() => console.log('C'))\nconsole.log('D')\n// A, D, C, B\n${f}\n\nAunque el timeout sea 0, espera a que se vacíen las microtareas. Por eso una promesa siempre “gana” a un \`setTimeout(0)\`.\n\nEsto explica por qué un bucle infinito congela la interfaz: el call stack nunca se vacía.`,
    related: ['promesas'],
  },
  {
    id: 'errores',
    keywords: ['error', 'undefined', 'null', 'typeerror', 'referenceerror', 'syntaxerror', 'nan', 'rompe', 'falla', 'no funciona', 'depurar'],
    title: 'Leer errores como un profesional',
    answer:
      `Los errores no son fracasos: son **mensajes con coordenadas**. Lee siempre las tres partes: tipo, mensaje y línea.\n\n**Los más comunes**\n\n${f}js\n// TypeError: Cannot read properties of undefined (reading 'name')\n// → algo antes del .name es undefined\nusuario?.perfil?.name\n\n// ReferenceError: x is not defined\n// → no declaraste x o está fuera de scope\n\n// TypeError: x.map is not a function\n// → x no es un array (quizá es un objeto o null)\n\n// NaN\n// → operación numérica inválida, revisa Number(...)\n${f}\n\n**Método de depuración**\n1. Reproduce el error con el caso más pequeño posible.\n2. Imprime los valores justo antes de la línea que falla: \`console.log({ variable })\`.\n3. Comprueba el **tipo**: \`console.log(typeof x, x)\`.\n4. Usa \`debugger\` o un breakpoint en DevTools.\n5. Lee el stack trace de abajo hacia arriba.\n\nSi me pegas el error y el código, te ayudo a interpretarlo.`,
    related: ['depuracion', 'promesas'],
  },
  {
    id: 'depuracion',
    keywords: ['debug', 'devtools', 'consola', 'console.log', 'breakpoint', 'inspeccionar', 'depurar'],
    title: 'Depurar con DevTools',
    answer:
      `Abre DevTools con **F12** (o Ctrl+Shift+I) y usa estas herramientas:\n\n- **Console:** errores, \`console.log\`, \`console.table\` para arrays y \`console.time\` para medir.\n- **Elements:** inspecciona el DOM y los estilos aplicados; prueba cambios en vivo.\n- **Sources:** pon *breakpoints* haciendo clic en el número de línea. Puedes avanzar paso a paso y ver variables.\n- **Network:** revisa peticiones, estados HTTP y respuestas de tu API.\n- **Application:** inspecciona \`localStorage\`, cookies y caché.\n\nTrucos:\n${f}js\nconsole.log({ usuario, nivel }) // muestra nombres de variables\nconsole.table(lista)           // tabla legible\ndebugger                       // pausa si DevTools está abierto\n${f}\n\nPara estilos, usa el selector y revisa qué regla gana (tachada = anulada). El panel **Computed** muestra el valor final.`,
    related: ['errores', 'css-selectores'],
  },
  {
    id: 'dom',
    keywords: ['dom', 'document', 'queryselector', 'addeventlistener', 'elemento', 'html', 'evento', 'click'],
    title: 'DOM: manipular la página',
    answer:
      `El **DOM** es la representación en objetos del HTML. Con JavaScript puedes leerlo y modificarlo.\n\n${f}js\nconst boton = document.querySelector('#mi-boton')\nconst titulo = document.querySelector('h1')\n\nboton.addEventListener('click', () => {\n  titulo.textContent = '¡Cambió!'\n  boton.classList.toggle('activo')\n})\n\n// Crear e insertar\nconst item = document.createElement('li')\nitem.textContent = 'Nuevo'\ndocument.querySelector('ul').append(item)\n${f}\n\n**Buenas prácticas**\n- Selecciona por \`id\` o por atributos estables, no por estilos.\n- Usa \`textContent\` en lugar de \`innerHTML\` si el contenido viene del usuario (evita XSS).\n- En Vue no manipules el DOM a mano: usa reactividad y \`ref\` para casos puntuales.`,
    related: ['errores', 'vue-intro'],
  },
  {
    id: 'vue-intro',
    keywords: ['vue', 'createapp', 'componente', 'template', 'script setup', 'single file component', 'sfc'],
    title: 'Vue 3: primeros pasos',
    answer:
      `Vue es un framework progresivo para construir interfaces reactivas. Un componente \`.vue\` tiene tres bloques:\n\n${f}vue\n<script setup>\nimport { ref } from 'vue'\n\nconst mensaje = ref('Hola Vue')\nconst contar = () => mensaje.value = '¡Hiciste clic!'\n</script>\n\n<template>\n  <h1>{{ mensaje }}</h1>\n  <button @click="contar">Cambiar</button>\n</template>\n\n<style scoped>\nh1 { color: #42d392; }\n</style>\n${f}\n\n- \`<script setup>\` es azúcar sintáctico: todo lo declarado queda disponible en el template.\n- \`{{ }}\` interpola texto; \`:prop\` enlaza atributos; \`@evento\` escucha eventos.\n- \`scoped\` limita los estilos a ese componente.\n\nLa app se crea en \`main.js\`:\n\n${f}js\nimport { createApp } from 'vue'\nimport App from './App.vue'\ncreateApp(App).mount('#app')\n${f}`,
    related: ['vue-ref-reactive', 'vue-props-emits'],
  },
  {
    id: 'vue-ref-reactive',
    keywords: ['ref', 'reactive', 'reactividad', 'value', 'torefs', 'shallowref', 'estado'],
    title: 'ref vs reactive en Vue',
    answer:
      `Ambos crean estado reactivo, pero se comportan distinto.\n\n${f}js\nimport { ref, reactive } from 'vue'\n\nconst contador = ref(0)\ncontador.value++          // en script: .value\n\nconst estado = reactive({ nombre: 'Ada', nivel: 1 })\nestado.nivel++            // sin .value\n${f}\n\n| | \`ref\` | \`reactive\` |\n|---|---|---|\n| Tipos | cualquier valor | solo objetos/arrays |\n| Acceso en script | \`.value\` | directo |\n| Reasignar | ✅ | ❌ (pierdes el proxy) |\n| Desestructurar | ✅ | ⚠️ pierde reactividad |\n\n**Recomendación:** usa \`ref\` por defecto, incluso para objetos. Si necesitas desestructurar un reactive, usa \`toRefs\`.\n\nEn el template Vue desenvuelve los \`ref\` automáticamente, por eso escribes \`{{ contador }}\` y no \`{{ contador.value }}\`.`,
    related: ['vue-computed-watch', 'this'],
  },
  {
    id: 'vue-computed-watch',
    keywords: ['computed', 'watch', 'watcheffect', 'derivado', 'cache', 'observar', 'efecto'],
    title: 'computed vs watch',
    answer:
      `**computed** calcula un valor derivado y lo cachea. **watch** ejecuta efectos secundarios cuando algo cambia.\n\n${f}js\nimport { ref, computed, watch } from 'vue'\n\nconst precio = ref(100)\nconst cantidad = ref(2)\n\n// Derivado: se recalcula solo si cambian sus dependencias\nconst total = computed(() => precio.value * cantidad.value)\n\n// Efecto secundario: guardar, llamar API, etc.\nwatch(total, (nuevo, anterior) => {\n  console.log(\`Total: \${anterior} → \${nuevo}\`)\n})\n${f}\n\nUsa **computed** para:\n- Mostrar datos calculados en el template.\n- Filtros y ordenaciones.\n- Validaciones derivadas.\n\nUsa **watch** para:\n- Reaccionar a cambios con una acción (fetch, localStorage).\n- Necesitas el valor anterior.\n- Quieres controlar \`immediate\` o \`deep\`.\n\n\`watchEffect\` rastrea automáticamente las dependencias que lee y se ejecuta de inmediato.`,
    related: ['vue-ref-reactive', 'vue-lifecycle'],
  },
  {
    id: 'vue-props-emits',
    keywords: ['props', 'emit', 'evento', 'hijo', 'padre', 'defineprops', 'defineemits', 'comunicacion'],
    title: 'Props y emits: comunicación entre componentes',
    answer:
      `El flujo es **unidireccional**: las props bajan y los eventos suben.\n\n${f}vue\n<!-- Hijo: BotonFavorito.vue -->\n<script setup>\nconst props = defineProps({\n  activo: { type: Boolean, default: false },\n})\nconst emit = defineEmits(['toggle'])\n</script>\n\n<template>\n  <button @click="emit('toggle')">\n    {{ activo ? '★ Guardado' : '☆ Guardar' }}\n  </button>\n</template>\n${f}\n\n${f}vue\n<!-- Padre -->\n<script setup>\nimport { ref } from 'vue'\nimport BotonFavorito from './BotonFavorito.vue'\nconst favorito = ref(false)\n</script>\n\n<template>\n  <BotonFavorito\n    :activo="favorito"\n    @toggle="favorito = !favorito"\n  />\n</template>\n${f}\n\n**Reglas**\n- El hijo **no** debe mutar la prop; emite y deja decidir al padre.\n- Para \`v-model\` personalizado usa \`modelValue\` + \`update:modelValue\`.\n- Si necesitas compartir estado profundo, usa un composable o Pinia.`,
    related: ['vue-vmodel', 'vue-composables'],
  },
  {
    id: 'vue-vmodel',
    keywords: ['v-model', 'formulario', 'input', 'checkbox', 'select', 'binding', 'bidireccional'],
    title: 'v-model y formularios',
    answer:
      `\`v-model\` crea un enlace **bidireccional** entre un control y el estado.\n\n${f}vue\n<script setup>\nimport { ref } from 'vue'\nconst nombre = ref('')\nconst acepta = ref(false)\nconst lenguaje = ref('js')\n</script>\n\n<template>\n  <input v-model="nombre" placeholder="Tu nombre" />\n  <input type="checkbox" v-model="acepta" />\n  <select v-model="lenguaje">\n    <option value="js">JavaScript</option>\n    <option value="vue">Vue</option>\n  </select>\n  <p>{{ nombre }} · {{ lenguaje }} · {{ acepta }}</p>\n</template>\n${f}\n\n**Modificadores útiles**\n- \`v-model.trim\` elimina espacios al inicio/final.\n- \`v-model.number\` convierte a número.\n- \`v-model.lazy\` sincroniza al perder el foco en vez de en cada tecla.\n\nEn un componente personalizado, \`v-model\` equivale a \`:modelValue\` + \`@update:modelValue\`.`,
    related: ['vue-props-emits', 'vue-ref-reactive'],
  },
  {
    id: 'vue-vfor-key',
    keywords: ['v-for', 'key', 'lista', 'renderizar', 'bucle', 'index'],
    title: 'v-for y la importancia de :key',
    answer:
      `\`v-for\` recorre arrays, objetos o rangos. **Siempre** añade una \`:key\` estable.\n\n${f}vue\n<script setup>\nimport { ref } from 'vue'\nconst tareas = ref([\n  { id: 1, texto: 'Estudiar JS' },\n  { id: 2, texto: 'Practicar CSS' },\n])\n</script>\n\n<template>\n  <ul>\n    <li v-for="tarea in tareas" :key="tarea.id">\n      {{ tarea.texto }}\n    </li>\n  </ul>\n</template>\n${f}\n\n**¿Por qué la key?** Vue reutiliza nodos para ser rápido. Sin una identidad estable, al insertar o eliminar puede mezclar estados (inputs, animaciones, componentes).\n\n- ✅ \`tarea.id\` (único y estable)\n- ⚠️ \`index\` (cambia al reordenar)\n- ❌ \`Math.random()\` (se regenera en cada render)\n\nTambién puedes recorrer objetos: \`v-for="(valor, clave) in objeto"\`.`,
    related: ['vue-intro', 'vue-ref-reactive'],
  },
  {
    id: 'vue-lifecycle',
    keywords: ['onmounted', 'onunmounted', 'ciclo de vida', 'lifecycle', 'mounted', 'hook', 'nexttick'],
    title: 'Ciclo de vida en Vue 3',
    answer:
      `Los hooks te permiten ejecutar código en momentos concretos del componente.\n\n${f}js\nimport { onMounted, onUnmounted, nextTick } from 'vue'\n\nonMounted(() => {\n  console.log('El DOM ya existe')\n  // iniciar peticiones, listeners, librerías\n})\n\nonUnmounted(() => {\n  // limpiar intervalos, listeners, suscripciones\n})\n\nawait nextTick()\n// el DOM ya refleja los últimos cambios\n${f}\n\n**Los más usados**\n- \`onMounted\`: tras montar el DOM.\n- \`onUnmounted\`: al destruirse; ideal para limpiar.\n- \`onUpdated\`: tras una actualización del DOM.\n- \`onBeforeMount\` / \`onBeforeUnmount\`: antes de los anteriores.\n\nEn Vue 3 los hooks se importan y se llaman dentro de \`setup\`. No existe \`beforeCreate\` como tal: el cuerpo de \`setup\` ya cumple ese rol.`,
    related: ['vue-computed-watch', 'vue-composables'],
  },
  {
    id: 'vue-composables',
    keywords: ['composable', 'composables', 'provide', 'inject', 'reutilizar', 'logica', 'pinia'],
    title: 'Composables: lógica reutilizable',
    answer:
      `Un **composable** es una función que encapsula estado y lógica reactiva. Por convención empieza con \`use\`.\n\n${f}js\n// composables/useContador.js\nimport { ref, computed } from 'vue'\n\nexport function useContador(inicial = 0) {\n  const valor = ref(inicial)\n  const doble = computed(() => valor.value * 2)\n\n  const incrementar = () => valor.value++\n  const reiniciar = () => (valor.value = inicial)\n\n  return { valor, doble, incrementar, reiniciar }\n}\n${f}\n\n${f}vue\n<script setup>\nimport { useContador } from '@/composables/useContador'\nconst { valor, doble, incrementar } = useContador(5)\n</script>\n${f}\n\n**Ventajas**\n- Reutilizas lógica sin mixins ni herencia.\n- Cada llamada crea estado independiente.\n- Es fácil de testear.\n\nPara estado global usa **Pinia**; para pasar dependencias profundas sin props, \`provide\` / \`inject\`.`,
    related: ['vue-props-emits', 'vue-lifecycle'],
  },
  {
    id: 'css-box-model',
    keywords: ['box model', 'modelo de caja', 'margin', 'padding', 'border', 'box-sizing', 'ancho', 'alto'],
    title: 'El modelo de caja',
    answer:
      `Todo elemento es una caja con cuatro capas: **contenido → padding → border → margin**.\n\n${f}css\n.caja {\n  width: 300px;\n  padding: 20px;\n  border: 2px solid #7cf5c4;\n  margin: 16px;\n  box-sizing: border-box;\n}\n${f}\n\n- \`content-box\` (por defecto): el width **no** incluye padding ni borde → la caja crece.\n- \`border-box\`: el width **sí** los incluye → layout predecible.\n\nCasi todos los proyectos empiezan con:\n\n${f}css\n*, *::before, *::after {\n  box-sizing: border-box;\n}\n${f}\n\n**Colapso de márgenes:** los márgenes verticales de bloques adyacentes se fusionan (el mayor gana). El padding y los bordes lo evitan.`,
    related: ['css-flexbox', 'css-grid'],
  },
  {
    id: 'css-flexbox',
    keywords: ['flex', 'flexbox', 'justify-content', 'align-items', 'centrar', 'gap', 'eje', 'responsive'],
    title: 'Flexbox: la guía rápida',
    answer:
      `Flexbox distribuye elementos en **un eje**. Actívalo con \`display: flex\`.\n\n${f}css\n.contenedor {\n  display: flex;\n  justify-content: center; /* eje principal */\n  align-items: center;     /* eje cruzado */\n  gap: 16px;\n  flex-wrap: wrap;\n}\n\n.hijo {\n  flex: 1 1 200px; /* grow shrink basis */\n}\n${f}\n\n**Para centrar perfecto:**\n${f}css\n.centro {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  min-height: 100vh;\n}\n${f}\n\n**Conceptos clave**\n- \`flex-direction: row | column\` cambia el eje principal.\n- \`justify-content\` actúa sobre el eje principal; \`align-items\` sobre el cruzado.\n- \`gap\` separa sin márgenes.\n- \`flex-wrap: wrap\` permite varias líneas.\n\nUsa Flexbox para filas/columnas de componentes; Grid para layouts bidimensionales.`,
    related: ['css-grid', 'css-box-model'],
  },
  {
    id: 'css-grid',
    keywords: ['grid', 'css grid', 'columnas', 'filas', 'template', 'fr', 'layout', 'areas'],
    title: 'CSS Grid: layouts en dos dimensiones',
    answer:
      `Grid controla **filas y columnas** a la vez. Es ideal para layouts completos.\n\n${f}css\n.galeria {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 20px;\n}\n\n.layout {\n  display: grid;\n  grid-template-columns: 240px 1fr;\n  grid-template-areas:\n    "sidebar main"\n    "sidebar footer";\n}\n.sidebar { grid-area: sidebar; }\n.main    { grid-area: main; }\n.footer  { grid-area: footer; }\n${f}\n\n**Atajos útiles**\n- \`repeat(auto-fit, minmax(220px, 1fr))\` crea una galería responsive sin media queries.\n- \`grid-column: span 2\` hace que un hijo ocupe dos columnas.\n- \`place-items: center\` centra contenido.\n\n\`fr\` reparte el espacio **libre**, no el total. Con \`minmax()\` evitas que las columnas se aplasten.`,
    related: ['css-flexbox', 'css-responsive'],
  },
  {
    id: 'css-selectores',
    keywords: ['selector', 'especificidad', 'clase', 'id', 'pseudo', 'hover', 'important', 'cascada'],
    title: 'Selectores y especificidad',
    answer:
      `Cuando dos reglas compiten, gana la de **mayor especificidad** (y, si empatan, la última declarada).\n\nOrden de peso:\n1. \`!important\` (evítalo).\n2. Estilos en línea.\n3. \`#id\` → (1, 0, 0).\n4. \`.clase\`, \`[atributo]\`, \`:hover\` → (0, 1, 0).\n5. \`etiqueta\`, \`::before\` → (0, 0, 1).\n6. \`*\` → (0, 0, 0).\n\n${f}css\n/* gana sobre .boton porque tiene dos clases */\n.boton.primario { background: #7cf5c4; }\n\n/* pseudo-clases y pseudo-elementos */\n.boton:hover { transform: translateY(-2px); }\n.boton::before { content: '→ '; }\n${f}\n\n**Buenas prácticas**\n- Estiliza con clases, no con ids.\n- Mantén la especificidad baja y plana.\n- Evita \`!important\`: suele ocultar un problema de arquitectura.\n- Usa \`:where()\` para reducir especificidad cuando lo necesites.`,
    related: ['css-cascada', 'depuracion'],
  },
  {
    id: 'css-cascada',
    keywords: ['cascada', 'herencia', 'inherit', 'initial', 'unset', 'orden', 'conflicto'],
    title: 'Cascada y herencia',
    answer:
      `CSS significa *Cascading Style Sheets*. La cascada resuelve conflictos en este orden:\n\n1. **Origen e importancia** (navegador, autor, usuario, \`!important\`).\n2. **Especificidad** del selector.\n3. **Orden de aparición** (la última regla gana).\n\n**Herencia:** algunas propiedades se heredan de padres a hijos (\`color\`, \`font-family\`, \`line-height\`); otras no (\`margin\`, \`border\`, \`display\`).\n\n${f}css\n.padre { color: teal; }\n.hijo  { color: inherit; } /* explícito */\n\n.reset {\n  all: unset; /* quita estilos heredados y aplicados */\n}\n${f}\n\nSi un estilo “no se aplica”, revisa en DevTools: la regla tachada indica que otra ganó. Ahí ves la especificidad y el origen.`,
    related: ['css-selectores'],
  },
  {
    id: 'css-posicionamiento',
    keywords: [
      'position', 'absolute', 'relative', 'fixed', 'sticky', 'z-index',
      'apilar', 'capas', 'stacking', 'stacking context', 'contexto de apilamiento',
    ],
    title: 'Posicionamiento y z-index',
    answer:
      `\`position\` saca o mantiene un elemento en el flujo:\n\n- \`static\` (por defecto): flujo normal.\n- \`relative\`: se desplaza respecto a su posición original; sigue ocupando espacio.\n- \`absolute\`: sale del flujo y se posiciona respecto al **ancestro posicionado** más cercano.\n- \`fixed\`: respecto al viewport; no se mueve al hacer scroll.\n- \`sticky\`: híbrido; se pega al hacer scroll dentro de su contenedor.\n\n${f}css\n.padre { position: relative; }\n.etiqueta {\n  position: absolute;\n  top: 8px;\n  right: 8px;\n  z-index: 2;\n}\n${f}\n\n**z-index** solo funciona en elementos posicionados o ítems flex/grid. Además, cada contexto de apilamiento (transform, opacity < 1, filter, etc.) aísla a sus hijos: un z-index alto dentro de un contexto no supera a otro contexto externo.`,
    related: ['css-selectores', 'css-animaciones'],
  },
  {
    id: 'css-responsive',
    keywords: ['responsive', 'media query', 'movil', 'breakpoint', 'adaptable', 'viewport', 'container query', 'clamp'],
    title: 'Diseño responsive moderno',
    answer:
      `Diseña **mobile-first**: parte del layout pequeño y amplía con \`min-width\`.\n\n${f}css\n/* base: móvil */\n.grid { display: grid; gap: 16px; }\n\n/* tablet */\n@media (min-width: 640px) {\n  .grid { grid-template-columns: repeat(2, 1fr); }\n}\n\n/* escritorio */\n@media (min-width: 1024px) {\n  .grid { grid-template-columns: repeat(3, 1fr); }\n}\n${f}\n\n**Herramientas clave**\n- \`clamp(min, ideal, max)\` para tipografía fluida.\n- \`minmax()\` + \`auto-fit\` para galerías sin media queries.\n- \`aspect-ratio\` para medios.\n- \`@container\` para que un componente responda a **su** contenedor, no al viewport.\n\nNo olvides el viewport en el HTML:\n${f}html\n<meta name="viewport" content="width=device-width, initial-scale=1.0" />\n${f}\n\nPrueba siempre con el dedo, no solo redimensionando la ventana.`,
    related: ['css-grid', 'css-flexbox'],
  },
  {
    id: 'css-variables',
    keywords: ['variable', 'custom property', 'var', 'root', 'tema', 'tokens', 'dark mode'],
    title: 'Variables CSS y temas',
    answer:
      `Las *custom properties* guardan valores reutilizables y se actualizan en vivo.\n\n${f}css\n:root {\n  --brand: #7cf5c4;\n  --bg: #080b14;\n  --text: #e8eefc;\n  --radius: 16px;\n}\n\n[data-theme='light'] {\n  --bg: #f7f9fc;\n  --text: #0f172a;\n}\n\n.card {\n  background: var(--bg);\n  color: var(--text);\n  border-radius: var(--radius);\n}\n${f}\n\n**Ventajas**\n- Cambias un token y se actualiza todo.\n- Funcionan con \`calc()\`, \`clamp()\` y transiciones.\n- Puedes sobrescribirlas por componente o por tema.\n\nIncluye un fallback por si falta la variable: \`var(--brand, #7cf5c4)\`.`,
    related: ['css-selectores', 'css-animaciones'],
  },
  {
    id: 'css-animaciones',
    keywords: ['animacion', 'transition', 'keyframes', 'transform', 'animar', 'hover', 'prefers-reduced-motion'],
    title: 'Transiciones y animaciones',
    answer:
      `Para microinteracciones usa **transition**; para secuencias, **@keyframes**.\n\n${f}css\n.boton {\n  transition: transform 180ms ease, box-shadow 180ms ease;\n}\n.boton:hover {\n  transform: translateY(-2px);\n  box-shadow: 0 8px 24px rgb(124 245 196 / 0.3);\n}\n\n@keyframes aparecer {\n  from { opacity: 0; transform: translateY(12px); }\n  to   { opacity: 1; transform: translateY(0); }\n}\n.card {\n  animation: aparecer 400ms ease both;\n}\n${f}\n\n**Rendimiento:** anima \`transform\` y \`opacity\` (se componen en GPU). Evita animar \`width\`, \`height\`, \`top\` o \`left\`.\n\n**Accesibilidad:** respeta la preferencia del usuario:\n\n${f}css\n@media (prefers-reduced-motion: reduce) {\n  *, *::before, *::after {\n    animation-duration: 0.01ms !important;\n    transition-duration: 0.01ms !important;\n  }\n}\n${f}`,
    related: ['css-posicionamiento', 'css-variables'],
  },
]

const STOPWORDS = new Set([
  'que', 'como', 'para', 'por', 'con', 'los', 'las', 'del', 'una', 'uno', 'unos', 'unas',
  'este', 'esta', 'esto', 'estos', 'estas', 'hay', 'pero', 'mas', 'muy', 'sin', 'sobre',
  'cuando', 'donde', 'porque', 'cual', 'cuales', 'son', 'ser', 'hacer', 'hace', 'puedo',
  'puede', 'tengo', 'tiene', 'quiero', 'saber', 'explicame', 'explica', 'dime', 'ayuda',
  'ayudame', 'duda', 'pregunta', 'algo', 'tema', 'funciona', 'sirve', 'uso', 'usar',
])

function normalize(text) {
  return String(text)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

function tokenize(text) {
  return normalize(text)
    .split(/[^a-z0-9#+]+/)
    .filter((t) => t.length > 2 && !STOPWORDS.has(t))
}

export function searchKnowledge(rawQuery) {
  const query = normalize(rawQuery)
  if (!query) return null
  const queryTokens = new Set(tokenize(query))

  let best = null
  let bestScore = 0

  for (const entry of KNOWLEDGE) {
    let score = 0
    for (const keyword of entry.keywords) {
      const k = normalize(keyword)
      if (!k) continue
      if (query.includes(k)) {
        score += Math.min(7, k.split(' ').length * 2 + 1)
      } else if (k.includes(' ')) {
        const parts = k.split(' ')
        if (parts.every((p) => queryTokens.has(p))) score += 2
      }
    }
    for (const token of tokenize(entry.title)) {
      if (queryTokens.has(token)) score += 0.75
    }
    for (const token of queryTokens) {
      if (entry.keywords.some((k) => normalize(k) === token)) score += 1
    }
    if (score > bestScore) {
      bestScore = score
      best = entry
    }
  }

  return bestScore >= 2 ? { entry: best, score: bestScore } : null
}

export function getRelated(entry, limit = 3) {
  if (!entry) return []
  return (entry.related || [])
    .map((id) => KNOWLEDGE.find((k) => k.id === id))
    .filter(Boolean)
    .slice(0, limit)
}

export function getKnowledgeById(id) {
  return KNOWLEDGE.find((k) => k.id === id)
}

export const SUGGESTED_PROMPTS = [
  { label: 'Diferencia entre let, const y var', text: '¿Cuál es la diferencia entre let, const y var?' },
  { label: 'Explícame las promesas', text: 'Explícame las promesas y async/await con un ejemplo' },
  { label: 'ref vs reactive en Vue', text: '¿Cuál es la diferencia entre ref y reactive en Vue?' },
  { label: 'Centrar un div con flexbox', text: '¿Cómo centro un div con flexbox?' },
  { label: 'No entiendo mi error', text: 'Me sale un error y no entiendo el mensaje. ¿Cómo lo depuro?' },
]

export function buildSystemPrompt(context = {}) {
  const { profileName, level, weakConcepts, currentQuestion, topic } = context
  const weak = (weakConcepts || [])
    .map((c) => `${c.label} (${Math.round(c.mastery * 100)}%)`)
    .join(', ')

  return [
    'Eres Mentor, el asistente pedagógico de CodeQuest, una plataforma para aprender JavaScript, Vue.js y CSS.',
    'Respondes en español claro, con ejemplos cortos y código bien formateado en bloques markdown.',
    'Tu objetivo es que el estudiante comprenda, no solo que copie la solución.',
    'Usa un tono cercano, motivador y directo. Máximo 220 palabras salvo que pidan profundidad.',
    'Si comparte código para explicarlo, recórrelo en orden y describe qué hace cada parte; si falta el código, pídeselo.',
    'Al depurar, relaciona el mensaje de error con el código compartido, separa hechos de hipótesis y propone pasos concretos para verificar la causa. No afirmes que ejecutaste el código.',
    'Si el estudiante pregunta por la respuesta de un quiz, da pistas y preguntas guía antes de revelar la solución.',
    'Nunca inventes APIs. Si no estás seguro, dilo y propone cómo comprobarlo.',
    profileName ? `El estudiante se llama ${profileName} y está en el nivel ${level || 1}.` : '',
    weak ? `Conceptos con menor dominio: ${weak}. Refuérzalos cuando sea natural.` : '',
    topic ? `Tema de práctica actual: ${topic}.` : '',
    currentQuestion
      ? `Pregunta actual del quiz: "${currentQuestion.prompt}". Concepto: ${currentQuestion.concept}. Dificultad ${currentQuestion.difficulty}/5. No des la opción correcta directamente.`
      : '',
  ]
    .filter(Boolean)
    .join('\n')
}
