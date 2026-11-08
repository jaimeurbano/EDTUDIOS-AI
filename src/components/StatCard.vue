<script setup>
import AppIcon from './AppIcon.vue'

defineProps({
  icon: { type: String, default: 'spark' },
  label: { type: String, required: true },
  value: { type: [String, Number], required: true },
  hint: { type: String, default: '' },
  accent: { type: String, default: '#7cf5c4' },
})
</script>

<template>
  <div class="stat-card">
    <span class="stat-icon" :style="{ color: accent, background: `${accent}1a` }">
      <AppIcon :name="icon" :size="19" />
    </span>
    <div class="stat-copy">
      <span class="stat-label">{{ label }}</span>
      <strong class="stat-value">{{ value }}</strong>
      <span v-if="hint" class="stat-hint">{{ hint }}</span>
    </div>
  </div>
</template>

<style scoped>
.stat-card {
  display: flex;
  align-items: flex-start;
  gap: 13px;
  padding: 17px 18px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  backdrop-filter: blur(16px);
}

.stat-icon {
  width: 38px;
  height: 38px;
  border-radius: 11px;
  display: grid;
  place-items: center;
  flex: none;
}

.stat-copy {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.stat-label {
  font-size: 0.74rem;
  color: var(--muted);
  font-weight: 500;
}

.stat-value {
  font-family: var(--font-display);
  font-size: 1.5rem;
  line-height: 1.2;
  color: #fff;
  margin-top: 1px;
}

.stat-hint {
  font-size: 0.72rem;
  color: var(--muted-2);
  margin-top: 2px;
}
</style>
