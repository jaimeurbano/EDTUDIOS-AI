<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import AppIcon from '../components/AppIcon.vue'
import { TOPICS } from '../data/questions'
import { isSupabaseConfigured } from '../lib/supabase'
import { auth, isTeacher } from '../stores/useAuth'
import {
  cloud,
  createClassroom,
  loadMyClassrooms,
  loadStudents,
} from '../stores/useCloud'
import { dateKey, levelFromXp } from '../stores/useProgress'
import { formatDate, formatNumber, timeAgo } from '../utils/format'

const TOPIC_ORDER = ['javascript', 'vue', 'css']
const configured = isSupabaseConfigured

const className = ref('')
const creating = ref(false)
const refreshing = ref(false)
const error = ref('')
const copied = ref('')
const search = ref('')
const classroomFilter = ref('all')
const expanded = ref('')

onMounted(() => {
  if (configured && auth.user) refresh()
})

async function refresh() {
  if (!configured) return
  refreshing.value = true
  error.value = ''
  try {
    await loadMyClassrooms()
    await loadStudents()
  } catch (err) {
    error.value = err.message
  } finally {
    refreshing.value = false
  }
}

async function submitClass() {
  const name = className.value.trim()
  if (name.length < 2) {
    error.value = 'Escribe un nombre de clase de al menos 2 caracteres.'
    return
  }
  creating.value = true
  error.value = ''
  try {
    await createClassroom(name)
    className.value = ''
  } catch (err) {
    error.value = err.message
  } finally {
    creating.value = false
  }
}

async function copyCode(code) {
  try {
    await navigator.clipboard.writeText(code)
    copied.value = code
    setTimeout(() => {
      if (copied.value === code) copied.value = ''
    }, 2200)
  } catch {
    copied.value = ''
  }
}

function keyOf(student) {
  return `${student.id}:${student.classroom_id}`
}

function toggle(student) {
  const key = keyOf(student)
  expanded.value = expanded.value === key ? '' : key
}

function metrics(student) {
  const data = student.progress || {}
  const answered = Number(data.answered || 0)
  const correct = Number(data.correct || 0)
  const xp = Number(data.xp || 0)
  return {
    xp,
    level: levelFromXp(xp),
    answered,
    correct,
    accuracy: answered ? Math.round((correct / answered) * 100) : 0,
    streak: Number(data.streak?.current || 0),
    lastActive: data.streak?.lastActive || student.updated_at || student.joined_at,
    sessions: Array.isArray(data.sessions) ? data.sessions.length : 0,
    topicAnswered: data.topicAnswered || {},
    topicCorrect: data.topicCorrect || {},
  }
}

function dayKeyOf(value) {
  if (!value) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value
  try {
    return dateKey(new Date(value))
  } catch {
    return ''
  }
}

function isActiveToday(student) {
  return dayKeyOf(metrics(student).lastActive) === dateKey()
}

function isActiveThisWeek(student) {
  const value = metrics(student).lastActive
  if (!value) return false
  const time = new Date(value).getTime()
  if (Number.isNaN(time)) return false
  return Date.now() - time < 7 * 24 * 60 * 60 * 1000
}

