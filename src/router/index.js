import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
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
