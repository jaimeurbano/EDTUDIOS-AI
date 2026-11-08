<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import AppIcon from '../components/AppIcon.vue'
import ProgressRing from '../components/ProgressRing.vue'
import {
  abandonSession,
  availablePool,
  currentQuestion,
  nextQuestion,
  progressPercent,
  quiz,
  restartSession,
  startSession,
  submitAnswer,
  topicLabel,
  useHint,
} from '../composables/useAdaptiveQuiz'
import { DIFFICULTY_LABELS, TOPICS, TOPIC_LIST } from '../data/questions'
import { askMentor } from '../stores/useAssistant'
import { masteryFor, progress, updateProfile } from '../stores/useProgress'
import { formatDuration, formatNumber } from '../utils/format'
import { renderMarkdown } from '../utils/markdown'

const route = useRoute()
const router = useRouter()

const selectedTopic = ref('mix')
const selectedLength = ref(progress.profile.quizLength || 8)
const lengths = [6, 8, 12]

const lengthEstimate = computed(() => {
  const ranges = { 6: '4 y 6', 8: '5 y 8', 12: '8 y 12' }
  const range = ranges[selectedLength.value] || ranges[8]
  return `${selectedLength.value} preguntas suelen tomar entre ${range} minutos.`
})

const setupTopics = computed(() => {
  const topics = TOPIC_LIST.map((topic) => {
    const pool = availablePool.value.find((p) => p.id === topic.id) || { unseen: 0, total: 0 }
    return {
      ...topic,
      unseen: pool.unseen,
      total: pool.total,
      mastery: masteryFor(topic.id),
      recommended: DIFFICULTY_LABELS[Math.min(4, Math.max(0, Math.round(progress.ability[topic.id]) - 1))],
    }
  })
  return [
    ...topics,
    {
      id: 'mix',
      name: 'Mezcla adaptativa',
      short: 'Mix',
      tagline: 'Lo mejor de los tres mundos',
      description: 'El motor elige el tema que más necesitas en cada pregunta.',
      color: '#a78bfa',
      accent: '#c4b5fd',
      icon: 'layers',
      unseen: availablePool.value.reduce((sum, t) => sum + t.unseen, 0),
      total: availablePool.value.reduce((sum, t) => sum + t.total, 0),
      mastery: (masteryFor('javascript') + masteryFor('vue') + masteryFor('css')) / 3,
      recommended: 'Adaptativo',
    },
  ]
})

const selectedPool = computed(
  () => setupTopics.value.find((t) => t.id === selectedTopic.value) || setupTopics.value[0],
)

const difficultyBars = computed(() => {
  const level = currentQuestion.value?.difficulty || 1
  return Array.from({ length: 5 }, (_, index) => index + 1 <= level)
})

const questionNumber = computed(() => Math.min(quiz.length, quiz.answers.length + (quiz.revealed ? 0 : 1)))
const isLast = computed(() => quiz.answers.length >= quiz.length)
const feedback = computed(() => quiz.lastResult)
const currentConcept = computed(() => currentQuestion.value?.concept || '')

const summaryMessage = computed(() => {
  const value = quiz.summary?.accuracy || 0
  if (value === 100) return 'Sesión perfecta. El siguiente nivel te está esperando.'
  if (value >= 80) return 'Muy sólido. Estás listo para subir la dificultad.'
  if (value >= 60) return 'Buen trabajo. Refuerza los conceptos con menor precisión.'
  return 'Cada error es un mapa. Repasa las explicaciones y vuelve a intentarlo.'
})

const summaryColor = computed(() => {
  const value = quiz.summary?.accuracy || 0
  if (value >= 80) return '#34d399'
  if (value >= 60) return '#fbbf24'
  return '#fb7185'
})

const abilityDeltas = computed(() => {
  const deltas = quiz.summary?.abilityDelta || {}
  return Object.entries(deltas)
    .filter(([, value]) => Math.abs(value) > 0.005)
    .map(([topic, value]) => ({
      topic,
      name: TOPICS[topic]?.name || topic,
      color: TOPICS[topic]?.color || '#7cf5c4',
      value,
    }))
})

function start() {
  updateProfile({ quizLength: selectedLength.value })
  startSession(selectedTopic.value, { length: selectedLength.value })
}

