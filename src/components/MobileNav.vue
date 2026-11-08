<script setup>
import { RouterLink } from 'vue-router'
import AppIcon from './AppIcon.vue'

const items = [
  { to: '/', label: 'Inicio', icon: 'home', exact: true },
  { to: '/practicar', label: 'Practicar', icon: 'target' },
  { to: '/laboratorio', label: 'Lab', icon: 'lab' },
  { to: '/progreso', label: 'Progreso', icon: 'chart' },
  { to: '/mentor', label: 'Mentor', icon: 'chat' },
]
</script>

<template>
  <nav class="mobile-nav" aria-label="Navegación móvil">
    <RouterLink
      v-for="item in items"
      :key="item.to"
      :to="item.to"
      class="mobile-nav-item"
      :active-class="item.exact ? '' : 'active'"
      exact-active-class="active"
    >
      <AppIcon :name="item.icon" :size="20" />
      <span>{{ item.label }}</span>
    </RouterLink>
  </nav>
</template>

<style scoped>
.mobile-nav {
  display: none;
}

@media (max-width: 980px) {
  .mobile-nav {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 45;
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 2px;
    padding: 8px 10px calc(8px + env(safe-area-inset-bottom));
    background: rgba(8, 12, 21, 0.94);
    border-top: 1px solid var(--border);
    backdrop-filter: blur(22px);
    -webkit-backdrop-filter: blur(22px);
  }

  .mobile-nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 6px 2px;
    border-radius: 10px;
    color: var(--muted-2);
    font-size: 0.62rem;
    font-weight: 600;
    text-decoration: none;
    transition: color 160ms ease, background 160ms ease;
  }

  .mobile-nav-item:hover {
    text-decoration: none;
  }

  .mobile-nav-item.active {
    color: var(--brand);
    background: rgba(124, 245, 196, 0.08);
  }
}
</style>
