import { nextTick, reactive, watch } from 'vue'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import { accountName, auth } from './useAuth'
import { cloud, loadMyClassrooms } from './useCloud'
import { assistant, clearChat } from './useAssistant'
import { applyProgressData, progress, resetProgress } from './useProgress'

const LAB_KEY = 'codequest.lab.v1'
const ONBOARDED_KEY = 'codequest.onboarded'
const LAST_USER_KEY = 'codequest.lastUser'
const LOCAL_TS_KEY = 'codequest.localUpdatedAt'
const SYNC_DELAY = 1400

export const cloudSync = reactive({
  enabled: isSupabaseConfigured,
  status: isSupabaseConfigured ? 'idle' : 'local',
  lastSyncedAt: null,
  error: null,
})

let started = false
let suppress = false
let debounceTimer = null
let inFlight = null
let pendingPush = false
let lastUserId = null

function readLastUser() {
  try {
    return localStorage.getItem(LAST_USER_KEY)
  } catch {
    return null
  }
}

function writeLastUser(id) {
  try {
    if (id) localStorage.setItem(LAST_USER_KEY, id)
    else localStorage.removeItem(LAST_USER_KEY)
  } catch {
    /* ignore */
  }
}

function readLocalTs() {
  try {
    return localStorage.getItem(LOCAL_TS_KEY)
  } catch {
    return null
  }
}

function writeLocalTs(value) {
  try {
    if (value) localStorage.setItem(LOCAL_TS_KEY, value)
    else localStorage.removeItem(LOCAL_TS_KEY)
  } catch {
    /* ignore */
  }
}

function isLocalNewer(remoteUpdatedAt) {
  const local = readLocalTs()
  if (!local) return false
  const localTime = new Date(local).getTime()
  const remoteTime = new Date(remoteUpdatedAt || 0).getTime()
  if (Number.isNaN(localTime) || Number.isNaN(remoteTime)) return false
  return localTime > remoteTime
}

function friendlyError(error, fallback) {
  if (!error) return fallback
  const message = String(error.message || error)
  if (/invalid api key|jwt|token/i.test(message)) {
    return 'Tu sesión expiró. Vuelve a iniciar sesión.'
  }
  if (/row-level security|permission denied/i.test(message)) {
    return 'No tienes permisos para guardar el progreso.'
  }
  if (/relation .* does not exist|schema cache/i.test(message)) {
    return 'Falta ejecutar supabase/schema.sql en tu proyecto de Supabase.'
  }
  return message
}

function setStatus(status, error = null) {
  cloudSync.status = status
  cloudSync.error = error
}

export async function pullProgress() {
  if (!supabase || !auth.session || !auth.user) return false
  setStatus('syncing')

  try {
    const { data, error } = await supabase
      .from('student_progress')
      .select('data,updated_at')
      .eq('student_id', auth.user.id)
      .maybeSingle()

    if (error) throw error

    if (!data?.data || !Object.keys(data.data).length) {
      setStatus('idle')
      return false
    }

    // Last-write-wins: si este dispositivo tiene cambios más recientes que
    // la nube (por ejemplo, practicó sin conexión), no los pisamos.
    if (isLocalNewer(data.updated_at)) {
      setStatus('idle')
      return false
    }

    const localAI = { ...progress.ai }
    suppress = true
    applyProgressData(data.data)
    // La clave de IA nunca viaja a la nube: conservamos la de este dispositivo.
    progress.ai = { ...progress.ai, apiKey: localAI.apiKey }
    if (!progress.profile.name) progress.profile.name = accountName.value
    await nextTick()
    suppress = false

    const stamp = data.updated_at || new Date().toISOString()
    cloudSync.lastSyncedAt = stamp
    writeLocalTs(stamp)
    setStatus('synced')
    return true
  } catch (error) {
    suppress = false
    setStatus('error', friendlyError(error, 'No se pudo descargar tu progreso.'))
    return false
  }
}

export async function pushProgress() {
  if (!supabase || !auth.session || !auth.user) return false
  if (inFlight) {
    // Los cambios que llegan mientras se sube se reenvían al terminar.
    pendingPush = true
    return inFlight
  }

  setStatus('syncing')
  const payload = JSON.parse(JSON.stringify(progress))
  if (payload.ai) delete payload.ai.apiKey

  inFlight = (async () => {
    try {
      const { data, error } = await supabase
        .from('student_progress')
        .upsert(
          {
            student_id: auth.user.id,
            data: payload,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'student_id' },
        )
        .select('updated_at')
        .maybeSingle()
      if (error) throw error

      const stamp = data?.updated_at || new Date().toISOString()
      cloudSync.lastSyncedAt = stamp
      writeLocalTs(stamp)
      setStatus('synced')
      return true
    } catch (error) {
      setStatus('error', friendlyError(error, 'No se pudo guardar tu progreso en la nube.'))
      return false
    } finally {
      inFlight = null
      if (pendingPush) {
        pendingPush = false
        scheduleSync()
      }
    }
  })()

  return inFlight
}

export function syncNow() {
  clearTimeout(debounceTimer)
  return pushProgress()
}

function scheduleSync() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    pushProgress()
  }, SYNC_DELAY)
}

async function clearSessionData() {
  suppress = true
  resetProgress({ keepProfile: false, keepAI: false })
  clearChat()
  assistant.prefill = ''
  assistant.error = null
  try {
    localStorage.removeItem(LAB_KEY)
    localStorage.removeItem(ONBOARDED_KEY)
    localStorage.removeItem(LOCAL_TS_KEY)
  } catch {
    /* ignore */
  }
  await nextTick()
  suppress = false
  cloud.classrooms = []
  cloud.students = []
  cloudSync.lastSyncedAt = null
  setStatus('idle')
}

async function handleUserChange(id, previousId) {
  if (id) {
    const storedUser = readLastUser()
    if (storedUser && storedUser !== id) {
      // Otro estudiante usó este navegador: no arrastrar sus datos locales.
      await clearSessionData()
    }

    lastUserId = id
    writeLastUser(id)

    const hadRemote = await pullProgress()
    if (!hadRemote) await pushProgress()
    if (!progress.profile.name && accountName.value) {
      progress.profile.name = accountName.value
    }
    loadMyClassrooms().catch(() => {})
    return
  }

  if (previousId || lastUserId) {
    await clearSessionData()
    lastUserId = null
    writeLastUser(null)
  }
}

export function initCloudSync() {
  if (!isSupabaseConfigured || started) return
  started = true

  watch(
    () => auth.session?.user?.id,
    (id, previousId) => {
      handleUserChange(id, previousId)
    },
    { immediate: true },
  )

  // El rol llega después del perfil: recargamos las clases cuando ya se conoce.
  watch(
    () => auth.profile?.role,
    (role) => {
      if (role && auth.user) {
        loadMyClassrooms().catch(() => {})
      }
    },
  )

  watch(
    () => auth.profile?.full_name,
    (fullName) => {
      if (fullName && auth.user && !progress.profile.name) {
        progress.profile.name = fullName.trim().slice(0, 24)
      }
    },
  )

  watch(
    progress,
    () => {
      if (!auth.user || suppress) return
      writeLocalTs(new Date().toISOString())
      scheduleSync()
    },
    { deep: true },
  )

  if (typeof window !== 'undefined') {
    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden' && auth.user) {
        clearTimeout(debounceTimer)
        pushProgress()
      }
    })
  }
}
