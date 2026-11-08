<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import AppIcon from '../components/AppIcon.vue'
import AchievementCard from '../components/AchievementCard.vue'
import ProgressRing from '../components/ProgressRing.vue'
import SparkBars from '../components/SparkBars.vue'
import StatCard from '../components/StatCard.vue'
import TopicCard from '../components/TopicCard.vue'
import {
  accuracy,
  achievementsView,
  activitySeries,
  dailyProgress,
  levelInfo,
  progress,
  streakAlive,
  topicStats,
  weakConcepts,
} from '../stores/useProgress'
import { assistant } from '../stores/useAssistant'
import { formatNumber, greeting, pluralize } from '../utils/format'

const firstName = computed(() => (progress.profile.name || 'Explorador').split(' ')[0])
const xpToGoal = computed(() => Math.max(0, dailyProgress.value.goal - dailyProgress.value.xp))
const lastSession = computed(() => progress.sessions[0] || null)

const featuredAchievements = computed(() => {
  const unlocked = achievementsView.value
    .filter((a) => a.unlocked)
    .sort((a, b) => new Date(b.unlockedAt) - new Date(a.unlockedAt))
  const locked = achievementsView.value
    .filter((a) => !a.unlocked)
    .sort((a, b) => b.percent - a.percent)
  return [...unlocked, ...locked].slice(0, 3)
})

const plan = computed(() => [
  {
    label: 'Responde 8 preguntas',
    detail: `${Math.min(8, dailyProgress.value.answered)}/8 completadas`,
    done: dailyProgress.value.answered >= 8,
  },
  {
    label: 'Completa tu meta de XP',
    detail: dailyProgress.value.done
      ? 'Meta cumplida'
      : `${formatNumber(xpToGoal.value)} XP restantes`,
    done: dailyProgress.value.done,
  },
  {
    label: 'Pregunta al mentor si te atascas',
    detail: assistant.messages.length > 1 ? 'Ya lo usaste' : 'Disponible 24/7',
    done: assistant.messages.length > 1,
  },
])

const weakList = computed(() => weakConcepts(4))
</script>

