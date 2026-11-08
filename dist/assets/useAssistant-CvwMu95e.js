import{a7 as P,d as y,k as m,N as T,a8 as q,O as L,a9 as I,aa as V,T as h,ab as B,ac as H,B as F,l as Q,H as G}from"./index-p-HKTFeT.js";import{p as J}from"./sound-DBAzlJqC.js";const a="```",D=[{id:"saludo",keywords:["hola","buenas","hey","saludos","buenos dias","buenas tardes","buenas noches"],title:"¡Hola, futuro dev!",answer:`Soy **Mentor**, tu asistente de CodeQuest. Puedo explicarte conceptos, revisar errores, darte pistas sin arruinarte la pregunta y proponerte ejercicios.

Prueba con:
- *“Explícame las promesas con un ejemplo”*
- *“¿Por qué mi \`map\` devuelve undefined?”*
- *“Diferencia entre \`ref\` y \`reactive\` en Vue”*
- *“¿Cómo centro un div con flexbox?”*

¿Qué quieres dominar hoy?`,related:["como-estudiar","let-const-var"]},{id:"como-estudiar",keywords:["estudiar","aprender","metodo","rutina","consejos","organizar","practicar"],title:"Cómo aprender programación de verdad",answer:`La programación no se aprende leyendo: se aprende **escribiendo y equivocándose**. Te propongo este ciclo de 30 minutos:

1. **10 min de concepto** — lee o mira un ejemplo pequeño.
2. **15 min de práctica** — resuelve un quiz y escribe el código a mano.
3. **5 min de explicación** — cuéntale a alguien (o al mentor) lo que aprendiste.

Claves que marcan la diferencia:
- **Repetición espaciada:** vuelve a un tema a los 2, 7 y 15 días. CodeQuest ya lo hace por ti.
- **Errores como pistas:** lee el mensaje completo y ubica la línea.
- **Un proyecto pequeño:** un contador, una lista de tareas, una galería. Aprenderás más que con 10 tutoriales.
- **No copies sin entender:** después de copiar, borra y reescribe.`,related:["depuracion","saludo"]},{id:"let-const-var",keywords:["let","const","var","variable","declarar","scope","alcance","reasignar","hoisting"],title:"let, const y var",answer:`En JavaScript moderno usa **const** por defecto y **let** solo cuando necesites reasignar.

${a}js
const nombre = 'Ada'      // no se puede reasignar
let contador = 0          // sí se puede reasignar
contador = contador + 1

const lista = [1, 2]
lista.push(3)             // ✅ el contenido sí puede mutar
// lista = [4]            // ❌ error: reasignación
${a}

**Diferencias clave**
- \`const\` y \`let\` tienen **alcance de bloque** (\`{}\`).
- \`var\` tiene alcance de función y sufre *hoisting* (se eleva como \`undefined\`).
- \`const\` no hace inmutable un objeto: congela la **referencia**, no el contenido.

Regla práctica: **const → let → nunca var**.`,related:["scope","objetos"]},{id:"scope",keywords:["scope","alcance","bloque","global","local","hoisting","elevacion"],title:"Scope: dónde vive cada variable",answer:`El **scope** es la zona donde una variable existe y puede usarse.

${a}js
let global = 'todos me ven'

function ejemplo() {
  let local = 'solo aquí dentro'
  if (true) {
    let bloque = 'solo en este if'
    console.log(global, local, bloque) // ✅
  }
  // console.log(bloque) // ❌ ReferenceError
}
${a}

- **Global:** accesible desde cualquier parte (evita abusar).
- **De función:** vive dentro de la función.
- **De bloque:** cualquier \`{}\` con \`let\` o \`const\`.

El *hoisting* eleva las declaraciones al inicio de su scope, pero \`let\` y \`const\` quedan en una “zona muerta temporal” hasta que se ejecuta su línea.`,related:["let-const-var","closures"]},{id:"funciones",keywords:["funcion","function","parametro","argumento","return","arrow","devolver","callback"],title:"Funciones y arrow functions",answer:`Una función agrupa lógica reutilizable y puede **devolver** un valor.

${a}js
// Declaración
function sumar(a, b) {
  return a + b
}

// Arrow function
const sumar2 = (a, b) => a + b

// Sin parámetros
const saludar = () => 'Hola'

// Callback: función que se pasa a otra
const numeros = [1, 2, 3]
const dobles = numeros.map((n) => n * 2)
${a}

**Diferencias importantes de las arrows**
- No tienen su propio \`this\` (lo heredan del contexto).
- No se pueden usar como constructor con \`new\`.
- Si el cuerpo va entre \`{}\`, necesitas \`return\` explícito.

Si una arrow devuelve un objeto literal, envuélvelo: \`() => ({ ok: true })\`.`,related:["this","arrays"]},{id:"arrays",keywords:["array","arreglo","map","filter","reduce","find","foreach","some","every","push","pop","ordenar","sort"],title:"Arrays: map, filter y reduce",answer:`Los métodos de array evitan los bucles manuales y expresan **qué** quieres, no **cómo**.

${a}js
const numeros = [1, 2, 3, 4]

// map: transforma cada elemento → mismo tamaño
numeros.map((n) => n * 2)          // [2, 4, 6, 8]

// filter: conserva los que cumplen → puede reducir
numeros.filter((n) => n % 2 === 0) // [2, 4]

// reduce: acumula un único valor
numeros.reduce((acc, n) => acc + n, 0) // 10

// find: primer elemento que cumple
numeros.find((n) => n > 2)         // 3

// some / every: devuelven booleano
numeros.some((n) => n > 3)         // true
${a}

**Errores típicos**
- Olvidar el \`return\` en un callback con llaves.
- Usar \`map\` cuando solo quieres filtrar (o \`forEach\` cuando necesitas un array nuevo).
- Ordenar números sin comparador: \`sort((a, b) => a - b)\`.

\`map\`, \`filter\` y \`reduce\` **no mutan** el array original.`,related:["funciones","objetos"]},{id:"objetos",keywords:["objeto","object","propiedad","clave","destructuring","spread","json","optional chaining","desestructurar"],title:"Objetos, spread y desestructuración",answer:`Un objeto agrupa datos con **clave: valor**.

${a}js
const usuario = { nombre: 'Ada', rol: 'dev', nivel: 3 }

// Acceso
usuario.nombre        // 'Ada'
usuario['rol']        // 'dev'

// Desestructuración
const { nombre, nivel = 1 } = usuario

// Spread: copia superficial
const actualizado = { ...usuario, nivel: 4 }

// Optional chaining: evita errores si falta algo
usuario.perfil?.ciudad // undefined, sin romper
${a}

**Ojo:** el spread copia solo el primer nivel. Los objetos anidados se comparten por referencia:

${a}js
const copia = { ...usuario }
copia.direccion.calle = 'Otra' // ⚠️ también cambia el original
${a}

Para copias profundas usa \`structuredClone(usuario)\` (entornos modernos).`,related:["let-const-var","arrays"]},{id:"closures",keywords:["closure","clausura","cierre","contador","estado privado","lexico"],title:"Closures: funciones que recuerdan",answer:`Un **closure** ocurre cuando una función interna recuerda variables de su función externa, aunque esta ya haya terminado.

${a}js
function crearContador() {
  let cuenta = 0
  return function () {
    cuenta++
    return cuenta
  }
}

const contador = crearContador()
contador() // 1
contador() // 2
// cuenta no es accesible desde fuera: estado privado
${a}

Son la base de:
- **Estado privado** en módulos y fábricas.
- **Callbacks** que conservan datos.
- **Hooks** y composables en Vue.

Error clásico en bucles con \`var\`:

${a}js
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i)) // 3, 3, 3
}
// Con let imprime 0, 1, 2: cada iteración crea su propio scope
${a}`,related:["scope","funciones"]},{id:"this",keywords:["this","contexto","bind","call","apply","arrow"],title:"this en JavaScript",answer:`\`this\` depende de **cómo se invoca** la función, no de dónde está escrita (salvo en arrows).

${a}js
const persona = {
  nombre: 'Ada',
  saludar() {
    console.log(this.nombre)
  },
}
persona.saludar() // 'Ada'

const suelto = persona.saludar
// suelto() // this ya no es persona

// Arrow: hereda el this del contexto
const objeto = {
  nombre: 'Grace',
  saludar: () => console.log(this.nombre), // this NO es objeto
}
${a}

**Reglas rápidas**
- Método de objeto → \`this\` es el objeto.
- Función suelta en modo estricto → \`undefined\`.
- Arrow function → \`this\` léxico (el del scope donde se creó).
- \`bind\`, \`call\` y \`apply\` permiten fijarlo manualmente.

En Vue con Composition API casi no necesitas \`this\`: usas \`ref\` y funciones directamente.`,related:["funciones","vue-ref-reactive"]},{id:"promesas",keywords:["promesa","promise","async","await","asincrono","then","catch","fetch","api"],title:"Promesas y async/await",answer:`Una **promesa** representa un valor que estará disponible ahora, después o nunca.

${a}js
// then/catch
fetch('/api/datos')
  .then((res) => res.json())
  .then((datos) => console.log(datos))
  .catch((error) => console.error(error))

// async/await: misma idea, más legible
async function cargar() {
  try {
    const res = await fetch('/api/datos')
    if (!res.ok) throw new Error('Respuesta no válida')
    const datos = await res.json()
    return datos
  } catch (error) {
    console.error('Falló:', error)
  }
}
${a}

**Reglas**
- \`await\` solo dentro de una función \`async\` (o en un módulo moderno).
- Una función \`async\` **siempre** devuelve una promesa.
- Usa \`Promise.all\` para tareas independientes en paralelo.
- No olvides \`try/catch\` para manejar rechazos.`,related:["event-loop","errores"]},{id:"event-loop",keywords:["event loop","evento","microtarea","macrotarea","settimeout","orden","asincronia","call stack"],title:"El event loop explicado simple",answer:`JavaScript tiene **un solo hilo**, pero puede delegar tareas al navegador. El *event loop* decide qué se ejecuta después.

Orden de prioridad:
1. **Código síncrono** (call stack).
2. **Microtareas:** promesas (\`.then\`, \`await\`) y \`queueMicrotask\`.
3. **Macrotareas:** \`setTimeout\`, eventos, \`setInterval\`.

${a}js
console.log('A')
setTimeout(() => console.log('B'), 0)
Promise.resolve().then(() => console.log('C'))
console.log('D')
// A, D, C, B
${a}

Aunque el timeout sea 0, espera a que se vacíen las microtareas. Por eso una promesa siempre “gana” a un \`setTimeout(0)\`.

Esto explica por qué un bucle infinito congela la interfaz: el call stack nunca se vacía.`,related:["promesas"]},{id:"errores",keywords:["error","undefined","null","typeerror","referenceerror","syntaxerror","nan","rompe","falla","no funciona","depurar"],title:"Leer errores como un profesional",answer:`Los errores no son fracasos: son **mensajes con coordenadas**. Lee siempre las tres partes: tipo, mensaje y línea.

**Los más comunes**

${a}js
// TypeError: Cannot read properties of undefined (reading 'name')
// → algo antes del .name es undefined
usuario?.perfil?.name

// ReferenceError: x is not defined
// → no declaraste x o está fuera de scope

// TypeError: x.map is not a function
// → x no es un array (quizá es un objeto o null)

// NaN
// → operación numérica inválida, revisa Number(...)
${a}

**Método de depuración**
1. Reproduce el error con el caso más pequeño posible.
2. Imprime los valores justo antes de la línea que falla: \`console.log({ variable })\`.
3. Comprueba el **tipo**: \`console.log(typeof x, x)\`.
4. Usa \`debugger\` o un breakpoint en DevTools.
5. Lee el stack trace de abajo hacia arriba.

Si me pegas el error y el código, te ayudo a interpretarlo.`,related:["depuracion","promesas"]},{id:"depuracion",keywords:["debug","devtools","consola","console.log","breakpoint","inspeccionar","depurar"],title:"Depurar con DevTools",answer:`Abre DevTools con **F12** (o Ctrl+Shift+I) y usa estas herramientas:

- **Console:** errores, \`console.log\`, \`console.table\` para arrays y \`console.time\` para medir.
- **Elements:** inspecciona el DOM y los estilos aplicados; prueba cambios en vivo.
- **Sources:** pon *breakpoints* haciendo clic en el número de línea. Puedes avanzar paso a paso y ver variables.
- **Network:** revisa peticiones, estados HTTP y respuestas de tu API.
- **Application:** inspecciona \`localStorage\`, cookies y caché.

Trucos:
${a}js
console.log({ usuario, nivel }) // muestra nombres de variables
console.table(lista)           // tabla legible
debugger                       // pausa si DevTools está abierto
${a}

Para estilos, usa el selector y revisa qué regla gana (tachada = anulada). El panel **Computed** muestra el valor final.`,related:["errores","css-selectores"]},{id:"dom",keywords:["dom","document","queryselector","addeventlistener","elemento","html","evento","click"],title:"DOM: manipular la página",answer:`El **DOM** es la representación en objetos del HTML. Con JavaScript puedes leerlo y modificarlo.

${a}js
const boton = document.querySelector('#mi-boton')
const titulo = document.querySelector('h1')

boton.addEventListener('click', () => {
  titulo.textContent = '¡Cambió!'
  boton.classList.toggle('activo')
})

// Crear e insertar
const item = document.createElement('li')
item.textContent = 'Nuevo'
document.querySelector('ul').append(item)
${a}

**Buenas prácticas**
- Selecciona por \`id\` o por atributos estables, no por estilos.
- Usa \`textContent\` en lugar de \`innerHTML\` si el contenido viene del usuario (evita XSS).
- En Vue no manipules el DOM a mano: usa reactividad y \`ref\` para casos puntuales.`,related:["errores","vue-intro"]},{id:"vue-intro",keywords:["vue","createapp","componente","template","script setup","single file component","sfc"],title:"Vue 3: primeros pasos",answer:`Vue es un framework progresivo para construir interfaces reactivas. Un componente \`.vue\` tiene tres bloques:

${a}vue
<script setup>
import { ref } from 'vue'

const mensaje = ref('Hola Vue')
const contar = () => mensaje.value = '¡Hiciste clic!'
<\/script>

<template>
  <h1>{{ mensaje }}</h1>
  <button @click="contar">Cambiar</button>
</template>

<style scoped>
h1 { color: #42d392; }
</style>
${a}

- \`<script setup>\` es azúcar sintáctico: todo lo declarado queda disponible en el template.
- \`{{ }}\` interpola texto; \`:prop\` enlaza atributos; \`@evento\` escucha eventos.
- \`scoped\` limita los estilos a ese componente.

La app se crea en \`main.js\`:

${a}js
import { createApp } from 'vue'
import App from './App.vue'
createApp(App).mount('#app')
${a}`,related:["vue-ref-reactive","vue-props-emits"]},{id:"vue-ref-reactive",keywords:["ref","reactive","reactividad","value","torefs","shallowref","estado"],title:"ref vs reactive en Vue",answer:`Ambos crean estado reactivo, pero se comportan distinto.

${a}js
import { ref, reactive } from 'vue'

const contador = ref(0)
contador.value++          // en script: .value

const estado = reactive({ nombre: 'Ada', nivel: 1 })
estado.nivel++            // sin .value
${a}

| | \`ref\` | \`reactive\` |
|---|---|---|
| Tipos | cualquier valor | solo objetos/arrays |
| Acceso en script | \`.value\` | directo |
| Reasignar | ✅ | ❌ (pierdes el proxy) |
| Desestructurar | ✅ | ⚠️ pierde reactividad |

**Recomendación:** usa \`ref\` por defecto, incluso para objetos. Si necesitas desestructurar un reactive, usa \`toRefs\`.

En el template Vue desenvuelve los \`ref\` automáticamente, por eso escribes \`{{ contador }}\` y no \`{{ contador.value }}\`.`,related:["vue-computed-watch","this"]},{id:"vue-computed-watch",keywords:["computed","watch","watcheffect","derivado","cache","observar","efecto"],title:"computed vs watch",answer:`**computed** calcula un valor derivado y lo cachea. **watch** ejecuta efectos secundarios cuando algo cambia.

${a}js
import { ref, computed, watch } from 'vue'

const precio = ref(100)
const cantidad = ref(2)

// Derivado: se recalcula solo si cambian sus dependencias
const total = computed(() => precio.value * cantidad.value)

// Efecto secundario: guardar, llamar API, etc.
watch(total, (nuevo, anterior) => {
  console.log(\`Total: \${anterior} → \${nuevo}\`)
})
${a}

Usa **computed** para:
- Mostrar datos calculados en el template.
- Filtros y ordenaciones.
- Validaciones derivadas.

Usa **watch** para:
- Reaccionar a cambios con una acción (fetch, localStorage).
- Necesitas el valor anterior.
- Quieres controlar \`immediate\` o \`deep\`.

\`watchEffect\` rastrea automáticamente las dependencias que lee y se ejecuta de inmediato.`,related:["vue-ref-reactive","vue-lifecycle"]},{id:"vue-props-emits",keywords:["props","emit","evento","hijo","padre","defineprops","defineemits","comunicacion"],title:"Props y emits: comunicación entre componentes",answer:`El flujo es **unidireccional**: las props bajan y los eventos suben.

${a}vue
<!-- Hijo: BotonFavorito.vue -->
<script setup>
const props = defineProps({
  activo: { type: Boolean, default: false },
})
const emit = defineEmits(['toggle'])
<\/script>

<template>
  <button @click="emit('toggle')">
    {{ activo ? '★ Guardado' : '☆ Guardar' }}
  </button>
</template>
${a}

${a}vue
<!-- Padre -->
<script setup>
import { ref } from 'vue'
import BotonFavorito from './BotonFavorito.vue'
const favorito = ref(false)
<\/script>

<template>
  <BotonFavorito
    :activo="favorito"
    @toggle="favorito = !favorito"
  />
</template>
${a}

**Reglas**
- El hijo **no** debe mutar la prop; emite y deja decidir al padre.
- Para \`v-model\` personalizado usa \`modelValue\` + \`update:modelValue\`.
- Si necesitas compartir estado profundo, usa un composable o Pinia.`,related:["vue-vmodel","vue-composables"]},{id:"vue-vmodel",keywords:["v-model","formulario","input","checkbox","select","binding","bidireccional"],title:"v-model y formularios",answer:`\`v-model\` crea un enlace **bidireccional** entre un control y el estado.

${a}vue
<script setup>
import { ref } from 'vue'
const nombre = ref('')
const acepta = ref(false)
const lenguaje = ref('js')
<\/script>

<template>
  <input v-model="nombre" placeholder="Tu nombre" />
  <input type="checkbox" v-model="acepta" />
  <select v-model="lenguaje">
    <option value="js">JavaScript</option>
    <option value="vue">Vue</option>
  </select>
  <p>{{ nombre }} · {{ lenguaje }} · {{ acepta }}</p>
</template>
${a}

**Modificadores útiles**
- \`v-model.trim\` elimina espacios al inicio/final.
- \`v-model.number\` convierte a número.
- \`v-model.lazy\` sincroniza al perder el foco en vez de en cada tecla.

En un componente personalizado, \`v-model\` equivale a \`:modelValue\` + \`@update:modelValue\`.`,related:["vue-props-emits","vue-ref-reactive"]},{id:"vue-vfor-key",keywords:["v-for","key","lista","renderizar","bucle","index"],title:"v-for y la importancia de :key",answer:`\`v-for\` recorre arrays, objetos o rangos. **Siempre** añade una \`:key\` estable.

${a}vue
<script setup>
import { ref } from 'vue'
const tareas = ref([
  { id: 1, texto: 'Estudiar JS' },
  { id: 2, texto: 'Practicar CSS' },
])
<\/script>

<template>
  <ul>
    <li v-for="tarea in tareas" :key="tarea.id">
      {{ tarea.texto }}
    </li>
  </ul>
</template>
${a}

**¿Por qué la key?** Vue reutiliza nodos para ser rápido. Sin una identidad estable, al insertar o eliminar puede mezclar estados (inputs, animaciones, componentes).

- ✅ \`tarea.id\` (único y estable)
- ⚠️ \`index\` (cambia al reordenar)
- ❌ \`Math.random()\` (se regenera en cada render)

También puedes recorrer objetos: \`v-for="(valor, clave) in objeto"\`.`,related:["vue-intro","vue-ref-reactive"]},{id:"vue-lifecycle",keywords:["onmounted","onunmounted","ciclo de vida","lifecycle","mounted","hook","nexttick"],title:"Ciclo de vida en Vue 3",answer:`Los hooks te permiten ejecutar código en momentos concretos del componente.

${a}js
import { onMounted, onUnmounted, nextTick } from 'vue'

onMounted(() => {
  console.log('El DOM ya existe')
  // iniciar peticiones, listeners, librerías
})

onUnmounted(() => {
  // limpiar intervalos, listeners, suscripciones
})

await nextTick()
// el DOM ya refleja los últimos cambios
${a}

**Los más usados**
- \`onMounted\`: tras montar el DOM.
- \`onUnmounted\`: al destruirse; ideal para limpiar.
- \`onUpdated\`: tras una actualización del DOM.
- \`onBeforeMount\` / \`onBeforeUnmount\`: antes de los anteriores.

En Vue 3 los hooks se importan y se llaman dentro de \`setup\`. No existe \`beforeCreate\` como tal: el cuerpo de \`setup\` ya cumple ese rol.`,related:["vue-computed-watch","vue-composables"]},{id:"vue-composables",keywords:["composable","composables","provide","inject","reutilizar","logica","pinia"],title:"Composables: lógica reutilizable",answer:`Un **composable** es una función que encapsula estado y lógica reactiva. Por convención empieza con \`use\`.

${a}js
// composables/useContador.js
import { ref, computed } from 'vue'

export function useContador(inicial = 0) {
  const valor = ref(inicial)
  const doble = computed(() => valor.value * 2)

  const incrementar = () => valor.value++
  const reiniciar = () => (valor.value = inicial)

  return { valor, doble, incrementar, reiniciar }
}
${a}

${a}vue
<script setup>
import { useContador } from '@/composables/useContador'
const { valor, doble, incrementar } = useContador(5)
<\/script>
${a}

**Ventajas**
- Reutilizas lógica sin mixins ni herencia.
- Cada llamada crea estado independiente.
- Es fácil de testear.

Para estado global usa **Pinia**; para pasar dependencias profundas sin props, \`provide\` / \`inject\`.`,related:["vue-props-emits","vue-lifecycle"]},{id:"css-box-model",keywords:["box model","modelo de caja","margin","padding","border","box-sizing","ancho","alto"],title:"El modelo de caja",answer:`Todo elemento es una caja con cuatro capas: **contenido → padding → border → margin**.

${a}css
.caja {
  width: 300px;
  padding: 20px;
  border: 2px solid #7cf5c4;
  margin: 16px;
  box-sizing: border-box;
}
${a}

- \`content-box\` (por defecto): el width **no** incluye padding ni borde → la caja crece.
- \`border-box\`: el width **sí** los incluye → layout predecible.

Casi todos los proyectos empiezan con:

${a}css
*, *::before, *::after {
  box-sizing: border-box;
}
${a}

**Colapso de márgenes:** los márgenes verticales de bloques adyacentes se fusionan (el mayor gana). El padding y los bordes lo evitan.`,related:["css-flexbox","css-grid"]},{id:"css-flexbox",keywords:["flex","flexbox","justify-content","align-items","centrar","gap","eje","responsive"],title:"Flexbox: la guía rápida",answer:`Flexbox distribuye elementos en **un eje**. Actívalo con \`display: flex\`.

${a}css
.contenedor {
  display: flex;
  justify-content: center; /* eje principal */
  align-items: center;     /* eje cruzado */
  gap: 16px;
  flex-wrap: wrap;
}

.hijo {
  flex: 1 1 200px; /* grow shrink basis */
}
${a}

**Para centrar perfecto:**
${a}css
.centro {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}
${a}

**Conceptos clave**
- \`flex-direction: row | column\` cambia el eje principal.
- \`justify-content\` actúa sobre el eje principal; \`align-items\` sobre el cruzado.
- \`gap\` separa sin márgenes.
- \`flex-wrap: wrap\` permite varias líneas.

Usa Flexbox para filas/columnas de componentes; Grid para layouts bidimensionales.`,related:["css-grid","css-box-model"]},{id:"css-grid",keywords:["grid","css grid","columnas","filas","template","fr","layout","areas"],title:"CSS Grid: layouts en dos dimensiones",answer:`Grid controla **filas y columnas** a la vez. Es ideal para layouts completos.

${a}css
.galeria {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.layout {
  display: grid;
  grid-template-columns: 240px 1fr;
  grid-template-areas:
    "sidebar main"
    "sidebar footer";
}
.sidebar { grid-area: sidebar; }
.main    { grid-area: main; }
.footer  { grid-area: footer; }
${a}

**Atajos útiles**
- \`repeat(auto-fit, minmax(220px, 1fr))\` crea una galería responsive sin media queries.
- \`grid-column: span 2\` hace que un hijo ocupe dos columnas.
- \`place-items: center\` centra contenido.

\`fr\` reparte el espacio **libre**, no el total. Con \`minmax()\` evitas que las columnas se aplasten.`,related:["css-flexbox","css-responsive"]},{id:"css-selectores",keywords:["selector","especificidad","clase","id","pseudo","hover","important","cascada"],title:"Selectores y especificidad",answer:`Cuando dos reglas compiten, gana la de **mayor especificidad** (y, si empatan, la última declarada).

Orden de peso:
1. \`!important\` (evítalo).
2. Estilos en línea.
3. \`#id\` → (1, 0, 0).
4. \`.clase\`, \`[atributo]\`, \`:hover\` → (0, 1, 0).
5. \`etiqueta\`, \`::before\` → (0, 0, 1).
6. \`*\` → (0, 0, 0).

${a}css
/* gana sobre .boton porque tiene dos clases */
.boton.primario { background: #7cf5c4; }

/* pseudo-clases y pseudo-elementos */
.boton:hover { transform: translateY(-2px); }
.boton::before { content: '→ '; }
${a}

**Buenas prácticas**
- Estiliza con clases, no con ids.
- Mantén la especificidad baja y plana.
- Evita \`!important\`: suele ocultar un problema de arquitectura.
- Usa \`:where()\` para reducir especificidad cuando lo necesites.`,related:["css-cascada","depuracion"]},{id:"css-cascada",keywords:["cascada","herencia","inherit","initial","unset","orden","conflicto"],title:"Cascada y herencia",answer:`CSS significa *Cascading Style Sheets*. La cascada resuelve conflictos en este orden:

1. **Origen e importancia** (navegador, autor, usuario, \`!important\`).
2. **Especificidad** del selector.
3. **Orden de aparición** (la última regla gana).

**Herencia:** algunas propiedades se heredan de padres a hijos (\`color\`, \`font-family\`, \`line-height\`); otras no (\`margin\`, \`border\`, \`display\`).

${a}css
.padre { color: teal; }
.hijo  { color: inherit; } /* explícito */

.reset {
  all: unset; /* quita estilos heredados y aplicados */
}
${a}

Si un estilo “no se aplica”, revisa en DevTools: la regla tachada indica que otra ganó. Ahí ves la especificidad y el origen.`,related:["css-selectores"]},{id:"css-posicionamiento",keywords:["position","absolute","relative","fixed","sticky","z-index","apilar","capas","stacking","stacking context","contexto de apilamiento"],title:"Posicionamiento y z-index",answer:`\`position\` saca o mantiene un elemento en el flujo:

- \`static\` (por defecto): flujo normal.
- \`relative\`: se desplaza respecto a su posición original; sigue ocupando espacio.
- \`absolute\`: sale del flujo y se posiciona respecto al **ancestro posicionado** más cercano.
- \`fixed\`: respecto al viewport; no se mueve al hacer scroll.
- \`sticky\`: híbrido; se pega al hacer scroll dentro de su contenedor.

${a}css
.padre { position: relative; }
.etiqueta {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 2;
}
${a}

**z-index** solo funciona en elementos posicionados o ítems flex/grid. Además, cada contexto de apilamiento (transform, opacity < 1, filter, etc.) aísla a sus hijos: un z-index alto dentro de un contexto no supera a otro contexto externo.`,related:["css-selectores","css-animaciones"]},{id:"css-responsive",keywords:["responsive","media query","movil","breakpoint","adaptable","viewport","container query","clamp"],title:"Diseño responsive moderno",answer:`Diseña **mobile-first**: parte del layout pequeño y amplía con \`min-width\`.

${a}css
/* base: móvil */
.grid { display: grid; gap: 16px; }

/* tablet */
@media (min-width: 640px) {
  .grid { grid-template-columns: repeat(2, 1fr); }
}

/* escritorio */
@media (min-width: 1024px) {
  .grid { grid-template-columns: repeat(3, 1fr); }
}
${a}

**Herramientas clave**
- \`clamp(min, ideal, max)\` para tipografía fluida.
- \`minmax()\` + \`auto-fit\` para galerías sin media queries.
- \`aspect-ratio\` para medios.
- \`@container\` para que un componente responda a **su** contenedor, no al viewport.

No olvides el viewport en el HTML:
${a}html
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
${a}

Prueba siempre con el dedo, no solo redimensionando la ventana.`,related:["css-grid","css-flexbox"]},{id:"css-variables",keywords:["variable","custom property","var","root","tema","tokens","dark mode"],title:"Variables CSS y temas",answer:`Las *custom properties* guardan valores reutilizables y se actualizan en vivo.

${a}css
:root {
  --brand: #7cf5c4;
  --bg: #080b14;
  --text: #e8eefc;
  --radius: 16px;
}

[data-theme='light'] {
  --bg: #f7f9fc;
  --text: #0f172a;
}

.card {
  background: var(--bg);
  color: var(--text);
  border-radius: var(--radius);
}
${a}

**Ventajas**
- Cambias un token y se actualiza todo.
- Funcionan con \`calc()\`, \`clamp()\` y transiciones.
- Puedes sobrescribirlas por componente o por tema.

Incluye un fallback por si falta la variable: \`var(--brand, #7cf5c4)\`.`,related:["css-selectores","css-animaciones"]},{id:"css-animaciones",keywords:["animacion","transition","keyframes","transform","animar","hover","prefers-reduced-motion"],title:"Transiciones y animaciones",answer:`Para microinteracciones usa **transition**; para secuencias, **@keyframes**.

${a}css
.boton {
  transition: transform 180ms ease, box-shadow 180ms ease;
}
.boton:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgb(124 245 196 / 0.3);
}

@keyframes aparecer {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
.card {
  animation: aparecer 400ms ease both;
}
${a}

**Rendimiento:** anima \`transform\` y \`opacity\` (se componen en GPU). Evita animar \`width\`, \`height\`, \`top\` o \`left\`.

**Accesibilidad:** respeta la preferencia del usuario:

${a}css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
${a}`,related:["css-posicionamiento","css-variables"]}],K=new Set(["que","como","para","por","con","los","las","del","una","uno","unos","unas","este","esta","esto","estos","estas","hay","pero","mas","muy","sin","sobre","cuando","donde","porque","cual","cuales","son","ser","hacer","hace","puedo","puede","tengo","tiene","quiero","saber","explicame","explica","dime","ayuda","ayudame","duda","pregunta","algo","tema","funciona","sirve","uso","usar"]);function w(n){return String(n).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/\s+/g," ").trim()}function C(n){return w(n).split(/[^a-z0-9#+]+/).filter(o=>o.length>2&&!K.has(o))}function Y(n){const o=w(n);if(!o)return null;const t=new Set(C(o));let s=null,r=0;for(const c of D){let l=0;for(const f of c.keywords){const u=w(f);u&&(o.includes(u)?l+=Math.min(7,u.split(" ").length*2+1):u.includes(" ")&&u.split(" ").every(v=>t.has(v))&&(l+=2))}for(const f of C(c.title))t.has(f)&&(l+=.75);for(const f of t)c.keywords.some(u=>w(u)===f)&&(l+=1);l>r&&(r=l,s=c)}return r>=2?{entry:s,score:r}:null}function _(n,o=3){return n?(n.related||[]).map(t=>D.find(s=>s.id===t)).filter(Boolean).slice(0,o):[]}const W=[{label:"Diferencia entre let, const y var",text:"¿Cuál es la diferencia entre let, const y var?"},{label:"Explícame las promesas",text:"Explícame las promesas y async/await con un ejemplo"},{label:"ref vs reactive en Vue",text:"¿Cuál es la diferencia entre ref y reactive en Vue?"},{label:"Centrar un div con flexbox",text:"¿Cómo centro un div con flexbox?"},{label:"No entiendo mi error",text:"Me sale un error y no entiendo el mensaje. ¿Cómo lo depuro?"}];function X(n={}){const{profileName:o,level:t,weakConcepts:s,currentQuestion:r,topic:c}=n,l=(s||[]).map(f=>`${f.label} (${Math.round(f.mastery*100)}%)`).join(", ");return["Eres Mentor, el asistente pedagógico de CodeQuest, una plataforma para aprender JavaScript, Vue.js y CSS.","Respondes en español claro, con ejemplos cortos y código bien formateado en bloques markdown.","Tu objetivo es que el estudiante comprenda, no solo que copie la solución.","Usa un tono cercano, motivador y directo. Máximo 220 palabras salvo que pidan profundidad.","Si comparte código para explicarlo, recórrelo en orden y describe qué hace cada parte; si falta el código, pídeselo.","Al depurar, relaciona el mensaje de error con el código compartido, separa hechos de hipótesis y propone pasos concretos para verificar la causa. No afirmes que ejecutaste el código.","Si el estudiante pregunta por la respuesta de un quiz, da pistas y preguntas guía antes de revelar la solución.","Nunca inventes APIs. Si no estás seguro, dilo y propone cómo comprobarlo.",o?`El estudiante se llama ${o} y está en el nivel ${t||1}.`:"",l?`Conceptos con menor dominio: ${l}. Refuérzalos cuando sea natural.`:"",c?`Tema de práctica actual: ${c}.`:"",r?`Pregunta actual del quiz: "${r.prompt}". Concepto: ${r.concept}. Dificultad ${r.difficulty}/5. No des la opción correcta directamente.`:""].filter(Boolean).join(`
`)}function k(n,o,t){return Math.min(t,Math.max(o,n))}function R(n,o){const t=o.reduce((r,c)=>r+c,0);if(t<=0)return n[Math.floor(Math.random()*n.length)];let s=Math.random()*t;for(let r=0;r<n.length;r+=1)if(s-=o[r],s<=0)return n[r];return n[n.length-1]}const e=P({status:"idle",topic:"javascript",mode:"focus",length:8,questions:[],index:0,answers:[],startedAt:null,finishedAt:null,combo:0,maxCombo:0,xpEarned:0,selected:null,revealed:!1,hintUsed:!1,hintVisible:!1,questionStartedAt:null,lastResult:null,summary:null,error:null,abilityStart:{},cycleBumped:{}}),x=y(()=>e.questions[e.index]||null),ue=y(()=>e.length?k(Math.round(e.answers.length/e.length*100),0,100):0),Z=y(()=>{var n;return e.mode==="mix"?"Mezcla adaptativa":((n=h[e.topic])==null?void 0:n.name)||"Práctica"}),de=y(()=>T.map(n=>{const o=q(n.id).length,t=q(n.id).filter(s=>m.seen[s.id]).length;return{...n,total:o,seen:t,unseen:o-t}}));function N(n,o){const s=q(n).filter(u=>!o.has(u.id));if(!s.length)return null;let r=s.filter(u=>!m.seen[u.id]);r.length||(e.cycleBumped[n]||(I(n),e.cycleBumped[n]=!0),r=[...s].sort((u,d)=>{var v,i;return(((v=m.seen[u.id])==null?void 0:v.lastSeen)||0)-(((i=m.seen[d.id])==null?void 0:i.lastSeen)||0)}),r=r.slice(0,Math.max(5,Math.ceil(r.length/2))));const c=k((m.ability[n]||2.5)+.15,1,5),l=Date.now(),f=r.map(u=>{let d=Math.exp(-((u.difficulty-c)**2)/1.15);const v=m.concepts[`${u.topic}:${u.concept}`];return v?(d*=1+(1-v.mastery)*.85,v.dueAt&&v.dueAt<=l&&(d*=1.55)):d*=1.2,d*=.85+Math.random()*.3,d});return R(r,f)}function ee(n){var c;const o=(c=e.questions[e.questions.length-1])==null?void 0:c.topic,t=T.filter(l=>q(l.id).some(f=>!n.has(f.id)));if(!t.length)return null;const s=t.map(l=>{let u=.35+(1-L(l.id))*1.3;return l.id===o&&(u*=.35),u}),r=R(t,s);return N(r.id,n)}function O(){const n=new Set(e.questions.map(o=>o.id));return e.mode==="mix"?ee(n):N(e.topic,n)}function ne(n="javascript",o={}){const t=n==="mix"||o.mode==="mix"?"mix":"focus",s=k(Number(o.length)||m.profile.quizLength||8,4,12);e.status="playing",e.topic=t==="mix"?"mix":n,e.mode=t,e.length=s,e.questions=[],e.index=0,e.answers=[],e.startedAt=Date.now(),e.finishedAt=null,e.combo=0,e.maxCombo=0,e.xpEarned=0,e.selected=null,e.revealed=!1,e.hintUsed=!1,e.hintVisible=!1,e.questionStartedAt=Date.now(),e.lastResult=null,e.summary=null,e.error=null,e.abilityStart={...m.ability},e.cycleBumped={};const r=O();return r?(e.questions.push(r),!0):(e.status="idle",e.error="No hay preguntas disponibles para esta configuración.",!1)}function pe(){var n;return e.hintVisible||(e.hintVisible=!0,e.hintUsed=!0),((n=x.value)==null?void 0:n.hint)||"Lee la pregunta con calma y descarta las opciones imposibles."}function me(n){if(e.revealed||e.status!=="playing")return null;const o=x.value;if(!o)return null;const t=n===o.answer;e.selected=n,e.combo=t?e.combo+1:0,e.maxCombo=Math.max(e.maxCombo,e.combo);const s=V({question:o,correct:t,combo:e.combo,usedHint:e.hintUsed}),r=e.questionStartedAt?Date.now()-e.questionStartedAt:0,c={questionId:o.id,topic:o.topic,concept:o.concept,difficulty:o.difficulty,selected:n,correct:t,usedHint:e.hintUsed,timeMs:r,xp:s.xpEarned,abilityBefore:s.previousAbility,abilityAfter:s.ability,expected:s.expected};return e.answers.push(c),e.xpEarned+=s.xpEarned,e.revealed=!0,e.lastResult={...c,correctIndex:o.answer,explanation:o.explanation},J(t?"correct":"wrong",m.profile.sound),e.lastResult}function fe(){if(e.revealed){if(e.answers.length>=e.length){E();return}if(e.index+=1,!e.questions[e.index]){const n=O();if(!n){E();return}e.questions.push(n)}e.selected=null,e.revealed=!1,e.hintUsed=!1,e.hintVisible=!1,e.lastResult=null,e.questionStartedAt=Date.now()}}function E(){var v;if(e.status!=="playing")return;const n=e.answers,o=n.length,t=n.filter(i=>i.correct).length,s=e.startedAt?Date.now()-e.startedAt:0,r=new Map;for(const i of n){const b=`${i.topic}:${i.concept}`,g=r.get(b)||{key:b,label:i.concept,topic:i.topic,attempts:0,correct:0,difficultySum:0};g.attempts+=1,g.difficultySum+=i.difficulty,i.correct&&(g.correct+=1),r.set(b,g)}const c=[...r.values()].map(i=>({...i,accuracy:Math.round(i.correct/i.attempts*100),difficulty:i.difficultySum/i.attempts})).sort((i,b)=>i.accuracy-b.accuracy),l=new Map;for(const i of n){const b=l.get(i.topic)||{topic:i.topic,attempts:0,correct:0};b.attempts+=1,i.correct&&(b.correct+=1),l.set(i.topic,b)}const f=[...l.values()].map(i=>{var b,g;return{...i,name:((b=h[i.topic])==null?void 0:b.name)||i.topic,color:((g=h[i.topic])==null?void 0:g.color)||"#7cf5c4",accuracy:Math.round(i.correct/i.attempts*100)}}),u={};for(const i of Object.keys(e.abilityStart))u[i]=(m.ability[i]||0)-(e.abilityStart[i]||0);const d={topic:e.topic,topicLabel:e.mode==="mix"?"Mezcla adaptativa":((v=h[e.topic])==null?void 0:v.name)||"Práctica",mode:e.mode,total:o,correct:t,accuracy:o?Math.round(t/o*100):0,xp:e.xpEarned,maxCombo:e.maxCombo,duration:s,concepts:c,topics:f,abilityDelta:u,weakest:c[0]||null,strongest:c[c.length-1]||null};e.summary=d,e.finishedAt=Date.now(),e.status="finished",B(d)}function ve(){const n=e.mode==="mix"?"mix":e.topic;ne(n,{length:e.length,mode:e.mode})}function be(){e.status="idle",e.questions=[],e.answers=[],e.summary=null,e.lastResult=null,e.error=null}const S="codequest.chat.v1",U="codequest.socratic.v1";function ae(){try{const n=localStorage.getItem(U);return n===null?!0:n==="1"}catch{return!0}}const j={id:"welcome",role:"assistant",content:`¡Hola! Soy **Mentor**, tu copiloto de aprendizaje. Puedo explicarte conceptos, ayudarte a leer un error y darte pistas sin revelarte la respuesta.

¿En qué te atascaste hoy?`,at:Date.now(),source:"CodeQuest"};function oe(){try{const n=localStorage.getItem(S);if(!n)return[j];const o=JSON.parse(n);return!Array.isArray(o)||!o.length?[j]:o.slice(-60)}catch{return[j]}}function te(n){return String(n).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase()}function A(n){return new Promise(o=>setTimeout(o,n))}const p=P({messages:oe(),pending:!1,error:null,socratic:ae(),context:{topic:null,question:null},prefill:"",lastSource:""}),ge=W,re=y(()=>m.ai.mode==="remote"&&!!m.ai.apiKey&&!!m.ai.baseUrl&&!!m.ai.model),ye=y(()=>({messages:m.assistantMessages||0,conversations:p.messages.filter(n=>n.role==="user").length}));let M=null;G(()=>p.messages,()=>{clearTimeout(M),M=setTimeout(()=>{try{localStorage.setItem(S,JSON.stringify(p.messages.slice(-60)))}catch{}},200)},{deep:!0});function $(n,o,t={}){const s={id:`${Date.now()}-${Math.random().toString(36).slice(2,8)}`,role:n,content:o,at:Date.now(),...t};return p.messages.push(s),s}function se(){const n=x.value;if(!n)return null;const o=h[n.topic];let t=`Estás practicando **${n.concept}** en ${(o==null?void 0:o.name)||""} (dificultad ${n.difficulty}/5).

> ${n.prompt}

`;return p.socratic?t+=`**Pista:** ${n.hint}

Antes de elegir, pregúntate:
1. ¿Qué me pide exactamente el enunciado?
2. ¿Qué pasaría si ejecutara el código paso a paso?
3. ¿Qué opción puedo descartar con seguridad?

Dime qué opción crees y por qué, y lo revisamos juntos.`:t+=`**Respuesta:** ${n.options[n.answer]}

${n.explanation}

**Pista original:** ${n.hint}`,{content:t,source:"Contexto del quiz"}}function z(n){const o=te(n);if(o.includes("explicame este codigo paso a paso"))return{content:"La explicación línea por línea de código personalizado requiere conectar una IA generativa en **Ajustes → Mentor IA**. En modo local puedo consultar la base de conocimiento, pero no interpretar código arbitrario. Pega el fragmento después de “Código” y vuelve a enviarlo cuando la IA esté conectada.",source:"Mentor local"};if(o.includes("analiza este error de programacion")){const r=n.match(/(?:ReferenceError|TypeError|SyntaxError|RangeError|Error)\s*:[^\n]+/i);if(!r)return{content:"Para orientar el diagnóstico, incluye el **mensaje completo del error** (tipo, texto y línea) y el **código relacionado**. El mentor local no ejecuta código; con una IA conectada puede relacionar ambos y sugerir correcciones específicas.",source:"Mentor local"};const c=r[0].split(":")[0].toLowerCase(),l={referenceerror:"Normalmente indica que se usó un nombre que no está definido o no es accesible en ese ámbito. Revisa errores de escritura, imports y dónde se declara la variable.",typeerror:"Normalmente indica que una operación se aplicó a un valor incompatible, a menudo `null` o `undefined`. Comprueba el valor y su tipo justo antes de la línea que falla.",syntaxerror:"El intérprete no pudo analizar el código. Revisa la línea señalada y también la anterior: pueden faltar comillas, paréntesis o llaves.",rangeerror:"El valor está fuera del rango permitido por esa operación. Revisa límites, índices y argumentos numéricos.",error:"El texto del error por sí solo no confirma la causa. Compara el stack trace con el código que se ejecuta en esa línea."};return{content:`**Error recibido:** \`${r[0]}\`

${l[c]||l.error}

1. Localiza la primera línea de tu código que aparece en el stack trace.
2. Inspecciona los valores usados allí con \`console.log({ valor })\`.
3. Compara el resultado con el tipo y valor que esperabas.

Esta orientación local es general y no ejecuta el código. Para relacionar el error con tu fragmento y proponer un cambio concreto, conecta una IA en **Ajustes → Mentor IA**.`,source:"Guía local de depuración"}}const t=/pregunta|quiz|pista|no entiendo|ayuda|respuesta|opcion|ejercicio|este codigo/.test(o);if(e.status==="playing"&&x.value&&t){const r=se();if(r)return r}const s=Y(n);if(s){const r=_(s.entry);let c=s.entry.answer;return r.length&&(c+=`

---
**Sigue explorando:** ${r.map(l=>`*${l.title}*`).join(" · ")}`),{content:c,source:`Base de conocimiento · ${s.entry.title}`}}return{content:`No encontré una respuesta exacta para eso en mi base local, pero puedo ayudarte si me das un poco más de contexto: ¿qué intentas hacer, qué esperabas que pasara y qué ocurrió realmente?

Mientras tanto, prueba con:
- *“Explícame los closures con un ejemplo”*
- *“¿Por qué \`map\` me devuelve undefined?”*
- *“¿Cómo funciona \`v-model\`?”*
- *“Centrar un div con flexbox”*

También puedes activar un modelo de IA real en **Ajustes → Mentor IA** para preguntas abiertas.`,source:"Mentor local"}}async function ie(){var l,f,u;const o=`${m.ai.baseUrl.replace(/\/+$/,"")}/chat/completions`,t={profileName:m.profile.name||"estudiante",level:Q.value.level,weakConcepts:F(3).map(d=>({label:`${d.label} (${d.topicName})`,mastery:d.mastery})),currentQuestion:e.status==="playing"?x.value:null,topic:e.status==="playing"?Z.value:null},s=p.messages.slice(-10).filter(d=>d.role==="user"||d.role==="assistant").map(d=>({role:d.role,content:d.content})),r=new AbortController,c=setTimeout(()=>r.abort(),45e3);try{const d=await fetch(o,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${m.ai.apiKey}`},body:JSON.stringify({model:m.ai.model,temperature:.5,max_tokens:800,messages:[{role:"system",content:X(t)},...s]}),signal:r.signal});if(!d.ok){const b=await d.text().catch(()=>"");throw new Error(`HTTP ${d.status}${b?` · ${b.slice(0,120)}`:""}`)}const v=await d.json(),i=(u=(f=(l=v==null?void 0:v.choices)==null?void 0:l[0])==null?void 0:f.message)==null?void 0:u.content;if(!i)throw new Error("El proveedor devolvió una respuesta vacía.");return{content:i,source:`IA · ${m.ai.model}`}}finally{clearTimeout(c)}}async function he(n){const o=String(n||"").trim();if(!(!o||p.pending)){$("user",o),H(),p.pending=!0,p.error=null;try{let t;if(re.value)try{t=await ie()}catch(s){p.error=`No se pudo conectar con la IA (${s.message}). Respondí con el mentor local.`,await A(300),t=z(o)}else await A(420+Math.random()*380),t=z(o);p.lastSource=t.source||"",$("assistant",t.content,{source:t.source})}catch(t){p.error="Ocurrió un problema al generar la respuesta.",$("assistant","No pude procesar tu mensaje. Inténtalo de nuevo o reformúlalo con más detalle.",{source:"Error"}),console.error(t)}finally{p.pending=!1}}}function xe(n=""){p.prefill=n}function we(){const n=p.prefill;return p.prefill="",n}function je(){p.messages=[j],p.error=null;try{localStorage.removeItem(S)}catch{}}function qe(n){p.socratic=!!n;try{localStorage.setItem(U,p.socratic?"1":"0")}catch{}}export{p as a,de as b,x as c,be as d,xe as e,me as f,qe as g,je as h,re as i,ge as j,ye as k,he as l,we as m,fe as n,ue as p,e as q,ve as r,ne as s,Z as t,pe as u};
