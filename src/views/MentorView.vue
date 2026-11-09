<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import AppIcon from '../components/AppIcon.vue'
import { currentQuestion, quiz, topicLabel } from '../composables/useAdaptiveQuiz'
import { QUESTIONS, TOPICS } from '../data/questions'
import {
  assistant,
  assistantStats,
  clearChat,
  consumePrefill,
  isRemoteConfigured,
  sendMessage,
  setSocratic,
  suggestions,
} from '../stores/useAssistant'
import { levelInfo, progress, weakConcepts } from '../stores/useProgress'
import { copyText, plainText, renderMarkdown } from '../utils/markdown'

const draft = ref('')
const scroller = ref(null)
const messageArea = ref(null)
const composerInput = ref(null)
const listening = ref(false)
const voiceNotice = ref('')
const speakingMessageId = ref('')
const practiceTopic = ref('javascript')
const practiceQuestion = ref(null)
const practiceSelected = ref(null)
const practiceRevealed = ref(false)
const practiceCorrect = ref(0)
const practiceAnswered = ref(0)
const practiceUsedIds = ref([])
let recognition = null

const displayName = computed(() => progress.profile.name || 'Explorador')
const topicOptions = Object.values(TOPICS)
const initials = computed(() =>
  displayName.value
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase(),
)

const weak = computed(() => weakConcepts(3))
const mentorStatus = computed(() =>
  isRemoteConfigured.value ? `IA · ${progress.ai.model}` : 'Mentor local',
)

function timeOf(message) {
  try {
    return new Intl.DateTimeFormat('es-ES', { hour: '2-digit', minute: '2-digit' }).format(
      new Date(message.at),
    )
  } catch {
    return ''
  }
}

function scrollToBottom() {
  nextTick(() => {
    if (scroller.value) scroller.value.scrollTop = scroller.value.scrollHeight
  })
}

function send(text = draft.value) {
  const value = String(text || '').trim()
  if (!value || assistant.pending) return
  sendMessage(value)
  draft.value = ''
  scrollToBottom()
}

function preparePrompt(text) {
  if (assistant.pending) return
  draft.value = text
  nextTick(() => composerInput.value?.focus())
}

function promptWithLines(lines) {
  return lines.join('\n')
}

function startQuickPractice() {
  const pool = QUESTIONS.filter(
    (question) =>
      (practiceTopic.value === 'all' || question.topic === practiceTopic.value) &&
      !practiceUsedIds.value.includes(question.id),
  )
  const available = pool.length
    ? pool
    : QUESTIONS.filter(
        (question) => practiceTopic.value === 'all' || question.topic === practiceTopic.value,
      )
  if (!available.length) return

  const next = available[Math.floor(Math.random() * available.length)]
  practiceUsedIds.value = [...practiceUsedIds.value, next.id]
  practiceQuestion.value = next
  practiceSelected.value = null
  practiceRevealed.value = false
}

function checkPracticeAnswer(index) {
  if (practiceRevealed.value || !practiceQuestion.value) return
  practiceSelected.value = index
  practiceRevealed.value = true
  practiceAnswered.value += 1
  if (index === practiceQuestion.value.answer) practiceCorrect.value += 1
}

function resetPracticeQuestion() {
  practiceQuestion.value = null
  practiceSelected.value = null
  practiceRevealed.value = false
}

function stopVoice() {
  if (recognition && listening.value) recognition.stop()
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel()
  }
  speakingMessageId.value = ''
}

function toggleDictation() {
  if (listening.value) {
    recognition?.stop()
    return
  }
  const SpeechRecognitionAPI =
    typeof window !== 'undefined' &&
    (window.SpeechRecognition || window.webkitSpeechRecognition)
  if (!SpeechRecognitionAPI) {
    voiceNotice.value = 'El dictado por voz no está disponible en este navegador.'
    return
  }

  voiceNotice.value = ''
  recognition = new SpeechRecognitionAPI()
  recognition.lang = 'es-ES'
  recognition.interimResults = true
  recognition.continuous = false
  recognition.onstart = () => {
    listening.value = true
  }
  recognition.onresult = (event) => {
    let transcript = ''
    for (let index = event.resultIndex; index < event.results.length; index += 1) {
      transcript += event.results[index][0].transcript
    }
    draft.value = transcript.trim()
  }
  recognition.onerror = (event) => {
    voiceNotice.value =
      event.error === 'not-allowed'
        ? 'Permite el acceso al micrófono en el navegador para usar el dictado.'
        : 'No se pudo reconocer la voz. Puedes escribir tu pregunta.'
  }
  recognition.onend = () => {
    listening.value = false
  }
  recognition.start()
}

