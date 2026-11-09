<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import AppIcon from '../components/AppIcon.vue'
import BrandMark from '../components/BrandMark.vue'
import { isSupabaseConfigured } from '../lib/supabase'
import { signIn, signUp } from '../stores/useAuth'
import { updateProfile } from '../stores/useProgress'

const route = useRoute()
const router = useRouter()

const configured = isSupabaseConfigured
const mode = ref(route.name === 'register' ? 'register' : 'login')
const form = reactive({ fullName: '', email: '', password: '', confirm: '' })
const error = ref('')
const info = ref('')
const submitting = ref(false)
const showPassword = ref(false)

const isRegister = computed(() => mode.value === 'register')
const title = computed(() => (isRegister.value ? 'Crea tu cuenta' : 'Bienvenido de nuevo'))
const subtitle = computed(() =>
  isRegister.value
    ? 'Tu progreso te seguirá en cualquier dispositivo y tu docente podrá acompañarte.'
    : 'Entra para continuar donde lo dejaste. Tu progreso está guardado.',
)

const redirectTarget = computed(() => {
  const target = route.query.redirect
  return typeof target === 'string' && target.startsWith('/') ? target : '/'
})

watch(
  () => route.name,
  (name) => {
    mode.value = name === 'register' ? 'register' : 'login'
    error.value = ''
    info.value =
      route.query.confirm === '1'
        ? 'Cuenta creada. Revisa tu correo para confirmarla y después inicia sesión.'
        : ''
  },
)

watch(mode, () => {
  error.value = ''
})

function switchMode(next) {
  info.value = ''
  const query = route.query.redirect ? { redirect: route.query.redirect } : {}
  router.push({ name: next === 'register' ? 'register' : 'login', query })
}

function validate() {
  const email = form.email.trim()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Escribe un correo válido.'
  if (form.password.length < 6) return 'La contraseña debe tener al menos 6 caracteres.'
  if (isRegister.value) {
    if (!form.fullName.trim()) return 'Escribe tu nombre completo.'
    if (form.password !== form.confirm) return 'Las contraseñas no coinciden.'
  }
  return ''
}

