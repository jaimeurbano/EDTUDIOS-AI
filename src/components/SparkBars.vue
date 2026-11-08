<script setup>
import { computed } from 'vue'
import { formatNumber } from '../utils/format'

const props = defineProps({
  data: { type: Array, default: () => [] },
  height: { type: Number, default: 96 },
})

const maxValue = computed(() => Math.max(10, ...props.data.map((d) => d.xp || 0)))

function barHeight(value) {
  const ratio = (value || 0) / maxValue.value
  return `${Math.max(6, Math.round(ratio * 100))}%`
}
</script>

<template>
  <div class="spark" :style="{ height: `${height}px` }">
    <div
      v-for="day in data"
      :key="day.key"
      class="spark-col"
      :class="{ today: day.isToday }"
      :title="`${day.label} ${day.dayNumber}: ${formatNumber(day.xp)} XP · ${day.answered} preguntas`"
    >
      <div class="spark-bar-wrap">
        <div
          class="spark-bar"
          :style="{ height: barHeight(day.xp) }"
          :class="{ empty: !day.xp }"
        />
      </div>
      <span class="spark-label">{{ day.label }}</span>
    </div>
  </div>
</template>

<style scoped>
.spark {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  width: 100%;
}

.spark-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 7px;
  height: 100%;
  min-width: 0;
}

.spark-bar-wrap {
  flex: 1;
  width: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.spark-bar {
  width: min(30px, 100%);
  border-radius: 7px 7px 3px 3px;
  background: linear-gradient(180deg, #7cf5c4, rgba(91, 168, 255, 0.45));
  transition: height 600ms cubic-bezier(0.22, 1, 0.36, 1);
  min-height: 5px;
}

.spark-bar.empty {
  background: rgba(255, 255, 255, 0.07);
}

.spark-col.today .spark-bar:not(.empty) {
  box-shadow: 0 0 18px rgba(124, 245, 196, 0.45);
}

.spark-label {
  font-size: 0.66rem;
  font-weight: 600;
  color: var(--muted-2);
}

.spark-col.today .spark-label {
  color: var(--brand);
}
</style>
