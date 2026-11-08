<script setup>
defineProps({
  size: { type: Number, default: 34 },
})
</script>

<template>
  <span class="brand-mark" :style="{ width: `${size}px`, height: `${size}px` }" aria-hidden="true">
    <svg viewBox="0 0 48 48" fill="none">
      <rect width="48" height="48" rx="14" fill="url(#cq-bg)" />
      <path
        d="M19 16 11 24l8 8M29 16l8 8-8 8"
        stroke="#07131a"
        stroke-width="4"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <circle cx="24" cy="24" r="2.4" fill="#07131a" />
      <defs>
        <linearGradient id="cq-bg" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stop-color="#7cf5c4" />
          <stop offset="0.55" stop-color="#5ba8ff" />
          <stop offset="1" stop-color="#a78bfa" />
        </linearGradient>
      </defs>
    </svg>
  </span>
</template>

<style scoped>
.brand-mark {
  display: inline-grid;
  place-items: center;
  border-radius: 12px;
  box-shadow: 0 8px 24px -10px rgba(124, 245, 196, 0.7);
}

.brand-mark svg {
  width: 100%;
  height: 100%;
}
</style>