async function submit() {
  if (submitting.value) return
  error.value = ''
  info.value = ''

  const problem = validate()
  if (problem) {
    error.value = problem
    return
  }

  submitting.value = true
  try {
    if (isRegister.value) {
      const result = await signUp(form.email, form.password, form.fullName)
      if (form.fullName.trim()) {
        updateProfile({ name: form.fullName.trim().slice(0, 24) })
      }
      if (result.needsConfirmation) {
        await router.push({ name: 'login', query: { confirm: '1' } })
        return
      }
      await router.push(redirectTarget.value)
    } else {
      await signIn(form.email, form.password)
      await router.push(redirectTarget.value)
    }
  } catch (err) {
    error.value = err.message || 'No se pudo completar la operación.'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-glow auth-glow-a" aria-hidden="true" />
    <div class="auth-glow auth-glow-b" aria-hidden="true" />

    <section class="auth-pitch">
      <RouterLink to="/" class="auth-brand">
        <BrandMark :size="46" />
        <span class="auth-brand-text">
          <strong>CodeQuizz-AI</strong>
          <small>aprende programando</small>
        </span>
      </RouterLink>

      <h1>
        Aprende JavaScript, Vue y CSS
        <span class="gradient-text">a tu ritmo</span>
      </h1>
      <p class="auth-lead">
        Un quiz adaptativo que ajusta la dificultad a ti, un mentor para tus dudas y un panel
        para que tu docente vea cómo avanzas. Todo en español y desde cualquier dispositivo.
      </p>

      <ul class="auth-features">
        <li>
          <span class="feature-icon"><AppIcon name="target" :size="18" /></span>
          <div>
            <strong>Práctica adaptativa</strong>
            <span>Preguntas que cambian de nivel según tus respuestas.</span>
          </div>
        </li>
        <li>
          <span class="feature-icon feature-icon-blue"><AppIcon name="chat" :size="18" /></span>
          <div>
            <strong>Mentor siempre disponible</strong>
            <span>Pistas y explicaciones sin darte la respuesta de golpe.</span>
          </div>
        </li>
        <li>
          <span class="feature-icon feature-icon-violet"><AppIcon name="users" :size="18" /></span>
          <div>
            <strong>Docente conectado</strong>
            <span>Tu clase ve tu progreso real, sin planillas manuales.</span>
          </div>
        </li>
      </ul>

      <div class="auth-note">
        <AppIcon name="shield" :size="16" />
        <span>
          Cada estudiante solo ve sus datos. El docente únicamente accede a los estudiantes de
          sus propias clases.
        </span>
      </div>
    </section>

    <section class="auth-panel">
      <div class="auth-card card">
        <template v-if="!configured">
          <header class="auth-head">
            <span class="eyebrow">Modo local</span>
            <h2>Backend sin configurar</h2>
            <p>
              CodeQuizz-AI funciona ahora mismo sin cuentas: tu progreso se guarda en este
              navegador. Para activar el inicio de sesión y el panel docente, conecta Supabase
              (plan gratuito).
            </p>
          </header>

          <ol class="setup-steps">
            <li>
              Crea un proyecto gratis en
              <a href="https://supabase.com" target="_blank" rel="noopener">supabase.com</a>.
            </li>
            <li>
              Abre el <strong>SQL Editor</strong> y ejecuta el archivo
              <code>supabase/schema.sql</code> de este repositorio.
            </li>
            <li>
              Copia <code>.env.example</code> a <code>.env.local</code> y pega la
              <strong>Project URL</strong> y la <strong>anon key</strong>.
            </li>
            <li>Reinicia el servidor con <code>npm run dev -- --host</code>.</li>
          </ol>

          <RouterLink to="/" class="btn btn-primary btn-lg btn-block">
            <AppIcon name="chevron-right" :size="17" />
            Explorar CodeQuizz-AI en modo local
          </RouterLink>
        </template>

        <template v-else>
          <header class="auth-head">
            <span class="eyebrow">{{ isRegister ? 'Nueva cuenta' : 'Acceso' }}</span>
            <h2>{{ title }}</h2>
            <p>{{ subtitle }}</p>
          </header>

          <div class="auth-tabs" role="tablist" aria-label="Tipo de acceso">
            <button
              type="button"
              role="tab"
              :aria-selected="!isRegister"
              :class="{ active: !isRegister }"
              @click="switchMode('login')"
            >
              Iniciar sesión
            </button>
            <button
              type="button"
              role="tab"
              :aria-selected="isRegister"
              :class="{ active: isRegister }"
              @click="switchMode('register')"
            >
              Crear cuenta
            </button>
          </div>

          <form class="auth-form" @submit.prevent="submit">
            <div v-if="isRegister" class="field">
              <label for="auth-name">Nombre completo</label>
              <div class="input-wrap">
                <AppIcon name="user" :size="16" class="input-icon" />
                <input
                  id="auth-name"
                  v-model="form.fullName"
                  class="input with-icon"
                  type="text"
                  autocomplete="name"
                  maxlength="60"
                  placeholder="Ana Pérez"
                  required
                />
              </div>
            </div>

            <div class="field">
              <label for="auth-email">Correo electrónico</label>
              <div class="input-wrap">
                <AppIcon name="mail" :size="16" class="input-icon" />
                <input
                  id="auth-email"
                  v-model="form.email"
                  class="input with-icon"
                  type="email"
                  autocomplete="email"
                  placeholder="tu@correo.com"
                  required
                />
              </div>
            </div>

            <div class="field">
              <label for="auth-password">Contraseña</label>
              <div class="input-wrap">
                <AppIcon name="lock" :size="16" class="input-icon" />
                <input
                  id="auth-password"
                  v-model="form.password"
                  class="input with-icon with-action"
                  :type="showPassword ? 'text' : 'password'"
                  :autocomplete="isRegister ? 'new-password' : 'current-password'"
                  placeholder="Mínimo 6 caracteres"
                  required
                />
                <button
                  type="button"
                  class="input-action"
                  :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                  @click="showPassword = !showPassword"
                >
                  <AppIcon :name="showPassword ? 'eye' : 'lock'" :size="15" />
                </button>
              </div>
            </div>

            <div v-if="isRegister" class="field">
              <label for="auth-confirm">Repite la contraseña</label>
              <div class="input-wrap">
                <AppIcon name="lock" :size="16" class="input-icon" />
                <input
                  id="auth-confirm"
                  v-model="form.confirm"
                  class="input with-icon"
                  :type="showPassword ? 'text' : 'password'"
                  autocomplete="new-password"
                  placeholder="Repite tu contraseña"
                  required
                />
              </div>
            </div>

            <Transition name="slide">
              <div v-if="error" class="auth-alert error" role="alert">
                <AppIcon name="alert" :size="16" />
                <span>{{ error }}</span>
              </div>
            </Transition>

            <Transition name="slide">
              <div v-if="info" class="auth-alert success" role="status">
                <AppIcon name="check" :size="16" />
                <span>{{ info }}</span>
              </div>
            </Transition>

            <button type="submit" class="btn btn-primary btn-lg btn-block" :disabled="submitting">
              <AppIcon
                :name="submitting ? 'rotate' : 'chevron-right'"
                :size="17"
                :class="{ spin: submitting }"
              />
              {{ submitting ? 'Procesando…' : isRegister ? 'Crear mi cuenta' : 'Entrar a CodeQuizz-AI' }}
            </button>
          </form>

          <p class="auth-switch">
            {{ isRegister ? '¿Ya tienes cuenta?' : '¿Aún no tienes cuenta?' }}
            <button
              type="button"
              class="link-button"
              @click="switchMode(isRegister ? 'login' : 'register')"
            >
              {{ isRegister ? 'Inicia sesión' : 'Créala gratis' }}
            </button>
          </p>
        </template>
      </div>

      <p class="auth-foot">
        <AppIcon name="cloud" :size="14" />
        <span v-if="configured">
          Tus datos se guardan en Supabase. La clave de tu mentor IA nunca se sube a la nube.
        </span>
        <span v-else>
          Sin cuenta ni servidor: todo se guarda en el almacenamiento de este navegador.
        </span>
      </p>
    </section>
  </div>
</template>

<style scoped>
.auth-page {
  position: relative;
  min-height: 100vh;
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
  gap: clamp(28px, 5vw, 72px);
  align-items: center;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: clamp(28px, 5vw, 64px) clamp(20px, 5vw, 56px);
  overflow: hidden;
}

.auth-glow {
  position: fixed;
  z-index: -1;
  border-radius: 50%;
  filter: blur(90px);
  pointer-events: none;
}

.auth-glow-a {
  width: 480px;
  height: 480px;
  top: -140px;
  left: -120px;
  background: rgba(124, 245, 196, 0.14);
}

.auth-glow-b {
  width: 520px;
  height: 520px;
  right: -160px;
  bottom: -180px;
  background: rgba(91, 168, 255, 0.13);
}

.auth-pitch {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 560px;
}

.auth-brand {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  color: inherit;
  text-decoration: none;
  width: fit-content;
}

.auth-brand:hover {
  text-decoration: none;
}

.auth-brand-text {
  display: flex;
  flex-direction: column;
  line-height: 1.1;
}

.auth-brand-text strong {
  font-family: var(--font-display);
  font-size: 1.3rem;
  color: #fff;
  letter-spacing: -0.02em;
}

.auth-brand-text small {
  font-size: 0.66rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--muted-2);
  font-weight: 600;
}

.auth-pitch h1 {
  font-size: clamp(2rem, 3.6vw, 2.85rem);
  line-height: 1.12;
  letter-spacing: -0.03em;
}

.auth-lead {
  color: var(--muted);
  font-size: 0.95rem;
  line-height: 1.65;
  max-width: 52ch;
}

.auth-features {
  list-style: none;
  padding: 0;
  margin: 4px 0 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.auth-features li {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.feature-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  flex: none;
  background: rgba(124, 245, 196, 0.11);
  color: var(--brand);
}

.feature-icon-blue {
  background: rgba(91, 168, 255, 0.12);
  color: var(--brand-2);
}

.feature-icon-violet {
  background: rgba(167, 139, 250, 0.12);
  color: var(--violet);
}

.auth-features strong {
  display: block;
  font-size: 0.88rem;
  color: var(--text);
}

.auth-features span {
  font-size: 0.8rem;
  color: var(--muted);
  line-height: 1.5;
}

.auth-note {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  margin-top: 4px;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: var(--surface-2);
  color: var(--muted);
  font-size: 0.76rem;
  line-height: 1.5;
}

.auth-note svg {
  margin-top: 2px;
  color: var(--brand);
  flex: none;
}

.auth-panel {
  display: flex;
  flex-direction: column;
  gap: 14px;
  width: 100%;
  max-width: 460px;
  justify-self: end;
}

.auth-card {
  padding: 30px;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
}

.auth-head h2 {
  font-size: 1.5rem;
  letter-spacing: -0.02em;
  margin-bottom: 6px;
}

.auth-head p {
  color: var(--muted);
  font-size: 0.83rem;
  line-height: 1.55;
  max-width: 46ch;
}

.auth-tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
  margin: 20px 0 18px;
  padding: 4px;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: rgba(7, 10, 18, 0.5);
}

.auth-tabs button {
  border: 0;
  border-radius: 9px;
  padding: 9px 10px;
  background: transparent;
  color: var(--muted);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 160ms ease, color 160ms ease;
}

.auth-tabs button:hover {
  color: var(--text);
}

.auth-tabs button.active {
  background: rgba(124, 245, 196, 0.12);
  color: var(--brand);
  box-shadow: inset 0 0 0 1px rgba(124, 245, 196, 0.2);
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.input-wrap {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 13px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--muted-2);
  pointer-events: none;
}

.input.with-icon {
  padding-left: 39px;
}

.input.with-action {
  padding-right: 44px;
}

.input-action {
  position: absolute;
  top: 50%;
  right: 6px;
  transform: translateY(-50%);
  width: 32px;
  height: 30px;
  display: grid;
  place-items: center;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: var(--muted);
  cursor: pointer;
}

.input-action:hover {
  color: var(--brand);
  background: var(--surface-2);
}

.auth-alert {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 10px;
  font-size: 0.78rem;
  line-height: 1.45;
}

.auth-alert svg {
  margin-top: 1px;
  flex: none;
}

.auth-alert.error {
  border: 1px solid rgba(251, 113, 133, 0.32);
  background: rgba(251, 113, 133, 0.08);
  color: #f3b7c1;
}

.auth-alert.success {
  border: 1px solid rgba(52, 211, 153, 0.32);
  background: rgba(52, 211, 153, 0.08);
  color: #9df3cd;
}

.auth-switch {
  margin-top: 18px;
  text-align: center;
  font-size: 0.8rem;
  color: var(--muted);
}

.link-button {
  border: 0;
  background: transparent;
  color: var(--brand);
  font: inherit;
  font-weight: 600;
  cursor: pointer;
  padding: 0 2px;
}

.link-button:hover {
  text-decoration: underline;
}

.auth-foot {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 7px;
  font-size: 0.7rem;
  line-height: 1.45;
  color: var(--muted-2);
  text-align: center;
  padding: 0 10px;
}

.auth-foot svg {
  margin-top: 1px;
  flex: none;
  color: var(--brand);
}

.setup-steps {
  margin: 20px 0;
  padding-left: 20px;
  display: flex;
  flex-direction: column;
  gap: 9px;
  font-size: 0.8rem;
  line-height: 1.55;
  color: var(--muted);
}

.setup-steps code {
  font-size: 0.9em;
  color: var(--brand);
}

.setup-steps strong {
  color: var(--text);
}

.spin {
  animation: authSpin 900ms linear infinite;
}

@keyframes authSpin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 920px) {
  .auth-page {
    grid-template-columns: 1fr;
    gap: 34px;
    padding-top: 34px;
    padding-bottom: 48px;
  }

  .auth-pitch {
    max-width: none;
  }

  .auth-features {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  }

  .auth-panel {
    max-width: none;
    justify-self: stretch;
  }

  .auth-card {
    max-width: 520px;
    width: 100%;
    margin: 0 auto;
  }
}

@media (max-width: 560px) {
  .auth-card {
    padding: 22px;
  }

  .auth-features {
    grid-template-columns: 1fr;
  }

  .auth-note {
    display: none;
  }
}
</style>