function initialsOf(student) {
  const source = student.full_name || student.email || 'Estudiante'
  return source
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function topicsFor(student) {
  const m = metrics(student)
  return TOPIC_ORDER.map((id) => {
    const answered = Number(m.topicAnswered[id] || 0)
    const correct = Number(m.topicCorrect[id] || 0)
    return {
      id,
      name: TOPICS[id]?.name || id,
      answered,
      correct,
      percent: answered ? Math.round((correct / answered) * 100) : 0,
    }
  })
}

function recentSessions(student) {
  const data = student.progress || {}
  return Array.isArray(data.sessions) ? data.sessions.slice(0, 4) : []
}

function classStudentCount(classroomId) {
  const ids = new Set(
    cloud.students
      .filter((student) => student.classroom_id === classroomId)
      .map((student) => student.id),
  )
  return ids.size
}

const uniqueStudents = computed(() => {
  const map = new Map()
  for (const student of cloud.students) {
    if (!map.has(student.id)) map.set(student.id, student)
  }
  return [...map.values()]
})

const summary = computed(() => {
  const rows = uniqueStudents.value
  const totalAnswered = rows.reduce((sum, student) => sum + metrics(student).answered, 0)
  const totalCorrect = rows.reduce((sum, student) => sum + metrics(student).correct, 0)
  const totalXp = rows.reduce((sum, student) => sum + metrics(student).xp, 0)
  return {
    students: rows.length,
    activeToday: rows.filter(isActiveToday).length,
    activeWeek: rows.filter(isActiveThisWeek).length,
    avgAccuracy: totalAnswered ? Math.round((totalCorrect / totalAnswered) * 100) : 0,
    avgXp: rows.length ? Math.round(totalXp / rows.length) : 0,
  }
})

const filteredStudents = computed(() => {
  const term = search.value.trim().toLowerCase()
  return cloud.students.filter((student) => {
    if (classroomFilter.value !== 'all' && student.classroom_id !== classroomFilter.value) {
      return false
    }
    if (!term) return true
    return `${student.full_name || ''} ${student.email || ''}`.toLowerCase().includes(term)
  })
})
</script>

<template>
  <div class="teacher-view">
    <header class="page-head animate-in">
      <div>
        <span class="eyebrow">Panel docente</span>
        <h1>El progreso de tu clase, <span class="gradient-text">en vivo</span></h1>
        <p>
          Crea una clase, comparte el código y observa el avance real de cada estudiante desde
          cualquier dispositivo.
        </p>
      </div>
      <div class="row wrap head-actions">
        <button type="button" class="btn btn-outline btn-sm" :disabled="refreshing" @click="refresh">
          <AppIcon name="refresh" :size="15" :class="{ spin: refreshing }" />
          {{ refreshing ? 'Actualizando…' : 'Actualizar' }}
        </button>
        <RouterLink to="/ajustes" class="btn btn-ghost btn-sm">
          <AppIcon name="settings" :size="15" />
          Ajustes
        </RouterLink>
      </div>
    </header>

    <Transition name="slide">
      <div v-if="error" class="notice error" role="alert">
        <AppIcon name="alert" :size="16" />
        <span>{{ error }}</span>
        <button type="button" class="notice-close" aria-label="Cerrar aviso" @click="error = ''">
          <AppIcon name="x" :size="14" />
        </button>
      </div>
    </Transition>

    <section v-if="!configured" class="card setup-card animate-in">
      <span class="setup-icon"><AppIcon name="cloud" :size="26" /></span>
      <h2>Conecta Supabase para usar el panel docente</h2>
      <p>
        El panel necesita cuentas y una base de datos. CodeQuest ya funciona en modo local; para
        activar el seguimiento de estudiantes:
      </p>
      <ol class="setup-steps">
        <li>Crea un proyecto gratis en <strong>supabase.com</strong>.</li>
        <li>Ejecuta <code>supabase/schema.sql</code> en el SQL Editor.</li>
        <li>
          Copia <code>.env.example</code> a <code>.env.local</code> con la URL y la anon key del
          proyecto.
        </li>
        <li>Reinicia el servidor y promueve tu cuenta a docente con el SQL del README.</li>
      </ol>
      <RouterLink to="/" class="btn btn-primary btn-sm">
        <AppIcon name="home" :size="15" />
        Volver al inicio
      </RouterLink>
    </section>

    <template v-else-if="!isTeacher">
      <section class="card setup-card animate-in">
        <span class="setup-icon setup-icon-violet"><AppIcon name="lock" :size="26" /></span>
        <h2>Esta sección es solo para docentes</h2>
        <p>
          Tu cuenta está registrada como estudiante. Pide a un administrador que ejecute el SQL
          de promoción incluido en el README y vuelve a iniciar sesión.
        </p>
        <RouterLink to="/" class="btn btn-primary btn-sm">Volver al inicio</RouterLink>
      </section>
    </template>

    <template v-else>
      <div class="summary-grid animate-in delay-1">
        <article class="card summary-card">
          <span class="summary-icon"><AppIcon name="users" :size="20" /></span>
          <div>
            <strong>{{ summary.students }}</strong>
            <span>estudiantes</span>
          </div>
          <small>{{ cloud.classrooms.length }} clase(s)</small>
        </article>
        <article class="card summary-card">
          <span class="summary-icon summary-icon-blue"><AppIcon name="bolt" :size="20" /></span>
          <div>
            <strong>{{ summary.activeToday }}</strong>
            <span>activos hoy</span>
          </div>
          <small>{{ summary.activeWeek }} en los últimos 7 días</small>
        </article>
        <article class="card summary-card">
          <span class="summary-icon summary-icon-violet"><AppIcon name="target" :size="20" /></span>
          <div>
            <strong>{{ summary.avgAccuracy }}%</strong>
            <span>precisión media</span>
          </div>
          <small>Entre respuestas registradas</small>
        </article>
        <article class="card summary-card">
          <span class="summary-icon summary-icon-warning"><AppIcon name="star" :size="20" /></span>
          <div>
            <strong>{{ formatNumber(summary.avgXp) }}</strong>
            <span>XP promedio</span>
          </div>
          <small>Por estudiante</small>
        </article>
      </div>

      <section class="card class-card animate-in delay-1">
        <div class="class-head">
          <div>
            <h2>Mis clases</h2>
            <p class="help">
              Comparte el código de 6 caracteres. Los estudiantes lo ingresan en
              <strong>Ajustes → Cuenta y sincronización</strong>.
            </p>
          </div>
          <form class="create-class" @submit.prevent="submitClass">
            <input
              v-model="className"
              class="input"
              type="text"
              maxlength="60"
              placeholder="Nombre de la clase (ej. 8°B)"
              aria-label="Nombre de la nueva clase"
            />
            <button type="submit" class="btn btn-primary btn-sm" :disabled="creating">
              <AppIcon :name="creating ? 'rotate' : 'plus'" :size="15" :class="{ spin: creating }" />
              {{ creating ? 'Creando…' : 'Crear clase' }}
            </button>
          </form>
        </div>

        <div v-if="cloud.classrooms.length" class="class-grid">
          <article v-for="room in cloud.classrooms" :key="room.id" class="class-tile">
            <div class="class-tile-top">
              <span class="class-avatar"><AppIcon name="graduation" :size="18" /></span>
              <div class="class-tile-copy">
                <strong>{{ room.name }}</strong>
                <small>{{ classStudentCount(room.id) }} estudiante(s)</small>
              </div>
            </div>
            <button type="button" class="code-pill" @click="copyCode(room.join_code)">
              <span class="code-label">Código</span>
              <code>{{ room.join_code }}</code>
              <AppIcon :name="copied === room.join_code ? 'check' : 'copy'" :size="14" />
            </button>
            <span class="class-hint">
              {{ copied === room.join_code ? '¡Copiado!' : 'Toca el código para copiarlo' }}
            </span>
          </article>
        </div>
        <div v-else class="inline-empty">
          <AppIcon name="graduation" :size="22" />
          <p>Aún no tienes clases. Crea la primera con el formulario de arriba.</p>
        </div>
      </section>

      <section class="card students-card animate-in delay-2">
        <div class="students-head">
          <div>
            <h2>Estudiantes</h2>
            <p class="help">Progreso sincronizado desde la nube. Ordena tu vista con los filtros.</p>
          </div>
          <div class="students-tools">
            <div class="search-box">
              <AppIcon name="search" :size="16" class="search-icon" />
              <input
                v-model="search"
                class="input"
                type="search"
                placeholder="Buscar por nombre o correo"
                aria-label="Buscar estudiantes"
              />
            </div>
            <select v-model="classroomFilter" class="input class-select" aria-label="Filtrar por clase">
              <option value="all">Todas las clases</option>
              <option v-for="room in cloud.classrooms" :key="room.id" :value="room.id">
                {{ room.name }}
              </option>
            </select>
          </div>
        </div>

        <div v-if="cloud.studentsLoading" class="loading-state">
          <AppIcon name="rotate" :size="22" class="spin" />
          <span>Cargando progreso de los estudiantes…</span>
        </div>

        <div v-else-if="!cloud.classrooms.length" class="empty-state">
          <span class="empty-icon"><AppIcon name="users" :size="24" /></span>
          <h3>Primero crea una clase</h3>
          <p>Cuando compartas el código, los estudiantes aparecerán aquí automáticamente.</p>
        </div>

        <div v-else-if="!cloud.students.length" class="empty-state">
          <span class="empty-icon"><AppIcon name="link" :size="24" /></span>
          <h3>Tu clase está lista para recibir estudiantes</h3>
          <p>
            Comparte el código <strong>{{ cloud.classrooms[0]?.join_code }}</strong> para que se
            unan desde <strong>Ajustes</strong>.
          </p>
        </div>

        <div v-else-if="!filteredStudents.length" class="empty-state">
          <span class="empty-icon"><AppIcon name="search" :size="24" /></span>
          <h3>Sin coincidencias</h3>
          <p>Prueba con otro nombre, correo o cambia el filtro de clase.</p>
        </div>

        <div v-else class="table-wrap">
          <table class="student-table">
            <thead>
              <tr>
                <th>Estudiante</th>
                <th class="col-class">Clase</th>
                <th class="col-level">Nivel</th>
                <th class="col-xp">XP</th>
                <th class="col-accuracy">Precisión</th>
                <th class="col-streak">Racha</th>
                <th class="col-activity">Última actividad</th>
                <th class="col-toggle"><span class="sr-only">Detalle</span></th>
              </tr>
            </thead>
            <tbody>
              <template v-for="student in filteredStudents" :key="keyOf(student)">
                <tr
                  class="student-row"
                  :class="{ open: expanded === keyOf(student) }"
                  @click="toggle(student)"
                >
                  <td>
                    <div class="student-identity">
                      <span class="student-avatar">{{ initialsOf(student) }}</span>
                      <div>
                        <strong>{{ student.full_name || 'Estudiante' }}</strong>
                        <small>{{ student.email }}</small>
                      </div>
                    </div>
                  </td>
                  <td class="col-class">
                    <span class="class-tag">{{ student.classroom_name }}</span>
                  </td>
                  <td class="col-level">
                    <span class="level-badge">Nv. {{ metrics(student).level }}</span>
                  </td>
                  <td class="col-xp num">{{ formatNumber(metrics(student).xp) }}</td>
                  <td class="col-accuracy">
                    <div class="accuracy-cell">
                      <span>{{ metrics(student).accuracy }}%</span>
                      <div class="mini-bar">
                        <span :style="{ width: `${metrics(student).accuracy}%` }" />
                      </div>
                    </div>
                  </td>
                  <td class="col-streak">
                    <span class="streak-cell">
                      <AppIcon name="flame" :size="13" />
                      {{ metrics(student).streak }} d
                    </span>
                  </td>
                  <td class="col-activity">
                    {{ timeAgo(metrics(student).lastActive) || 'Sin actividad' }}
                  </td>
                  <td class="col-toggle">
                    <button
                      type="button"
                      class="row-toggle"
                      :aria-expanded="expanded === keyOf(student)"
                      :aria-label="`Ver detalle de ${student.full_name || 'estudiante'}`"
                      @click.stop="toggle(student)"
                    >
                      <AppIcon
                        name="chevron-down"
                        :size="16"
                        :class="{ rotated: expanded === keyOf(student) }"
                      />
                    </button>
                  </td>
                </tr>

                <tr v-if="expanded === keyOf(student)" class="detail-row">
                  <td colspan="8">
                    <div class="detail-panel">
                      <div class="detail-topics">
                        <div v-for="topic in topicsFor(student)" :key="topic.id" class="topic-card">
                          <div class="topic-top">
                            <strong>{{ topic.name }}</strong>
                            <span>{{ topic.answered }} preguntas</span>
                          </div>
                          <div class="bar">
                            <span :style="{ width: `${topic.percent}%` }" />
                          </div>
                          <small>{{ topic.correct }} correctas · {{ topic.percent }}%</small>
                        </div>
                      </div>

                      <div class="detail-sessions">
                        <h4>Últimas sesiones</h4>
                        <ul v-if="recentSessions(student).length">
                          <li v-for="(session, index) in recentSessions(student)" :key="index">
                            <span class="session-topic">{{ session.topicLabel || 'Práctica' }}</span>
                            <span class="session-score">
                              {{ session.correct }}/{{ session.total }} ·
                              {{ session.accuracy }}%
                            </span>
                            <span class="session-date">
                              {{ formatDate(session.date) || 'Sin fecha' }}
                            </span>
                          </li>
                        </ul>
                        <p v-else class="help">Todavía no completó ninguna sesión de quiz.</p>
                      </div>
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </section>
    </template>
  </div>
</template>

<style scoped>
.head-actions {
  align-items: center;
}

.notice {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  padding: 12px 14px;
  margin-bottom: 18px;
  border-radius: 12px;
  font-size: 0.82rem;
  line-height: 1.45;
}

.notice.error {
  border: 1px solid rgba(251, 113, 133, 0.3);
  background: rgba(251, 113, 133, 0.08);
  color: #f3b7c1;
}

.notice span {
  flex: 1;
}

.notice-close {
  border: 0;
  background: transparent;
  color: inherit;
  opacity: 0.7;
  padding: 2px;
  border-radius: 5px;
}

.setup-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  max-width: 760px;
}

