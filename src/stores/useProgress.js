import { computed, reactive, ref, watch } from 'vue'
import { ACHIEVEMENTS } from '../data/achievements'
import { TOPIC_LIST, TOPICS } from '../data/questions'

const STORAGE_KEY = 'codequest.progress.v1'
const DAY = 24 * 60 * 60 * 1000
const REVIEW_INTERVALS = [1, 3, 7, 14, 30, 60]

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

export function dateKey(date = new Date()) {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function yesterdayKey() {
  return dateKey(new Date(Date.now() - DAY))
}

function defaultState() {
  return {
    version: 1,
    profile: {
      name: '',
      dailyGoal: 120,
      quizLength: 8,
      sound: true,
      reducedMotion: false,
    },
    xp: 0,
    streak: { current: 0, best: 0, lastActive: null },
    answered: 0,
    correct: 0,
    bestCombo: 0,
    topicAnswered: { javascript: 0, vue: 0, css: 0 },
    topicCorrect: { javascript: 0, vue: 0, css: 0 },
    seen: {},
    cycles: { javascript: 0, vue: 0, css: 0 },
    concepts: {},
    ability: { javascript: 2.5, vue: 2.5, css: 2.5 },
    activity: {},
    achievements: {},
    perfectSessions: 0,
    assistantMessages: 0,
    sessions: [],
    ai: {
      mode: 'local',
      baseUrl: 'https://api.openai.com/v1',
      model: 'gpt-4o-mini',
      apiKey: '',
    },
  }
}

function loadState() {
  const base = defaultState()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return base
    const saved = JSON.parse(raw)
    if (!saved || typeof saved !== 'object') return base
    return {
      ...base,
      ...saved,
      profile: { ...base.profile, ...(saved.profile || {}) },
      streak: { ...base.streak, ...(saved.streak || {}) },
      topicAnswered: { ...base.topicAnswered, ...(saved.topicAnswered || {}) },
      topicCorrect: { ...base.topicCorrect, ...(saved.topicCorrect || {}) },
      cycles: { ...base.cycles, ...(saved.cycles || {}) },
      ability: { ...base.ability, ...(saved.ability || {}) },
      ai: { ...base.ai, ...(saved.ai || {}) },
      seen: saved.seen || {},
      concepts: saved.concepts || {},
      activity: saved.activity || {},
      achievements: saved.achievements || {},
      sessions: Array.isArray(saved.sessions) ? saved.sessions : [],
    }
  } catch (error) {
    console.warn('No se pudo cargar el progreso:', error)
    return base
  }
}

export const progress = reactive(loadState())
export const toasts = ref([])

let saveTimer = null
watch(
  progress,
  () => {
    clearTimeout(saveTimer)
    saveTimer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
      } catch (error) {
        console.warn('No se pudo guardar el progreso:', error)
      }
    }, 120)
  },
  { deep: true },
)

export function levelFromXp(xp) {
  return Math.floor(Math.sqrt(Math.max(0, xp) / 100)) + 1
}

export const levelInfo = computed(() => {
  const level = levelFromXp(progress.xp)
  const base = 100 * (level - 1) ** 2
  const next = 100 * level ** 2
  return {
    level,
    current: progress.xp - base,
    needed: next - base,
    nextAt: next,
    percent: clamp(((progress.xp - base) / (next - base)) * 100, 0, 100),
  }
})

export const accuracy = computed(() =>
  progress.answered ? Math.round((progress.correct / progress.answered) * 100) : 0,
)

export const dailyProgress = computed(() => {
  const today = progress.activity[dateKey()] || { xp: 0, answered: 0, correct: 0 }
  const goal = Math.max(20, progress.profile.dailyGoal || 120)
  return {
    ...today,
    goal,
    percent: clamp(Math.round((today.xp / goal) * 100), 0, 100),
    done: today.xp >= goal,
  }
})

export const streakAlive = computed(
  () => progress.streak.lastActive === dateKey() || progress.streak.lastActive === yesterdayKey(),
)

export function masteryFor(topic) {
  const baseline = clamp((progress.ability[topic] - 1) / 4, 0, 1)
  const entries = Object.values(progress.concepts).filter((c) => c.topic === topic)
  if (!entries.length) return baseline
  const totalWeight = entries.reduce((sum, c) => sum + Math.min(6, c.attempts), 0)
  if (!totalWeight) return baseline
  const weighted = entries.reduce(
    (sum, c) => sum + c.mastery * Math.min(6, c.attempts),
    0,
  )
  const value = weighted / totalWeight
  // Mezcla con la habilidad global para estabilizar con pocos datos.
  const confidence = Math.min(1, entries.reduce((s, c) => s + c.attempts, 0) / 12)
  return clamp(value * confidence + baseline * (1 - confidence), 0.03, 0.99)
}

