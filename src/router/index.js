import { createRouter, createWebHashHistory } from 'vue-router'
import { isSupabaseConfigured } from '../lib/supabase'
import { accountChoiceMade, auth, isTeacher } from '../stores/useAuth'

const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/AuthView.vue'),
    meta: { title: 'Iniciar sesión', public: true },
  },
  {
    path: '/registro',
    name: 'register',
    component: () => import('../views/AuthView.vue'),
    meta: { title: 'Crear cuenta', public: true },
  },
  {
    path: '/',
    name: 'home',
    component: () => import('../views/DashboardView.vue'),
    meta: { title: 'Tu panel', subtitle: 'Hoy es un buen día para programar' },
  },
  {
    path: '/practicar',
    name: 'practice',
    component: () => import('../views/PracticeView.vue'),
    meta: { title: 'Practicar', subtitle: 'Quiz adaptativo' },
  },
  {
    path: '/laboratorio',
    name: 'lab',
    component: () => import('../views/LabView.vue'),
    meta: { title: 'Laboratorio', subtitle: 'Código en vivo' },
  },
  {
    path: '/progreso',
    name: 'progress',
    component: () => import('../views/ProgressView.vue'),
    meta: { title: 'Mi progreso', subtitle: 'Tus métricas de aprendizaje' },
  },
  {
    path: '/mentor',
    name: 'mentor',
    component: () => import('../views/MentorView.vue'),
    meta: { title: 'Mentor IA', subtitle: 'Tu copiloto de estudio' },
  },
  {
    path: '/docente',
    name: 'teacher',
    component: () => import('../views/TeacherView.vue'),
    meta: {
      title: 'Panel docente',
      subtitle: 'Progreso de tus estudiantes',
      requiresTeacher: true,
    },
  },
  {
    path: '/ajustes',
    name: 'settings',
    component: () => import('../views/SettingsView.vue'),
    meta: { title: 'Ajustes', subtitle: 'Personaliza tu experiencia' },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('../views/NotFoundView.vue'),
    meta: { title: 'Página no encontrada', subtitle: 'Quizá el enlace cambió' },
  },
]

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    return { top: 0, behavior: 'smooth' }
  },
})

router.beforeEach((to) => {
  // Sin Supabase configurado la app funciona en modo local, sin cuentas.
  if (!isSupabaseConfigured) return true

  const isPublic = Boolean(to.meta.public)
  // Usamos la sesión, no auth.user: un registro pendiente de confirmar
  // crea un usuario pero no una sesión válida.
  const signedIn = Boolean(auth.session)

  if (signedIn && !accountChoiceMade.value) {
    if (to.name === 'login') return true
    const query = { choose: '1' }
    if (to.fullPath !== '/') query.redirect = to.fullPath
    return { name: 'login', query }
  }

  if (to.meta.requiresTeacher && !isTeacher.value) {
    return signedIn ? { name: 'home' } : { name: 'login', query: { redirect: to.fullPath } }
  }

  if (!isPublic && !signedIn) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (isPublic && signedIn) {
    return { name: 'home' }
  }

  return true
})