.setup-icon {
  width: 52px;
  height: 52px;
  border-radius: 15px;
  display: grid;
  place-items: center;
  background: rgba(91, 168, 255, 0.12);
  color: var(--brand-2);
}

.setup-icon-violet {
  background: rgba(167, 139, 250, 0.12);
  color: var(--violet);
}

.setup-card h2 {
  font-size: 1.25rem;
}

.setup-card p {
  color: var(--muted);
  font-size: 0.85rem;
  line-height: 1.6;
}

.setup-steps {
  margin: 2px 0 8px;
  padding-left: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: var(--muted);
  font-size: 0.82rem;
  line-height: 1.55;
}

.setup-steps code {
  color: var(--brand);
  font-size: 0.9em;
}

.setup-steps strong {
  color: var(--text);
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 18px;
}

.summary-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
}

.summary-card > div {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
  min-width: 0;
}

.summary-card strong {
  font-family: var(--font-display);
  font-size: 1.35rem;
  color: #fff;
}

.summary-card span {
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--muted-2);
}

.summary-card small {
  margin-left: auto;
  font-size: 0.66rem;
  color: var(--muted-2);
  text-align: right;
  line-height: 1.35;
  max-width: 90px;
}

.summary-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  flex: none;
  background: rgba(124, 245, 196, 0.11);
  color: var(--brand);
}