function optionState(index) {
  if (!quiz.revealed) return ''
  if (!currentQuestion.value) return ''
  if (index === currentQuestion.value.answer) return 'correct'
  if (index === quiz.selected) return 'wrong'
  return 'dim'
}

function answer(index) {
  if (quiz.revealed) return
  submitAnswer(index)
}

function next() {
  nextQuestion()
}

function revealHint() {
  useHint()
}

function exitSession() {
  if (quiz.answers.length && !window.confirm('¿Salir de la sesión? Se guardará tu XP, pero no completarás el resumen.')) {
    return
  }
  abandonSession()
}

function newSession() {
  abandonSession()
}

function repeatSession() {
  restartSession()
}

function askAboutQuestion() {
  const question = currentQuestion.value
  if (!question) return
  const result = feedback.value
  const chosen = result ? question.options[result.selected] : 'sin responder'
  const correctOption = question.options[question.answer]
  askMentor(
    `Estoy practicando ${question.concept}. La pregunta era: "${question.prompt}". Elegí "${chosen}" y la correcta era "${correctOption}". Explícame el razonamiento paso a paso, sin darme solo la respuesta.`,
  )
  router.push('/mentor')
}

function askAboutWeakest() {
  const weakest = quiz.summary?.weakest
  askMentor(
    weakest
      ? `Acabo de terminar una sesión de ${quiz.summary.topicLabel}. Mi concepto más flojo fue "${weakest.label}" con ${weakest.accuracy}% de acierto. Explícamelo desde cero con un ejemplo cotidiano.`
      : 'Acabo de terminar una sesión de práctica. ¿Qué me recomiendas estudiar después?',
  )
  router.push('/mentor')
}

function topicColor(topicId) {
  return TOPICS[topicId]?.color || '#7cf5c4'
}