function toggleReadAloud(message) {
  if (speakingMessageId.value === message.id) {
    window.speechSynthesis?.cancel()
    speakingMessageId.value = ''
    return
  }
  if (!window.speechSynthesis || typeof SpeechSynthesisUtterance === 'undefined') {
    voiceNotice.value = 'La lectura en voz alta no está disponible en este navegador.'
    return
  }

  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(plainText(message.content))
  utterance.lang = 'es-ES'
  utterance.onend = () => {
    speakingMessageId.value = ''
  }
  utterance.onerror = () => {
    speakingMessageId.value = ''
    voiceNotice.value = 'No se pudo reproducir la respuesta en voz alta.'
  }
  speakingMessageId.value = message.id
  window.speechSynthesis.speak(utterance)
}

function useSuggestion(text) {
  send(text)
}

function hintForCurrent() {
  const question = currentQuestion.value
  if (!question) return
  send(`Dame una pista para esta pregunta sin revelarme la respuesta: "${question.prompt}"`)
}

function explainCurrent() {
  const question = currentQuestion.value
  if (!question) return
  send(`Explícame el concepto "${question.concept}" con un ejemplo sencillo y luego ayúdame a razonar la pregunta.`)
}

function explainWeak() {
  const concept = weak.value[0]
  if (!concept) return
  send(`Explícame "${concept.label}" (${concept.topicName}) desde cero, con un ejemplo cotidiano y un ejercicio corto.`)
}

async function handleMessageClick(event) {
  const button = event.target.closest('.md-copy')
  if (!button) return
  const code = decodeURIComponent(button.dataset.code || '')
  const ok = await copyText(code)
  if (!ok) return
  const original = button.textContent
  button.textContent = '¡Copiado!'
  setTimeout(() => {
    button.textContent = original
  }, 1400)
}

function handleComposerKeydown(event) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    send()
  }
}

watch(
  () => [assistant.messages.length, assistant.pending],
  () => scrollToBottom(),
)

watch(
  () => assistant.prefill,
  (value) => {
    if (!value) return
    const text = consumePrefill()
    if (text) send(text)
  },
  { immediate: true },
)

onMounted(() => {
  scrollToBottom()
})

onBeforeUnmount(() => {
  stopVoice()
})
</script>