export function recommendedDifficulty(topic) {
  return clamp(Math.round(progress.ability[topic] || 2.5), 1, 5)
}

export function weakConcepts(limit = 5) {
  return Object.entries(progress.concepts)
    .map(([key, c]) => ({
      key,
      ...c,
      topicName: TOPICS[c.topic]?.name || c.topic,
      topicColor: TOPICS[c.topic]?.color || '#7cf5c4',
    }))
    .filter((c) => c.attempts > 0)
    .sort((a, b) => a.mastery - b.mastery)
    .slice(0, limit)
}

export function strongConcepts(limit = 3) {
  return Object.entries(progress.concepts)
    .map(([key, c]) => ({ key, ...c, topicName: TOPICS[c.topic]?.name || c.topic }))
    .filter((c) => c.attempts >= 2)
    .sort((a, b) => b.mastery - a.mastery)
    .slice(0, limit)
}

export function conceptMastery(topic) {
  return Object.values(progress.concepts)
    .filter((c) => c.topic === topic && c.attempts > 0)
    .sort((a, b) => b.attempts - a.attempts)
}

export const topicStats = computed(() =>
  TOPIC_LIST.map((topic) => {
    const mastery = masteryFor(topic.id)
    return {
      ...topic,
      mastery,
      percent: Math.round(mastery * 100),
      answered: progress.topicAnswered[topic.id] || 0,
      correct: progress.topicCorrect[topic.id] || 0,
      ability: progress.ability[topic.id],
      recommended: recommendedDifficulty(topic.id),
      concepts: conceptMastery(topic.id),
    }
  }),
)

export const activitySeries = computed(() => {
  const days = []
  for (let i = 6; i >= 0; i -= 1) {
    const date = new Date(Date.now() - i * DAY)
    const key = dateKey(date)
    const data = progress.activity[key] || { xp: 0, answered: 0, correct: 0 }
    days.push({
      key,
      label: ['D', 'L', 'M', 'X', 'J', 'V', 'S'][date.getDay()],
      dayNumber: date.getDate(),
      ...data,
      isToday: key === dateKey(),
    })
  }
  return days
})

export const achievementsView = computed(() =>
  ACHIEVEMENTS.map((achievement) => {
    const unlockedAt = progress.achievements[achievement.id]
    const context = { ...progress, level: levelInfo.value.level }
    const raw = achievement.progress(context)
    return {
      ...achievement,
      unlocked: Boolean(unlockedAt),
      unlockedAt,
      current: Math.min(achievement.target, Math.max(0, Math.round(raw || 0))),
      percent: clamp(Math.round((raw / achievement.target) * 100), 0, 100),
    }
  }),
)

export const unlockedCount = computed(
  () => achievementsView.value.filter((a) => a.unlocked).length,
)

function pushToast({ title, subtitle, icon = 'spark', color = '#7cf5c4', duration = 4200 }) {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
  toasts.value.push({ id, title, subtitle, icon, color })
  setTimeout(() => dismissToast(id), duration)
}

export function dismissToast(id) {
  toasts.value = toasts.value.filter((t) => t.id !== id)
}

function touchStreak() {
  const today = dateKey()
  if (progress.streak.lastActive === today) return
  if (progress.streak.lastActive === yesterdayKey()) {
    progress.streak.current += 1
  } else {
    progress.streak.current = 1
  }
  progress.streak.lastActive = today
  progress.streak.best = Math.max(progress.streak.best || 0, progress.streak.current)
}

function checkAchievements() {
  const context = { ...progress, level: levelInfo.value.level }
  const unlocked = []
  for (const achievement of ACHIEVEMENTS) {
    if (progress.achievements[achievement.id]) continue
    if (achievement.check(context)) {
      progress.achievements[achievement.id] = new Date().toISOString()
      unlocked.push(achievement)
      pushToast({
        title: `Logro desbloqueado: ${achievement.name}`,
        subtitle: achievement.description,
        icon: achievement.icon,
        color: achievement.color,
      })
    }
  }
  return unlocked
}