function formatDelta(value) {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}`
}

function handleKey(event) {
  if (quiz.status !== 'playing') return
  const target = event.target
  const tag = target?.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || target?.isContentEditable) return

  if (!quiz.revealed && ['1', '2', '3', '4'].includes(event.key)) {
    const index = Number(event.key) - 1
    if (index < (currentQuestion.value?.options.length || 0)) {
      event.preventDefault()
      answer(index)
    }
  } else if (!quiz.revealed && event.key.toLowerCase() === 'h') {
    event.preventDefault()
    revealHint()
  } else if (quiz.revealed && event.key === 'Enter') {
    event.preventDefault()
    next()
  }
}

function syncTopicFromQuery() {
  const topic = route.query.tema
  if (typeof topic === 'string' && (TOPICS[topic] || topic === 'mix')) {
    selectedTopic.value = topic
    if (quiz.status === 'finished') abandonSession()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKey)
  syncTopicFromQuery()
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKey)
})

watch(() => route.query.tema, syncTopicFromQuery)
</script>

<template>
  <div class="practice">
    <!-- ───────────── Configuración ───────────── -->
    <template v-if="quiz.status === 'idle'">
      <header class="page-head animate-in">
        <div>
          <span class="eyebrow">Practicar</span>
          <h1>Entrena con preguntas que <span class="gradient-text">se adaptan a ti</span></h1>
          <p>
            El motor estima tu nivel en cada tema y elige la siguiente pregunta en tu zona
            de desarrollo próximo: ni demasiado fácil, ni imposible. Nunca repite una
            pregunta hasta agotar el banco.
          </p>
        </div>
      </header>

      <div v-if="quiz.error" class="alert">
        <AppIcon name="alert" :size="18" />
        {{ quiz.error }}
      </div>

      <div class="setup-grid">
        <section class="card card-pad-lg setup-topics animate-in delay-1">
          <div class="row-between">
            <div>
              <h2>¿Qué quieres practicar?</h2>
              <p class="small muted">Elige un tema o deja que el motor decida por ti.</p>
            </div>
            <span class="chip chip-brand">
              <AppIcon name="spark" :size="13" />
              Adaptativo
            </span>
          </div>

          <div class="topic-options">
            <button
              v-for="topic in setupTopics"
              :key="topic.id"
              type="button"
              class="topic-option"
              :class="{ selected: selectedTopic === topic.id }"
              :style="{ '--topic-color': topic.color }"
              @click="selectedTopic = topic.id"
            >
              <span class="topic-option-icon">
                <AppIcon :name="topic.icon" :size="20" />
              </span>
              <span class="topic-option-copy">
                <strong>{{ topic.name }}</strong>
                <small>{{ topic.tagline }}</small>
                <span class="topic-option-meta">
                  {{ topic.unseen }} sin ver · {{ Math.round(topic.mastery * 100) }}% dominio
                </span>
              </span>
              <span class="topic-option-check">
                <AppIcon name="check" :size="13" />
              </span>
            </button>
          </div>

          <div class="length-row">
            <div>
              <span class="field-label">Duración de la sesión</span>
              <p class="help">{{ lengthEstimate }}</p>
            </div>
            <div class="length-options">
              <button
                v-for="value in lengths"
                :key="value"
                type="button"
                class="length-option"
                :class="{ selected: selectedLength === value }"
                @click="selectedLength = value"
              >
                {{ value }}
                <small>preguntas</small>
              </button>
            </div>
          </div>

          <div class="start-row">
            <div class="start-info">
              <span class="chip">
                <AppIcon name="target" :size="13" />
                Nivel recomendado: {{ selectedPool.recommended }}
              </span>
              <span class="chip">
                <AppIcon name="layers" :size="13" />
                {{ selectedPool.unseen }} preguntas nuevas disponibles
              </span>
            </div>
            <button type="button" class="btn btn-primary btn-lg" @click="start">
              <AppIcon name="play" :size="17" />
              Empezar sesión
            </button>
          </div>
        </section>

        <aside class="setup-side">
          <div class="card how-card">
            <h3>Cómo funciona</h3>
            <ul class="how-list">
              <li>
                <span class="how-icon"><AppIcon name="brain" :size="16" /></span>
                <div>
                  <strong>Dificultad adaptativa</strong>
                  <p>Un modelo tipo Elo estima tu habilidad y ajusta cada pregunta.</p>
                </div>
              </li>
              <li>
                <span class="how-icon"><AppIcon name="eye" :size="16" /></span>
                <div>
                  <strong>Sin repetición</strong>
                  <p>Las preguntas vistas quedan en cuarentena hasta completar el banco.</p>
                </div>
              </li>
              <li>
                <span class="how-icon"><AppIcon name="refresh" :size="16" /></span>
                <div>
                  <strong>Repaso espaciado</strong>
                  <p>Los conceptos fallados vuelven a aparecer en el momento justo.</p>
                </div>
              </li>
            </ul>
          </div>

          <div class="card pool-card">
            <div class="row-between">
              <h3>Tu banco de preguntas</h3>
              <span class="chip">{{ progress.answered }} intentos</span>
            </div>
            <div class="pool-list">
              <div v-for="topic in availablePool" :key="topic.id" class="pool-item">
                <span class="pool-dot" :style="{ background: topic.color }" />
                <span class="pool-name">{{ topic.name }}</span>
                <span class="pool-count">{{ topic.unseen }}/{{ topic.total }}</span>
                <div class="bar bar-thin pool-bar">
                  <span
                    :style="{
                      width: `${Math.round((topic.seen / topic.total) * 100)}%`,
                      background: topic.color,
                    }"
                  />
                </div>
              </div>
            </div>
            <p class="help">
              Cuando agotas un tema, el ciclo se reinicia priorizando lo que viste hace más
              tiempo.
            </p>
          </div>

          <div class="card tip-card">
            <span class="tip-icon"><AppIcon name="lightbulb" :size="18" /></span>
            <p>
              <strong>Atajo:</strong> responde con las teclas <span class="mono">1</span> a
              <span class="mono">4</span>, pide una pista con <span class="mono">H</span> y
              avanza con <span class="mono">Enter</span>.
            </p>
          </div>
        </aside>
      </div>
    </template>

    <!-- ───────────── Sesión en curso ───────────── -->
    <template v-else-if="quiz.status === 'playing' && currentQuestion">
      <div class="quiz-shell animate-in">
        <header class="quiz-top">
          <button type="button" class="btn btn-ghost btn-sm" @click="exitSession">
            <AppIcon name="arrow-left" :size="15" />
            Salir
          </button>

          <div class="quiz-status">
            <span class="chip" :style="{ borderColor: `${topicColor(quiz.topic === 'mix' ? 'vue' : quiz.topic)}40` }">
              <AppIcon :name="quiz.mode === 'mix' ? 'layers' : TOPICS[quiz.topic]?.icon" :size="13" />
              {{ topicLabel }}
            </span>
            <span class="quiz-counter">Pregunta {{ questionNumber }} de {{ quiz.length }}</span>
          </div>

          <div class="quiz-stats">
            <span v-if="quiz.combo >= 2" class="chip chip-warning combo">
              <AppIcon name="flame" :size="13" />
              x{{ quiz.combo }}
            </span>
            <span class="chip">
              <AppIcon name="bolt" :size="13" />
              {{ formatNumber(quiz.xpEarned) }} XP
            </span>
          </div>
        </header>

        <div class="quiz-progress">
          <div class="bar">
            <span :style="{ width: `${progressPercent}%` }" />
          </div>
          <div class="quiz-progress-meta">
            <span class="difficulty-label">
              Dificultad
              <span class="difficulty-bars" :title="`Nivel ${currentQuestion.difficulty} de 5`">
                <span
                  v-for="(active, index) in difficultyBars"
                  :key="index"
                  :class="{ active }"
                />
              </span>
              {{ DIFFICULTY_LABELS[currentQuestion.difficulty - 1] }}
            </span>
            <span class="tiny dim">{{ Math.round(progressPercent) }}% completado</span>
          </div>
        </div>

        <article class="card question-card">
          <div class="question-head">
            <span class="chip chip-brand">
              <AppIcon name="code" :size="13" />
              {{ currentConcept }}
            </span>
            <span class="chip">{{ TOPICS[currentQuestion.topic]?.name }}</span>
            <button
              v-if="!quiz.revealed"
              type="button"
              class="btn btn-ghost btn-sm hint-btn"
              @click="revealHint"
            >
              <AppIcon name="lightbulb" :size="14" />
              Pista (H)
            </button>
          </div>

          <h2 class="question-prompt">{{ currentQuestion.prompt }}</h2>

          <div v-if="currentQuestion.code" class="question-code">
            <div class="code-head">
              <span>código</span>
              <span class="tiny dim">léelo con calma</span>
            </div>
            <pre><code>{{ currentQuestion.code }}</code></pre>
          </div>

          <Transition name="fade">
            <div v-if="quiz.hintVisible" class="hint-box">
              <AppIcon name="lightbulb" :size="17" />
              <div>
                <strong>Pista</strong>
                <p>{{ currentQuestion.hint }}</p>
              </div>
            </div>
          </Transition>

          <div class="options" role="group" aria-label="Opciones de respuesta">
            <button
              v-for="(option, index) in currentQuestion.options"
              :key="option"
              type="button"
              class="option"
              :class="optionState(index)"
              :disabled="quiz.revealed"
              @click="answer(index)"
            >
              <span class="option-letter">{{ String.fromCharCode(65 + index) }}</span>
              <span class="option-text">{{ option }}</span>
              <span v-if="quiz.revealed && index === currentQuestion.answer" class="option-mark">
                <AppIcon name="check" :size="16" />
              </span>
              <span
                v-else-if="quiz.revealed && index === quiz.selected"
                class="option-mark wrong"
              >
                <AppIcon name="x" :size="16" />
              </span>
            </button>
          </div>

          <div class="question-foot">
            <span class="tiny dim">
              <AppIcon name="info" :size="12" class="inline-icon" />
              Responde con 1-4 · Pista con H
            </span>
            <span v-if="!quiz.revealed" class="tiny dim">Elige la opción que consideres correcta</span>
          </div>
        </article>

        <Transition name="slide">
          <div v-if="feedback" class="feedback card" :class="feedback.correct ? 'ok' : 'bad'">
            <div class="feedback-head">
              <span class="feedback-icon">
                <AppIcon :name="feedback.correct ? 'check' : 'x'" :size="20" />
              </span>
              <div class="feedback-title">
                <strong>{{ feedback.correct ? '¡Correcto!' : 'Casi lo tienes' }}</strong>
                <span class="small">
                  {{ feedback.correct ? `+${feedback.xp} XP` : `+${feedback.xp} XP por intentarlo` }}
                  · dificultad {{ DIFFICULTY_LABELS[feedback.difficulty - 1] }}
                </span>
              </div>
              <span class="chip" :class="feedback.abilityAfter >= feedback.abilityBefore ? 'chip-brand' : 'chip-warning'">
                <AppIcon :name="feedback.abilityAfter >= feedback.abilityBefore ? 'arrow-right' : 'refresh'" :size="12" />
                Nivel {{ feedback.abilityAfter.toFixed(1) }}
              </span>
            </div>

            <div class="feedback-explanation md" v-html="renderMarkdown(feedback.explanation)" />

            <div class="feedback-actions">
              <button type="button" class="btn btn-ghost btn-sm" @click="askAboutQuestion">
                <AppIcon name="chat" :size="14" />
                Preguntar al mentor
              </button>
              <button type="button" class="btn btn-primary" @click="next">
                {{ isLast ? 'Ver resultados' : 'Siguiente pregunta' }}
                <AppIcon name="arrow-right" :size="16" />
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </template>

    <!-- ───────────── Resumen ───────────── -->
    <template v-else-if="quiz.status === 'finished' && quiz.summary">
      <div class="summary animate-in">
        <header class="summary-head">
          <div class="summary-ring">
            <ProgressRing
              :value="quiz.summary.accuracy"
              :size="148"
              :stroke="10"
              :color="summaryColor"
              :label="`Precisión ${quiz.summary.accuracy}%`"
            >
              <div class="summary-ring-center">
                <strong>{{ quiz.summary.accuracy }}%</strong>
                <span>precisión</span>
              </div>
            </ProgressRing>
          </div>
          <div class="summary-copy">
            <span class="eyebrow">Sesión completada</span>
            <h1>{{ summaryMessage }}</h1>
            <p class="muted">
              {{ quiz.summary.correct }} de {{ quiz.summary.total }} correctas en
              {{ quiz.summary.topicLabel }}. Tu dificultad objetivo se ha recalibrado.
            </p>
            <div class="summary-badges">
              <span class="chip chip-brand">
                <AppIcon name="bolt" :size="13" />
                +{{ quiz.summary.xp }} XP
              </span>
              <span class="chip chip-warning">
                <AppIcon name="flame" :size="13" />
                Combo máximo x{{ quiz.summary.maxCombo }}
              </span>
              <span class="chip">
                <AppIcon name="clock" :size="13" />
                {{ formatDuration(quiz.summary.duration) }}
              </span>
              <span v-if="quiz.summary.accuracy === 100" class="chip chip-violet">
                <AppIcon name="trophy" :size="13" />
                Sesión perfecta
              </span>
            </div>
          </div>
        </header>

        <div class="summary-grid">
          <section class="card">
            <h3>Precisión por concepto</h3>
            <p class="small muted">El motor usará esto para elegir tus próximas preguntas.</p>
            <div class="concept-results">
              <div
                v-for="concept in quiz.summary.concepts"
                :key="concept.key"
                class="concept-result"
              >
                <div class="concept-result-head">
                  <span class="concept-result-name">
                    <span class="pool-dot" :style="{ background: topicColor(concept.topic) }" />
                    {{ concept.label }}
                  </span>
                  <span class="concept-result-score" :class="{ low: concept.accuracy < 60 }">
                    {{ concept.correct }}/{{ concept.attempts }}
                  </span>
                </div>
                <div class="bar bar-thin">
                  <span
                    :style="{
                      width: `${Math.max(5, concept.accuracy)}%`,
                      background: topicColor(concept.topic),
                    }"
                  />
                </div>
              </div>
            </div>
          </section>

          <section class="card">
            <h3>Ajuste adaptativo</h3>
            <p class="small muted">Cambio estimado de tu nivel de habilidad por tema.</p>
            <div v-if="abilityDeltas.length" class="delta-list">
              <div v-for="delta in abilityDeltas" :key="delta.topic" class="delta-item">
                <span class="pool-dot" :style="{ background: delta.color }" />
                <span class="delta-name">{{ delta.name }}</span>
                <span class="delta-value" :class="{ up: delta.value > 0, down: delta.value < 0 }">
                  {{ formatDelta(delta.value) }}
                </span>
              </div>
            </div>
            <p v-else class="small muted">Sin cambios significativos en esta sesión.</p>

            <div class="next-focus">
              <span class="next-focus-icon">
                <AppIcon name="target" :size="18" />
              </span>
              <div>
                <strong>Próximo foco</strong>
                <p class="small muted">
                  {{
                    quiz.summary.weakest
                      ? `${quiz.summary.weakest.label} (${quiz.summary.weakest.accuracy}% de acierto)`
                      : 'Sigue explorando nuevos conceptos.'
                  }}
                </p>
              </div>
            </div>

            <button type="button" class="btn btn-outline btn-block" @click="askAboutWeakest">
              <AppIcon name="chat" :size="15" />
              Pedir explicación al mentor
            </button>
          </section>
        </div>

        <div class="summary-actions">
          <button type="button" class="btn btn-primary btn-lg" @click="repeatSession">
            <AppIcon name="rotate" :size="17" />
            Repetir con nuevas preguntas
          </button>
          <button type="button" class="btn btn-outline btn-lg" @click="newSession">
            <AppIcon name="target" :size="17" />
            Elegir otro tema
          </button>
          <RouterLink to="/progreso" class="btn btn-ghost btn-lg">
            <AppIcon name="chart" :size="17" />
            Ver mi progreso
          </RouterLink>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.alert {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid rgba(251, 113, 133, 0.3);
  background: rgba(251, 113, 133, 0.08);
  color: var(--danger);
  font-size: 0.85rem;
  margin-bottom: 18px;
}

/* Setup */

.setup-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.55fr) minmax(280px, 0.8fr);
  gap: 20px;
  align-items: start;
}

.setup-topics {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.topic-options {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.topic-option {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 15px;
  border-radius: 14px;
  border: 1px solid var(--border);
  background: var(--surface-2);
  text-align: left;
  transition: border-color 160ms ease, background 160ms ease, transform 160ms ease;
  position: relative;
}

.topic-option:hover {
  border-color: color-mix(in srgb, var(--topic-color) 35%, transparent);
  background: color-mix(in srgb, var(--topic-color) 5%, transparent);
  transform: translateY(-1px);
}

.topic-option.selected {
  border-color: color-mix(in srgb, var(--topic-color) 60%, transparent);
  background: color-mix(in srgb, var(--topic-color) 9%, transparent);
}

.topic-option-icon {
  width: 38px;
  height: 38px;
  border-radius: 11px;
  display: grid;
  place-items: center;
  background: color-mix(in srgb, var(--topic-color) 13%, transparent);
  color: var(--topic-color);
  flex: none;
}

.topic-option-copy {
  display: flex;
  flex-direction: column;
  min-width: 0;
  line-height: 1.35;
}

.topic-option-copy strong {
  font-size: 0.86rem;
  color: #fff;
}

.topic-option-copy small {
  font-size: 0.72rem;
  color: var(--muted);
}

.topic-option-meta {
  font-size: 0.67rem;
  color: var(--muted-2);
  margin-top: 4px;
}

.topic-option-check {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: var(--topic-color);
  color: #06121a;
  opacity: 0;
  transform: scale(0.7);
  transition: opacity 160ms ease, transform 160ms ease;
}

.topic-option.selected .topic-option-check {
  opacity: 1;
  transform: scale(1);
}

.length-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding-top: 18px;
  border-top: 1px solid var(--border);
  flex-wrap: wrap;
}

.length-options {
  display: flex;
  gap: 8px;
}

.length-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  width: 68px;
  padding: 8px 6px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: var(--surface-2);
  font-family: var(--font-display);
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--muted);
  transition: border-color 160ms ease, color 160ms ease, background 160ms ease;
}

.length-option small {
  font-family: var(--font-body);
  font-size: 0.6rem;
  font-weight: 500;
  color: var(--muted-2);
}

.length-option.selected {
  border-color: rgba(124, 245, 196, 0.5);
  background: rgba(124, 245, 196, 0.08);
  color: var(--brand);
}

.start-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding-top: 18px;
  border-top: 1px solid var(--border);
  flex-wrap: wrap;
}

.start-info {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.setup-side {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.how-card h3,
.pool-card h3 {
  font-size: 0.98rem;
}

.how-list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 16px;
}

.how-list li {
  display: flex;
  gap: 11px;
}

.how-icon {
  width: 32px;
  height: 32px;
  border-radius: 9px;
  display: grid;
  place-items: center;
  background: rgba(124, 245, 196, 0.09);
  color: var(--brand);
  flex: none;
}

.how-list strong {
  display: block;
  font-size: 0.8rem;
  color: #fff;
}

.how-list p {
  font-size: 0.73rem;
  color: var(--muted);
  line-height: 1.45;
  margin-top: 2px;
}

.pool-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 14px 0;
}

.pool-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.74rem;
}

.pool-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex: none;
}

.pool-name {
  color: var(--muted);
  width: 84px;
  flex: none;
}

.pool-count {
  font-family: var(--font-mono);
  font-size: 0.68rem;
  color: var(--muted-2);
  width: 40px;
  text-align: right;
}

.pool-bar {
  flex: 1;
}

.tip-card {
  display: flex;
  gap: 11px;
  align-items: flex-start;
  background: linear-gradient(140deg, rgba(167, 139, 250, 0.09), rgba(255, 255, 255, 0.02));
  border-color: rgba(167, 139, 250, 0.2);
}

.tip-icon {
  color: var(--violet);
  flex: none;
}

.tip-card p {
  font-size: 0.76rem;
  color: var(--muted);
  line-height: 1.5;
}

/* Quiz */

.quiz-shell {
  max-width: 880px;
  margin: 0 auto;
}

.quiz-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 18px;
  flex-wrap: wrap;
}

.quiz-status {
  display: flex;
  align-items: center;
  gap: 9px;
}

.quiz-counter {
  font-size: 0.76rem;
  color: var(--muted);
}

.quiz-stats {
  display: flex;
  gap: 6px;
}

.combo {
  animation: pulseGlow 1.8s infinite;
}

.quiz-progress {
  margin-bottom: 18px;
}

.quiz-progress-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 8px;
}

.difficulty-label {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 0.7rem;
  color: var(--muted-2);
  font-weight: 600;
}

.difficulty-bars {
  display: inline-flex;
  gap: 2px;
}

.difficulty-bars span {
  width: 12px;
  height: 4px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.1);
}

.difficulty-bars span.active {
  background: var(--gradient);
}

.question-card {
  padding: 26px;
}

.question-head {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.hint-btn {
  margin-left: auto;
}

.question-prompt {
  font-size: clamp(1.15rem, 2.4vw, 1.45rem);
  line-height: 1.4;
  color: #fff;
  margin-bottom: 16px;
}

.question-code {
  background: #060a12;
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 18px;
}

.question-code pre {
  margin: 0;
  padding: 15px 16px;
  overflow-x: auto;
  font-family: var(--font-mono);
  font-size: 0.83rem;
  line-height: 1.65;
  color: #c9d7f2;
}

.hint-box {
  display: flex;
  gap: 10px;
  padding: 12px 14px;
  border-radius: 11px;
  background: rgba(251, 191, 36, 0.07);
  border: 1px solid rgba(251, 191, 36, 0.2);
  color: var(--warning);
  margin-bottom: 16px;
}

.hint-box strong {
  font-size: 0.76rem;
  display: block;
}

.hint-box p {
  font-size: 0.8rem;
  color: #e8d8a8;
  margin-top: 2px;
}

.options {
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.option {
  display: flex;
  align-items: center;
  gap: 13px;
  width: 100%;
  padding: 13px 15px;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: rgba(255, 255, 255, 0.022);
  text-align: left;
  color: var(--text);
  font-size: 0.88rem;
  transition: border-color 150ms ease, background 150ms ease, transform 150ms ease;
}

.option:not(:disabled):hover {
  border-color: rgba(124, 245, 196, 0.35);
  background: rgba(124, 245, 196, 0.05);
  transform: translateX(2px);
}

.option:disabled {
  cursor: default;
}

.option-letter {
  width: 27px;
  height: 27px;
  border-radius: 8px;
  display: grid;
  place-items: center;
  background: var(--surface-3);
  border: 1px solid var(--border);
  font-family: var(--font-mono);
  font-size: 0.74rem;
  font-weight: 600;
  color: var(--muted);
  flex: none;
}

.option-text {
  flex: 1;
  min-width: 0;
}

.option-mark {
  color: var(--success);
  flex: none;
}

.option-mark.wrong {
  color: var(--danger);
}

.option.correct {
  border-color: rgba(52, 211, 153, 0.5);
  background: rgba(52, 211, 153, 0.08);
}

.option.correct .option-letter {
  background: rgba(52, 211, 153, 0.2);
  border-color: rgba(52, 211, 153, 0.4);
  color: var(--success);
}

.option.wrong {
  border-color: rgba(251, 113, 133, 0.5);
  background: rgba(251, 113, 133, 0.08);
}

.option.wrong .option-letter {
  background: rgba(251, 113, 133, 0.18);
  border-color: rgba(251, 113, 133, 0.4);
  color: var(--danger);
}

.option.dim {
  opacity: 0.5;
}

.question-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid var(--border);
  flex-wrap: wrap;
}

.inline-icon {
  display: inline-block;
  vertical-align: -2px;
  margin-right: 4px;
}

.feedback {
  margin-top: 16px;
  border-left: 3px solid var(--success);
}

.feedback.bad {
  border-left-color: var(--danger);
}

.feedback-head {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.feedback-icon {
  width: 38px;
  height: 38px;
  border-radius: 11px;
  display: grid;
  place-items: center;
  background: rgba(52, 211, 153, 0.15);
  color: var(--success);
  flex: none;
}

.feedback.bad .feedback-icon {
  background: rgba(251, 113, 133, 0.14);
  color: var(--danger);
}

.feedback-title {
  display: flex;
  flex-direction: column;
  line-height: 1.3;
  flex: 1;
  min-width: 0;
}

.feedback-title strong {
  font-family: var(--font-display);
  font-size: 1.02rem;
  color: #fff;
}

.feedback-title span {
  color: var(--muted);
  font-size: 0.74rem;
}

.feedback-explanation {
  padding: 12px 14px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.025);
  border: 1px solid var(--border);
}

.feedback-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 16px;
  flex-wrap: wrap;
}

/* Summary */

.summary {
  max-width: 980px;
  margin: 0 auto;
}

.summary-head {
  display: flex;
  align-items: center;
  gap: 30px;
  margin-bottom: 26px;
  flex-wrap: wrap;
}

.summary-ring-center {
  display: flex;
  flex-direction: column;
  line-height: 1.1;
}

.summary-ring-center strong {
  font-family: var(--font-display);
  font-size: 1.7rem;
  color: #fff;
}

.summary-ring-center span {
  font-size: 0.66rem;
  color: var(--muted);
  margin-top: 2px;
}

.summary-copy {
  flex: 1;
  min-width: 260px;
}

.summary-copy h1 {
  font-size: clamp(1.5rem, 3vw, 2.1rem);
}

.summary-copy p {
  margin-top: 8px;
  font-size: 0.88rem;
  max-width: 56ch;
}

.summary-badges {
  display: flex;
  gap: 7px;
  flex-wrap: wrap;
  margin-top: 14px;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.summary-grid h3 {
  font-size: 0.98rem;
}

.concept-results {
  display: flex;
  flex-direction: column;
  gap: 13px;
  margin-top: 16px;
}

.concept-result-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 5px;
}

.concept-result-name {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 0.79rem;
  color: var(--text);
}

.concept-result-score {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  color: var(--success);
}

.concept-result-score.low {
  color: var(--warning);
}

.delta-list {
  display: flex;
  flex-direction: column;
  gap: 9px;
  margin: 14px 0;
}

.delta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.79rem;
}

.delta-name {
  color: var(--muted);
  flex: 1;
}

.delta-value {
  font-family: var(--font-mono);
  font-size: 0.76rem;
  color: var(--muted-2);
}

.delta-value.up {
  color: var(--success);
}

.delta-value.down {
  color: var(--danger);
}

.next-focus {
  display: flex;
  gap: 11px;
  align-items: flex-start;
  padding: 12px;
  border-radius: 11px;
  background: rgba(167, 139, 250, 0.07);
  border: 1px solid rgba(167, 139, 250, 0.18);
  margin: 16px 0;
}

.next-focus-icon {
  color: var(--violet);
  flex: none;
}

.next-focus strong {
  font-size: 0.78rem;
  color: #fff;
}

.next-focus p {
  margin-top: 2px;
}

.summary-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 26px;
  flex-wrap: wrap;
}

@media (max-width: 1080px) {
  .setup-grid {
    grid-template-columns: 1fr;
  }

  .setup-side {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    align-items: start;
  }

  .tip-card {
    grid-column: span 2;
  }
}

@media (max-width: 760px) {
  .topic-options {
    grid-template-columns: 1fr;
  }

  .setup-side {
    grid-template-columns: 1fr;
  }

  .tip-card {
    grid-column: span 1;
  }

  .summary-grid {
    grid-template-columns: 1fr;
  }

  .question-card {
    padding: 18px;
  }

  .quiz-top {
    gap: 8px;
  }

  .quiz-status {
    order: 3;
    width: 100%;
  }

  .summary-head {
    gap: 18px;
  }

  .feedback-actions {
    flex-direction: column-reverse;
  }

  .feedback-actions .btn {
    width: 100%;
  }
}
</style>