<template>
  <div class="mentor-view">
    <header class="page-head animate-in">
      <div>
        <span class="eyebrow">Mentor IA</span>
        <h1>Tu copiloto para <span class="gradient-text">no quedarte atascado</span></h1>
        <p>
          Pregunta conceptos, pega un error o pide una pista. En modo socrático te guía con
          preguntas en lugar de darte la solución de inmediato.
        </p>
      </div>
      <div class="mentor-head-actions">
        <span class="chip" :class="isRemoteConfigured ? 'chip-brand' : 'chip-violet'">
          <AppIcon :name="isRemoteConfigured ? 'spark' : 'brain'" :size="13" />
          {{ mentorStatus }}
        </span>
        <RouterLink to="/ajustes" class="btn btn-ghost btn-sm">
          <AppIcon name="settings" :size="14" />
          Configurar
        </RouterLink>
      </div>
    </header>

    <div class="mentor-grid">
      <section class="chat card">
        <header class="chat-head">
          <div class="mentor-identity">
            <span class="mentor-avatar">
              <AppIcon name="spark" :size="20" />
              <span class="mentor-online" />
            </span>
            <div>
              <strong>Mentor CodeQuizz-AI</strong>
              <small>{{ isRemoteConfigured ? 'Conectado a un modelo de IA' : 'Base de conocimiento local · sin conexión' }}</small>
            </div>
          </div>
          <div class="chat-head-actions">
            <button
              type="button"
              class="socratic-toggle"
              :class="{ active: assistant.socratic }"
              :aria-pressed="assistant.socratic"
              @click="setSocratic(!assistant.socratic)"
            >
              <AppIcon name="brain" :size="14" />
              Socrático
              <span class="toggle-state">{{ assistant.socratic ? 'ON' : 'OFF' }}</span>
            </button>
            <button type="button" class="btn btn-ghost btn-icon" title="Borrar conversación" @click="clearChat">
              <AppIcon name="trash" :size="16" />
            </button>
          </div>
        </header>

        <div ref="scroller" class="chat-messages" aria-live="polite">
          <div
            v-for="message in assistant.messages"
            :key="message.id"
            class="message"
            :class="message.role"
          >
            <span v-if="message.role === 'assistant'" class="message-avatar mentor">
              <AppIcon name="spark" :size="15" />
            </span>
            <div class="message-body">
              <div
                v-if="message.role === 'assistant'"
                ref="messageArea"
                class="message-bubble md"
                @click="handleMessageClick"
                v-html="renderMarkdown(message.content)"
              />
              <div v-else class="message-bubble user-bubble">{{ message.content }}</div>
              <div class="message-meta">
                <span>{{ timeOf(message) }}</span>
                <span v-if="message.source" class="message-source">{{ message.source }}</span>
                <button
                  v-if="message.role === 'assistant'"
                  type="button"
                  class="message-speak"
                  :aria-label="speakingMessageId === message.id ? 'Detener lectura' : 'Leer respuesta en voz alta'"
                  @click="toggleReadAloud(message)"
                >
                  <AppIcon :name="speakingMessageId === message.id ? 'x' : 'volume'" :size="12" />
                  {{ speakingMessageId === message.id ? 'Detener' : 'Escuchar' }}
                </button>
              </div>
            </div>
            <span v-if="message.role === 'user'" class="message-avatar user">
              {{ initials }}
            </span>
          </div>

          <div v-if="assistant.pending" class="message assistant">
            <span class="message-avatar mentor">
              <AppIcon name="spark" :size="15" />
            </span>
            <div class="message-body">
              <div class="message-bubble typing">
                <span />
                <span />
                <span />
              </div>
              <span class="message-meta">Mentor está pensando…</span>
            </div>
          </div>
        </div>

        <div v-if="assistant.error" class="chat-error">
          <AppIcon name="alert" :size="15" />
          {{ assistant.error }}
        </div>
        <div v-if="voiceNotice" class="chat-error" role="status">
          <AppIcon name="info" :size="15" />
          {{ voiceNotice }}
        </div>

        <div class="chat-suggestions">
          <button
            type="button"
            class="suggestion"
            @click="preparePrompt(promptWithLines([
              'Analiza este error de programación. Explica la causa probable y propón pasos concretos para corregirlo.',
              '',
              'Error completo:',
              '',
              'Código relacionado:',
            ]))"
          >
            Analizar error
          </button>
          <button
            type="button"
            class="suggestion"
            @click="preparePrompt(promptWithLines([
              'Explícame este código paso a paso, qué hace cada parte y qué conceptos debería aprender.',
              '',
              'Código:',
            ]))"
          >
            Explicar código
          </button>
          <button
            v-for="suggestion in suggestions"
            :key="suggestion.label"
            type="button"
            class="suggestion"
            @click="useSuggestion(suggestion.text)"
          >
            {{ suggestion.label }}
          </button>
        </div>

        <form class="composer" @submit.prevent="send()">
          <textarea
            v-model="draft"
            ref="composerInput"
            class="composer-input"
            rows="2"
            maxlength="1200"
            placeholder="Escribe tu duda… (Enter para enviar, Shift+Enter para salto de línea)"
            aria-label="Mensaje para el mentor"
            @keydown="handleComposerKeydown"
          />
          <button
            type="button"
            class="btn btn-ghost btn-icon voice-button"
            :class="{ active: listening }"
            :aria-label="listening ? 'Detener dictado' : 'Dictar pregunta por voz'"
            :aria-pressed="listening"
            :disabled="assistant.pending"
            @click="toggleDictation"
          >
            <AppIcon :name="listening ? 'x' : 'mic'" :size="17" />
          </button>
          <button type="submit" class="btn btn-primary composer-send" :disabled="!draft.trim() || assistant.pending">
            <AppIcon name="send" :size="17" />
            <span>Enviar</span>
          </button>
        </form>
        <p class="composer-note">
          <AppIcon name="shield" :size="12" />
          Voz: depende de tu navegador. El análisis personalizado de código requiere conectar una IA en Ajustes.
        </p>
      </section>

      <aside class="mentor-side">
        <div v-if="quiz.status === 'playing' && currentQuestion" class="card context-card">
          <div class="row-between">
            <span class="chip chip-brand">
              <AppIcon name="target" :size="13" />
              En sesión
            </span>
            <span class="tiny dim">{{ topicLabel }}</span>
          </div>
          <h3>Pregunta actual</h3>
          <p class="context-prompt">{{ currentQuestion.prompt }}</p>
          <div class="context-meta">
            <span class="chip">{{ currentQuestion.concept }}</span>
            <span class="chip">Dificultad {{ currentQuestion.difficulty }}/5</span>
          </div>
          <div class="context-actions">
            <button type="button" class="btn btn-primary btn-sm btn-block" @click="hintForCurrent">
              <AppIcon name="lightbulb" :size="14" />
              Dame una pista
            </button>
            <button type="button" class="btn btn-outline btn-sm btn-block" @click="explainCurrent">
              <AppIcon name="book" :size="14" />
              Explícame el concepto
            </button>
          </div>
        </div>

        <div v-else class="card context-card">
          <div class="row-between">
            <span class="chip chip-violet">
              <AppIcon name="brain" :size="13" />
              Recomendado
            </span>
            <span class="tiny dim">Nivel {{ levelInfo.level }}</span>
          </div>
          <h3>Refuerza tu punto débil</h3>
          <div v-if="weak.length" class="weak-context">
            <div v-for="concept in weak" :key="concept.key" class="weak-context-item">
              <span class="pool-dot" :style="{ background: concept.topicColor }" />
              <span class="weak-context-copy">
                <strong>{{ concept.label }}</strong>
                <small>{{ concept.topicName }} · {{ Math.round(concept.mastery * 100) }}%</small>
              </span>
            </div>
            <button type="button" class="btn btn-primary btn-sm btn-block" @click="explainWeak">
              <AppIcon name="chat" :size="14" />
              Explícame el primero
            </button>
          </div>
          <p v-else class="small muted">
            Completa una sesión de práctica y aquí verás qué concepto conviene reforzar.
          </p>
        </div>

        <div class="card socratic-card">
          <div class="row-between">
            <h3>Modo socrático</h3>
            <button
              type="button"
              class="switch"
              role="switch"
              :aria-checked="assistant.socratic"
              aria-label="Activar modo socrático"
              @click="setSocratic(!assistant.socratic)"
            />
          </div>
          <p class="small muted">
            {{
              assistant.socratic
                ? 'El mentor te da pistas y preguntas guía. Aprenderás más al razonar.'
                : 'El mentor puede darte la respuesta y la explicación completa.'
            }}
          </p>
        </div>

        <div class="card practice-card">
          <div class="row-between">
            <h3>Práctica rápida</h3>
            <span v-if="practiceAnswered" class="tiny dim">
              {{ practiceCorrect }}/{{ practiceAnswered }} correctas
            </span>
          </div>
          <label class="practice-label" for="practice-topic">Tema</label>
          <select
            id="practice-topic"
            v-model="practiceTopic"
            class="practice-select"
            @change="resetPracticeQuestion"
          >
            <option value="all">Todos</option>
            <option v-for="topic in topicOptions" :key="topic.id" :value="topic.id">
              {{ topic.name }}
            </option>
          </select>
          <template v-if="practiceQuestion">
            <p class="practice-prompt">{{ practiceQuestion.prompt }}</p>
            <pre v-if="practiceQuestion.code" class="practice-code"><code>{{ practiceQuestion.code }}</code></pre>
            <div class="practice-options">
              <button
                v-for="(option, index) in practiceQuestion.options"
                :key="option"
                type="button"
                class="practice-option"
                :class="{
                  correct: practiceRevealed && index === practiceQuestion.answer,
                  incorrect: practiceRevealed && index === practiceSelected && index !== practiceQuestion.answer,
                }"
                :disabled="practiceRevealed"
                @click="checkPracticeAnswer(index)"
              >
                {{ option }}
              </button>
            </div>
            <p v-if="practiceRevealed" class="practice-feedback">
              {{ practiceQuestion.explanation }}
            </p>
          </template>
          <p v-else class="small muted">
            Responde una pregunta y revisa la explicación al instante.
          </p>
          <button
            type="button"
            class="btn btn-primary btn-sm btn-block"
            :disabled="practiceQuestion && !practiceRevealed"
            @click="startQuickPractice"
          >
            {{ practiceQuestion ? 'Siguiente pregunta' : 'Empezar práctica' }}
          </button>
          <small class="practice-note">Práctica independiente: no modifica tu XP ni tu progreso.</small>
        </div>

        <div class="card stats-card">
          <h3>Tu actividad con el mentor</h3>
          <div class="mentor-stats">
            <div>
              <strong>{{ assistantStats.conversations }}</strong>
              <span>{{ assistantStats.conversations === 1 ? 'pregunta' : 'preguntas' }}</span>
            </div>
            <div>
              <strong>{{ assistantStats.messages }}</strong>
              <span>consultas totales</span>
            </div>
          </div>
          <p class="help">
            Preguntar no es hacer trampa: es la forma más rápida de detectar qué no
            entiendes.
          </p>
        </div>

        <div v-if="!isRemoteConfigured" class="card upgrade-card">
          <span class="upgrade-icon"><AppIcon name="wand" :size="18" /></span>
          <div>
            <h3>¿Quieres IA generativa?</h3>
            <p class="small muted">
              Conecta un proveedor compatible con OpenAI desde Ajustes. Sin clave, el mentor
              local sigue funcionando.
            </p>
            <RouterLink to="/ajustes" class="btn btn-outline btn-sm">
              Configurar mentor IA
              <AppIcon name="arrow-right" :size="14" />
            </RouterLink>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.mentor-head-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.mentor-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(280px, 0.75fr);
  gap: 20px;
  align-items: start;
}

