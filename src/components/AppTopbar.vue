<script setup>
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import AppIcon from './AppIcon.vue'
import BrandMark from './BrandMark.vue'
import { dailyProgress, levelInfo, progress } from '../stores/useProgress'
import { formatNumber } from '../utils/format'

const route = useRoute()

const title = computed(() => route.meta.title || 'CodeQuest')
const subtitle = computed(() => route.meta.subtitle || '')
const initials = computed(() =>
  (progress.profile.name || 'Explorador')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase(),
)
</script>

<template>
  <header class="topbar">
    <div class="topbar-left">
      <RouterLink to="/" class="mobile-brand" aria-label="Ir al inicio">
        <BrandMark :size="30" />
        <span>CodeQuest</span>
      </RouterLink>
      <div class="topbar-title">
        <span class="topbar-eyebrow">{{ subtitle || 'Tu espacio de aprendizaje' }}</span>
        <strong>{{ title }}</strong>
      </div>
    </div>

    <div class="topbar-right">
      <div class="daily-chip" :title="`${formatNumber(dailyProgress.xp)} de ${dailyProgress.goal} XP hoy`">
        <span class="daily-ring">
          <svg viewBox="0 0 36 36" aria-hidden="true">
            <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="3" />
            <circle
              cx="18"
              cy="18"
              r="15"
              fill="none"
              stroke="#7cf5c4"
              stroke-width="3"
              stroke-linecap="round"
              :stroke-dasharray="94.2"
              :stroke-dashoffset="94.2 - (94.2 * dailyProgress.percent) / 100"
              transform="rotate(-90 18 18)"
            />
          </svg>
        </span>
        <span class="daily-copy">
          <strong>{{ dailyProgress.done ? 'Meta cumplida' : 'Meta diaria' }}</strong>
          <small>{{ formatNumber(dailyProgress.xp) }}/{{ dailyProgress.goal }} XP</small>
        </span>
      </div>

      <span class="chip chip-warning topbar-streak">
        <AppIcon name="flame" :size="14" />
        {{ progress.streak.current }}
      </span>

      <span class="chip topbar-level">
        <AppIcon name="bolt" :size="14" />
        Nv. {{ levelInfo.level }}
      </span>

      <RouterLink to="/ajustes" class="topbar-avatar" :aria-label="`Perfil de ${progress.profile.name || 'Explorador'}`">
        {{ initials }}
      </RouterLink>
    </div>
  </header>
</template>

<style scoped>
.topbar {
  position: sticky;
  top: 0;
  z-index: 35;
  height: var(--topbar-height);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 0 34px;
  border-bottom: 1px solid var(--border);
  background: rgba(7, 10, 18, 0.74);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
}

.mobile-brand {
  display: none;
  align-items: center;
  gap: 8px;
  color: #fff;
  font-family: var(--font-display);
  font-weight: 600;
  text-decoration: none;
}

.topbar-title {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
  min-width: 0;
}

.topbar-eyebrow {
  font-size: 0.66rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--muted-2);
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.topbar-title strong {
  font-family: var(--font-display);
  font-size: 1.02rem;
  color: #fff;
  letter-spacing: -0.01em;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 9px;
  flex: none;
}

.daily-chip {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 5px 12px 5px 6px;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: var(--surface-2);
}

.daily-ring {
  width: 27px;
  height: 27px;
  display: block;
}

.daily-ring svg {
  width: 100%;
  height: 100%;
}

.daily-copy {
  display: flex;
  flex-direction: column;
  line-height: 1.15;
}

.daily-copy strong {
  font-size: 0.68rem;
  color: var(--text);
  font-weight: 600;
}

.daily-copy small {
  font-size: 0.62rem;
  color: var(--muted-2);
}

.topbar-avatar {
  width: 36px;
  height: 36px;
  border-radius: 11px;
  display: grid;
  place-items: center;
  font-size: 0.7rem;
  font-weight: 700;
  color: #06121a;
  background: var(--gradient);
  text-decoration: none;
  transition: transform 160ms ease, box-shadow 160ms ease;
}

.topbar-avatar:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 22px -8px rgba(124, 245, 196, 0.7);
  text-decoration: none;
}

@media (max-width: 980px) {
  .topbar {
    padding: 0 18px;
    height: 66px;
  }

  .mobile-brand {
    display: flex;
  }

  .topbar-title {
    display: none;
  }

  .daily-chip {
    display: none;
  }
}

@media (max-width: 520px) {
  .topbar {
    padding: 0 14px;
  }

  .topbar-level {
    display: none;
  }
}
</style>
