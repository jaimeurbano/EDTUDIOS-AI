# CodeQuizz-AI

> Aprende JavaScript, Vue.js y CSS con quizzes que se adaptan a ti, un mentor disponible 24/7 y retos de código en vivo.

CodeQuizz-AI es una plataforma de aprendizaje construida con **Vue 3**. Puede funcionar de dos formas:

- **Modo local:** sin backend ni cuentas. Todo el progreso vive en el navegador.
- **Modo nube:** con **Supabase** (Postgres + Auth gratis). Cada estudiante inicia sesión desde cualquier dispositivo y el docente ve el progreso real de su clase.

El motor de práctica ajusta la dificultad pregunta a pregunta, evita repetir ejercicios y prioriza justo los conceptos que más cuestan.

---

## ✨ Características

- **Quiz adaptativo real** — un modelo de habilidad por tecnología estima tu nivel y elige la siguiente pregunta en tu zona de desarrollo próximo.
- **Sin repetición** — cada pregunta respondida se marca como vista. Solo vuelve a aparecer cuando se agota el banco del tema, y en ese caso prioriza las vistas hace más tiempo.
- **Repaso espaciado** — los conceptos fallados vuelven antes; los dominados se espacian con intervalos de 1, 3, 7, 14, 30 y 60 días.
- **Modo mezcla** — sesiones que alternan JavaScript, Vue y CSS dando más peso a los temas con menor dominio.
- **Mentor IA** — base de conocimiento local con búsqueda por intención y modo socrático. Opcionalmente puedes conectar cualquier API compatible con OpenAI.
- **Laboratorio de código** — retos de JavaScript ejecutados en un Web Worker aislado y retos de CSS con vista previa en vivo.
- **Gamificación** — XP, niveles, rachas, meta diaria, combos, 14 logros y un mapa de constancia de 28 días.
- **Cuentas y sincronización** — login con correo y contraseña, progreso en la nube y continuidad entre dispositivos.
- **Panel docente** — clases con código de invitación, lista de estudiantes, XP, precisión, racha, actividad reciente y desglose por tema.
- **Privacidad por diseño** — Row Level Security: cada estudiante solo ve sus datos y cada docente solo ve los estudiantes de sus propias clases. La clave del mentor IA nunca se sube a la nube.
- **Diseño oscuro tipo neón** — sistema de diseño con variables CSS, sidebar responsive, navegación móvil, animaciones suaves y soporte de `prefers-reduced-motion`.

---

## 🧱 Stack

| Capa | Tecnología |
| --- | --- |
| UI | Vue 3 (`<script setup>`, Composition API) |
| Build | Vite 6 |
| Rutas | Vue Router 4 (hash history) |
| Estado | Stores reactivos propios (`reactive` + `computed`) |
| Estilos | CSS puro con variables y `scoped styles` |
| Persistencia local | `localStorage` |
| Backend opcional | Supabase (Postgres + Auth + RLS) |
| IA | Base local + API compatible con OpenAI (opcional) |

Sin Pinia, sin framework CSS y sin dependencias de UI. El modo local sigue funcionando aunque no configures Supabase.

---

## 🚀 Puesta en marcha

Requisitos: **Node.js 18+** y npm.

```bash
# Instalar dependencias
npm install

# Servidor de desarrollo (http://localhost:5173)
npm run dev

# Servidor accesible desde otros dispositivos de la red local
npm run dev -- --host 0.0.0.0

# Compilar para producción
npm run build

# Previsualizar la compilación
npm run preview
```

El proyecto usa `base: './'` y `createWebHashHistory()`, así que la carpeta `dist/` funciona en cualquier hosting estático (GitHub Pages, Netlify, Vercel, Cloudflare Pages, un servidor propio) sin configurar rewrites.

### Modo local (sin backend)

Si no existe `.env.local` o faltan `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`, CodeQuizz-AI arranca en modo local:

- No hay pantalla de login.
- El progreso se guarda en `localStorage`.
- El panel docente muestra las instrucciones de configuración.

### Modo nube (recomendado para clases)

Sigue la sección **Backend con Supabase** de más abajo.

---

## 🔐 Backend con Supabase (cuentas y panel docente)

Supabase ofrece un plan gratuito con Postgres, autenticación y políticas RLS. No hay que mantener ningún servidor propio.

### 1. Crear el proyecto