.summary-icon-blue {
  background: rgba(91, 168, 255, 0.12);
  color: var(--brand-2);
}

.summary-icon-violet {
  background: rgba(167, 139, 250, 0.12);
  color: var(--violet);
}

.summary-icon-warning {
  background: rgba(251, 191, 36, 0.12);
  color: var(--warning);
}

.class-card {
  margin-bottom: 18px;
}

.class-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
}

.class-head h2,
.students-head h2 {
  font-size: 1.1rem;
}

.class-head .help,
.students-head .help {
  margin-top: 3px;
  max-width: 56ch;
}

.create-class {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.create-class .input {
  width: 230px;
}

.class-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px;
  margin-top: 18px;
}

.class-tile {
  display: flex;
  flex-direction: column;
  gap: 9px;
  padding: 14px;
  border-radius: 13px;
  border: 1px solid var(--border);
  background: var(--surface-2);
}

.class-tile-top {
  display: flex;
  align-items: center;
  gap: 10px;
}

.class-avatar {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  background: rgba(124, 245, 196, 0.1);
  color: var(--brand);
  flex: none;
}

.class-tile-copy {
  display: flex;
  flex-direction: column;
  line-height: 1.3;
  min-width: 0;
}

.class-tile-copy strong {
  font-size: 0.86rem;
  color: var(--text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.class-tile-copy small {
  font-size: 0.68rem;
  color: var(--muted-2);
}

.code-pill {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 10px;
  border-radius: 9px;
  border: 1px dashed rgba(124, 245, 196, 0.32);
  background: rgba(124, 245, 196, 0.06);
  color: var(--brand);
  cursor: pointer;
  transition: background 160ms ease;
}

.code-pill:hover {
  background: rgba(124, 245, 196, 0.12);
}

.code-label {
  font-size: 0.62rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--muted-2);
}

.code-pill code {
  font-family: var(--font-mono);
  font-size: 0.86rem;
  letter-spacing: 0.12em;
  font-weight: 600;
}

.code-pill svg {
  margin-left: auto;
}

.class-hint {
  font-size: 0.64rem;
  color: var(--muted-2);
}

.inline-empty {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
  padding: 16px;
  border-radius: 12px;
  border: 1px dashed var(--border-strong);
  color: var(--muted);
  font-size: 0.8rem;
}

.inline-empty svg {
  color: var(--muted-2);
  flex: none;
}

.students-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 18px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.students-tools {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.search-box {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--muted-2);
  pointer-events: none;
}

.search-box .input {
  padding-left: 36px;
  width: 230px;
}

.class-select {
  width: 170px;
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 42px 16px;
  color: var(--muted);
  font-size: 0.84rem;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 6px;
  padding: 42px 20px;
}

.empty-icon {
  width: 52px;
  height: 52px;
  border-radius: 15px;
  display: grid;
  place-items: center;
  background: var(--surface-2);
  border: 1px solid var(--border);
  color: var(--muted);
  margin-bottom: 6px;
}

.empty-state h3 {
  font-size: 1rem;
}

.empty-state p {
  color: var(--muted);
  font-size: 0.82rem;
  max-width: 48ch;
  line-height: 1.55;
}

.table-wrap {
  overflow-x: auto;
  margin: 0 -6px;
  padding: 0 6px;
}

.student-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 0.8rem;
}