<template>
  <div class="dashboard">
    <header class="page-head animate-in">
      <div>
        <span class="eyebrow">Tu panel</span>
        <h1>{{ greeting() }}, <span class="gradient-text">{{ firstName }}</span></h1>
        <p>
          Tu ruta se adapta a lo que ya dominas y a lo que necesitas reforzar. Un paso
          pequeño hoy es un proyecto enorme mañana.
        </p>
      </div>
      <div class="row wrap">
        <RouterLink to="/practicar" class="btn btn-primary btn-lg">
          <AppIcon name="target" :size="18" />
          Continuar mi ruta
        </RouterLink>
        <RouterLink to="/mentor" class="btn btn-outline btn-lg">
          <AppIcon name="chat" :size="18" />
          Hablar con el mentor
        </RouterLink>
      </div>
    </header>

    <section class="hero card card-glow animate-in delay-1">
      <div class="hero-main">
        <ProgressRing
          :value="dailyProgress.percent"
          :size="132"
          :stroke="9"
          :color="dailyProgress.done ? '#34d399' : '#7cf5c4'"
          :label="`Meta diaria ${dailyProgress.percent}%`"
        >
          <div class="hero-ring-center">
            <strong>{{ dailyProgress.percent }}%</strong>
            <span>{{ formatNumber(dailyProgress.xp) }} XP</span>
          </div>
        </ProgressRing>

        <div class="hero-copy">
          <span class="chip" :class="dailyProgress.done ? 'chip-brand' : 'chip-violet'">
            <AppIcon :name="dailyProgress.done ? 'check' : 'bolt'" :size="13" />
            {{ dailyProgress.done ? 'Misión completada' : 'Misión diaria' }}
          </span>
          <h2>
            {{ dailyProgress.done ? '¡Hoy has cumplido!' : `Te faltan ${formatNumber(xpToGoal)} XP` }}
          </h2>
          <p class="muted">
            {{
              dailyProgress.done
                ? 'Excelente constancia. Puedes seguir practicando o explorar un reto nuevo en el laboratorio.'
                : 'Cada respuesta correcta suma XP y ajusta la dificultad de tus próximas preguntas.'
            }}
          </p>

          <div class="level-line">
            <div class="level-copy">
              <span class="chip chip-brand">
                <AppIcon name="star" :size="13" />
                Nivel {{ levelInfo.level }}
              </span>
              <span class="tiny dim">{{ formatNumber(levelInfo.current) }}/{{ formatNumber(levelInfo.needed) }} XP para el nivel {{ levelInfo.level + 1 }}</span>
            </div>
            <div class="bar bar-thin">
              <span :style="{ width: `${levelInfo.percent}%` }" />
            </div>
          </div>

          <div class="hero-badges">
            <span class="chip" :class="streakAlive ? 'chip-warning' : 'chip-danger'">
              <AppIcon name="flame" :size="13" />
              {{ pluralize(progress.streak.current, 'día', 'días') }} de racha
            </span>
            <span v-if="lastSession" class="chip">
              <AppIcon name="clock" :size="13" />
              Última: {{ lastSession.correct }}/{{ lastSession.total }} en {{ lastSession.topicLabel }}
            </span>
          </div>
        </div>
      </div>

      <div class="hero-plan">
        <h3>Plan de hoy</h3>
        <ul class="plan-list">
          <li v-for="item in plan" :key="item.label" :class="{ done: item.done }">
            <span class="plan-check">
              <AppIcon :name="item.done ? 'check' : 'dot'" :size="12" />
            </span>
            <span class="plan-copy">
              <strong>{{ item.label }}</strong>
              <small>{{ item.detail }}</small>
            </span>
          </li>
        </ul>
        <RouterLink to="/practicar" class="btn btn-outline btn-sm btn-block">
          Empezar sesión
          <AppIcon name="arrow-right" :size="15" />
        </RouterLink>
      </div>
    </section>

    <section class="grid grid-4 stats animate-in delay-2">
      <StatCard
        icon="bolt"
        label="XP total"
        :value="formatNumber(progress.xp)"
        :hint="`Nivel ${levelInfo.level}`"
        accent="#7cf5c4"
      />
      <StatCard
        icon="target"
        label="Precisión"
        :value="`${accuracy}%`"
        :hint="`${progress.correct} de ${progress.answered} respuestas`"
        accent="#5ba8ff"
      />
      <StatCard
        icon="flame"
        label="Racha actual"
        :value="pluralize(progress.streak.current, 'día', 'días')"
        :hint="`Mejor racha: ${progress.streak.best}`"
        accent="#fbbf24"
      />
      <StatCard
        icon="layers"
        label="Preguntas vistas"
        :value="Object.keys(progress.seen).length"
        :hint="`${progress.answered} intentos en total`"
        accent="#a78bfa"
      />
    </section>

    <section>
      <div class="section-head">
        <h2>Elige tu tecnología</h2>
        <RouterLink to="/practicar" class="link">
          Ver todas
          <AppIcon name="chevron-right" :size="14" />
        </RouterLink>
      </div>
      <div class="grid grid-3">
        <TopicCard v-for="topic in topicStats" :key="topic.id" :topic="topic" />
      </div>
    </section>

    <section class="grid grid-2 split">
      <div class="card">
        <div class="row-between">
          <div>
            <h3>Actividad de la semana</h3>
            <p class="small muted">XP ganado en los últimos 7 días</p>
          </div>
          <span class="chip chip-brand">
            <AppIcon name="chart" :size="13" />
            {{ formatNumber(activitySeries.reduce((sum, day) => sum + day.xp, 0)) }} XP
          </span>
        </div>
        <div class="chart-wrap">
          <SparkBars :data="activitySeries" :height="128" />
        </div>
        <div class="chart-footer">
          <span class="tiny dim">
            {{ activitySeries.reduce((sum, day) => sum + day.answered, 0) }} preguntas esta semana
          </span>
          <RouterLink to="/progreso" class="link small">
            Ver detalle
            <AppIcon name="chevron-right" :size="13" />
          </RouterLink>
        </div>
      </div>

      <div class="card">
        <div class="row-between">
          <div>
            <h3>Conceptos a reforzar</h3>
            <p class="small muted">El motor adaptativo priorizará estos temas</p>
          </div>
          <span class="chip chip-violet">
            <AppIcon name="brain" :size="13" />
            Personalizado
          </span>
        </div>

        <div v-if="weakList.length" class="weak-list">
          <RouterLink
            v-for="concept in weakList"
            :key="concept.key"
            :to="{ path: '/practicar', query: { tema: concept.topic } }"
            class="weak-item"
          >
            <span class="weak-dot" :style="{ background: concept.topicColor }" />
            <span class="weak-copy">
              <strong>{{ concept.label }}</strong>
              <small>{{ concept.topicName }} · {{ Math.round(concept.mastery * 100) }}% de dominio</small>
            </span>
            <span class="weak-bar">
              <span class="bar bar-thin">
                <span
                  :style="{
                    width: `${Math.max(6, Math.round(concept.mastery * 100))}%`,
                    background: concept.topicColor,
                  }"
                />
              </span>
            </span>
            <AppIcon name="chevron-right" :size="14" class="weak-arrow" />
          </RouterLink>
        </div>

        <div v-else class="empty-weak">
          <span class="empty-icon"><AppIcon name="compass" :size="22" /></span>
          <p class="small muted">
            Todavía no hay suficientes datos. Completa tu primera sesión y aquí verás
            exactamente qué reforzar.
          </p>
          <RouterLink to="/practicar" class="btn btn-outline btn-sm">Hacer mi primera sesión</RouterLink>
        </div>
      </div>
    </section>

    <section>
      <div class="section-head">
        <h2>Logros</h2>
        <RouterLink to="/progreso" class="link">
          Ver todos
          <AppIcon name="chevron-right" :size="14" />
        </RouterLink>
      </div>
      <div class="grid grid-3">
        <AchievementCard
          v-for="achievement in featuredAchievements"
          :key="achievement.id"
          :achievement="achievement"
        />
      </div>
    </section>
  </div>