.chat {
  display: flex;
  flex-direction: column;
  padding: 0;
  overflow: hidden;
  min-height: 640px;
  max-height: calc(100vh - 210px);
}

.chat-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 18px;
  border-bottom: 1px solid var(--border);
  background: rgba(255, 255, 255, 0.02);
  flex-wrap: wrap;
}

.mentor-identity {
  display: flex;
  align-items: center;
  gap: 11px;
}

.mentor-avatar {
  position: relative;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  background: var(--gradient);
  color: #06121a;
  flex: none;
}

.mentor-online {
  position: absolute;
  right: -2px;
  bottom: -2px;
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: var(--success);
  border: 2px solid #0b1020;
}

.mentor-identity strong {
  display: block;
  font-family: var(--font-display);
  font-size: 0.92rem;
  color: #fff;
}

.mentor-identity small {
  display: block;
  font-size: 0.68rem;
  color: var(--muted-2);
}

.chat-head-actions {
  display: flex;
  align-items: center;
  gap: 7px;
}

.socratic-toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: var(--surface-2);
  color: var(--muted);
  font-size: 0.7rem;
  font-weight: 600;
  transition: border-color 160ms ease, color 160ms ease, background 160ms ease;
}

.socratic-toggle.active {
  border-color: rgba(167, 139, 250, 0.4);
  background: rgba(167, 139, 250, 0.1);
  color: var(--violet);
}

