<script setup>
import AppIcon from './AppIcon.vue'
import { dismissToast, toasts } from '../stores/useProgress'
</script>

<template>
  <Teleport to="body">
    <div class="toast-stack" aria-live="polite" aria-atomic="false">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="toast"
          :style="{ '--toast-color': toast.color }"
        >
          <span class="toast-icon">
            <AppIcon :name="toast.icon" :size="19" />
          </span>
          <div class="toast-body">
            <strong>{{ toast.title }}</strong>
            <p>{{ toast.subtitle }}</p>
          </div>
          <button class="toast-close" type="button" aria-label="Cerrar" @click="dismissToast(toast.id)">
            <AppIcon name="x" :size="15" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-stack {
  position: fixed;
  top: 18px;
  right: 18px;
  z-index: 200;
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: min(360px, calc(100vw - 32px));
  pointer-events: none;
}

.toast {
  pointer-events: auto;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 14px 14px 15px;
  background: rgba(13, 19, 33, 0.96);
  border: 1px solid var(--border-strong);
  border-left: 3px solid var(--toast-color);
  border-radius: 14px;
  box-shadow: var(--shadow);
  backdrop-filter: blur(20px);
}

.toast-icon {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  background: color-mix(in srgb, var(--toast-color) 14%, transparent);
  color: var(--toast-color);
  flex: none;
}

.toast-body {
  flex: 1;
  min-width: 0;
}

.toast-body strong {
  display: block;
  font-size: 0.84rem;
  color: #fff;
  line-height: 1.3;
}

.toast-body p {
  margin-top: 3px;
  font-size: 0.76rem;
  color: var(--muted);
  line-height: 1.4;
}

.toast-close {
  background: transparent;
  border: 0;
  color: var(--muted-2);
  padding: 2px;
  border-radius: 5px;
  flex: none;
}

.toast-close:hover {
  color: var(--text);
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity 260ms ease, transform 260ms cubic-bezier(0.22, 1, 0.36, 1);
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(24px) scale(0.97);
}

@media (max-width: 520px) {
  .toast-stack {
    top: auto;
    bottom: 84px;
    right: 12px;
    left: 12px;
    width: auto;
  }
}
</style>
