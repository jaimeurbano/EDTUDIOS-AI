<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import AppIcon from '../components/AppIcon.vue'
import { isSupabaseConfigured } from '../lib/supabase'
import { assistant, clearChat, setSocratic } from '../stores/useAssistant'
import {
  accountName,
  auth,
  isTeacher,
  signOut,
  updateAccountName,
} from '../stores/useAuth'
import {
  cloud,
  joinClassroom,
  leaveClassroom,
  loadMyClassrooms,
} from '../stores/useCloud'
import { cloudSync, syncNow } from '../stores/useCloudSync'
import {
  accuracy,
  exportProgress,
  importProgress,
  levelInfo,
  progress,
  resetProgress,
  updateAI,
  updateProfile,
} from '../stores/useProgress'
import { formatNumber, timeAgo } from '../utils/format'
import { playFeedback } from '../utils/sound'

const router = useRouter()

const LAB_KEY = 'codequest.lab.v1'
const GOAL_PRESETS = [60, 120, 200, 300]
const QUIZ_LENGTHS = [
  { value: 6, label: 'Rápida', detail: '6 preguntas' },
  { value: 8, label: 'Equilibrada', detail: '8 preguntas' },
  { value: 12, label: 'Intensa', detail: '12 preguntas' },
]
const AI_PRESETS = [
  { name: 'OpenAI', baseUrl: 'https://api.openai.com/v1', model: 'gpt-4o-mini' },
  { name: 'OpenRouter', baseUrl: 'https://openrouter.ai/api/v1', model: 'openai/gpt-4o-mini' },
  { name: 'Groq', baseUrl: 'https://api.groq.com/openai/v1', model: 'llama-3.3-70b-versatile' },
]

const showKey = ref(false)
const confirmReset = ref(false)
const fileInput = ref(null)
const notice = ref(null)
const testState = ref('idle')
const testMessage = ref('')
const joinCode = ref('')
const joinError = ref('')
const joining = ref(false)
const signingOut = ref(false)
const syncingNow = ref(false)

const cloudConfigured = isSupabaseConfigured
const accountEmail = computed(() => auth.user?.email || '')
const roleLabel = computed(() => (isTeacher.value ? 'Docente' : 'Estudiante'))
const syncLabel = computed(() => {
  if (cloudSync.status === 'syncing') return 'Sincronizando cambios…'
  if (cloudSync.status === 'error') return cloudSync.error || 'No se pudo sincronizar.'
  if (cloudSync.lastSyncedAt) {
    return `Última sincronización: ${timeAgo(cloudSync.lastSyncedAt)}.`
  }
  if (cloudSync.status === 'synced') return 'Progreso sincronizado con la nube.'
  return 'Tu progreso se guardará en la nube automáticamente.'
})

let noticeTimer = null
let testController = null

const displayName = computed(() => progress.profile.name || 'Explorador')
const initials = computed(() =>
  displayName.value
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase(),
)
const isRemote = computed(() => progress.ai.mode === 'remote')
const remoteReady = computed(
  () =>
    Boolean(progress.ai.apiKey) &&
    Boolean(progress.ai.baseUrl) &&
    Boolean(progress.ai.model),
)

const name = computed({
  get: () => progress.profile.name,
  set: (value) => updateProfile({ name: String(value || '').slice(0, 24) }),
})
const dailyGoal = computed({
  get: () => progress.profile.dailyGoal || 120,
  set: (value) => updateProfile({ dailyGoal: Math.min(400, Math.max(20, Number(value) || 120)) }),
})
const quizLength = computed({
  get: () => progress.profile.quizLength || 8,
  set: (value) => updateProfile({ quizLength: Number(value) || 8 }),
})
const baseUrl = computed({
  get: () => progress.ai.baseUrl,
  set: (value) => updateAI({ baseUrl: String(value || '') }),
})
const model = computed({
  get: () => progress.ai.model,
  set: (value) => updateAI({ model: String(value || '') }),
})
const apiKey = computed({
  get: () => progress.ai.apiKey,
  set: (value) => updateAI({ apiKey: String(value || '') }),
})

function showNotice(type, text) {
  notice.value = { type, text }
  clearTimeout(noticeTimer)
  noticeTimer = setTimeout(() => {
    notice.value = null
  }, 7000)
}

function ensureName() {
  if (!name.value.trim()) updateProfile({ name: 'Explorador' })
  else updateProfile({ name: name.value.trim() })
  if (cloudConfigured && auth.user) {
    updateAccountName(name.value.trim() || accountName.value)
  }
}

function toggleSound() {
  const next = !progress.profile.sound
  updateProfile({ sound: next })
  if (next) playFeedback('correct', true)
}

function toggleMotion() {
  updateProfile({ reducedMotion: !progress.profile.reducedMotion })
}

function toggleSocratic() {
  setSocratic(!assistant.socratic)
}

function setAIMode(nextMode) {
  updateAI({ mode: nextMode })
  testState.value = 'idle'
  testMessage.value = ''
}

function applyPreset(preset) {
  updateAI({ mode: 'remote', baseUrl: preset.baseUrl, model: preset.model })
  testState.value = 'idle'
  testMessage.value = ''
}