.toggle-state {
  font-family: var(--font-mono);
  font-size: 0.6rem;
  opacity: 0.8;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px 18px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  scroll-behavior: smooth;
}

.message {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  max-width: 100%;
}

.message.user {
  justify-content: flex-end;
}

.message-avatar {
  width: 30px;
  height: 30px;
  border-radius: 9px;
  display: grid;
  place-items: center;
  flex: none;
  font-size: 0.62rem;
  font-weight: 700;
}

.message-avatar.mentor {
  background: rgba(124, 245, 196, 0.13);
  color: var(--brand);
  border: 1px solid rgba(124, 245, 196, 0.2);
}

.message-avatar.user {
  background: var(--gradient);
  color: #06121a;
}

.message-body {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-width: min(84%, 720px);
  min-width: 0;
}

.message.user .message-body {
  align-items: flex-end;
}

.message-bubble {
  padding: 12px 15px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid var(--border);
  border-top-left-radius: 4px;
  width: 100%;
}

.message.user .message-bubble {
  background: linear-gradient(135deg, rgba(124, 245, 196, 0.16), rgba(91, 168, 255, 0.12));
  border-color: rgba(124, 245, 196, 0.22);
  border-top-left-radius: 14px;
  border-top-right-radius: 4px;
}

.user-bubble {
  white-space: pre-wrap;
  font-size: 0.87rem;
  color: #e6f7f1;
}

