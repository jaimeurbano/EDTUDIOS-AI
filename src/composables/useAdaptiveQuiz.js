import { computed, reactive } from 'vue'
import { QUESTIONS, TOPICS, TOPIC_LIST, getQuestionsByTopic } from '../data/questions'
import {
  bumpCycle,
  masteryFor,
  progress,
  recordAnswer,
  registerSession,
} from '../stores/useProgress'
import { playFeedback } from '../utils/sound'

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function weightedPick(items, weights) {
  const total = weights.reduce((sum, weight) => sum + weight, 0)
  if (total <= 0) return items[Math.floor(Math.random() * items.length)]
  let threshold = Math.random() * total
  for (let i = 0; i < items.length; i += 1) {
    threshold -= weights[i]
    if (threshold <= 0) return items[i]
  }
  return items[items.length - 1]
}

export const quiz = reactive({
  status: 'idle',
  topic: 'javascript',
  mode: 'focus',
  length: 8,
  questions: [],
  index: 0,
  answers: [],
  startedAt: null,
  finishedAt: null,
  combo: 0,
  maxCombo: 0,
  xpEarned: 0,
  selected: null,
  revealed: false,
  hintUsed: false,
  hintVisible: false,
  questionStartedAt: null,
  lastResult: null,
  summary: null,
  error: null,
  abilityStart: {},
  cycleBumped: {},
})

export const currentQuestion = computed(() => quiz.questions[quiz.index] || null)

export const currentAnswer = computed(() => quiz.answers[quiz.index] || null)

export const progressPercent = computed(() => {
  if (!quiz.length) return 0
  return clamp(Math.round((quiz.answers.length / quiz.length) * 100), 0, 100)
})

export const topicLabel = computed(() =>
  quiz.mode === 'mix' ? 'Mezcla adaptativa' : TOPICS[quiz.topic]?.name || 'Práctica',
)

export const availablePool = computed(() =>
  TOPIC_LIST.map((topic) => {
    const total = getQuestionsByTopic(topic.id).length
    const seen = getQuestionsByTopic(topic.id).filter((q) => progress.seen[q.id]).length
    return { ...topic, total, seen, unseen: total - seen }
  }),
)

function pickForTopic(topic, usedIds) {
  const all = getQuestionsByTopic(topic)
  const available = all.filter((q) => !usedIds.has(q.id))
  if (!available.length) return null

  let pool = available.filter((q) => !progress.seen[q.id])
  if (!pool.length) {
    if (!quiz.cycleBumped[topic]) {
      bumpCycle(topic)
      quiz.cycleBumped[topic] = true
    }
    // Nuevo ciclo: prioriza las preguntas vistas hace más tiempo.
    pool = [...available].sort(
      (a, b) => (progress.seen[a.id]?.lastSeen || 0) - (progress.seen[b.id]?.lastSeen || 0),
    )
    pool = pool.slice(0, Math.max(5, Math.ceil(pool.length / 2)))
  }

  const target = clamp((progress.ability[topic] || 2.5) + 0.15, 1, 5)
  const now = Date.now()

  const weights = pool.map((question) => {
    // Cuanto más cerca de la habilidad actual, más probable (zona de desarrollo próximo).
    let weight = Math.exp(-((question.difficulty - target) ** 2) / 1.15)
    const concept = progress.concepts[`${question.topic}:${question.concept}`]
    if (concept) {
      weight *= 1 + (1 - concept.mastery) * 0.85
      if (concept.dueAt && concept.dueAt <= now) weight *= 1.55
    } else {
      weight *= 1.2
    }
    // Pequeña variación para que dos sesiones no sean idénticas.
    weight *= 0.85 + Math.random() * 0.3
    return weight
  })

  return weightedPick(pool, weights)
}

function pickMixed(usedIds) {
  const lastTopic = quiz.questions[quiz.questions.length - 1]?.topic
  const candidates = TOPIC_LIST.filter((topic) =>
    getQuestionsByTopic(topic.id).some((q) => !usedIds.has(q.id)),
  )
  if (!candidates.length) return null

  const weights = candidates.map((topic) => {
    const mastery = masteryFor(topic.id)
    let weight = 0.35 + (1 - mastery) * 1.3
    if (topic.id === lastTopic) weight *= 0.35
    return weight
  })

  const chosen = weightedPick(candidates, weights)
  return pickForTopic(chosen.id, usedIds)
}

function pickNext() {
  const used = new Set(quiz.questions.map((q) => q.id))
  return quiz.mode === 'mix' ? pickMixed(used) : pickForTopic(quiz.topic, used)
}

export function startSession(topic = 'javascript', options = {}) {
  const mode = topic === 'mix' || options.mode === 'mix' ? 'mix' : 'focus'
  const length = clamp(Number(options.length) || progress.profile.quizLength || 8, 4, 12)

  quiz.status = 'playing'
  quiz.topic = mode === 'mix' ? 'mix' : topic
  quiz.mode = mode
  quiz.length = length
  quiz.questions = []
  quiz.index = 0
  quiz.answers = []
  quiz.startedAt = Date.now()
  quiz.finishedAt = null
  quiz.combo = 0
  quiz.maxCombo = 0
  quiz.xpEarned = 0
  quiz.selected = null
  quiz.revealed = false
  quiz.hintUsed = false
  quiz.hintVisible = false
  quiz.questionStartedAt = Date.now()
  quiz.lastResult = null
  quiz.summary = null
  quiz.error = null
  quiz.abilityStart = { ...progress.ability }
  quiz.cycleBumped = {}

  const first = pickNext()
  if (!first) {
    quiz.status = 'idle'
    quiz.error = 'No hay preguntas disponibles para esta configuración.'
    return false
  }
  quiz.questions.push(first)
  return true
}

