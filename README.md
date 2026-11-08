# CodeQuest

> Aprende JavaScript, Vue.js y CSS con quizzes que se adaptan a ti, un mentor disponible 24/7 y retos de código en vivo.

CodeQuest es una plataforma de aprendizaje **100 % frontend** construida con Vue 3. No necesita backend, cuentas ni base de datos: todo tu progreso vive en el navegador. El motor de práctica ajusta la dificultad pregunta a pregunta, evita repetir ejercicios y prioriza justo los conceptos que más te cuestan.

---

## ✨ Características

- **Quiz adaptativo real** — un modelo de habilidad por tecnología estima tu nivel y elige la siguiente pregunta en tu zona de desarrollo próximo.
- **Sin repetición** — cada pregunta respondida se marca como vista. Solo vuelve a aparecer cuando se agota el banco del tema, y en ese caso prioriza las vistas hace más tiempo.
- **Repaso espaciado** — los conceptos fallados vuelven antes; los dominados se espacian con intervalos de 1, 3, 7, 14, 30 y 60 días.
- **Modo mezcla** — sesiones que alternan JavaScript, Vue y CSS dando más peso a los temas con menor dominio.
- **Mentor IA** — base de conocimiento local con búsqueda por intención y modo socrático (pistas y preguntas guía antes que respuestas). Opcionalmente puedes conectar cualquier API compatible con OpenAI.
- **Laboratorio de código** — 6 retos de JavaScript ejecutados en un Web Worker aislado con timeout de 2,5 s, y 4 retos de CSS con vista previa en vivo y objetivos verificables.
- **Gamificación** — XP, niveles, rachas, meta diaria, combos, 14 logros y un mapa de constancia de 28 días.
- **Diseño oscuro tipo neón** — sistema de diseño con variables CSS, sidebar responsive, navegación móvil, animaciones suaves y soporte de `prefers-reduced-motion`.
- **Privacidad por diseño** — sin cuentas, sin cookies de seguimiento y sin servidor propio. Exporta e importa tu progreso en JSON cuando quieras.

---

## 🧱 Stack

| Capa | Tecnología |
| --- | --- |
| UI | Vue 3 (`<script setup>`, Composition API) |
| Build | Vite 6 |
| Rutas | Vue Router 4 (hash history) |
| Estado | Stores reactivos propios (`reactive` + `computed`) |
| Estilos | CSS puro con variables y `scoped styles` |
| Persistencia | `localStorage` |
| IA | Base local + API compatible con OpenAI (opcional) |

Sin Pinia, sin framework CSS y sin dependencias de UI: el objetivo es mantener el proyecto pequeño, legible y fácil de desplegar en cualquier hosting estático.

---

## 🚀 Puesta en marcha

Requisitos: **Node.js 18+** y npm.

```bash
# Instalar dependencias
npm install

# Servidor de desarrollo (http://localhost:5173)
npm run dev

# Compilar para producción
npm run build

# Previsualizar la compilación
npm run preview
```

El proyecto usa `base: './'` y `createWebHashHistory()`, así que la carpeta `dist/` funciona en cualquier hosting estático (GitHub Pages, Netlify, Vercel, un servidor propio) sin configurar rewrites.

---

## 🗺️ Rutas

| Ruta | Vista | Descripción |
| --- | --- | --- |
| `/` | Panel | Meta diaria, racha, temas, recomendaciones y actividad. |
| `/practicar` | Practicar | Configuración de sesión, quiz adaptativo y resumen final. |
| `/laboratorio` | Laboratorio | Retos de JavaScript y CSS con ejecución real. |
| `/progreso` | Mi progreso | Dominio por tema, conceptos, historial, heatmap y logros. |
| `/mentor` | Mentor IA | Chat con base local o modelo externo. |
| `/ajustes` | Ajustes | Perfil, preferencias, IA, respaldo y reinicio. |
| `*` | 404 | Página no encontrada con atajos útiles. |

---

## 🧠 Cómo funciona el motor adaptativo

### 1. Habilidad por tema

Cada tecnología (`javascript`, `vue`, `css`) tiene una habilidad estimada entre **1 y 5**, que empieza en `2.5`. Tras cada respuesta se actualiza con una variante de Elo:

```js
expected = 1 / (1 + Math.exp(-(ability - difficulty) * 1.1))
nextAbility = clamp(ability + 0.42 * (result - expected), 1, 5)
```

Acertar una pregunta difícil sube más la habilidad; fallar una fácil la baja más. El resultado se suaviza para evitar saltos bruscos.

### 2. Selección de la siguiente pregunta

Para cada pregunta disponible se calcula un peso:

- **Cercanía a la habilidad actual** con una gaussiana centrada en `ability + 0.15` (zona de desarrollo próximo).
- **Refuerzo de conceptos débiles** — si el concepto tiene bajo dominio, el peso se multiplica hasta por `1.85`.
- **Repaso espaciado** — si el concepto está vencido (`dueAt <= ahora`), el peso se multiplica por `1.55`.
- **Novedad** — los conceptos nunca vistos reciben un pequeño impulso.
- **Variación aleatoria** (±15 %) para que dos sesiones no sean idénticas.

La elección final es un muestreo ponderado, no el máximo absoluto: así el aprendizaje no se vuelve predecible.

### 3. Anti-repetición

- Cada respuesta guarda su `id` en `progress.seen`.
- La selección excluye las preguntas ya usadas **en la sesión actual**.
- Si se agota el banco de un tema, se abre un **nuevo ciclo**: se priorizan las preguntas vistas hace más tiempo y se incrementa el contador `cycles` del tema.

### 4. Modo mezcla

Cuando eliges "Mezcla adaptativa", primero se elige un tema con peso inverso a su dominio y se penaliza repetir el tema anterior. Después se aplica la selección normal dentro de ese tema.

### 5. Dominio y repaso

Cada concepto actualiza su dominio con un promedio exponencial:

```js
mastery = clamp(mastery + 0.28 * (acierto - mastery), 0.05, 0.98)
```

El intervalo de repaso crece al acertar y se reinicia al fallar. El panel de progreso mezcla este dato con la habilidad global para estabilizar las primeras sesiones.

---

## 🤖 Mentor IA

### Modo local (por defecto)

Funciona sin conexión. Incluye una base de conocimiento sobre JavaScript, Vue, CSS, errores comunes y hábitos de estudio, con búsqueda por palabras clave e intenciones. Si hay un quiz activo y preguntas por la pregunta actual, responde con el contexto del ejercicio.

### Modo remoto (opcional)

En **Ajustes → Mentor IA** puedes configurar:

- **URL base** compatible con OpenAI (por ejemplo `https://api.openai.com/v1`).
- **Modelo** (por ejemplo `gpt-4o-mini`).
- **Clave API**.

Hay presets para OpenAI, OpenRouter y Groq. La app llama directamente a `${baseUrl}/chat/completions` desde el navegador.

> ⚠️ **CORS y seguridad**
>
> - La clave se guarda **solo en `localStorage`** y se envía directamente al proveedor. Nunca pasa por un servidor de CodeQuest (no existe).
> - Algunos proveedores bloquean peticiones desde el navegador por CORS. En ese caso, usa un proveedor que lo permita o un proxy propio.
> - No uses claves de producción en equipos compartidos. Si algo falla, CodeQuest responde automáticamente con el mentor local.

---

## 🧪 Laboratorio

### JavaScript

- El código se ejecuta dentro de un **Web Worker** creado con un `Blob`.
- Un timeout de **2,5 segundos** termina ejecuciones infinitas.
- `console.log`, `info`, `warn` y `error` se capturan y se comparan con la salida esperada.
- El worker está aislado del DOM y del resto de la aplicación.

### CSS

- La vista previa se renderiza en un `<iframe sandbox="">` con `srcdoc`.
- El CSS del estudiante se inyecta junto a una base visual segura.
- Los objetivos se validan con expresiones regulares sobre el CSS escrito (por ejemplo `display: flex` o `grid-template-columns: repeat(3, 1fr)`).
- La vista previa se actualiza con un pequeño debounce para no recargar en cada tecla.

Las soluciones superadas se guardan en `codequest.lab.v1`.

---

## 📁 Estructura del proyecto