.message-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.62rem;
  color: var(--muted-2);
  padding: 0 3px;
}

.message-source {
  padding: 1px 6px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.05);
  font-size: 0.6rem;
}

.message-speak {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 0;
  border: 0;
  background: none;
  color: var(--muted-2);
  font-size: inherit;
}

.message-speak:hover {
  color: var(--brand);
}

.typing {
  display: flex;
  align-items: center;
  gap: 4px;
  width: fit-content;
  padding: 14px 16px;
}

.typing span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--muted);
  animation: typingBounce 1.2s infinite;
}

.typing span:nth-child(2) {
  animation-delay: 0.15s;
}

.typing span:nth-child(3) {
  animation-delay: 0.3s;
}

@keyframes typingBounce {
  0%,
  60%,
  100% {
    transform: translateY(0);
    opacity: 0.4;
  }
  30% {
    transform: translateY(-4px);
    opacity: 1;
  }
}

.chat-error {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 18px 10px;
  padding: 9px 12px;
  border-radius: 9px;
  background: rgba(251, 191, 36, 0.08);
  border: 1px solid rgba(251, 191, 36, 0.22);
  color: var(--warning);
  font-size: 0.74rem;
}

.chat-suggestions {
  display: flex;
  gap: 7px;
  padding: 10px 18px 0;
  overflow-x: auto;
  scrollbar-width: none;
  flex-wrap: nowrap;
}

.chat-suggestions::-webkit-scrollbar {
  display: none;
}

.suggestion {
  padding: 6px 11px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: var(--surface-2);
  color: var(--muted);
  font-size: 0.7rem;
  white-space: nowrap;
  transition: border-color 160ms ease, color 160ms ease;
  flex: none;
}

.suggestion:hover {
  border-color: rgba(124, 245, 196, 0.35);
  color: var(--brand);
}

.composer {
  display: flex;
  align-items: flex-end;
  gap: 9px;
  padding: 12px 18px 8px;
}

.composer-input {
  flex: 1;
  min-height: 52px;
  max-height: 150px;
  resize: none;
  padding: 12px 14px;
  border-radius: 13px;
  border: 1px solid var(--border);
  background: rgba(7, 10, 18, 0.7);
  color: var(--text);
  font-size: 0.87rem;
  line-height: 1.5;
}

.composer-input:focus {
  outline: none;
  border-color: rgba(124, 245, 196, 0.45);
  box-shadow: 0 0 0 3px rgba(124, 245, 196, 0.1);
}

.composer-send {
  height: 46px;
  flex: none;
}

.voice-button {
  width: 46px;
  height: 46px;
  flex: none;
}

.voice-button.active {
  color: var(--warning);
  border-color: var(--warning);
}

.composer-note {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 0 18px 12px;
  font-size: 0.64rem;
  color: var(--muted-2);
}

.mentor-side {
  display: flex;
  flex-direction: column;
  gap: 14px;
  position: sticky;
  top: calc(var(--topbar-height) + 18px);
}

