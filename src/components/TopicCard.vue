<script setup>
import { computed } from 'vue'
import AppIcon from './AppIcon.vue'
import ProgressRing from './ProgressRing.vue'
import { DIFFICULTY_LABELS } from '../data/questions'

const props = defineProps({
  topic: { type: Object, required: true },
})

const difficultyLabel = computed(
  () => DIFFICULTY_LABELS[Math.min(4, Math.max(0, props.topic.recommended - 1))],
)
</script>

<template>
  <RouterLink
    :to="{ path: '/practicar', query: { tema: topic.id } }"
    class="topic-card"
    :style="{ '--topic-color': topic.color }"
  >
    <div class="topic-top">
      <span class="topic-icon">
        <AppIcon :name="topic.icon" :size="24" />
      </span>
      <ProgressRing
        :value="topic.percent"
        :size="58"
        :stroke="5"
        :color="topic.color"
        :label="`Dominio de ${topic.name}: ${topic.percent}%`"
      />
    </div>

    <div class="topic-copy">
      <h3>{{ topic.name }}</h3>
      <p>{{ topic.description }}</p>
    </div>

    <div class="topic-meta">
      <span class="chip">Nivel {{ difficultyLabel }}</span>
      <span class="topic-questions">{{ topic.answered }} respondidas</span>
    </div>

    <div class="topic-footer">
      <span>Practicar ahora</span>
      <AppIcon name="arrow-right" :size="16" />
    </div>
  </RouterLink>
</template>

<style scoped>
.topic-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 22px;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  background:
    radial-gradient(120% 100% at 100% 0%, color-mix(in srgb, var(--topic-color) 10%, transparent), transparent 55%),
    var(--surface);
  backdrop-filter: blur(18px);
  color: inherit;
  text-decoration: none;
  transition: transform 220ms ease, border-color 220ms ease, box-shadow 220ms ease;
  overflow: hidden;
  position: relative;
}

.topic-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(160deg, transparent 40%, color-mix(in srgb, var(--topic-color) 6%, transparent));
  opacity: 0;
  transition: opacity 220ms ease;
  pointer-events: none;
}

.topic-card:hover {
  transform: translateY(-4px);
  border-color: color-mix(in srgb, var(--topic-color) 35%, transparent);
  box-shadow: 0 26px 50px -26px color-mix(in srgb, var(--topic-color) 40%, transparent);
  text-decoration: none;
}

.topic-card:hover::before {
  opacity: 1;
}

.topic-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.topic-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  color: var(--topic-color);
  background: color-mix(in srgb, var(--topic-color) 12%, transparent);
  border: 1px solid color-mix(in srgb, var(--topic-color) 24%, transparent);
}

.topic-copy h3 {
  font-size: 1.14rem;
  color: #fff;
}

.topic-copy p {
  margin-top: 5px;
  font-size: 0.8rem;
  line-height: 1.5;
  color: var(--muted);
}

.topic-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.topic-questions {
  font-size: 0.72rem;
  color: var(--muted-2);
}

.topic-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 14px;
  border-top: 1px solid var(--border);
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--topic-color);
}

.topic-footer .icon-svg {
  transition: transform 200ms ease;
}

.topic-card:hover .topic-footer .icon-svg {
  transform: translateX(4px);
}
</style>