export function useHint() {
  if (!quiz.hintVisible) {
    quiz.hintVisible = true
    quiz.hintUsed = true
  }
  return currentQuestion.value?.hint || 'Lee la pregunta con calma y descarta las opciones imposibles.'
}

export function submitAnswer(optionIndex) {
  if (quiz.revealed || quiz.status !== 'playing') return null
  const question = currentQuestion.value
  if (!question) return null

  const correct = optionIndex === question.answer
  quiz.selected = optionIndex
  quiz.combo = correct ? quiz.combo + 1 : 0
  quiz.maxCombo = Math.max(quiz.maxCombo, quiz.combo)

  const result = recordAnswer({
    question,
    correct,
    combo: quiz.combo,
    usedHint: quiz.hintUsed,
  })

  const timeMs = quiz.questionStartedAt ? Date.now() - quiz.questionStartedAt : 0
  const answer = {
    questionId: question.id,
    topic: question.topic,
    concept: question.concept,
    difficulty: question.difficulty,
    selected: optionIndex,
    correct,
    usedHint: quiz.hintUsed,
    timeMs,
    xp: result.xpEarned,
    abilityBefore: result.previousAbility,
    abilityAfter: result.ability,
    expected: result.expected,
  }
  quiz.answers.push(answer)
  quiz.xpEarned += result.xpEarned
  quiz.revealed = true
  quiz.lastResult = { ...answer, correctIndex: question.answer, explanation: question.explanation }

  playFeedback(correct ? 'correct' : 'wrong', progress.profile.sound)
  return quiz.lastResult
}

export function nextQuestion() {
  if (!quiz.revealed) return
  if (quiz.answers.length >= quiz.length) {
    finishSession()
    return
  }

  quiz.index += 1
  if (!quiz.questions[quiz.index]) {
    const next = pickNext()
    if (!next) {
      finishSession()
      return
    }
    quiz.questions.push(next)
  }

  quiz.selected = null
  quiz.revealed = false
  quiz.hintUsed = false
  quiz.hintVisible = false
  quiz.lastResult = null
  quiz.questionStartedAt = Date.now()
}

export function finishSession() {
  if (quiz.status !== 'playing') return
  const answers = quiz.answers
  const total = answers.length
  const correct = answers.filter((a) => a.correct).length
  const duration = quiz.startedAt ? Date.now() - quiz.startedAt : 0

  const conceptMap = new Map()
  for (const answer of answers) {
    const key = `${answer.topic}:${answer.concept}`
    const entry =
      conceptMap.get(key) || {
        key,
        label: answer.concept,
        topic: answer.topic,
        attempts: 0,
        correct: 0,
        difficultySum: 0,
      }
    entry.attempts += 1
    entry.difficultySum += answer.difficulty
    if (answer.correct) entry.correct += 1
    conceptMap.set(key, entry)
  }
  const concepts = [...conceptMap.values()]
    .map((entry) => ({
      ...entry,
      accuracy: Math.round((entry.correct / entry.attempts) * 100),
      difficulty: entry.difficultySum / entry.attempts,
    }))
    .sort((a, b) => a.accuracy - b.accuracy)

  const topicMap = new Map()
  for (const answer of answers) {
    const entry =
      topicMap.get(answer.topic) || { topic: answer.topic, attempts: 0, correct: 0 }
    entry.attempts += 1
    if (answer.correct) entry.correct += 1
    topicMap.set(answer.topic, entry)
  }
  const topics = [...topicMap.values()].map((entry) => ({
    ...entry,
    name: TOPICS[entry.topic]?.name || entry.topic,
    color: TOPICS[entry.topic]?.color || '#7cf5c4',
    accuracy: Math.round((entry.correct / entry.attempts) * 100),
  }))

  const abilityDelta = {}
  for (const topic of Object.keys(quiz.abilityStart)) {
    abilityDelta[topic] = (progress.ability[topic] || 0) - (quiz.abilityStart[topic] || 0)
  }

  const summary = {
    topic: quiz.topic,
    topicLabel: quiz.mode === 'mix' ? 'Mezcla adaptativa' : TOPICS[quiz.topic]?.name || 'Práctica',
    mode: quiz.mode,
    total,
    correct,
    accuracy: total ? Math.round((correct / total) * 100) : 0,
    xp: quiz.xpEarned,
    maxCombo: quiz.maxCombo,
    duration,
    concepts,
    topics,
    abilityDelta,
    weakest: concepts[0] || null,
    strongest: concepts[concepts.length - 1] || null,
  }

  quiz.summary = summary
  quiz.finishedAt = Date.now()
  quiz.status = 'finished'
  registerSession(summary)
}

export function restartSession() {
  const topic = quiz.mode === 'mix' ? 'mix' : quiz.topic
  startSession(topic, { length: quiz.length, mode: quiz.mode })
}

export function abandonSession() {
  quiz.status = 'idle'
  quiz.questions = []
  quiz.answers = []
  quiz.summary = null
  quiz.lastResult = null
  quiz.error = null
}

export function poolFor(topic) {
  if (topic === 'mix') return QUESTIONS
  return getQuestionsByTopic(topic)
}
