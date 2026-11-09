<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import AppIcon from './AppIcon.vue'
import BrandMark from './BrandMark.vue'
import ProgressRing from './ProgressRing.vue'
import { isTeacher } from '../stores/useAuth'
import { dailyProgress, levelInfo, progress, streakAlive } from '../stores/useProgress'
import { formatNumber, pluralize } from '../utils/format'

const baseNav = [
  { to: '/', label: 'Inicio', icon: 'home', exact: true },
  { to: '/practicar', label: 'Practicar', icon: 'target' },
  { to: '/laboratorio', label: 'Laboratorio', icon: 'lab' },
  { to: '/progreso', label: 'Mi progreso', icon: 'chart' },
  { to: '/mentor', label: 'Mentor IA', icon: 'chat' },
  { to: '/ajustes', label: 'Ajustes', icon: 'settings' },
]

const navItems = computed(() => {
  if (!isTeacher.value) return baseNav
  const items = [...baseNav]
  items.splice(items.length - 1, 0, { to: '/docente', label: 'Docente', icon: 'users' })
  return items
})

const displayName = computed(() => progress.profile.name || 'Explorador')
const initials = computed(() =>
  displayName.value
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase(),
)
</script>

<template>
  <aside class="sidebar">
    <RouterLink to="/" class="brand">
      <BrandMark :size="38" />
      <span class="brand-text">
        <strong>CodeQuizz-AI</strong>
        <small>aprende programando</small>
      </span>
    </RouterLink>

    <nav class="nav" aria-label="Navegación principal">
      <span class="nav-label">Explorar</span>
      <RouterLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="nav-item"
        :exact-active-class="item.exact ? 'active' : ''"
        active-class="active"
      >
        <AppIcon :name="item.icon" :size="18" />
        <span>{{ item.label }}</span>
        <span v-if="item.to === '/mentor'" class="nav-dot" aria-hidden="true" />
      </RouterLink>
    </nav>

    <div class="sidebar-spacer" />

    <div class="goal-card">
      <div class="goal-top">
        <ProgressRing
          :value="dailyProgress.percent"
          :size="54"
          :stroke="5"
          :color="dailyProgress.done ? '#34d399' : '#7cf5c4'"
          :label="`Meta diaria: ${dailyProgress.percent}%`"
        />
        <div class="goal-copy">
          <span class="goal-label">Meta diaria</span>
          <strong>{{ formatNumber(dailyProgress.xp) }} / {{ dailyProgress.goal }} XP</strong>
          <span class="goal-status">
            {{ dailyProgress.done ? '¡Completada!' : 'Sigue así' }}
          </span>
        </div>
      </div>
      <div class="goal-meta">
        <span class="chip" :class="streakAlive ? 'chip-warning' : ''">
          <AppIcon name="flame" :size="13" />
          {{ pluralize(progress.streak.current, 'día', 'días') }}
        </span>
        <span class="chip chip-brand">
          <AppIcon name="bolt" :size="13" />
          Nivel {{ levelInfo.level }}
        </span>
      </div>
      <RouterLink to="/mentor" class="btn btn-primary btn-sm btn-block">
        <AppIcon name="chat" :size="15" />
        Preguntar al mentor
      </RouterLink>
    </div>

    <RouterLink to="/ajustes" class="profile">
      <span class="avatar">{{ initials }}</span>
      <span class="profile-copy">
        <strong>{{ displayName }}</strong>
        <small>Nivel {{ levelInfo.level }} · {{ formatNumber(progress.xp) }} XP</small>
      </span>
      <AppIcon name="chevron-right" :size="16" class="profile-chevron" />
    </RouterLink>
  </aside>
</template>

<style scoped>
.sidebar {
  position: sticky;
  top: 0;
  height: 100vh;
  display: flex;
  flex-direction: column;
  gap: 22px;
  padding: 24px 18px 18px;
  border-right: 1px solid var(--border);
  background: rgba(8, 12, 21, 0.72);
  backdrop-filter: blur(22px);
  z-index: 40;
  overflow-y: auto;
}

.brand {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 0 6px;
  color: inherit;
  text-decoration: none;
}

.brand:hover {
  text-decoration: none;
}

.brand-text {
  display: flex;
  flex-direction: column;
  line-height: 1.15;
}

.brand-text strong {
  font-family: var(--font-display);
  font-size: 1.12rem;
  letter-spacing: -0.02em;
  color: #fff;
}

.brand-text small {
  font-size: 0.64rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--muted-2);
  font-weight: 600;
}

.nav {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.nav-label {
  font-size: 0.64rem;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: var(--muted-2);
  font-weight: 700;
  padding: 0 12px;
  margin-bottom: 7px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 10px 12px;
  border-radius: 11px;
  color: var(--muted);
  font-size: 0.86rem;
  font-weight: 500;
  text-decoration: none;
  border: 1px solid transparent;
  transition: background 160ms ease, color 160ms ease, border-color 160ms ease;
  position: relative;
}

.nav-item:hover {
  background: var(--surface-2);
  color: var(--text);
  text-decoration: none;
}

.nav-item.active {
  background: linear-gradient(100deg, rgba(124, 245, 196, 0.13), rgba(91, 168, 255, 0.05));
  border-color: rgba(124, 245, 196, 0.2);
  color: var(--brand);
}

.nav-item.active::before {
  content: '';
  position: absolute;
  left: -19px;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 18px;
  border-radius: 0 3px 3px 0;
  background: var(--gradient);
}

.nav-dot {
  margin-left: auto;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--brand);
  box-shadow: 0 0 8px var(--brand);
  animation: pulseGlow 2.4s infinite;
}

.sidebar-spacer {
  flex: 1;
  min-height: 10px;
}

.goal-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 15px;
  border-radius: 16px;
  border: 1px solid rgba(124, 245, 196, 0.14);
  background:
    radial-gradient(120% 100% at 100% 0%, rgba(124, 245, 196, 0.08), transparent 60%),
    rgba(255, 255, 255, 0.025);
}

.goal-top {
  display: flex;
  align-items: center;
  gap: 11px;
}

.goal-copy {
  display: flex;
  flex-direction: column;
  line-height: 1.3;
  min-width: 0;
}

.goal-label {
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--muted-2);
  font-weight: 700;
}

.goal-copy strong {
  font-size: 0.82rem;
  color: #fff;
  margin-top: 2px;
}

.goal-status {
  font-size: 0.68rem;
  color: var(--brand);
  margin-top: 1px;
}

.goal-meta {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.profile {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border-radius: 13px;
  border: 1px solid transparent;
  color: inherit;
  text-decoration: none;
  transition: background 160ms ease, border-color 160ms ease;
}

.profile:hover {
  background: var(--surface-2);
  border-color: var(--border);
  text-decoration: none;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 11px;
  display: grid;
  place-items: center;
  font-size: 0.72rem;
  font-weight: 700;
  color: #06121a;
  background: var(--gradient);
  flex: none;
}

.profile-copy {
  display: flex;
  flex-direction: column;
  min-width: 0;
  line-height: 1.3;
}

.profile-copy strong {
  font-size: 0.8rem;
  color: #fff;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.profile-copy small {
  font-size: 0.68rem;
  color: var(--muted-2);
}

.profile-chevron {
  margin-left: auto;
  color: var(--muted-2);
}

@media (max-width: 980px) {
  .sidebar {
    display: none;
  }
}
</style>
