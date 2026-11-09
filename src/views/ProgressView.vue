<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import AppIcon from '../components/AppIcon.vue'
import AchievementCard from '../components/AchievementCard.vue'
import ProgressRing from '../components/ProgressRing.vue'
import SparkBars from '../components/SparkBars.vue'
import StatCard from '../components/StatCard.vue'
import {
  accuracy,
  achievementsView,
  activitySeries,
  levelInfo,
  progress,
  topicStats,
  unlockedCount,
  weakConcepts,
} from '../stores/useProgress'
import { askMentor } from '../stores/useAssistant'
import { formatDate, formatNumber, pluralize, timeAgo } from '../utils/format'

const heatmap = computed(() => {
  const days = []
  const today = new Date()
  for (let i = 27; i >= 0; i -= 1) {
    const date = new Date(today)
    date.setDate(today.getDate() - i)
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
      date.getDate(),
    ).padStart(2, '0')}`
    const data = progress.activity[key] || { xp: 0, answered: 0 }
    let level = 0
    if (data.xp > 0) level = 1
    if (data.xp >= 40) level = 2
    if (data.xp >= 100) level = 3
    if (data.xp >= 180) level = 4
    days.push({
      key,
      date,
      xp: data.xp,
      answered: data.answered,
      level,
      isToday: i === 0,
      label: formatDate(date, { day: 'numeric', month: 'short' }),
    })
  }
  return days
})

const recentSessions = computed(() => progress.sessions.slice(0, 6))
const averageMastery = computed(() => {
  const values = topicStats.value.map((t) => t.mastery)
  return values.length ? Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 100) : 0
})
const nextFocus = computed(() => weakConcepts(1)[0] || null)

function askAboutProgress() {
  const focus = nextFocus.value
  askMentor(
    focus
      ? `Estoy en el nivel ${levelInfo.value.level} de CodeQuizz-AI. Mi concepto más débil es "${focus.label}" (${focus.topicName}) con ${Math.round(focus.mastery * 100)}% de dominio. Diseña un plan de estudio de 3 pasos para mejorarlo esta semana.`
      : 'Estoy empezando en CodeQuizz-AI. ¿Qué plan de estudio me recomiendas para aprender JavaScript, Vue y CSS en 4 semanas?',
  )
}
</script>

<template>
  <div class="progress-view">
    <header class="page-head animate-in">
      <div>
        <span class="eyebrow">Mi progreso</span>
        <h1>Tu aprendizaje, <span class="gradient-text">en datos claros</span></h1>
        <p>
          Cada respuesta alimenta un modelo de habilidad por tema. Aquí ves lo que dominas,
          lo que está en riesgo y cuál es el siguiente paso más rentable.
        </p>
      </div>
      <RouterLink to="/practicar" class="btn btn-primary btn-lg">
        <AppIcon name="target" :size="18" />
        Seguir practicando
      </RouterLink>
    </header>

    <section class="level-hero card card-glow animate-in delay-1">
      <div class="level-badge">
        <span class="level-number">{{ levelInfo.level }}</span>
        <span class="level-word">nivel</span>
      </div>
      <div class="level-body">
        <div class="row-between wrap">
          <div>
            <h2>{{ progress.profile.name || 'Explorador' }}</h2>
            <p class="small muted">
              {{ formatNumber(progress.xp) }} XP acumulados · {{ unlockedCount }} de
              {{ achievementsView.length }} logros
            </p>
          </div>
          <span class="chip chip-brand">
            <AppIcon name="star" :size="13" />
            {{ formatNumber(levelInfo.needed - levelInfo.current) }} XP para el nivel
            {{ levelInfo.level + 1 }}
          </span>
        </div>
        <div class="bar level-bar">
          <span :style="{ width: `${levelInfo.percent}%` }" />
        </div>
        <div class="level-meta">
          <span>{{ formatNumber(levelInfo.current) }} / {{ formatNumber(levelInfo.needed) }} XP en este nivel</span>
          <span>{{ Math.round(levelInfo.percent) }}%</span>
        </div>
      </div>
      <div class="level-ring">
        <ProgressRing
          :value="averageMastery"
          :size="104"
          :stroke="8"
          color="#5ba8ff"
          label="Dominio medio"
        >
          <div class="level-ring-center">
            <strong>{{ averageMastery }}%</strong>
            <span>dominio</span>
          </div>
        </ProgressRing>
      </div>
    </section>

    <section class="grid grid-4 stats animate-in delay-2">
      <StatCard icon="target" label="Precisión global" :value="`${accuracy}%`" :hint="`${progress.correct}/${progress.answered} correctas`" accent="#7cf5c4" />
      <StatCard icon="flame" label="Mejor combo" :value="`x${progress.bestCombo || 0}`" hint="Respuestas seguidas" accent="#fbbf24" />
      <StatCard icon="trophy" label="Sesiones perfectas" :value="progress.perfectSessions || 0" hint="Sin fallar ninguna" accent="#a78bfa" />
      <StatCard icon="chat" label="Consultas al mentor" :value="progress.assistantMessages || 0" hint="Preguntar también es aprender" accent="#5ba8ff" />
    </section>

    <section>
      <div class="section-head">
        <h2>Dominio por tecnología</h2>
        <span class="chip chip-violet">
          <AppIcon name="brain" :size="13" />
          Modelo adaptativo
        </span>
      </div>
      <div class="grid grid-3">
        <article
          v-for="topic in topicStats"
          :key="topic.id"
          class="card topic-mastery"
          :style="{ '--topic-color': topic.color }"
        >
          <div class="topic-mastery-head">
            <span class="topic-mastery-icon">
              <AppIcon :name="topic.icon" :size="22" />
            </span>
            <div class="topic-mastery-title">
              <h3>{{ topic.name }}</h3>
              <p class="small muted">
                {{ pluralize(topic.answered, 'pregunta', 'preguntas') }} ·
                {{ pluralize(topic.correct, 'acierto', 'aciertos') }}
              </p>
            </div>
            <ProgressRing
              :value="topic.percent"
              :size="54"
              :stroke="5"
              :color="topic.color"
              :label="`${topic.name}: ${topic.percent}%`"
            />
          </div>

          <div class="mastery-meta">
            <span class="chip">Habilidad {{ topic.ability.toFixed(1) }} / 5</span>
            <span class="chip">Objetivo: {{ topic.recommended }}</span>
          </div>

          <div v-if="topic.concepts.length" class="concept-list">
            <div v-for="concept in topic.concepts.slice(0, 4)" :key="concept.label" class="concept-row">
              <div class="concept-row-head">
                <span>{{ concept.label }}</span>
                <span class="tiny dim">{{ Math.round(concept.mastery * 100) }}%</span>
              </div>
              <div class="bar bar-thin">
                <span
                  :style="{
                    width: `${Math.max(5, Math.round(concept.mastery * 100))}%`,
                    background: topic.color,
                  }"
                />
              </div>
            </div>
          </div>
          <p v-else class="small muted concept-empty">
            Aún no hay datos de conceptos. Practica este tema para desbloquear el desglose.
          </p>

          <RouterLink :to="{ path: '/practicar', query: { tema: topic.id } }" class="btn btn-outline btn-sm btn-block">
            Practicar {{ topic.name }}
            <AppIcon name="arrow-right" :size="14" />
          </RouterLink>
        </article>
      </div>
    </section>

    <section class="grid grid-2 activity-grid">
      <div class="card">
        <div class="row-between">
          <div>
            <h3>Últimos 7 días</h3>
            <p class="small muted">XP diario ganado</p>
          </div>
          <span class="chip chip-brand">
            <AppIcon name="bolt" :size="13" />
            {{ formatNumber(activitySeries.reduce((sum, d) => sum + d.xp, 0)) }} XP
          </span>
        </div>
        <div class="chart-wrap">
          <SparkBars :data="activitySeries" :height="132" />
        </div>
      </div>

      <div class="card">
        <div class="row-between">
          <div>
            <h3>Mapa de constancia</h3>
            <p class="small muted">Últimos 28 días de actividad</p>
          </div>
          <span class="chip">
            <AppIcon name="calendar" :size="13" />
            {{ pluralize(progress.streak.current, 'día', 'días') }} de racha
          </span>
        </div>
        <div class="heatmap" role="img" aria-label="Mapa de actividad de los últimos 28 días">
          <span
            v-for="day in heatmap"
            :key="day.key"
            class="heat-cell"
            :class="[`level-${day.level}`, { today: day.isToday }]"
            :title="`${day.label}: ${day.xp} XP · ${day.answered} preguntas`"
          />
        </div>
        <div class="heat-legend">
          <span class="tiny dim">Menos</span>
          <span class="heat-cell level-0" />
          <span class="heat-cell level-1" />
          <span class="heat-cell level-2" />
          <span class="heat-cell level-3" />
          <span class="heat-cell level-4" />
          <span class="tiny dim">Más</span>
        </div>
      </div>
    </section>

    <section class="grid grid-2 focus-grid">
      <div class="card focus-card">
        <span class="focus-icon"><AppIcon name="target" :size="20" /></span>
        <div>
          <h3>Tu siguiente foco</h3>
          <p v-if="nextFocus" class="small muted">
            <strong class="strong">{{ nextFocus.label }}</strong> ({{ nextFocus.topicName }}) es
            el concepto con menor dominio: {{ Math.round(nextFocus.mastery * 100) }}%. El motor
            lo priorizará automáticamente.
          </p>
          <p v-else class="small muted">
            Completa algunas preguntas para que el motor identifique tu siguiente foco.
          </p>
          <div class="row wrap focus-actions">
            <RouterLink
              v-if="nextFocus"
              :to="{ path: '/practicar', query: { tema: nextFocus.topic } }"
              class="btn btn-primary btn-sm"
            >
              Reforzar ahora
            </RouterLink>
            <button type="button" class="btn btn-outline btn-sm" @click="askAboutProgress">
              <AppIcon name="chat" :size="14" />
              Plan con el mentor
            </button>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="row-between">
          <div>
            <h3>Sesiones recientes</h3>
            <p class="small muted">Tu historial de práctica</p>
          </div>
          <RouterLink to="/practicar" class="link small">
            Nueva
            <AppIcon name="plus" :size="13" />
          </RouterLink>
        </div>

        <div v-if="recentSessions.length" class="session-list">
          <div v-for="(session, index) in recentSessions" :key="index" class="session-item">
            <span class="session-score" :class="{ good: session.accuracy >= 70 }">
              {{ session.accuracy }}%
            </span>
            <div class="session-copy">
              <strong>{{ session.topicLabel }}</strong>
              <small>
                {{ session.correct }}/{{ session.total }} correctas · {{ formatNumber(session.xp) }} XP
              </small>
            </div>
            <span class="session-date tiny dim">{{ timeAgo(session.date) }}</span>
          </div>
        </div>
        <p v-else class="small muted session-empty">
          Todavía no has completado una sesión. ¡La primera te dará tu línea base!
        </p>
      </div>
    </section>

    <section>
      <div class="section-head">
        <h2>Logros</h2>
        <span class="chip chip-brand">
          <AppIcon name="trophy" :size="13" />
          {{ unlockedCount }} / {{ achievementsView.length }}
        </span>
      </div>
      <div class="grid grid-3 achievements-grid">
        <AchievementCard
          v-for="achievement in achievementsView"
          :key="achievement.id"
          :achievement="achievement"
        />
      </div>
    </section>
  </div>
</template>

<style scoped>
.level-hero {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.level-badge {
  width: 92px;
  height: 92px;
  border-radius: 22px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--gradient);
  color: #06121a;
  flex: none;
  box-shadow: 0 18px 40px -18px rgba(124, 245, 196, 0.7);
}

.level-number {
  font-family: var(--font-display);
  font-size: 2.4rem;
  font-weight: 700;
  line-height: 1;
}

.level-word {
  font-size: 0.62rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.level-body {
  flex: 1;
  min-width: 240px;
}

.level-bar {
  margin-top: 16px;
  height: 9px;
}

.level-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 6px;
  font-size: 0.7rem;
  color: var(--muted-2);
}

.level-ring {
  flex: none;
}

.level-ring-center {
  display: flex;
  flex-direction: column;
  line-height: 1.1;
}

.level-ring-center strong {
  font-family: var(--font-display);
  font-size: 1.15rem;
  color: #fff;
}

.level-ring-center span {
  font-size: 0.6rem;
  color: var(--muted);
}

.stats {
  margin-bottom: 8px;
}

.topic-mastery {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.topic-mastery-head {
  display: flex;
  align-items: center;
  gap: 11px;
}

.topic-mastery-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  background: color-mix(in srgb, var(--topic-color) 12%, transparent);
  color: var(--topic-color);
  flex: none;
}

.topic-mastery-title {
  flex: 1;
  min-width: 0;
}

.topic-mastery-title h3 {
  font-size: 1rem;
}

.mastery-meta {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.concept-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-top: 4px;
}

.concept-row-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-size: 0.73rem;
  color: var(--muted);
  margin-bottom: 4px;
}

.concept-empty {
  flex: 1;
}

.activity-grid,
.focus-grid {
  margin-top: 30px;
  align-items: stretch;
}

.chart-wrap {
  margin-top: 18px;
}

.heatmap {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;
  margin-top: 20px;
}

.heat-cell {
  aspect-ratio: 1;
  border-radius: 5px;
  background: rgba(255, 255, 255, 0.05);
  display: inline-block;
  min-width: 0;
}

.heat-cell.level-1 {
  background: rgba(124, 245, 196, 0.2);
}

.heat-cell.level-2 {
  background: rgba(124, 245, 196, 0.4);
}

.heat-cell.level-3 {
  background: rgba(124, 245, 196, 0.65);
}

.heat-cell.level-4 {
  background: var(--brand);
  box-shadow: 0 0 10px rgba(124, 245, 196, 0.4);
}

.heat-cell.today {
  outline: 1px solid rgba(255, 255, 255, 0.5);
  outline-offset: 1px;
}

.heat-legend {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 14px;
  justify-content: flex-end;
}

.heat-legend .heat-cell {
  width: 12px;
  height: 12px;
  aspect-ratio: auto;
}

.focus-card {
  display: flex;
  gap: 14px;
  align-items: flex-start;
}

.focus-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  background: rgba(124, 245, 196, 0.1);
  color: var(--brand);
  flex: none;
}

.focus-actions {
  margin-top: 12px;
}

.session-list {
  display: flex;
  flex-direction: column;
  margin-top: 10px;
}

.session-item {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 9px 0;
  border-bottom: 1px solid var(--border);
}

.session-item:last-child {
  border-bottom: 0;
}

.session-score {
  width: 46px;
  height: 34px;
  border-radius: 9px;
  display: grid;
  place-items: center;
  font-family: var(--font-mono);
  font-size: 0.72rem;
  font-weight: 600;
  background: rgba(251, 113, 133, 0.1);
  color: var(--danger);
  flex: none;
}

.session-score.good {
  background: rgba(52, 211, 153, 0.1);
  color: var(--success);
}

.session-copy {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  line-height: 1.35;
}

.session-copy strong {
  font-size: 0.79rem;
  color: var(--text);
}

.session-copy small {
  font-size: 0.68rem;
  color: var(--muted-2);
}

.session-date {
  flex: none;
}

.session-empty {
  margin-top: 16px;
}

.achievements-grid {
  margin-bottom: 10px;
}

@media (max-width: 760px) {
  .level-hero {
    gap: 16px;
  }

  .level-ring {
    display: none;
  }

  .level-badge {
    width: 74px;
    height: 74px;
    border-radius: 18px;
  }

  .level-number {
    font-size: 1.9rem;
  }

  .focus-card {
    flex-direction: column;
  }
}
</style>