.student-table th {
  text-align: left;
  padding: 9px 12px;
  font-size: 0.64rem;
  text-transform: uppercase;
  letter-spacing: 0.09em;
  color: var(--muted-2);
  font-weight: 700;
  border-bottom: 1px solid var(--border);
  white-space: nowrap;
}

.student-table td {
  padding: 11px 12px;
  border-bottom: 1px solid var(--border);
  color: var(--muted);
  vertical-align: middle;
}

.student-row {
  cursor: pointer;
  transition: background 150ms ease;
}

.student-row:hover {
  background: rgba(255, 255, 255, 0.025);
}

.student-row.open {
  background: rgba(124, 245, 196, 0.045);
}

.student-row.open td {
  border-bottom-color: transparent;
}

.student-identity {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 180px;
}

.student-avatar {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  flex: none;
  background: var(--gradient);
  color: #06121a;
  font-size: 0.66rem;
  font-weight: 700;
}

.student-identity div {
  display: flex;
  flex-direction: column;
  line-height: 1.3;
  min-width: 0;
}

.student-identity strong {
  font-size: 0.8rem;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 210px;
}

.student-identity small {
  font-size: 0.68rem;
  color: var(--muted-2);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 210px;
}

.class-tag {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 999px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  font-size: 0.68rem;
  white-space: nowrap;
}

