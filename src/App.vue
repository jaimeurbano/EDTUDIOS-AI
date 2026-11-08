<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import AppSidebar from './components/AppSidebar.vue'
import AppTopbar from './components/AppTopbar.vue'
import MobileNav from './components/MobileNav.vue'
import OnboardingModal from './components/OnboardingModal.vue'
import ToastStack from './components/ToastStack.vue'
import AppIcon from './components/AppIcon.vue'
import { progress } from './stores/useProgress'

const route = useRoute()
const showOnboarding = ref(false)
const showFab = computed(() => route.path !== '/mentor')

onMounted(() => {
  try {
    if (!progress.profile.name && !localStorage.getItem('codequest.onboarded')) {
      showOnboarding.value = true
    }
  } catch {
    /* ignore */
  }
  applyMotionPreference(progress.profile.reducedMotion)
})

function applyMotionPreference(reduced) {
  document.documentElement.classList.toggle('reduce-motion', Boolean(reduced))
}

watch(
  () => progress.profile.reducedMotion,
  (value) => applyMotionPreference(value),
)

watch(
  () => route.meta.title,
  (title) => {
    document.title = title ? `${title} · CodeQuest` : 'CodeQuest · Aprende programando'
  },
  { immediate: true },
)
</script>

<template>
  <a href="#contenido" class="skip-link">Saltar al contenido</a>

  <div class="app-shell">
    <AppSidebar />

    <div class="app-main">
      <AppTopbar />
      <main id="contenido" class="page-content" tabindex="-1">
        <RouterView v-slot="{ Component }">
          <Transition name="page" mode="out-in">
            <component :is="Component" />
          </Transition>
        </RouterView>
      </main>
    </div>
  </div>

  <MobileNav />
  <ToastStack />

  <Transition name="slide">
    <RouterLink v-if="showFab" to="/mentor" class="mentor-fab" aria-label="Abrir el mentor IA">
      <span class="mentor-fab-icon">
        <AppIcon name="chat" :size="22" />
      </span>
      <span class="mentor-fab-text">Mentor</span>
    </RouterLink>
  </Transition>

  <OnboardingModal v-if="showOnboarding" @close="showOnboarding = false" />
</template>

<style scoped>
.skip-link {
  position: fixed;
  top: 10px;
  left: 10px;
  z-index: 400;
  padding: 10px 16px;
  border-radius: 10px;
  background: var(--brand);
  color: #06121a;
  font-weight: 700;
  transform: translateY(-160%);
  transition: transform 160ms ease;
}

.skip-link:focus {
  transform: translateY(0);
}

.mentor-fab {
  position: fixed;
  right: 26px;
  bottom: 26px;
  z-index: 60;
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 10px 18px 10px 10px;
  border-radius: 999px;
  background: var(--gradient);
  color: #06121a;
  font-weight: 700;
  font-size: 0.82rem;
  text-decoration: none;
  box-shadow: 0 18px 44px -14px rgba(124, 245, 196, 0.7);
  transition: transform 180ms ease, box-shadow 180ms ease;
}

.mentor-fab:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 24px 54px -14px rgba(124, 245, 196, 0.85);
  text-decoration: none;
}

.mentor-fab-icon {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: rgba(6, 18, 26, 0.14);
}

@media (max-width: 980px) {
  .mentor-fab {
    right: 16px;
    bottom: 84px;
  }

  .mentor-fab-text {
    display: none;
  }

  .mentor-fab {
    padding: 8px;
    animation: float 4s ease-in-out infinite;
  }
}
</style>