async function testConnection() {
  if (testState.value === 'testing') return
  if (!remoteReady.value) {
    testState.value = 'error'
    testMessage.value = 'Completa la URL base, el modelo y la clave antes de probar.'
    return
  }

  testState.value = 'testing'
  testMessage.value = 'Enviando una petición mínima al proveedor…'
  testController = new AbortController()
  const timer = setTimeout(() => testController.abort(), 20000)

  try {
    const response = await fetch(`${progress.ai.baseUrl.replace(/\/+$/, '')}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${progress.ai.apiKey}`,
      },
      body: JSON.stringify({
        model: progress.ai.model,
        max_tokens: 8,
        messages: [{ role: 'user', content: 'Responde solo con: ok' }],
      }),
      signal: testController.signal,
    })

    if (!response.ok) {
      const detail = await response.text().catch(() => '')
      throw new Error(`HTTP ${response.status}${detail ? ` · ${detail.slice(0, 100)}` : ''}`)
    }

    const data = await response.json()
    if (!data?.choices?.[0]?.message) throw new Error('El proveedor no devolvió una respuesta válida.')
    testState.value = 'ok'
    testMessage.value = 'Conexión correcta. El mentor ya puede usar este modelo.'
  } catch (error) {
    testState.value = 'error'
    testMessage.value = `No se pudo conectar: ${
      error.name === 'AbortError' ? 'tiempo de espera agotado' : error.message
    }. Revisa la URL, el modelo, la clave y las restricciones CORS del proveedor.`
  } finally {
    clearTimeout(timer)
    testController = null
  }
}

