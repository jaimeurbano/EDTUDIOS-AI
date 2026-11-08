<script setup>
import { ref } from 'vue'
import AppIcon from './AppIcon.vue'
import BrandMark from './BrandMark.vue'
import { updateProfile } from '../stores/useProgress'

const emit = defineEmits(['close'])
const name = ref('')
const goal = ref(120)

const goals = [
  { value: 60, label: 'Relajado', detail: '5 min al día' },
  { value: 120, label: 'Constante', detail: '10 min al día' },
  { value: 200, label: 'Intenso', detail: '20 min al día' },
]

function start() {
  updateProfile({ name: name.value.trim() || 'Explorador', dailyGoal: goal.value })
  try {
    localStorage.setItem('codequest.onboarded', '1')
  } catch {
    /* ignore */
  }
  emit('close')
}

function skip() {
  try {
    localStorage.setItem('codequest.onboarded', '1')
  } catch {
    /* ignore */
  }
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <div class="onboarding-overlay" role="dialog" aria-modal="true" aria-labelledby="onboarding-title">
      <div class="onboarding-card">
        <div class="onboarding-glow" aria-hidden="true" />
        <div class="onboarding-brand">
          <BrandMark :size="46" />
          <span class="chip chip-brand">Bienvenido a CodeQuest</span>
        </div>

        <h1 id="onboarding-title">
          Aprende a programar<br />
          <span class="gradient-text">como si fuera un juego.</span>
        </h1>
        <p class="onboarding-sub">
          Quizzes que se adaptan a ti, un mentor disponible 24/7 y retos reales de
          JavaScript, Vue y CSS.
        </p>

        <form class="onboarding-form" @submit.prevent="start">
          <div class="field">
            <label for="onboarding-name">¿Cómo te llamas?</label>
            <input
              id="onboarding-name"
              v-model="name"
              class="input"
              type="text"
              maxlength="24"
              placeholder="Tu nombre o apodo"
              autocomplete="given-name"
            />
          </div>

          <div class="field">
            <span class="field-label">¿Cuánto quieres practicar al día?</span>
            <div class="goal-options">
              <button
                v-for="option in goals"
                :key="option.value"
                type="button"
                class="goal-option"
                :class="{ selected: goal === option.value }"
                @click="goal = option.value"
              >
                <strong>{{ option.label }}</strong>
                <span>{{ option.detail }}</span>
                <em>{{ option.value }} XP</em>
              </button>
            </div>
          </div>

          <button type="submit" class="btn btn-primary btn-lg btn-block">
            Empezar mi ruta
            <AppIcon name="arrow-right" :size="18" />
          </button>
        </form>

        <button type="button" class="skip" @click="skip">Explorar primero</button>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.onboarding-overlay {
  position: fixed;
  inset: 0;
  z-index: 300;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgba(4, 7, 13, 0.82);
  backdrop-filter: blur(14px);
  overflow-y: auto;
}

.onboarding-card {
  position: relative;
  width: min(560px, 100%);
  background: rgba(13, 19, 33, 0.96);
  border: 1px solid var(--border-strong);
  border-radius: 28px;
  padding: 34px;
  box-shadow: 0 40px 120px -30px rgba(0, 0, 0, 0.9);
  overflow: hidden;
  animation: fadeUp 500ms cubic-bezier(0.22, 1, 0.36, 1) both;
}

.onboarding-glow {
  position: absolute;
  top: -120px;
  right: -80px;
  width: 320px;
  height: 320px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(124, 245, 196, 0.2), transparent 65%);
  pointer-events: none;
}

.onboarding-brand {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 22px;
}

.onboarding-card h1 {
  font-size: clamp(1.7rem, 4vw, 2.3rem);
  line-height: 1.1;
}

.onboarding-sub {
  color: var(--muted);
  margin-top: 12px;
  font-size: 0.9rem;
  max-width: 44ch;
}

.onboarding-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
  margin-top: 24px;
}

.goal-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.goal-option {
  display: flex;
  flex-direction: column;
  gap: 2px;
  align-items: flex-start;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: var(--surface-2);
  text-align: left;
  transition: border-color 160ms ease, background 160ms ease;
}

.goal-option strong {
  font-size: 0.8rem;
  color: #fff;
}

.goal-option span {
  font-size: 0.68rem;
  color: var(--muted);
}

.goal-option em {
  font-style: normal;
  font-size: 0.64rem;
  color: var(--brand);
  font-weight: 600;
  margin-top: 3px;
}

.goal-option.selected {
  border-color: rgba(124, 245, 196, 0.5);
  background: rgba(124, 245, 196, 0.09);
}

.skip {
  display: block;
  margin: 14px auto 0;
  background: transparent;
  border: 0;
  color: var(--muted-2);
  font-size: 0.78rem;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.skip:hover {
  color: var(--muted);
}

@media (max-width: 520px) {
  .onboarding-card {
    padding: 24px 20px;
  }

  .goal-options {
    grid-template-columns: 1fr;
  }

  .goal-option {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .goal-option em {
    margin-top: 0;
  }
}
</style>