export function recordAnswer({ question, correct, combo = 0, usedHint = false }) {
  const previousLevel = levelFromXp(progress.xp)
  const today = dateKey()

  progress.answered += 1
  if (correct) progress.correct += 1
  progress.bestCombo = Math.max(progress.bestCombo || 0, combo)
  progress.topicAnswered[question.topic] = (progress.topicAnswered[question.topic] || 0) + 1
  if (correct) {
    progress.topicCorrect[question.topic] = (progress.topicCorrect[question.topic] || 0) + 1
  }

  const seen = progress.seen[question.id] || { count: 0, correct: 0, wrong: 0, lastSeen: null }
  seen.count += 1
  seen.lastSeen = Date.now()
  if (correct) seen.correct += 1
  else seen.wrong += 1
  progress.seen[question.id] = seen

  const key = `${question.topic}:${question.concept}`
  const concept =
    progress.concepts[key] || {
      topic: question.topic,
      label: question.concept,
      attempts: 0,
      correct: 0,
      mastery: 0.45,
      interval: 0,
      dueAt: null,
      lastSeen: null,
    }
  concept.attempts += 1
  if (correct) concept.correct += 1
  const target = correct ? 1 : 0
  concept.mastery = clamp(concept.mastery + 0.28 * (target - concept.mastery), 0.05, 0.98)
  concept.interval = correct ? Math.min(concept.interval + 1, REVIEW_INTERVALS.length - 1) : 0
  concept.dueAt = Date.now() + REVIEW_INTERVALS[concept.interval] * DAY
  concept.lastSeen = Date.now()
  progress.concepts[key] = concept

  const ability = progress.ability[question.topic] || 2.5
  const expected = 1 / (1 + Math.exp(-(ability - question.difficulty) * 1.1))
  const nextAbility = clamp(ability + 0.42 * ((correct ? 1 : 0) - expected), 1, 5)
  progress.ability[question.topic] = nextAbility

  let xpEarned = correct ? 8 + question.difficulty * 4 : 1
  if (usedHint) xpEarned = Math.max(1, xpEarned - 4)
  progress.xp += xpEarned

  const activity = progress.activity[today] || { xp: 0, answered: 0, correct: 0 }
  activity.xp += xpEarned
  activity.answered += 1
  if (correct) activity.correct += 1
  progress.activity[today] = activity

  touchStreak()
  checkAchievements()

  const newLevel = levelFromXp(progress.xp)
  if (newLevel > previousLevel) {
    pushToast({
      title: `¡Nivel ${newLevel}!`,
      subtitle: 'Tu constancia está dando frutos. Sigue así.',
      icon: 'star',
      color: '#a78bfa',
      duration: 5200,
    })
  }

  return {
    xpEarned,
    ability: nextAbility,
    previousAbility: ability,
    expected,
    level: newLevel,
  }
}

export function registerSession(summary) {
  progress.sessions.unshift({ ...summary, date: new Date().toISOString() })
  progress.sessions = progress.sessions.slice(0, 40)
  if (summary.total > 0 && summary.correct === summary.total) {
    progress.perfectSessions = (progress.perfectSessions || 0) + 1
  }
  checkAchievements()
}

export function incrementAssistant() {
  progress.assistantMessages = (progress.assistantMessages || 0) + 1
  checkAchievements()
}

export function bumpCycle(topic) {
  progress.cycles[topic] = (progress.cycles[topic] || 0) + 1
}

export function updateProfile(patch) {
  progress.profile = { ...progress.profile, ...patch }
}

export function updateAI(patch) {
  progress.ai = { ...progress.ai, ...patch }
}

export function resetProgress({ keepProfile = true, keepAI = true } = {}) {
  const fresh = defaultState()
  if (keepProfile) fresh.profile = { ...progress.profile }
  if (keepAI) fresh.ai = { ...progress.ai }
  Object.keys(progress).forEach((key) => {
    delete progress[key]
  })
  Object.assign(progress, fresh)
  toasts.value = []
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  } catch {
    /* ignore */
  }
}

export function exportProgress() {
  return JSON.stringify(progress, null, 2)
}

export function importProgress(raw) {
  const parsed = JSON.parse(raw)
  if (!parsed || typeof parsed !== 'object') throw new Error('El archivo no es válido.')
  if (!parsed.version) throw new Error('El archivo no parece un respaldo de CodeQuest.')
  applyProgressData(parsed)
}

export function applyProgressData(parsed) {
  if (!parsed || typeof parsed !== 'object') return false
  if (!parsed.version) return false
  const base = defaultState()
  Object.keys(progress).forEach((key) => delete progress[key])
  Object.assign(progress, {
    ...base,
    ...parsed,
    profile: { ...base.profile, ...(parsed.profile || {}) },
    ai: { ...base.ai, ...(parsed.ai || {}) },
  })
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  } catch {
    /* ignore */
  }
  return true
}

export function getSeenMap() {
  return progress.seen
}

export function topicName(topicId) {
  return TOPICS[topicId]?.name || topicId
}