function exportData() {
  try {
    const blob = new Blob([exportProgress()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `codequizz-ai-respaldo-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
    showNotice('success', 'Respaldo descargado. Guárdalo en un lugar seguro.')
  } catch {
    showNotice('error', 'No se pudo generar el respaldo.')
  }
}

function openImport() {
  fileInput.value?.click()
}

async function handleImport(event) {
  const file = event.target.files?.[0]
  event.target.value = ''
  if (!file) return
  try {
    const raw = await file.text()
    importProgress(raw)
    showNotice('success', 'Progreso importado correctamente. Tus datos se actualizaron.')
  } catch (error) {
    showNotice('error', error.message || 'El archivo no es un respaldo válido de CodeQuizz-AI.')
  }
}

function doReset() {
  resetProgress()
  confirmReset.value = false
  showNotice('success', 'Progreso reiniciado. Tu perfil y la configuración de IA se conservan.')
}

function wipeChat() {
  if (!window.confirm('¿Vaciar la conversación con el mentor? Esta acción no se puede deshacer.')) {
    return
  }
  clearChat()
  showNotice('success', 'La conversación con el mentor se vació.')
}

function wipeLab() {
  if (!window.confirm('¿Borrar las soluciones guardadas del laboratorio? Esta acción no se puede deshacer.')) {
    return
  }
  try {
    localStorage.removeItem(LAB_KEY)
  } catch {
    /* ignore */
  }
  showNotice('success', 'Las soluciones guardadas del laboratorio se borraron.')
}

async function handleJoinClass() {
  const code = joinCode.value.trim().toUpperCase()
  if (code.length < 4) {
    joinError.value = 'Escribe el código que te dio tu docente.'
    return
  }
  joining.value = true
  joinError.value = ''
  try {
    await joinClassroom(code)
    joinCode.value = ''
    showNotice('success', 'Te uniste a la clase. Tu progreso ya está vinculado.')
  } catch (error) {
    joinError.value = error.message
  } finally {
    joining.value = false
  }
}

async function handleLeaveClass(classroomId) {
  if (!window.confirm('¿Salir de esta clase? Tu progreso se conserva.')) return
  try {
    await leaveClassroom(classroomId)
    showNotice('success', 'Saliste de la clase.')
  } catch (error) {
    showNotice('error', error.message)
  }
}

async function handleSyncNow() {
  if (syncingNow.value) return
  syncingNow.value = true
  try {
    const ok = await syncNow()
    if (ok) showNotice('success', 'Progreso sincronizado con la nube.')
    else showNotice('error', cloudSync.error || 'No se pudo sincronizar el progreso.')
  } finally {
    syncingNow.value = false
  }
}

async function handleSignOut() {
  if (
    !window.confirm(
      '¿Cerrar sesión? Se borrarán los datos locales de este estudiante en este dispositivo.',
    )
  ) {
    return
  }
  signingOut.value = true
  try {
    await signOut()
    await router.push({ name: 'login' })
  } catch (error) {
    showNotice('error', error.message)
  } finally {
    signingOut.value = false
  }
}

onMounted(() => {
  if (cloudConfigured && auth.user) {
    loadMyClassrooms().catch(() => {})
  }
})

onBeforeUnmount(() => {
  clearTimeout(noticeTimer)
  if (testController) testController.abort()
})
</script>

<template>
  <div class="settings-view">
    <header class="page-head animate-in">
      <div>
        <span class="eyebrow">Ajustes</span>
        <h1>Haz CodeQuizz-AI <span class="gradient-text">a tu medida</span></h1>
        <p v-if="cloudConfigured">
          Tu perfil, tu ritmo y tu mentor, sincronizados en la nube para que continúes en
          cualquier dispositivo.
        </p>
        <p v-else>
          Tu perfil, tu ritmo y tu mentor. Todo se guarda automáticamente en este navegador,
          sin cuentas ni servidores.
        </p>
      </div>
      <span class="chip chip-brand">
        <AppIcon :name="cloudConfigured ? 'cloud' : 'shield'" :size="14" />
        {{ cloudConfigured ? 'Sincronización en la nube' : 'Guardado automático' }}
      </span>
    </header>

    <Transition name="slide">
      <div v-if="notice" class="notice" :class="notice.type" role="status">
        <AppIcon :name="notice.type === 'success' ? 'check' : 'alert'" :size="16" />
        <span>{{ notice.text }}</span>
        <button
          type="button"
          class="notice-close"
          aria-label="Cerrar aviso"
          @click="notice = null"
        >
          <AppIcon name="x" :size="14" />
        </button>
      </div>
    </Transition>

    <div class="settings-layout animate-in delay-1">
      <div class="stack">
        <section class="card settings-card account-card">
          <div class="settings-head">
            <span class="settings-icon settings-icon-blue">
              <AppIcon name="cloud" :size="20" />
            </span>
            <div>
              <h2>Cuenta y sincronización</h2>
              <p v-if="cloudConfigured">
                Tu progreso se guarda en Supabase y te sigue en cualquier dispositivo.
              </p>
              <p v-else>
                Modo local: el progreso vive solo en este navegador. Conecta Supabase para usar
                cuentas y el panel docente.
              </p>
            </div>
          </div>

          <div class="settings-body">
            <template v-if="cloudConfigured && auth.user">
              <div class="account-row">
                <div class="account-identity">
                  <span class="account-avatar">{{ initials }}</span>
                  <div>
                    <strong>{{ accountName }}</strong>
                    <small>{{ accountEmail }}</small>
                  </div>
                </div>
                <span class="chip" :class="isTeacher ? 'chip-violet' : 'chip-brand'">
                  <AppIcon :name="isTeacher ? 'graduation' : 'user'" :size="13" />
                  {{ roleLabel }}
                </span>
              </div>

              <div class="sync-row">
                <div>
                  <strong class="sync-title">Sincronización</strong>
                  <p class="help" :class="{ 'sync-error': cloudSync.status === 'error' }">
                    {{ syncLabel }}
                  </p>
                </div>
                <button
                  type="button"
                  class="btn btn-outline btn-sm"
                  :disabled="syncingNow || cloudSync.status === 'syncing'"
                  @click="handleSyncNow"
                >
                  <AppIcon
                    name="refresh"
                    :size="14"
                    :class="{ spin: syncingNow || cloudSync.status === 'syncing' }"
                  />
                  {{ syncingNow || cloudSync.status === 'syncing' ? 'Sincronizando…' : 'Sincronizar ahora' }}
                </button>
              </div>

              <div v-if="isTeacher" class="account-actions">
                <RouterLink to="/docente" class="btn btn-primary btn-sm">
                  <AppIcon name="users" :size="15" />
                  Ir al panel docente
                </RouterLink>
                <span class="help">Crea clases y revisa el progreso de tus estudiantes.</span>
              </div>

              <div v-else class="classroom-block">
                <h3 class="subhead">
                  <AppIcon name="graduation" :size="16" />
                  Mis clases
                </h3>

                <div v-if="cloud.classrooms.length" class="class-list">
                  <div v-for="room in cloud.classrooms" :key="room.id" class="class-pill">
                    <div>
                      <strong>{{ room.name }}</strong>
                      <small>Código {{ room.join_code }}</small>
                    </div>
                    <button
                      type="button"
                      class="btn btn-ghost btn-sm"
                      @click="handleLeaveClass(room.id)"
                    >
                      Salir
                    </button>
                  </div>
                </div>
                <p v-else class="help">
                  Aún no perteneces a ninguna clase. Pídele el código a tu docente.
                </p>

                <form class="join-form" @submit.prevent="handleJoinClass">
                  <input
                    v-model="joinCode"
                    class="input mono"
                    type="text"
                    maxlength="12"
                    placeholder="Código de clase (ej. A1B2C3)"
                    aria-label="Código de clase"
                  />
                  <button type="submit" class="btn btn-primary btn-sm" :disabled="joining">
                    <AppIcon :name="joining ? 'rotate' : 'plus'" :size="15" :class="{ spin: joining }" />
                    {{ joining ? 'Uniendo…' : 'Unirme' }}
                  </button>
                </form>
                <p v-if="joinError" class="join-error">{{ joinError }}</p>
              </div>

              <div class="account-actions account-signout">
                <button type="button" class="btn btn-ghost btn-sm" :disabled="signingOut" @click="handleSignOut">
                  <AppIcon name="logout" :size="15" />
                  {{ signingOut ? 'Cerrando sesión…' : 'Cerrar sesión' }}
                </button>
              </div>
            </template>

            <template v-else-if="!cloudConfigured">
              <ol class="setup-steps">
                <li>Crea un proyecto gratis en <strong>supabase.com</strong>.</li>
                <li>Ejecuta <code>supabase/schema.sql</code> en el SQL Editor.</li>
                <li>
                  Copia <code>.env.example</code> a <code>.env.local</code> con la URL y la anon
                  key de tu proyecto.
                </li>
                <li>Reinicia el servidor y promueve tu cuenta a docente si la necesitas.</li>
              </ol>
              <p class="help">
                Mientras tanto puedes seguir practicando: todo se guarda en este navegador.
              </p>
            </template>

            <template v-else>
              <p class="help">Inicia sesión para sincronizar tu progreso y unirte a tu clase.</p>
              <RouterLink to="/login" class="btn btn-primary btn-sm">
                <AppIcon name="chevron-right" :size="15" />
                Iniciar sesión
              </RouterLink>
            </template>
          </div>
        </section>

        <section class="card settings-card">
          <div class="settings-head">
            <span class="settings-icon"><AppIcon name="user" :size="20" /></span>
            <div>
              <h2>Perfil y ritmo</h2>
              <p>Así te saluda CodeQuizz-AI y cuánto quieres practicar cada día.</p>
            </div>
          </div>

          <div class="settings-body">
            <div class="grid grid-2 profile-fields">
              <div class="field">
                <label for="settings-name">Tu nombre</label>
                <input
                  id="settings-name"
                  v-model="name"
                  class="input"
                  type="text"
                  maxlength="24"
                  placeholder="Tu nombre o apodo"
                  autocomplete="given-name"
                  @blur="ensureName"
                />
                <span class="help">
                  {{
                    cloudConfigured
                      ? 'Se sincroniza con tu cuenta y se usa en el panel, el mentor y tus logros.'
                      : 'Se usa en el panel, el mentor y tus logros.'
                  }}
                </span>
              </div>

              <div class="field">
                <label for="settings-goal">Meta diaria de XP</label>
                <div class="goal-row">
                  <input
                    id="settings-goal"
                    v-model.number="dailyGoal"
                    class="range"
                    type="range"
                    min="20"
                    max="400"
                    step="10"
                  />
                  <span class="goal-value">{{ dailyGoal }} XP</span>
                </div>
                <div class="row wrap goal-presets">
                  <button
                    v-for="preset in GOAL_PRESETS"
                    :key="preset"
                    type="button"
                    class="chip preset"
                    :class="{ active: dailyGoal === preset }"
                    @click="dailyGoal = preset"
                  >
                    {{ preset }} XP
                  </button>
                </div>
              </div>
            </div>

            <div class="field">
              <span class="field-label">Duración de las sesiones de quiz</span>
              <div class="length-options">
                <button
                  v-for="option in QUIZ_LENGTHS"
                  :key="option.value"
                  type="button"
                  class="length-option"
                  :class="{ selected: quizLength === option.value }"
                  @click="quizLength = option.value"
                >
                  <strong>{{ option.value }}</strong>
                  <span>{{ option.label }}</span>
                  <small>{{ option.detail }}</small>
                </button>
              </div>
              <span class="help">
                El motor adaptativo ajusta la dificultad dentro de la sesión, sin importar la
                longitud que elijas.
              </span>
            </div>
          </div>
        </section>

        <section class="card settings-card">
          <div class="settings-head">
            <span class="settings-icon settings-icon-violet">
              <AppIcon name="spark" :size="20" />
            </span>
            <div>
              <h2>Experiencia</h2>
              <p>Pequeños detalles que cambian cómo se siente aprender aquí.</p>
            </div>
          </div>

          <div class="settings-body preferences">
            <div class="setting-row">
              <div>
                <strong>Sonidos de feedback</strong>
                <p class="help">Tonos suaves al acertar, fallar o subir de nivel.</p>
              </div>
              <button
                type="button"
                class="switch"
                role="switch"
                :aria-checked="progress.profile.sound"
                aria-label="Activar sonidos de feedback"
                @click="toggleSound"
              />
            </div>

            <div class="setting-row">
              <div>
                <strong>Reducir movimiento</strong>
                <p class="help">
                  Desactiva animaciones y transiciones. También respetamos la preferencia de tu
                  sistema operativo.
                </p>
              </div>
              <button
                type="button"
                class="switch"
                role="switch"
                :aria-checked="progress.profile.reducedMotion"
                aria-label="Reducir movimiento"
                @click="toggleMotion"
              />
            </div>

            <div class="setting-row">
              <div>
                <strong>Modo socrático del mentor</strong>
                <p class="help">
                  Cuando está activo, el mentor da pistas y preguntas guía en lugar de revelar la
                  respuesta del quiz.
                </p>
              </div>
              <button
                type="button"
                class="switch"
                role="switch"
                :aria-checked="assistant.socratic"
                aria-label="Activar modo socrático"
                @click="toggleSocratic"
              />
            </div>
          </div>
        </section>

        <section class="card settings-card">
          <div class="settings-head">
            <span class="settings-icon settings-icon-blue">
              <AppIcon name="wand" :size="20" />
            </span>
            <div>
              <h2>Mentor IA</h2>
              <p>
                Usa la base de conocimiento local o conecta cualquier API compatible con OpenAI.
              </p>
            </div>
          </div>

          <div class="settings-body">
            <div class="mode-options">
              <button
                type="button"
                class="mode-option"
                :class="{ active: !isRemote }"
                @click="setAIMode('local')"
              >
                <span class="mode-icon"><AppIcon name="brain" :size="19" /></span>
                <strong>Mentor local</strong>
                <p>Base de conocimiento incluida. Funciona sin conexión, sin claves y sin coste.</p>
                <span class="mode-tag">Recomendado</span>
              </button>

              <button
                type="button"
                class="mode-option"
                :class="{ active: isRemote }"
                @click="setAIMode('remote')"
              >
                <span class="mode-icon mode-icon-blue"><AppIcon name="wand" :size="19" /></span>
                <strong>Modelo externo</strong>
                <p>Respuestas abiertas con tu propia clave. Compatible con OpenAI, Groq u OpenRouter.</p>
                <span class="mode-tag mode-tag-blue">Tu clave</span>
              </button>
            </div>

            <Transition name="slide">
              <div v-if="isRemote" class="ai-config">
                <div class="row wrap preset-row">
                  <span class="tiny dim">Rellenar con:</span>
                  <button
                    v-for="preset in AI_PRESETS"
                    :key="preset.name"
                    type="button"
                    class="chip preset"
                    @click="applyPreset(preset)"
                  >
                    {{ preset.name }}
                  </button>
                </div>

                <div class="grid grid-2">
                  <div class="field">
                    <label for="ai-base">URL base (compatible con OpenAI)</label>
                    <input
                      id="ai-base"
                      v-model="baseUrl"
                      class="input mono"
                      type="url"
                      placeholder="https://api.openai.com/v1"
                      spellcheck="false"
                    />
                    <span class="help">CodeQuizz-AI añadirá <code>/chat/completions</code>.</span>
                  </div>

                  <div class="field">
                    <label for="ai-model">Modelo</label>
                    <input
                      id="ai-model"
                      v-model="model"
                      class="input mono"
                      type="text"
                      placeholder="gpt-4o-mini"
                      spellcheck="false"
                    />
                    <span class="help">Debe existir en el proveedor que elijas.</span>
                  </div>
                </div>

                <div class="field">
                  <label for="ai-key">Clave API</label>
                  <div class="secret-row">
                    <input
                      id="ai-key"
                      v-model="apiKey"
                      class="input mono"
                      :type="showKey ? 'text' : 'password'"
                      placeholder="sk-…"
                      autocomplete="off"
                      spellcheck="false"
                    />
                    <button
                      type="button"
                      class="secret-toggle"
                      :aria-label="showKey ? 'Ocultar clave' : 'Mostrar clave'"
                      @click="showKey = !showKey"
                    >
                      <AppIcon :name="showKey ? 'eye' : 'lock'" :size="16" />
                    </button>
                  </div>
                  <span class="help">
                    La clave se guarda solo en <code>localStorage</code> de este navegador y viaja
                    directamente al proveedor. Nunca pasa por un servidor de CodeQuizz-AI.
                  </span>
                </div>

                <div class="test-row">
                  <button
                    type="button"
                    class="btn btn-outline"
                    :disabled="testState === 'testing'"
                    @click="testConnection"
                  >
                    <AppIcon
                      :name="testState === 'testing' ? 'rotate' : 'bolt'"
                      :size="15"
                      :class="{ spin: testState === 'testing' }"
                    />
                    {{ testState === 'testing' ? 'Probando…' : 'Probar conexión' }}
                  </button>
                  <p
                    v-if="testMessage"
                    class="test-message"
                    :class="testState"
                    role="status"
                  >
                    {{ testMessage }}
                  </p>
                </div>

                <div v-if="!remoteReady" class="ai-warning">
                  <AppIcon name="info" :size="15" />
                  <span>
                    Mientras falte la clave, la URL o el modelo, el mentor responderá con la base
                    local.
                  </span>
                </div>
              </div>
            </Transition>
          </div>
        </section>

        <section class="card settings-card">
          <div class="settings-head">
            <span class="settings-icon settings-icon-warning">
              <AppIcon name="download" :size="20" />
            </span>
            <div>
              <h2>Datos y respaldo</h2>
              <p>Exporta tu progreso, impórtalo en otro navegador o empieza de cero.</p>
            </div>
          </div>

          <div class="settings-body">
            <div class="data-actions">
              <button type="button" class="btn btn-outline" @click="exportData">
                <AppIcon name="download" :size="15" />
                Exportar progreso
              </button>
              <button type="button" class="btn btn-outline" @click="openImport">
                <AppIcon name="upload" :size="15" />
                Importar respaldo
              </button>
              <input
                ref="fileInput"
                type="file"
                accept="application/json,.json"
                class="sr-only"
                @change="handleImport"
              />
            </div>

            <div class="data-actions secondary-actions">
              <button type="button" class="btn btn-ghost btn-sm" @click="wipeChat">
                <AppIcon name="chat" :size="14" />
                Vaciar chat del mentor
              </button>
              <button type="button" class="btn btn-ghost btn-sm" @click="wipeLab">
                <AppIcon name="lab" :size="14" />
                Borrar soluciones del laboratorio
              </button>
            </div>

            <div class="danger-zone">
              <div class="danger-copy">
                <h4>
                  <AppIcon name="alert" :size="15" />
                  Zona de peligro
                </h4>
                <p class="help">
                  Borra XP, racha, logros, historial, estadísticas y el modelo de habilidad. Tu
                  perfil y la configuración de IA se conservan.
                </p>
              </div>

              <div v-if="!confirmReset" class="danger-actions">
                <button type="button" class="btn btn-danger" @click="confirmReset = true">
                  <AppIcon name="trash" :size="15" />
                  Reiniciar progreso
                </button>
              </div>
              <div v-else class="danger-confirm">
                <p>¿Seguro? Esta acción no se puede deshacer. Exporta un respaldo primero.</p>
                <div class="row wrap">
                  <button type="button" class="btn btn-danger" @click="doReset">
                    Sí, borrar mi progreso
                  </button>
                  <button type="button" class="btn btn-ghost" @click="confirmReset = false">
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <aside class="stack side-column">
        <section class="card profile-summary">
          <div class="summary-avatar">{{ initials }}</div>
          <h3>{{ displayName }}</h3>
          <p class="small muted">
            Nivel {{ levelInfo.level }} · {{ formatNumber(progress.xp) }} XP
          </p>
          <div class="bar summary-bar">
            <span :style="{ width: `${levelInfo.percent}%` }" />
          </div>
          <div class="summary-grid">
            <div>
              <strong>{{ progress.streak.current }}</strong>
              <span>racha</span>
            </div>
            <div>
              <strong>{{ accuracy }}%</strong>
              <span>precisión</span>
            </div>
            <div>
              <strong>{{ progress.answered }}</strong>
              <span>preguntas</span>
            </div>
          </div>
        </section>

        <section class="card privacy-card">
          <div class="privacy-head">
            <span class="privacy-icon"><AppIcon name="shield" :size="18" /></span>
            <h3>Privacidad por diseño</h3>
          </div>
          <ul class="privacy-list">
            <template v-if="cloudConfigured">
              <li>
                <AppIcon name="check" :size="14" />
                <span>
                  Tu progreso se guarda en Supabase. Solo tú y el docente de tu clase pueden
                  verlo.
                </span>
              </li>
              <li>
                <AppIcon name="check" :size="14" />
                <span>Las políticas RLS impiden que otros estudiantes accedan a tus datos.</span>
              </li>
              <li>
                <AppIcon name="check" :size="14" />
                <span>La clave de tu mentor IA nunca se sube a la nube.</span>
              </li>
              <li>
                <AppIcon name="check" :size="14" />
                <span>El código del laboratorio se ejecuta aislado y nunca sale de tu equipo.</span>
              </li>
              <li>
                <AppIcon name="info" :size="14" />
                <span>
                  Si activas la IA remota, tus mensajes y la clave se envían al proveedor que
                  configures, bajo sus propias políticas.
                </span>
              </li>
            </template>
            <template v-else>
              <li>
                <AppIcon name="check" :size="14" />
                <span>Todo tu progreso vive en el <code>localStorage</code> de este navegador.</span>
              </li>
              <li>
                <AppIcon name="check" :size="14" />
                <span>No hay cuentas, cookies de seguimiento ni servidor de CodeQuizz-AI.</span>
              </li>
              <li>
                <AppIcon name="check" :size="14" />
                <span>El código del laboratorio se ejecuta aislado y nunca sale de tu equipo.</span>
              </li>
              <li>
                <AppIcon name="info" :size="14" />
                <span>
                  Si activas la IA remota, tus mensajes y la clave se envían al proveedor que
                  configures, bajo sus propias políticas.
                </span>
              </li>
            </template>
          </ul>
          <p class="privacy-note">
            <template v-if="cloudConfigured">
              Al cerrar sesión se limpian los datos locales de este dispositivo. Tu progreso
              sigue seguro en la nube.
            </template>
            <template v-else>
              Limpiar los datos del navegador borra tu progreso. Exporta un respaldo de vez en
              cuando.
            </template>
          </p>
        </section>

        <section class="card shortcut-card">
          <span class="shortcut-icon"><AppIcon name="compass" :size="18" /></span>
          <div>
            <h3>¿Buscas un reto?</h3>
            <p class="small muted">
              El laboratorio tiene 10 ejercicios con ejecución real de JavaScript y CSS.
            </p>
            <RouterLink to="/laboratorio" class="btn btn-outline btn-sm shortcut-link">
              Ir al laboratorio
              <AppIcon name="arrow-right" :size="14" />
            </RouterLink>
          </div>
        </section>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.notice {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  padding: 12px 14px;
  margin-bottom: 18px;
  border-radius: 12px;
  border: 1px solid var(--border);
  font-size: 0.82rem;
  line-height: 1.45;
}

.notice.success {
  border-color: rgba(52, 211, 153, 0.3);
  background: rgba(52, 211, 153, 0.08);
  color: #9df3cd;
}

.notice.error {
  border-color: rgba(251, 113, 133, 0.3);
  background: rgba(251, 113, 133, 0.08);
  color: #f3b7c1;
}

.notice span {
  flex: 1;
}

.notice-close {
  border: 0;
  background: transparent;
  color: inherit;
  opacity: 0.7;
  padding: 2px;
  border-radius: 5px;
}

.notice-close:hover {
  opacity: 1;
}

.settings-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 308px;
  gap: 18px;
  align-items: start;
}

.side-column {
  position: sticky;
  top: calc(var(--topbar-height) + 18px);
}

.settings-card {
  padding: 22px 24px;
}

.settings-head {
  display: flex;
  align-items: flex-start;
  gap: 13px;
}

.settings-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  flex: none;
  background: rgba(124, 245, 196, 0.1);
  color: var(--brand);
}

.settings-icon-violet {
  background: rgba(167, 139, 250, 0.12);
  color: var(--violet);
}

.settings-icon-blue {
  background: rgba(91, 168, 255, 0.12);
  color: var(--brand-2);
}

.settings-icon-warning {
  background: rgba(251, 191, 36, 0.12);
  color: var(--warning);
}

.settings-head h2 {
  font-size: 1.08rem;
}

.settings-head p {
  color: var(--muted);
  font-size: 0.8rem;
  margin-top: 3px;
  max-width: 62ch;
}

.settings-body {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 20px;
}

.profile-fields {
  align-items: start;
}

.goal-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.range {
  flex: 1;
  min-width: 0;
  accent-color: var(--brand);
  height: 4px;
}

.goal-value {
  flex: none;
  min-width: 68px;
  text-align: center;
  padding: 5px 9px;
  border-radius: 8px;
  background: rgba(124, 245, 196, 0.09);
  border: 1px solid rgba(124, 245, 196, 0.2);
  font-family: var(--font-mono);
  font-size: 0.72rem;
  color: var(--brand);
}

.goal-presets {
  margin-top: 2px;
}

.preset {
  background: var(--surface-2);
  cursor: pointer;
  transition: border-color 160ms ease, color 160ms ease, background 160ms ease;
}

.preset:hover {
  color: var(--text);
  border-color: var(--border-strong);
}

.preset.active {
  background: rgba(124, 245, 196, 0.1);
  border-color: rgba(124, 245, 196, 0.3);
  color: var(--brand);
}

.length-options {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.length-option {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1px;
  padding: 11px 13px;
  border-radius: 11px;
  border: 1px solid var(--border);
  background: var(--surface-2);
  text-align: left;
  transition: border-color 160ms ease, background 160ms ease;
}

.length-option:hover {
  border-color: var(--border-strong);
}

.length-option strong {
  font-family: var(--font-display);
  font-size: 1.15rem;
  color: var(--text);
  line-height: 1.1;
}

.length-option span {
  font-size: 0.76rem;
  font-weight: 600;
  color: var(--muted);
}

.length-option small {
  font-size: 0.66rem;
  color: var(--muted-2);
}

.length-option.selected {
  border-color: rgba(124, 245, 196, 0.42);
  background: rgba(124, 245, 196, 0.08);
}

.length-option.selected strong,
.length-option.selected span {
  color: var(--brand);
}

.preferences {
  gap: 0;
}

.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 13px 0;
  border-bottom: 1px solid var(--border);
}

.setting-row:first-child {
  padding-top: 0;
}

.setting-row:last-child {
  padding-bottom: 0;
  border-bottom: 0;
}

.setting-row strong {
  display: block;
  font-size: 0.84rem;
  color: var(--text);
  margin-bottom: 2px;
}

.setting-row .help {
  max-width: 54ch;
}

.mode-options {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.mode-option {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 5px;
  padding: 15px;
  border-radius: 13px;
  border: 1px solid var(--border);
  background: var(--surface-2);
  text-align: left;
  transition: border-color 180ms ease, background 180ms ease;
}

.mode-option:hover {
  border-color: var(--border-strong);
}

.mode-option.active {
  border-color: rgba(124, 245, 196, 0.42);
  background: rgba(124, 245, 196, 0.07);
}

.mode-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  background: rgba(124, 245, 196, 0.12);
  color: var(--brand);
  margin-bottom: 3px;
}

.mode-icon-blue {
  background: rgba(91, 168, 255, 0.14);
  color: var(--brand-2);
}

.mode-option strong {
  font-size: 0.86rem;
  color: var(--text);
}

.mode-option p {
  font-size: 0.72rem;
  line-height: 1.45;
  color: var(--muted);
}

.mode-tag {
  position: absolute;
  top: 13px;
  right: 13px;
  font-size: 0.6rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--brand);
  background: rgba(124, 245, 196, 0.1);
  border: 1px solid rgba(124, 245, 196, 0.22);
  border-radius: 999px;
  padding: 2px 7px;
}

.mode-tag-blue {
  color: var(--brand-2);
  background: rgba(91, 168, 255, 0.1);
  border-color: rgba(91, 168, 255, 0.22);
}

.ai-config {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  border: 1px solid var(--border);
  border-radius: 13px;
  background: rgba(7, 10, 18, 0.4);
}

.preset-row {
  gap: 7px;
}

.secret-row {
  position: relative;
}

.secret-row .input {
  padding-right: 46px;
}

.secret-toggle {
  position: absolute;
  top: 50%;
  right: 5px;
  transform: translateY(-50%);
  width: 32px;
  height: 30px;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: var(--muted);
  display: grid;
  place-items: center;
}

.secret-toggle:hover {
  color: var(--brand);
  background: var(--surface-2);
}

.test-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-start;
}

.test-message {
  font-size: 0.74rem;
  line-height: 1.45;
  color: var(--muted);
}

.test-message.ok {
  color: #9df3cd;
}

.test-message.error {
  color: #f3b7c1;
}

.ai-warning {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 10px;
  background: rgba(251, 191, 36, 0.07);
  border: 1px solid rgba(251, 191, 36, 0.2);
  color: #f6d98b;
  font-size: 0.74rem;
  line-height: 1.45;
}

.data-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.secondary-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.danger-zone {
  padding: 15px;
  border-radius: 13px;
  border: 1px solid rgba(251, 113, 133, 0.24);
  background: rgba(251, 113, 133, 0.05);
}

.danger-copy h4 {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 0.82rem;
  color: var(--danger);
  margin-bottom: 4px;
}

.danger-copy .help {
  max-width: 64ch;
}

.danger-actions {
  margin-top: 12px;
}

.danger-confirm {
  margin-top: 12px;
}

.danger-confirm p {
  font-size: 0.78rem;
  color: #f3b7c1;
  margin-bottom: 10px;
}

.account-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  flex-wrap: wrap;
  padding: 14px;
  border-radius: 13px;
  border: 1px solid var(--border);
  background: var(--surface-2);
}

.account-identity {
  display: flex;
  align-items: center;
  gap: 11px;
  min-width: 0;
}

.account-avatar {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  flex: none;
  background: var(--gradient);
  color: #06121a;
  font-size: 0.8rem;
  font-weight: 700;
}

.account-identity div {
  display: flex;
  flex-direction: column;
  line-height: 1.3;
  min-width: 0;
}

.account-identity strong {
  font-size: 0.86rem;
  color: #fff;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.account-identity small {
  font-size: 0.72rem;
  color: var(--muted-2);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sync-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 13px 0;
  border-bottom: 1px solid var(--border);
}

.sync-row .help {
  margin-top: 2px;
}

.sync-title {
  font-size: 0.84rem;
  color: var(--text);
}

.sync-error {
  color: #f3b7c1;
}

.account-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.account-signout {
  padding-top: 14px;
  border-top: 1px solid var(--border);
}

.subhead {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 0.8rem;
  color: var(--text);
  margin-bottom: 9px;
}

.subhead svg {
  color: var(--brand);
}

.classroom-block {
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.class-list {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.class-pill {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 11px;
  border: 1px solid var(--border);
  background: var(--surface-2);
}

.class-pill div {
  display: flex;
  flex-direction: column;
  line-height: 1.3;
  min-width: 0;
}

.class-pill strong {
  font-size: 0.82rem;
  color: var(--text);
}

.class-pill small {
  font-size: 0.68rem;
  color: var(--muted-2);
  font-family: var(--font-mono);
}

.join-form {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.join-form .input {
  flex: 1;
  min-width: 160px;
}

.join-error {
  font-size: 0.74rem;
  color: #f3b7c1;
}

.setup-steps {
  margin: 0;
  padding-left: 20px;
  display: flex;
  flex-direction: column;
  gap: 7px;
  font-size: 0.8rem;
  line-height: 1.5;
  color: var(--muted);
}

.setup-steps code {
  color: var(--brand);
  font-size: 0.9em;
}

.setup-steps strong {
  color: var(--text);
}

.profile-summary {
  text-align: center;
  padding: 24px 20px;
}

.summary-avatar {
  width: 68px;
  height: 68px;
  margin: 0 auto 12px;
  border-radius: 20px;
  display: grid;
  place-items: center;
  background: var(--gradient);
  color: #06121a;
  font-family: var(--font-display);
  font-size: 1.4rem;
  font-weight: 700;
  box-shadow: 0 16px 34px -16px rgba(124, 245, 196, 0.7);
}

.profile-summary h3 {
  font-size: 1.05rem;
}

.summary-bar {
  margin: 14px 0 16px;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  padding-top: 14px;
  border-top: 1px solid var(--border);
}

.summary-grid div {
  display: flex;
  flex-direction: column;
  line-height: 1.25;
}

.summary-grid strong {
  font-family: var(--font-display);
  font-size: 1rem;
  color: #fff;
}

.summary-grid span {
  font-size: 0.62rem;
  color: var(--muted-2);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.privacy-card {
  padding: 20px;
}

.privacy-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.privacy-icon {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  background: rgba(124, 245, 196, 0.1);
  color: var(--brand);
  flex: none;
}

.privacy-head h3 {
  font-size: 0.94rem;
}

.privacy-list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.privacy-list li {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 0.73rem;
  line-height: 1.45;
  color: var(--muted);
}

.privacy-list li svg {
  margin-top: 2px;
  color: var(--brand);
}

.privacy-list code {
  font-size: 0.9em;
}

.privacy-note {
  margin-top: 13px;
  padding-top: 12px;
  border-top: 1px solid var(--border);
  font-size: 0.7rem;
  color: var(--muted-2);
  line-height: 1.45;
}

.shortcut-card {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 18px;
}

.shortcut-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  background: rgba(167, 139, 250, 0.12);
  color: var(--violet);
  flex: none;
}

.shortcut-card h3 {
  font-size: 0.9rem;
  margin-bottom: 3px;
}

.shortcut-link {
  margin-top: 10px;
}

.spin {
  animation: settingsSpin 900ms linear infinite;
}

@keyframes settingsSpin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 1100px) {
  .settings-layout {
    grid-template-columns: 1fr;
  }

  .side-column {
    position: static;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  }
}

@media (max-width: 760px) {
  .settings-card {
    padding: 18px;
  }

  .mode-options,
  .data-actions {
    grid-template-columns: 1fr;
  }

  .setting-row {
    align-items: flex-start;
  }

  .side-column {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 520px) {
  .length-options {
    grid-template-columns: 1fr;
  }

  .length-option {
    flex-direction: row;
    align-items: center;
    gap: 8px;
  }

  .length-option small {
    margin-left: auto;
  }

  .profile-summary {
    padding: 20px 16px;
  }
}
</style>