</template>

<style scoped>
.hero {
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(250px, 0.75fr);
  gap: 30px;
  align-items: center;
  margin-bottom: 20px;
  overflow: hidden;
}

.hero::before {
  content: '';
  position: absolute;
  top: -60%;
  left: 20%;
  width: 420px;
  height: 420px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(124, 245, 196, 0.1), transparent 65%);
  pointer-events: none;
}

.hero-main {
  display: flex;
  align-items: center;
  gap: 26px;
  position: relative;
  z-index: 1;
}

.hero-ring-center {
  display: flex;
  flex-direction: column;
  line-height: 1.1;
}

.hero-ring-center strong {
  font-family: var(--font-display);
  font-size: 1.55rem;
  color: #fff;
}

.hero-ring-center span {
  font-size: 0.66rem;
  color: var(--muted);
  margin-top: 3px;
}

.hero-copy {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  min-width: 0;
}

.hero-copy h2 {
  font-size: clamp(1.4rem, 2.6vw, 1.9rem);
}

.hero-copy p {
  font-size: 0.86rem;
  max-width: 48ch;
}

.level-line {
  width: 100%;
  max-width: 430px;
  margin-top: 4px;
}

.level-copy {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 6px;
  flex-wrap: wrap;
}

.hero-badges {
  display: flex;
  gap: 7px;
  flex-wrap: wrap;
  margin-top: 4px;
}

.hero-plan {
  border-left: 1px solid var(--border);
  padding-left: 26px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.hero-plan h3 {
  font-size: 0.95rem;
  color: #fff;
}

.plan-list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.plan-list li {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  opacity: 0.78;
}

.plan-list li.done {
  opacity: 1;
}

.plan-check {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 1px solid var(--border-strong);
  display: grid;
  place-items: center;
  color: var(--muted-2);
  flex: none;
  margin-top: 1px;
}

.plan-list li.done .plan-check {
  background: rgba(52, 211, 153, 0.16);
  border-color: rgba(52, 211, 153, 0.4);
  color: var(--success);
}

.plan-copy {
  display: flex;
  flex-direction: column;
  line-height: 1.35;
}

.plan-copy strong {
  font-size: 0.79rem;
  font-weight: 600;
  color: var(--text);
}

.plan-list li.done .plan-copy strong {
  color: #fff;
}

.plan-copy small {
  font-size: 0.69rem;
  color: var(--muted-2);
}

.stats {
  margin-bottom: 8px;
}

.split {
  margin-top: 30px;
  align-items: stretch;
}

.chart-wrap {
  margin-top: 20px;
}

.chart-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid var(--border);
  flex-wrap: wrap;
}

.weak-list {
  display: flex;
  flex-direction: column;
  margin-top: 14px;
}

.weak-item {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 11px 4px;
  border-bottom: 1px solid var(--border);
  color: inherit;
  text-decoration: none;
  transition: background 160ms ease;
  border-radius: 6px;
}

.weak-item:last-child {
  border-bottom: 0;
}

.weak-item:hover {
  background: var(--surface-2);
  text-decoration: none;
}

.weak-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex: none;
}

.weak-copy {
  display: flex;
  flex-direction: column;
  line-height: 1.35;
  min-width: 0;
  flex: 1;
}

.weak-copy strong {
  font-size: 0.8rem;
  color: var(--text);
  font-weight: 600;
}

.weak-copy small {
  font-size: 0.68rem;
  color: var(--muted-2);
}

.weak-bar {
  width: 76px;
  flex: none;
}

.weak-arrow {
  color: var(--muted-2);
  flex: none;
}

.empty-weak {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 26px 12px 10px;
  text-align: center;
}

.empty-icon {
  width: 46px;
  height: 46px;
  border-radius: 13px;
  display: grid;
  place-items: center;
  color: var(--violet);
  background: rgba(167, 139, 250, 0.1);
}

@media (max-width: 1080px) {
  .hero {
    grid-template-columns: 1fr;
  }

  .hero-plan {
    border-left: 0;
    border-top: 1px solid var(--border);
    padding-left: 0;
    padding-top: 20px;
  }
}

@media (max-width: 760px) {
  .hero-main {
    flex-direction: column;
    align-items: flex-start;
    gap: 18px;
  }

  .hero-copy h2 {
    font-size: 1.4rem;
  }

  .weak-bar {
    display: none;
  }
}
</style>
