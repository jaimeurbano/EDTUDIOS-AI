import{_ as me,C as h,H as J,G as fe,e as r,a as e,f as v,F as k,q as A,t as l,n as W,b as u,m as w,Q as ge,S as he,U as ye,V as _e,i as z,A as p,w as Y,I as K,d as y,W as O,k as xe,o as i,c as ke}from"./index-p-HKTFeT.js";import{c as ze,r as Q}from"./markdown-3U270pWg.js";import{p as Se}from"./sound-DBAzlJqC.js";const I=[{id:"js-lab-1",title:"El doble exacto",level:1,concept:"Variables y operadores",brief:"Imprime en consola el doble de `numero`. Debes obtener exactamente `42`.",starter:`const numero = 21

// Escribe tu código aquí
`,expected:["42"],hint:"Usa `console.log(numero * 2)`.",solution:`const numero = 21
console.log(numero * 2)
`},{id:"js-lab-2",title:"FizzBuzz mini",level:2,concept:"Bucles y condicionales",brief:"Recorre del 1 al 15. Imprime `Fizz` si el número es múltiplo de 3, `Buzz` si es múltiplo de 5, `FizzBuzz` si es múltiplo de ambos, y el número en caso contrario. Un valor por línea.",starter:`for (let i = 1; i <= 15; i++) {
  // Tu lógica aquí
}
`,expected:["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz"],hint:"Comprueba primero el caso de ambos (i % 3 === 0 && i % 5 === 0), luego cada uno por separado.",solution:`for (let i = 1; i <= 15; i++) {
  if (i % 3 === 0 && i % 5 === 0) console.log('FizzBuzz')
  else if (i % 3 === 0) console.log('Fizz')
  else if (i % 5 === 0) console.log('Buzz')
  else console.log(i)
}
`},{id:"js-lab-3",title:"Suma de pares",level:2,concept:"Arrays y reduce",brief:"Dado el array `numeros`, imprime la suma de todos sus elementos pares. Resultado esperado: `12`.",starter:`const numeros = [1, 2, 3, 4, 5, 6]

// Tu código aquí
`,expected:["12"],hint:"Puedes usar `filter(n => n % 2 === 0)` y luego `reduce((a, b) => a + b, 0)`.",solution:`const numeros = [1, 2, 3, 4, 5, 6]
const suma = numeros.filter((n) => n % 2 === 0).reduce((a, b) => a + b, 0)
console.log(suma)
`},{id:"js-lab-4",title:"Texto invertido",level:2,concept:"Strings y spread",brief:"Imprime la palabra `codequest` invertida, en minúsculas y sin espacios.",starter:`const palabra = 'codequest'

// Tu código aquí
`,expected:["tseuqedoc"],hint:'Convierte el string en array con `[...palabra]`, usa `reverse()` y `join("")`.',solution:`const palabra = 'codequest'
console.log([...palabra].reverse().join(''))
`},{id:"js-lab-5",title:"Nombres en mayúsculas",level:3,concept:"Objetos y map",brief:"Imprime los nombres de las personas en mayúsculas, separados por coma y sin espacios. Resultado: `ADA,GRACE,LINUS`.",starter:`const personas = [
  { nombre: 'Ada' },
  { nombre: 'Grace' },
  { nombre: 'Linus' },
]

// Tu código aquí
`,expected:["ADA,GRACE,LINUS"],hint:'Usa `map` para transformar y `join(",")` para unir.',solution:`const personas = [
  { nombre: 'Ada' },
  { nombre: 'Grace' },
  { nombre: 'Linus' },
]
console.log(personas.map((p) => p.nombre.toUpperCase()).join(','))
`},{id:"js-lab-6",title:"Espera la promesa",level:4,concept:"Async / await",brief:"Dentro de `cargar()`, espera el resultado de `obtenerNivel()` e imprime el valor. Debe aparecer `7`.",starter:`function obtenerNivel() {
  return Promise.resolve(7)
}

async function cargar() {
  // Tu código aquí
}

cargar()
`,expected:["7"],hint:"Usa `const nivel = await obtenerNivel()` y luego `console.log(nivel)`.",solution:`function obtenerNivel() {
  return Promise.resolve(7)
}

async function cargar() {
  const nivel = await obtenerNivel()
  console.log(nivel)
}

cargar()
`}],P=[{id:"css-lab-1",title:"Centra la tarjeta",level:1,concept:"Flexbox",brief:"Centra horizontal y verticalmente la tarjeta dentro del escenario. El escenario debe ocupar al menos 320px de alto.",starter:`.stage {
  /* Tu CSS aquí */
}

.card {
  padding: 24px 32px;
}
`,html:'<div class="stage"><div class="card">Hola, CSS ✨</div></div>',objectives:[{label:"El escenario usa display: flex",test:n=>/display\s*:\s*flex/.test(n)},{label:"Centra en el eje principal (justify-content)",test:n=>/justify-content\s*:\s*center/.test(n)},{label:"Centra en el eje cruzado (align-items)",test:n=>/align-items\s*:\s*center/.test(n)},{label:"Define una altura mínima de 320px",test:n=>/min-height\s*:\s*(320px|20rem)/.test(n)}],hint:"Activa flex en `.stage`, usa `justify-content: center`, `align-items: center` y `min-height: 320px`.",solution:`.stage {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 320px;
}

.card {
  padding: 24px 32px;
}
`},{id:"css-lab-2",title:"Galería con Grid",level:2,concept:"CSS Grid",brief:"Convierte `.galeria` en una cuadrícula de 3 columnas iguales con 16px de separación.",starter:`.galeria {
  /* Tu CSS aquí */
}
`,html:`<div class="galeria">
  <div class="item">01</div>
  <div class="item">02</div>
  <div class="item">03</div>
  <div class="item">04</div>
  <div class="item">05</div>
  <div class="item">06</div>
</div>`,objectives:[{label:"Usa display: grid",test:n=>/display\s*:\s*grid/.test(n)},{label:"Crea 3 columnas con repeat(3, 1fr)",test:n=>/grid-template-columns\s*:\s*repeat\(\s*3\s*,\s*1fr\s*\)/.test(n)},{label:"Aplica un gap de 16px",test:n=>/gap\s*:\s*16px/.test(n)}],hint:"Usa `display: grid`, `grid-template-columns: repeat(3, 1fr)` y `gap: 16px`.",solution:`.galeria {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
`},{id:"css-lab-3",title:"Botón con vida",level:2,concept:"Transiciones",brief:"Estiliza `.boton` con fondo `#7cf5c4`, texto oscuro, padding, bordes redondeados y una transición. Al pasar el mouse debe elevarse 3px.",starter:`.boton {
  /* Tu CSS aquí */
}

.boton:hover {
  /* Tu CSS aquí */
}
`,html:'<button class="boton">Pruébame</button>',objectives:[{label:"Fondo #7cf5c4 y texto oscuro",test:n=>/background(-color)?\s*:\s*#7cf5c4/.test(n)&&/color\s*:\s*#0[0-9a-f]{5}/.test(n)},{label:"Padding y border-radius",test:n=>/padding\s*:/.test(n)&&/border-radius\s*:/.test(n)},{label:"Declara una transition",test:n=>/transition\s*:/.test(n)},{label:"En :hover aplica translateY(-3px)",test:n=>/\.boton:hover\s*\{[^}]*translateY\(\s*-3px\s*\)/.test(n)}],hint:"En `.boton:hover` usa `transform: translateY(-3px)`. La transición va en el estado base.",solution:`.boton {
  background: #7cf5c4;
  color: #08111f;
  padding: 14px 24px;
  border: 0;
  border-radius: 999px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 180ms ease, box-shadow 180ms ease;
}

.boton:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 28px rgba(124, 245, 196, 0.35);
}
`},{id:"css-lab-4",title:"Tema con variables",level:3,concept:"Custom properties",brief:"Define `--brand` en `:root` y úsala como fondo de `.card`. Añade también `--radius` y aplícala al borde.",starter:`:root {
  /* Define tus variables */
}

.card {
  /* Usa las variables */
}
`,html:'<div class="card">Diseño con tokens</div>',objectives:[{label:"Define --brand en :root",test:n=>/:root\s*\{[^}]*--brand\s*:/.test(n)},{label:"Define --radius en :root",test:n=>/:root\s*\{[^}]*--radius\s*:/.test(n)},{label:"Usa var(--brand) como background",test:n=>/background(-color)?\s*:\s*var\(\s*--brand\s*\)/.test(n)},{label:"Usa var(--radius) en border-radius",test:n=>/border-radius\s*:\s*var\(\s*--radius\s*\)/.test(n)}],hint:"Declara `--brand: #7cf5c4;` y `--radius: 18px;` en `:root`, y consúmelas con `var(...)`.",solution:`:root {
  --brand: #7cf5c4;
  --radius: 18px;
}

.card {
  background: var(--brand);
  color: #08111f;
  padding: 28px;
  border-radius: var(--radius);
}
`}],je=`
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
`,Ce=`
  const format = (value) => {
    if (typeof value === 'string') return value
    if (typeof value === 'function') return '[Function]'
    if (typeof value === 'undefined') return 'undefined'
    if (value === null) return 'null'
    if (typeof value === 'object') {
      try { return JSON.stringify(value) } catch { return String(value) }
    }
    return String(value)
  }

  self.onmessage = async (event) => {
    const logs = []
    const fakeConsole = {
      log: (...args) => logs.push(args.map(format).join(' ')),
      info: (...args) => logs.push(args.map(format).join(' ')),
      warn: (...args) => logs.push(args.map(format).join(' ')),
      error: (...args) => logs.push(args.map(format).join(' ')),
    }
    try {
      const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor
      const fn = new AsyncFunction('console', '"use strict";\\n' + event.data)
      await fn(fakeConsole)
      self.postMessage({ logs, error: null })
    } catch (error) {
      self.postMessage({ logs, error: error && error.message ? error.message : String(error) })
    }
  }
`;function we(n,L=2500){return new Promise(S=>{if(typeof Worker>"u"){S({logs:[],error:"Tu navegador no permite ejecutar código en el laboratorio."});return}let o,m;const b=f=>{clearTimeout(g),o&&o.terminate(),m&&URL.revokeObjectURL(m),S(f)},g=setTimeout(()=>{b({logs:[],error:"Tiempo de ejecución excedido (2.5s). Revisa si tienes un bucle infinito."})},L);try{const f=new Blob([Ce],{type:"application/javascript"});m=URL.createObjectURL(f),o=new Worker(m),o.onmessage=d=>b(d.data),o.onerror=d=>b({logs:[],error:d.message||"Error en el worker."}),o.postMessage(n)}catch(f){b({logs:[],error:f.message||"No se pudo iniciar el laboratorio."})}})}function Te(n,L){const S=g=>String(g).trim(),o=n.map(S),m=L.map(S),b=o.length===m.length&&o.every((g,f)=>g===m[f]);return{matches:b,received:o,expected:m,firstMismatch:b?-1:Math.max(0,o.findIndex((g,f)=>g!==m[f])===-1?Math.min(o.length,m.length):o.findIndex((g,f)=>g!==m[f]))}}const Ee={class:"lab-view"},Ne={class:"page-head animate-in"},Ae={class:"lab-tabs",role:"tablist","aria-label":"Tecnología del laboratorio"},Le=["aria-selected","onClick"],Ue={class:"tab-count"},Re={class:"lab-layout animate-in delay-1"},Be={class:"card challenge-rail"},De={class:"rail-head"},Fe={class:"tiny dim"},Me={class:"rail-percent"},qe={class:"bar bar-thin rail-bar"},Ie={class:"rail-list"},Oe=["onClick"],Pe={class:"rail-index"},Ve={class:"rail-copy"},$e={class:"rail-status"},He={key:1,class:"level-dots","aria-hidden":"true"},Ge={class:"rail-tip"},Je={class:"lab-main"},We={class:"card lab-brief"},Ye={class:"row-between wrap brief-head"},Ke={class:"row wrap"},Qe={class:"chip chip-brand"},Xe={class:"chip"},Ze={key:0,class:"chip chip-brand"},es=["innerHTML"],ss={class:"lab-work"},as={class:"card editor-card"},ts={class:"editor-head"},ns={class:"editor-file"},os={class:"editor-meta"},ls={class:"editor-shell"},is=["aria-label","onKeydown"],rs={class:"editor-foot"},cs={class:"row wrap editor-actions"},us=["disabled"],ds={key:0,class:"hint-box"},ps={class:"hint-head"},vs=["innerHTML"],bs={key:0,class:"solution-box"},ms={class:"solution-head"},fs={class:"card output-card"},gs={class:"output-head"},hs={key:0,class:"console-empty"},ys={class:"console-empty-icon"},_s={key:0,class:"console-error"},xs={class:"mono"},ks={key:1,class:"console-logs"},zs={class:"console-index"},Ss={key:0,class:"console-empty-line"},js={key:3,class:"expected-box"},Cs={class:"expected-list"},ws={class:"output-head"},Ts=["srcdoc"],Es={class:"objectives"},Ns={class:"row-between objectives-head"},As={class:"tiny dim"},Ls={class:"objective-list"},Us={class:"objective-check"},X="codequest.lab.v1",Rs={__name:"LabView",setup(n){const L=[{id:"js",label:"JavaScript",icon:"js",color:"#f7df1e"},{id:"css",label:"CSS",icon:"css",color:"#5ba8ff"}];function S(){try{const a=localStorage.getItem(X),s=a?JSON.parse(a):{};return s&&typeof s=="object"?s:{}}catch{return{}}}const o=h("js"),m=h(I[0].id),b=h(S()),g=h({}),f=h({}),d=h(null),j=h(null),U=h(""),T=h(!1),R=h(!1),D=h(!1),B=h(!1);let E=null;const C=y(()=>o.value==="js"?I:P),c=y(()=>C.value.find(a=>a.id===m.value)||C.value[0]),V=y(()=>C.value.filter(a=>b.value[a.id]).length),$=y(()=>C.value.length?Math.round(V.value/C.value.length*100):0),_=y({get(){const s=(o.value==="js"?g.value:f.value)[c.value.id];return s===void 0?c.value.starter:s},set(a){const s=o.value==="js"?g:f;s.value={...s.value,[c.value.id]:a}}}),Z=y(()=>Q(c.value.brief)),ee=y(()=>Q(c.value.hint||"")),se=y(()=>_.value.split(`
`).length),ae=y(()=>_.value.length),F=y(()=>o.value!=="css"?[]:(c.value.objectives||[]).map(a=>{let s=!1;try{s=!!a.test(_.value)}catch{s=!1}return{label:a.label,passed:s}})),te=y(()=>F.value.filter(a=>a.passed).length),H=y(()=>{var a;return d.value?d.value.error?{label:"Error",className:"chip-danger"}:(a=d.value.check)!=null&&a.matches?{label:"Correcto",className:"chip-brand"}:{label:"Revisar",className:"chip-warning"}:{label:"Sin ejecutar",className:""}});function ne(a){return(a==="js"?I:P).filter(t=>b.value[t.id]).length}function oe(){try{localStorage.setItem(X,JSON.stringify(b.value))}catch{}}function G(){const a=c.value.id,s=!b.value[a];b.value={...b.value,[a]:new Date().toISOString()},oe(),s&&Se("correct",xe.profile.sound)}function M(){d.value=null,j.value=null,R.value=!1,D.value=!1,B.value=!1}function le(a){a!==o.value&&(o.value=a,m.value=a==="js"?I[0].id:P[0].id,M())}function ie(a){a!==m.value&&(m.value=a,M())}function q(){const a=c.value.html||"";return`<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      ${je}
      ${_.value}
    </style>
  </head>
  <body>${a}</body>
</html>`}function re(){o.value==="css"&&(clearTimeout(E),U.value=q())}J([_,()=>c.value.id],()=>{o.value==="css"&&(clearTimeout(E),E=setTimeout(()=>{U.value=q()},380))},{immediate:!0}),J(()=>c.value.id,()=>M()),fe(()=>clearTimeout(E));async function ce(){if(T.value)return;const a=c.value;T.value=!0,d.value=null;try{const s=await we(_.value,2500);if(a.id!==c.value.id)return;const t=s.error?null:Te(s.logs,a.expected);d.value={...s,check:t},t!=null&&t.matches&&G()}finally{T.value=!1}}function ue(){const a=F.value,s=a.filter(t=>t.passed).length;s===a.length?(j.value={type:"success",text:"¡Todos los objetivos cumplidos! Reto superado."},G()):j.value={type:"pending",text:`Cumpliste ${s} de ${a.length} objetivos. Ajusta tu CSS y vuelve a comprobar.`}}function de(){D.value=!0,_.value=c.value.solution,o.value==="css"&&O(()=>{clearTimeout(E),U.value=q()})}function pe(){_.value=c.value.starter,M(),o.value==="css"&&O(()=>{clearTimeout(E),U.value=q()})}async function ve(){await ze(c.value.solution)&&(B.value=!0,setTimeout(()=>{B.value=!1},1600))}function be(a){const s=a.target,t=s.selectionStart,x=s.selectionEnd,N=s.value;_.value=`${N.slice(0,t)}  ${N.slice(x)}`,O(()=>{s.selectionStart=t+2,s.selectionEnd=t+2})}return(a,s)=>(i(),r("div",Ee,[e("header",Ne,[s[2]||(s[2]=e("div",null,[e("span",{class:"eyebrow"},"Laboratorio"),e("h1",null,[v("Escribe código, "),e("span",{class:"gradient-text"},"míralo cobrar vida")]),e("p",null," Retos cortos con ejecución real: JavaScript corre aislado en un Web Worker y CSS se previsualiza al instante. Sin instalar nada. ")],-1)),e("div",Ae,[(i(),r(k,null,A(L,t=>e("button",{key:t.id,type:"button",role:"tab",class:z(["lab-tab",{active:o.value===t.id}]),"aria-selected":o.value===t.id,style:W({"--tab-color":t.color}),onClick:x=>le(t.id)},[u(p,{name:t.icon,size:17},null,8,["name"]),v(" "+l(t.label)+" ",1),e("span",Ue,l(ne(t.id)),1)],14,Le)),64))])]),e("div",Re,[e("aside",Be,[e("div",De,[e("div",null,[s[3]||(s[3]=e("h2",null,"Retos",-1)),e("p",Fe,l(V.value)+" de "+l(C.value.length)+" superados",1)]),e("span",Me,l($.value)+"%",1)]),e("div",qe,[e("span",{style:W({width:`${$.value}%`})},null,4)]),e("div",Ie,[(i(!0),r(k,null,A(C.value,(t,x)=>(i(),r("button",{key:t.id,type:"button",class:z(["rail-item",{active:t.id===c.value.id,solved:b.value[t.id]}]),onClick:N=>ie(t.id)},[e("span",Pe,l(String(x+1).padStart(2,"0")),1),e("span",Ve,[e("strong",null,l(t.title),1),e("small",null,l(t.concept),1)]),e("span",$e,[b.value[t.id]?(i(),ke(p,{key:0,name:"check",size:14})):(i(),r("span",He,[(i(),r(k,null,A(5,N=>e("i",{key:N,class:z({on:N<=t.level})},null,2)),64))]))])],10,Oe))),128))]),e("div",Ge,[u(p,{name:"shield",size:15}),s[4]||(s[4]=e("p",null," Tu código se ejecuta solo en tu navegador. Nada se envía a un servidor. ",-1))])]),e("section",Je,[e("article",We,[e("div",Ye,[e("div",Ke,[e("span",Qe,[u(p,{name:"flag",size:13}),v(" Nivel "+l(c.value.level)+" / 5 ",1)]),e("span",Xe,l(c.value.concept),1),b.value[c.value.id]?(i(),r("span",Ze,[u(p,{name:"check",size:13}),s[5]||(s[5]=v(" Completado ",-1))])):w("",!0)]),e("button",{type:"button",class:"btn btn-ghost btn-sm",onClick:pe},[u(p,{name:"rotate",size:14}),s[6]||(s[6]=v(" Reiniciar ",-1))])]),e("h2",null,l(c.value.title),1),e("div",{class:"md lab-brief-text",innerHTML:Z.value},null,8,es)]),e("div",ss,[e("div",as,[e("div",ts,[e("span",ns,[u(p,{name:"code",size:14}),v(" "+l(o.value==="js"?"script.js":"styles.css"),1)]),e("span",os,l(se.value)+" líneas",1)]),e("div",ls,[ge(e("textarea",{"onUpdate:modelValue":s[0]||(s[0]=t=>_.value=t),class:"code-editor",spellcheck:"false",autocapitalize:"off",autocomplete:"off",autocorrect:"off","aria-label":`Editor de código para el reto ${c.value.title}`,onKeydown:ye(_e(be,["prevent"]),["tab"])},null,40,is),[[he,_.value]])]),e("div",rs,[e("span",null,l(ae.value)+" caracteres",1),s[7]||(s[7]=e("span",null,"Tab inserta 2 espacios",-1))]),e("div",cs,[o.value==="js"?(i(),r("button",{key:0,type:"button",class:"btn btn-primary",disabled:T.value,onClick:ce},[u(p,{name:"play",size:15,class:z({spin:T.value})},null,8,["class"]),v(" "+l(T.value?"Ejecutando…":"Ejecutar código"),1)],8,us)):(i(),r("button",{key:1,type:"button",class:"btn btn-primary",onClick:ue},[u(p,{name:"check",size:15}),s[8]||(s[8]=v(" Comprobar objetivos ",-1))])),e("button",{type:"button",class:"btn btn-outline",onClick:s[1]||(s[1]=t=>R.value=!R.value)},[u(p,{name:"lightbulb",size:15}),v(" "+l(R.value?"Ocultar pista":"Ver pista"),1)]),e("button",{type:"button",class:"btn btn-ghost",onClick:de},[u(p,{name:"eye",size:15}),v(" "+l(D.value?"Solución aplicada":"Ver solución"),1)])]),u(K,{name:"slide"},{default:Y(()=>[R.value?(i(),r("div",ds,[e("div",ps,[u(p,{name:"lightbulb",size:15}),s[9]||(s[9]=e("strong",null,"Pista",-1))]),e("div",{class:"md",innerHTML:ee.value},null,8,vs)])):w("",!0)]),_:1}),u(K,{name:"slide"},{default:Y(()=>[D.value?(i(),r("div",bs,[e("div",ms,[s[10]||(s[10]=e("span",null,"Una posible solución",-1)),e("button",{type:"button",class:"btn btn-ghost btn-sm",onClick:ve},[u(p,{name:B.value?"check":"copy",size:13},null,8,["name"]),v(" "+l(B.value?"¡Copiada!":"Copiar"),1)])]),e("pre",null,[e("code",null,l(c.value.solution),1)])])):w("",!0)]),_:1})]),e("div",fs,[o.value==="js"?(i(),r(k,{key:0},[e("div",gs,[e("h3",null,[u(p,{name:"code",size:16}),s[11]||(s[11]=v(" Consola ",-1))]),e("span",{class:z(["chip",H.value.className])},l(H.value.label),3)]),d.value?(i(),r(k,{key:1},[d.value.error?(i(),r("div",_s,[u(p,{name:"alert",size:16}),e("div",null,[s[13]||(s[13]=e("strong",null,"No se pudo completar la ejecución",-1)),e("p",xs,l(d.value.error),1)])])):(i(),r("div",ks,[(i(!0),r(k,null,A(d.value.logs,(t,x)=>(i(),r("div",{key:x,class:"console-line"},[e("span",zs,l(x+1),1),e("code",null,l(t),1)]))),128)),d.value.logs.length?w("",!0):(i(),r("p",Ss," El código no imprimió nada en consola. "))])),d.value.check?(i(),r("div",{key:2,class:z(["check-result",d.value.check.matches?"success":"pending"])},[u(p,{name:d.value.check.matches?"check":"info",size:16},null,8,["name"]),e("span",null,l(d.value.check.matches?"¡Salida exacta! Reto superado.":`La salida no coincide todavía. Esperaba ${c.value.expected.length} línea(s).`),1)],2)):w("",!0),d.value.check&&!d.value.check.matches?(i(),r("div",js,[s[14]||(s[14]=e("h4",null,"Salida esperada",-1)),e("div",Cs,[(i(!0),r(k,null,A(c.value.expected,(t,x)=>(i(),r("code",{key:x},l(t),1))),128))])])):w("",!0)],64)):(i(),r("div",hs,[e("span",ys,[u(p,{name:"play",size:20})]),s[12]||(s[12]=e("p",{class:"small muted"},[v(" Pulsa "),e("strong",{class:"strong"},"Ejecutar código"),v(" para ver la salida de "),e("code",null,"console.log"),v(". ")],-1))]))],64)):(i(),r(k,{key:1},[e("div",ws,[e("h3",null,[u(p,{name:"eye",size:16}),s[15]||(s[15]=v(" Vista previa ",-1))]),e("button",{type:"button",class:"btn btn-ghost btn-sm",onClick:re},[u(p,{name:"refresh",size:13}),s[16]||(s[16]=v(" Actualizar ",-1))])]),e("iframe",{srcdoc:U.value,class:"preview-frame",sandbox:"",title:"Vista previa del reto CSS"},null,8,Ts),e("div",Es,[e("div",Ns,[s[17]||(s[17]=e("h4",null,"Objetivos",-1)),e("span",As,l(te.value)+" / "+l(F.value.length),1)]),e("ul",Ls,[(i(!0),r(k,null,A(F.value,(t,x)=>(i(),r("li",{key:x,class:z({passed:t.passed})},[e("span",Us,[u(p,{name:t.passed?"check":"dot",size:11},null,8,["name"])]),v(" "+l(t.label),1)],2))),128))]),j.value?(i(),r("div",{key:0,class:z(["check-result",j.value.type])},[u(p,{name:j.value.type==="success"?"check":"info",size:16},null,8,["name"]),e("span",null,l(j.value.text),1)],2)):w("",!0)])],64))])])])])]))}},Ms=me(Rs,[["__scopeId","data-v-8508d151"]]);export{Ms as default};
