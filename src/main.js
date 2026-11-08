import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router'
import { initAuth } from './stores/useAuth'
import { initCloudSync } from './stores/useCloudSync'
import './assets/styles/main.css'

async function bootstrap() {
  // La sesión debe estar resuelta antes de montar: los guards del router
  // dependen de auth.user para decidir si muestra /login o la app.
  await initAuth()
  initCloudSync()
  createApp(App).use(router).mount('#app')
}

bootstrap()