.context-card h3 {
  margin-top: 12px;
  font-size: 0.95rem;
}

.context-prompt {
  margin-top: 7px;
  font-size: 0.8rem;
  color: var(--text);
  line-height: 1.5;
  padding: 10px 12px;
  border-radius: 9px;
  background: rgba(124, 245, 196, 0.05);
  border-left: 2px solid var(--brand);
}

.context-meta {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 10px;
}

.context-actions {
  display: flex;
  flex-direction: column;
  gap: 7px;
  margin-top: 14px;
}

.weak-context {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 12px 0 14px;
}

.weak-context-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.weak-context-copy {
  display: flex;
  flex-direction: column;
  line-height: 1.3;
}

.weak-context-copy strong {
  font-size: 0.78rem;
  color: var(--text);
}

.weak-context-copy small {
  font-size: 0.67rem;
  color: var(--muted-2);
}

.pool-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex: none;
}

.socratic-card h3,
.stats-card h3,
.upgrade-card h3 {
  font-size: 0.9rem;
}

.socratic-card p {
  margin-top: 7px;
}

.practice-card h3 {
  font-size: 0.9rem;
}

.practice-label {
  display: block;
  margin: 12px 0 5px;
  color: var(--muted-2);
  font-size: 0.68rem;
}

.practice-select {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface-2);
  color: var(--text);
}

.practice-prompt {
  margin: 12px 0 8px;
  font-size: 0.82rem;
  line-height: 1.5;
}

.practice-code {
  overflow-x: auto;
  margin: 0 0 9px;
  padding: 9px;
  border-radius: 8px;
  background: rgba(7, 10, 18, 0.7);
  color: var(--brand);
  font-size: 0.72rem;
  white-space: pre-wrap;
}

.practice-options {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 10px;
}

.practice-option {
  padding: 8px 10px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface-2);
  color: var(--text);
  font-size: 0.72rem;
  text-align: left;
}

.practice-option:not(:disabled):hover {
  border-color: rgba(124, 245, 196, 0.45);
}

.practice-option.correct {
  border-color: var(--brand);
  background: rgba(124, 245, 196, 0.1);
}

.practice-option.incorrect {
  border-color: var(--danger);
  background: rgba(248, 113, 113, 0.1);
}

.practice-feedback {
  margin: 8px 0 12px;
  color: var(--muted);
  font-size: 0.72rem;
  line-height: 1.5;
}

.practice-note {
  display: block;
  margin-top: 8px;
  color: var(--muted-2);
  font-size: 0.62rem;
}

.mentor-stats {
  display: flex;
  gap: 24px;
  margin: 14px 0 10px;
}

.mentor-stats div {
  display: flex;
  flex-direction: column;
}

.mentor-stats strong {
  font-family: var(--font-display);
  font-size: 1.4rem;
  color: #fff;
}

.mentor-stats span {
  font-size: 0.65rem;
  color: var(--muted-2);
}

.upgrade-card {
  display: flex;
  gap: 11px;
  background: linear-gradient(140deg, rgba(167, 139, 250, 0.09), rgba(255, 255, 255, 0.02));
  border-color: rgba(167, 139, 250, 0.2);
}

.upgrade-icon {
  color: var(--violet);
  flex: none;
}

.upgrade-card p {
  margin: 5px 0 10px;
}

@media (max-width: 1080px) {
  .mentor-grid {
    grid-template-columns: 1fr;
  }

  .mentor-side {
    position: static;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    align-items: start;
  }
}

@media (max-width: 760px) {
  .chat {
    min-height: 540px;
    max-height: calc(100vh - 190px);
  }

  .mentor-side {
    grid-template-columns: 1fr;
  }

  .message-body {
    max-width: calc(100% - 40px);
  }

  .composer-send span {
    display: none;
  }

  .composer-send {
    width: 46px;
    padding: 0;
  }

  .chat-head {
    padding: 12px 14px;
  }

  .chat-messages {
    padding: 16px 14px;
  }

  .composer {
    padding: 10px 14px 6px;
  }

  .composer-note {
    padding: 0 14px 10px;
  }
}
</style>