.level-badge {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 7px;
  background: rgba(91, 168, 255, 0.1);
  border: 1px solid rgba(91, 168, 255, 0.2);
  color: var(--brand-2);
  font-size: 0.68rem;
  font-weight: 600;
  white-space: nowrap;
}

.num {
  font-family: var(--font-mono);
  color: var(--text);
  white-space: nowrap;
}

.accuracy-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 74px;
}

.accuracy-cell > span {
  font-size: 0.74rem;
  color: var(--text);
}

.mini-bar {
  height: 4px;
  border-radius: 99px;
  background: rgba(255, 255, 255, 0.08);
  overflow: hidden;
}

.mini-bar span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: var(--gradient);
}

.streak-cell {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
}

.streak-cell svg {
  color: var(--warning);
}

.col-activity {
  white-space: nowrap;
  font-size: 0.74rem;
}

.col-toggle {
  width: 40px;
  text-align: right;
}

.row-toggle {
  width: 30px;
  height: 30px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface-2);
  color: var(--muted);
  display: grid;
  place-items: center;
  cursor: pointer;
}

.row-toggle:hover {
  color: var(--brand);
  border-color: var(--border-strong);
}

.row-toggle svg {
  transition: transform 180ms ease;
}

.row-toggle svg.rotated {
  transform: rotate(180deg);
}

.detail-row td {
  padding: 0 12px 14px;
  border-bottom: 1px solid var(--border);
  background: rgba(124, 245, 196, 0.035);
}

.detail-panel {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
  gap: 16px;
  padding: 14px;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: rgba(7, 10, 18, 0.45);
}

.detail-topics {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.topic-card {
  padding: 10px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: var(--surface-2);
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.topic-top {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 6px;
}

.topic-top strong {
  font-size: 0.74rem;
  color: var(--text);
}

.topic-top span {
  font-size: 0.62rem;
  color: var(--muted-2);
  white-space: nowrap;
}

.topic-card small {
  font-size: 0.62rem;
  color: var(--muted-2);
}

.detail-sessions h4 {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--muted-2);
  margin-bottom: 7px;
}

.detail-sessions ul {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.detail-sessions li {
  display: flex;
  align-items: baseline;
  gap: 8px;
  font-size: 0.7rem;
  padding: 5px 0;
  border-bottom: 1px dashed var(--border);
}

.detail-sessions li:last-child {
  border-bottom: 0;
}

.session-topic {
  color: var(--text);
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.session-score {
  color: var(--brand);
  white-space: nowrap;
}

.session-date {
  color: var(--muted-2);
  white-space: nowrap;
}

.spin {
  animation: teacherSpin 900ms linear infinite;
}

@keyframes teacherSpin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 1100px) {
  .summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .col-class,
  .col-streak {
    display: none;
  }

  .detail-panel {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .col-level,
  .col-activity {
    display: none;
  }

  .create-class,
  .students-tools {
    width: 100%;
  }

  .create-class .input,
  .search-box,
  .search-box .input,
  .class-select {
    width: 100%;
  }

  .create-class {
    flex-direction: column;
    align-items: stretch;
  }

  .detail-topics {
    grid-template-columns: 1fr;
  }

  .summary-grid {
    grid-template-columns: 1fr;
  }
}
</style>
