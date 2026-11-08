import { computed, reactive } from 'vue'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

export const auth = reactive({
  ready: !isSupabaseConfigured,
  session: null,
  user: null,
  profile: null,
  loading: false,
  error: null,
})

export const isAuthenticated = computed(() => Boolean(auth.session?.user))
export const isTeacher = computed(() => auth.profile?.role === 'teacher')
export const isStudent = computed(() => auth.profile?.role === 'student')

export const accountName = computed(() => {
  const profileName = auth.profile?.full_name?.trim()
  if (profileName) return profileName
  const email = auth.user?.email || ''
  return email ? email.split('@')[0] : 'Estudiante'
})

const ERROR_MESSAGES = {
  'Invalid login credentials': 'Correo o contraseña incorrectos.',
  'Email not confirmed': 'Confirma tu correo antes de iniciar sesión.',
  'User already registered': 'Ya existe una cuenta con este correo.',
  'Password should be at least 6 characters':
    'La contraseña debe tener al menos 6 caracteres.',
  'Signup requires a valid password': 'Escribe una contraseña válida.',
  'Unable to validate email address: invalid format': 'El correo no tiene un formato válido.',
  'Auth session missing!': 'Tu sesión expiró. Vuelve a iniciar sesión.',
}

function friendlyError(error) {
  if (!error) return 'Ocurrió un error inesperado.'
  const message = String(error.message || error)
  return ERROR_MESSAGES[message] || message
}

let initialized = false
let nameTimer = null

async function loadProfile() {
  if (!supabase || !auth.user) return null
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id,email,full_name,role,created_at')
      .eq('id', auth.user.id)
      .maybeSingle()

    if (error) throw error

    if (data) {
      auth.profile = data
      return data
    }

    // Respaldo por si el trigger de alta aún no ha creado el perfil.
    const fallbackName =
      auth.user.user_metadata?.full_name ||
      auth.user.email?.split('@')[0] ||
      'Estudiante'
    const { data: created, error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: auth.user.id,
        email: auth.user.email,
        full_name: fallbackName,
      })
      .select('id,email,full_name,role,created_at')
      .maybeSingle()

    if (insertError) throw insertError
    auth.profile = created
    return created
  } catch (error) {
    console.warn('No se pudo cargar el perfil:', error)
    return null
  }
}

export async function initAuth() {
  if (!isSupabaseConfigured || initialized) return
  initialized = true

  try {
    const { data, error } = await supabase.auth.getSession()
    if (error) throw error
    auth.session = data.session || null
    auth.user = data.session?.user || null
    if (auth.user) await loadProfile()
  } catch (error) {
    console.warn('No se pudo recuperar la sesión:', error)
  } finally {
    auth.ready = true
  }

  supabase.auth.onAuthStateChange((_event, session) => {
    auth.session = session || null
    auth.user = session?.user || null
    auth.ready = true
    if (session?.user) {
      // No esperar llamadas a Supabase dentro del callback de auth.
      setTimeout(() => {
        loadProfile()
      }, 0)
    } else {
      auth.profile = null
    }
  })
}

export async function signIn(email, password) {
  if (!supabase) throw new Error('Supabase no está configurado.')
  auth.loading = true
  auth.error = null
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: String(email || '').trim(),
      password: String(password || ''),
    })
    if (error) throw error
    auth.session = data.session
    auth.user = data.user
    await loadProfile()
    return data
  } catch (error) {
    auth.error = friendlyError(error)
    throw new Error(auth.error)
  } finally {
    auth.loading = false
  }
}

export async function signUp(email, password, fullName) {
  if (!supabase) throw new Error('Supabase no está configurado.')
  auth.loading = true
  auth.error = null
  try {
    const { data, error } = await supabase.auth.signUp({
      email: String(email || '').trim(),
      password: String(password || ''),
      options: {
        data: { full_name: String(fullName || '').trim() },
      },
    })
    if (error) throw error
    auth.session = data.session || null
    // Sin sesión (correo pendiente de confirmar) no consideramos al usuario
    // como autenticado: evita que los guards lo dejen entrar a la app.
    auth.user = data.session?.user || null
    if (data.session) await loadProfile()
    return {
      needsConfirmation: !data.session,
      user: data.user,
    }
  } catch (error) {
    auth.error = friendlyError(error)
    throw new Error(auth.error)
  } finally {
    auth.loading = false
  }
}

export async function signOut() {
  if (!supabase) return
  auth.loading = true
  try {
    await supabase.auth.signOut()
  } finally {
    auth.loading = false
    auth.session = null
    auth.user = null
    auth.profile = null
    auth.error = null
  }
}

export function updateAccountName(fullName) {
  if (!supabase || !auth.user) return
  const next = String(fullName || '').trim().slice(0, 60)
  clearTimeout(nameTimer)
  nameTimer = setTimeout(async () => {
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: next })
      .eq('id', auth.user.id)
    if (!error) {
      auth.profile = { ...(auth.profile || {}), full_name: next }
    }
  }, 700)
}

export async function refreshProfile() {
  return loadProfile()
}
