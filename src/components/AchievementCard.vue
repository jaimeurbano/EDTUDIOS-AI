<script setup>
import AppIcon from './AppIcon.vue'
import { formatDate } from '../utils/format'

defineProps({
  achievement: { type: Object, required: true },
})
</script>

<template>
  <div class="achievement" :class="{ unlocked: achievement.unlocked }">
    <span
      class="achievement-icon"
      :style="{ '--accent': achievement.color }"
      :aria-hidden="true"
    >
      <AppIcon :name="achievement.unlocked ? achievement.icon : 'lock'" :size="21" />
    </span>
    <div class="achievement-copy">
      <div class="achievement-title">
        <strong>{{ achievement.name }}</strong>
        <span v-if="achievement.unlocked" class="achievement-check">
          <AppIcon name="check" :size="12" />
        </span>
      </div>
      <p>{{ achievement.description }}</p>
      <div v-if="!achievement.unlocked" class="achievement-progress">
        <div class="bar bar-thin">
          <span :style="{ width: `${achievement.percent}%` }" />
        </div>
        <span class="tiny dim">{{ achievement.current }}/{{ achievement.target }}</span>
      </div>
      <span v-else class="achievement-date tiny">
        Desbloqueado el {{ formatDate(achievement.unlockedAt) }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.achievement {
  display: flex;
  gap: 13px;
  padding: 16px;
  border: 1px solid var(--border);
  border-radius: 15px;
  background: rgba(255, 255, 255, 0.02);
  opacity: 0.72;
  transition: opacity 200ms ease, border-color 200ms ease, transform 200ms ease;
}

.achievement.unlocked {
  opacity: 1;
  background: linear-gradient(140deg, rgba(255, 255, 255, 0.045), transparent 60%);
}

.achievement.unlocked:hover {
  transform: translateY(-2px);
  border-color: var(--border-strong);
}

.achievement-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  flex: none;
  background: rgba(255, 255, 255, 0.05);
  color: var(--muted-2);
  border: 1px solid var(--border);
}

.achievement.unlocked .achievement-icon {
  background: color-mix(in srgb, var(--accent) 14%, transparent);
  color: var(--accent);
  border-color: color-mix(in srgb, var(--accent) 32%, transparent);
  box-shadow: 0 0 22px -8px var(--accent);
}

.achievement-copy {
  min-width: 0;
  flex: 1;
}

.achievement-title {
  display: flex;
  align-items: center;
  gap: 7px;
}

.achievement-title strong {
  font-size: 0.86rem;
  color: #fff;
}

.achievement-check {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: rgba(52, 211, 153, 0.18);
  color: var(--success);
}

.achievement-copy p {
  font-size: 0.75rem;
  color: var(--muted);
  line-height: 1.4;
  margin-top: 2px;
}

.achievement-progress {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}

.achievement-progress .bar {
  flex: 1;
}

.achievement-date {
  display: block;
  margin-top: 5px;
  color: var(--success);
}
</style>