1. Entra en [supabase.com](https://supabase.com) y crea un proyecto gratuito.
2. Espera a que termine el aprovisionamiento.

### 2. Crear las tablas y políticas

1. Abre **SQL Editor** en el panel de Supabase.
2. Copia y ejecuta el contenido completo de [`supabase/schema.sql`](supabase/schema.sql).

El script crea:

| Tabla | Contenido |
| --- | --- |
| `profiles` | `id`, `email`, `full_name`, `role` (`student` / `teacher`) |
| `student_progress` | Progreso completo del estudiante en una columna `jsonb` |
| `classrooms` | Clases con nombre, código de 6 caracteres y docente |
| `classroom_members` | Relación estudiante ↔ clase |

También crea las funciones `create_classroom`, `join_classroom`, `leave_classroom`, los triggers de alta de perfil y todas las políticas RLS.

### 3. Configurar el correo de autenticación

En **Authentication → Providers → Email**:

- **Para uso en clase:** desactiva **Confirm email** para que los estudiantes entren de inmediato.
- **Si prefieres confirmar correos:** configura **Authentication → URL Configuration → Site URL** y añade tu dominio de producción en **Redirect URLs**.

Sin esto, el registro puede quedar pendiente de confirmación y el estudiante no podrá iniciar sesión.

### 4. Conectar la app

1. Copia `.env.example` a `.env.local`.
2. En **Project Settings → API** copia:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public key** → `VITE_SUPABASE_ANON_KEY`

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-anonima
```

3. Reinicia el servidor de desarrollo.

> ⚠️ **Nunca** pongas la clave `service_role` en el frontend ni en `.env.local`. Esa clave omite RLS. La clave `anon` es pública y está protegida por las políticas del esquema.

### 5. Promover una cuenta a docente

El rol **nunca** se acepta desde el registro. Después de que la persona cree su cuenta, ejecuta en el **SQL Editor**:

```sql
update public.profiles
set role = 'teacher'
where email = 'docente@correo.com';
```

Luego pide que cierre y vuelva a iniciar sesión para que la app reciba el rol actualizado.

### 6. Flujo de una clase

1. El docente entra a **Panel docente** y crea una clase (por ejemplo `8°B`).
2. La app genera un código de 6 caracteres, por ejemplo `A1B2C3`.
3. El docente comparte el código con sus estudiantes.
4. Cada estudiante inicia sesión, va a **Ajustes → Cuenta y sincronización**, escribe el código y pulsa **Unirme**.
5. El progreso se sincroniza automáticamente. El docente puede refrescar el panel y ver XP, precisión, racha, última actividad y desglose por tema.

### 7. Seguridad y RLS

- `profiles`: cada usuario ve su perfil; un docente ve los perfiles de estudiantes de sus clases.
- `student_progress`: solo el estudiante dueño o su docente pueden leerlo.
- `classrooms`: solo el docente dueño y los estudiantes inscritos.
- `classroom_members`: solo el estudiante y el docente de esa clase.
- Las funciones auxiliares son `security definer` para evitar recursión en las políticas.
- Un trigger impide que un usuario autenticado se cambie el rol a sí mismo.
- La sincronización aplica **last-write-wins** y elimina `ai.apiKey` antes de subir el progreso.
- Al cerrar sesión se limpian progreso, chat, laboratorio y preferencias locales de ese dispositivo.

### 8. Despliegue

1. Compila con `npm run build`.
2. Sube `dist/` a Netlify, Vercel, Cloudflare Pages o cualquier hosting estático.
3. Configura las mismas variables `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` en el hosting.
4. Añade la URL pública en **Supabase → Authentication → URL Configuration**.

### 9. Plan gratuito

- 500 MB de base de datos, 50 000 usuarios activos mensuales y 5 GB de tráfico.
- Los proyectos gratuitos pueden pausarse tras un periodo de inactividad; se reactivan desde el panel.
- Para una clase típica, el consumo es mínimo: el progreso es un único JSON por estudiante.

---

## 🗺️ Rutas

| Ruta | Vista | Descripción |
| --- | --- | --- |
| `/login` | Iniciar sesión | Acceso con correo y contraseña (modo nube). |
| `/registro` | Crear cuenta | Registro de estudiantes y docentes. |
| `/` | Panel | Meta diaria, racha, temas, recomendaciones y actividad. |
| `/practicar` | Practicar | Configuración de sesión, quiz adaptativo y resumen final. |
| `/laboratorio` | Laboratorio | Retos de JavaScript y CSS con ejecución real. |
| `/progreso` | Mi progreso | Dominio por tema, conceptos, historial, heatmap y logros. |
| `/mentor` | Mentor IA | Chat con base local o modelo externo. |
| `/docente` | Panel docente | Clases, códigos y progreso de estudiantes (solo docentes). |
| `/ajustes` | Ajustes | Cuenta, clases, perfil, preferencias, IA y respaldo. |
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
> - La clave se guarda **solo en `localStorage`** y se envía directamente al proveedor. Nunca pasa por un servidor de CodeQuizz-AI ni se sube a Supabase.
> - Algunos proveedores bloquean peticiones desde el navegador por CORS. En ese caso, usa un proveedor que lo permita o un proxy propio.
> - No uses claves de producción en equipos compartidos. Si algo falla, CodeQuizz-AI responde automáticamente con el mentor local.

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
├── .env.example
├── supabase
│   └── schema.sql               # Tablas, RLS, triggers y RPCs
└── src
    ├── App.vue                  # Shell, layout de auth, FAB, onboarding
    ├── main.js                  # Bootstrap: initAuth → initCloudSync → montar
    ├── assets/styles/main.css   # Tokens de diseño y estilos globales
    ├── components/              # Sidebar, topbar, nav móvil, tarjetas, iconos…
    ├── composables/
    │   └── useAdaptiveQuiz.js   # Motor de sesión y selección adaptativa
    ├── data/
    │   ├── achievements.js      # 14 logros con progreso y condición
    │   ├── challenges.js        # Retos del laboratorio JS/CSS
    │   ├── knowledge.js         # Base del mentor local y prompts
    │   └── questions.js         # 60 preguntas (20 por tema, 4 por nivel)
    ├── lib/
    │   └── supabase.js          # Cliente y detección de configuración
    ├── router/index.js          # Rutas y guards de auth/docente
    ├── stores/
    │   ├── useAssistant.js      # Chat, IA local/remota y persistencia
    │   ├── useAuth.js           # Sesión, perfil y rol
    │   ├── useCloud.js          # Clases y progreso de estudiantes
    │   ├── useCloudSync.js      # Pull/push del progreso y limpieza
    │   └── useProgress.js       # XP, niveles, dominio, logros, respaldo
    ├── utils/                   # Formato, Markdown, sonido y runner del worker
    └── views/                   # Login, Panel, Practicar, Laboratorio,
                                 # Progreso, Mentor, Docente, Ajustes y 404
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
| `codequest.lastUser` | Último usuario de Supabase en este navegador |
| `codequest.localUpdatedAt` | Marca de tiempo del último cambio local para resolver conflictos |

En **Ajustes → Datos y respaldo** puedes:

- Descargar un JSON con todo tu progreso.
- Importarlo en otro navegador o tras limpiar los datos.
- Vaciar el chat del mentor.
- Borrar las soluciones del laboratorio.
- Reiniciar el progreso conservando tu perfil y la configuración de IA.

En modo nube, **Ajustes → Cuenta y sincronización** añade:

- Estado de sincronización y botón **Sincronizar ahora**.
- Unirse o salir de clases con código.
- Acceso directo al panel docente.
- Cierre de sesión con limpieza de datos locales.

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

- El modo nube requiere configurar Supabase; sin credenciales la app funciona solo en local.
- La sincronización usa **last-write-wins** por estudiante. No está pensada para editar el mismo progreso en dos dispositivos a la vez.
- El panel docente muestra el progreso tal como lo sube cada estudiante; no hay validación anti-trampa.
- Los proyectos gratuitos de Supabase pueden pausarse por inactividad.
- El banco actual tiene 60 preguntas; al agotarse un tema se abren ciclos de repaso.
- La ejecución de JavaScript es para ejercicios síncronos y promesas simples; no hay DOM ni módulos.
- La validación de CSS es heurística (regex), no un parser completo.
- El mentor remoto depende de CORS y de la disponibilidad del proveedor.

---

## 🛣️ Roadmap

- [x] Cuentas, sincronización en la nube y panel docente con Supabase.
- [ ] Más preguntas y nuevos temas (TypeScript, accesibilidad, Git).
- [ ] Editor con resaltado de sintaxis y números de línea.
- [ ] Tests unitarios para el motor adaptativo y los objetivos del laboratorio.
- [ ] Informes de clase exportables en CSV/PDF.
- [ ] Modo oscuro/claro y temas de color.
- [ ] PWA instalable con soporte offline completo.

---

## 🤝 Contribuir

1. Haz un fork y crea una rama con un nombre descriptivo.
2. Mantén el estilo del proyecto: `<script setup>`, CSS con variables, textos en español y componentes pequeños.
3. Verifica que `npm run build` termina sin errores.
4. Si tocas el backend, actualiza `supabase/schema.sql` y prueba las políticas RLS con dos cuentas distintas.
5. Abre un pull request explicando el cambio y, si aplica, añade preguntas o retos nuevos.

---

Hecho con Vue 3, curiosidad y bastante café. Si CodeQuizz-AI te ayuda a entender algo que antes parecía magia, ya valió la pena.
