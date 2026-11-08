<script setup>
import { computed } from 'vue'

const props = defineProps({
  value: { type: Number, default: 0 },
  size: { type: Number, default: 96 },
  stroke: { type: Number, default: 8 },
  color: { type: String, default: '#7cf5c4' },
  track: { type: String, default: 'rgba(255,255,255,0.08)' },
  label: { type: String, default: '' },
})

const radius = computed(() => 50 - props.stroke / 2)
const circumference = computed(() => 2 * Math.PI * radius.value)
const offset = computed(() => {
  const clamped = Math.min(100, Math.max(0, props.value))
  return circumference.value - (clamped / 100) * circumference.value
})
</script>

<template>
  <div
    class="progress-ring"
    :style="{ width: `${size}px`, height: `${size}px` }"
    role="img"
    :aria-label="label || `${Math.round(value)} por ciento`"
  >
    <svg viewBox="0 0 100 100">
      <circle
        cx="50"
        cy="50"
        :r="radius"
        fill="none"
        :stroke="track"
        :stroke-width="stroke"
      />
      <circle
        class="ring-value"
        cx="50"
        cy="50"
        :r="radius"
        fill="none"
        :stroke="color"
        :stroke-width="stroke"
        stroke-linecap="round"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="offset"
        transform="rotate(-90 50 50)"
      />
    </svg>
    <div class="ring-center">
      <slot>
        <strong>{{ Math.round(value) }}%</strong>
      </slot>
    </div>
  </div>
</template>

<style scoped>
.progress-ring {
  position: relative;
  display: grid;
  place-items: center;
  flex: none;
}

.progress-ring svg {
  width: 100%;
  height: 100%;
}

.ring-value {
  transition: stroke-dashoffset 900ms cubic-bezier(0.22, 1, 0.36, 1);
  filter: drop-shadow(0 0 6px color-mix(in srgb, currentColor 45%, transparent));
}

.ring-center {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  text-align: center;
  font-family: var(--font-display);
  font-size: 0.95rem;
  color: var(--text);
  line-height: 1.1;
}
</style>