```text
.
├── index.html
├── package.json
├── vite.config.js
└── src
    ├── App.vue                  # Shell, FAB del mentor, onboarding, reduced motion
    ├── main.js
    ├── assets/styles/main.css   # Tokens de diseño y estilos globales
    ├── components/              # Sidebar, topbar, nav móvil, tarjetas, iconos…
    ├── composables/
    │   └── useAdaptiveQuiz.js   # Motor de sesión y selección adaptativa
    ├── data/
    │   ├── achievements.js      # 14 logros con progreso y condición
    │   ├── challenges.js        # Retos del laboratorio JS/CSS
    │   ├── knowledge.js         # Base del mentor local y prompts
    │   └── questions.js         # 60 preguntas (20 por tema, 4 por nivel)
    ├── router/index.js
    ├── stores/
    │   ├── useAssistant.js      # Chat, IA local/remota y persistencia
    │   └── useProgress.js       # XP, niveles, dominio, logros, respaldo
    ├── utils/                   # Formato, Markdown, sonido y runner del worker
    └── views/                   # Panel, Practicar, Laboratorio, Progreso,
                                 # Mentor, Ajustes y 404
```

### Banco de preguntas

`src/data/questions.js` contiene **60 preguntas**:

- 20 de JavaScript, 20 de Vue.js y 20 de CSS.
- 4 preguntas por cada nivel de dificultad (1 a 5) en cada tema.
- Cada pregunta incluye `prompt`, 4 `options`, `answer`, `explanation`, `hint` y `concept`.

Para añadir preguntas basta con seguir ese formato y mantener el `id` único. El motor las detectará automáticamente.

---

## 💾 Persistencia y respaldo

| Clave de `localStorage` | Contenido |
| --- | --- |
| `codequest.progress.v1` | Perfil, XP, racha, habilidad, conceptos, logros, sesiones, IA |
| `codequest.chat.v1` | Últimos 60 mensajes del mentor |
| `codequest.socratic.v1` | Preferencia del modo socrático |
| `codequest.lab.v1` | Retos del laboratorio superados |
| `codequest.onboarded` | Marca de onboarding completado |

En **Ajustes → Datos y respaldo** puedes:

- Descargar un JSON con todo tu progreso.
- Importarlo en otro navegador o tras limpiar los datos.
- Vaciar el chat del mentor.
- Borrar las soluciones del laboratorio.
- Reiniciar el progreso conservando tu perfil y la configuración de IA.

> El reinicio no borra el chat ni el laboratorio; usa los botones específicos para eso.

---

## ♿ Accesibilidad y rendimiento

- Navegación por teclado con `:focus-visible` y enlace para saltar al contenido.
- Roles y etiquetas ARIA en tabs, switches, diálogos y regiones dinámicas.
- Respeto de `prefers-reduced-motion` y opción manual para reducir movimiento.
- Iconos SVG inline sin dependencias externas.
- Carga diferida de vistas con `import()` en el router.
- Sin fuentes ni scripts de terceros más allá de Google Fonts.

---

## ⚠️ Limitaciones conocidas

- El progreso es local al navegador: no se sincroniza entre dispositivos.
- El banco actual tiene 60 preguntas; al agotarse un tema se abren ciclos de repaso.
- La ejecución de JavaScript es para ejercicios síncronos y promesas simples; no hay DOM ni módulos.
- La validación de CSS es heurística (regex), no un parser completo.
- El mentor remoto depende de CORS y de la disponibilidad del proveedor.

---

## 🛣️ Roadmap

- [ ] Más preguntas y nuevos temas (TypeScript, accesibilidad, Git).
- [ ] Editor con resaltado de sintaxis y números de línea.
- [ ] Tests unitarios para el motor adaptativo y los objetivos del laboratorio.
- [ ] Sincronización opcional mediante un backend ligero.
- [ ] Modo oscuro/claro y temas de color.
- [ ] Exportación de un informe de progreso en PDF.
- [ ] PWA instalable con soporte offline completo.

---

## 🤝 Contribuir

1. Haz un fork y crea una rama con un nombre descriptivo.
2. Mantén el estilo del proyecto: `<script setup>`, CSS con variables, textos en español y componentes pequeños.
3. Verifica que `npm run build` termina sin errores.
4. Abre un pull request explicando el cambio y, si aplica, añade preguntas o retos nuevos.

---

Hecho con Vue 3, curiosidad y bastante café. Si CodeQuest te ayuda a entender algo que antes parecía magia, ya valió la pena.
