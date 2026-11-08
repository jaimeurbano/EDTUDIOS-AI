import { reactive } from 'vue'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import { auth, isTeacher } from './useAuth'

export const cloud = reactive({
  configured: isSupabaseConfigured,
  classrooms: [],
  students: [],
  loading: false,
  studentsLoading: false,
  error: null,
  lastLoaded: null,
})

function friendlyError(error, fallback) {
  if (!error) return fallback
  const message = String(error.message || error)
  if (/invalid api key|jwt/i.test(message)) {
    return 'La sesión no es válida. Vuelve a iniciar sesión.'
  }
  if (/permission denied|row-level security/i.test(message)) {
    return 'No tienes permisos para esta acción.'
  }
  if (/duplicate key/i.test(message)) {
    return 'Ese registro ya existe.'
  }
  if (/function .* does not exist|schema cache/i.test(message)) {
    return 'Falta ejecutar supabase/schema.sql en tu proyecto de Supabase.'
  }
  return message
}

export async function loadMyClassrooms() {
  if (!isSupabaseConfigured || !supabase || !auth.user) {
    cloud.classrooms = []
    return []
  }

  cloud.loading = true
  cloud.error = null

  try {
    if (isTeacher.value) {
      const { data, error } = await supabase
        .from('classrooms')
        .select('id,name,join_code,teacher_id,created_at')
        .eq('teacher_id', auth.user.id)
        .order('created_at', { ascending: true })

      if (error) throw error
      cloud.classrooms = data || []
    } else {
      const { data, error } = await supabase
        .from('classroom_members')
        .select('classroom_id,joined_at,classrooms:classroom_id(id,name,join_code,teacher_id,created_at)')
        .eq('student_id', auth.user.id)
        .order('joined_at', { ascending: true })

      if (error) throw error
      cloud.classrooms = (data || [])
        .map((row) =>
          row.classrooms
            ? { ...row.classrooms, joined_at: row.joined_at }
            : null,
        )
        .filter(Boolean)
    }

    cloud.lastLoaded = new Date().toISOString()
    return cloud.classrooms
  } catch (error) {
    cloud.error = friendlyError(error, 'No se pudieron cargar las clases.')
    throw new Error(cloud.error)
  } finally {
    cloud.loading = false
  }
}

export async function createClassroom(name) {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase no está configurado.')
  }
  const cleanName = String(name || '').trim()
  if (cleanName.length < 2) {
    throw new Error('El nombre de la clase debe tener al menos 2 caracteres.')
  }

  const { data, error } = await supabase.rpc('create_classroom', {
    class_name: cleanName.slice(0, 60),
  })

  if (error) throw new Error(friendlyError(error, 'No se pudo crear la clase.'))

  const classroom = Array.isArray(data) ? data[0] : data
  if (classroom?.id) {
    cloud.classrooms = [...cloud.classrooms, classroom]
  } else {
    await loadMyClassrooms()
  }
  return classroom
}

export async function joinClassroom(code) {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase no está configurado.')
  }
  const cleanCode = String(code || '').trim().toUpperCase()
  if (cleanCode.length < 4) {
    throw new Error('Escribe el código que te dio tu docente.')
  }

  const { data, error } = await supabase.rpc('join_classroom', {
    p_code: cleanCode,
  })

  if (error) throw new Error(friendlyError(error, 'No se pudo unir a la clase.'))

  const classroom = Array.isArray(data) ? data[0] : data
  await loadMyClassrooms()
  return classroom
}

export async function leaveClassroom(classroomId) {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase no está configurado.')
  }

  const { error } = await supabase.rpc('leave_classroom', {
    p_classroom_id: classroomId,
  })

  if (error) throw new Error(friendlyError(error, 'No se pudo salir de la clase.'))

  cloud.classrooms = cloud.classrooms.filter((room) => room.id !== classroomId)
}

export async function loadStudents() {
  if (!isSupabaseConfigured || !supabase || !auth.user || !isTeacher.value) {
    cloud.students = []
    return []
  }

  cloud.studentsLoading = true
  cloud.error = null

  try {
    if (!cloud.classrooms.length) {
      await loadMyClassrooms()
    }
    if (!cloud.classrooms.length) {
      cloud.students = []
      return []
    }

    const classroomIds = cloud.classrooms.map((room) => room.id)
    const roomById = new Map(cloud.classrooms.map((room) => [room.id, room]))

    const { data: members, error: membersError } = await supabase
      .from('classroom_members')
      .select('classroom_id,student_id,joined_at')
      .in('classroom_id', classroomIds)

    if (membersError) throw membersError
    if (!members?.length) {
      cloud.students = []
      return []
    }

    const studentIds = [...new Set(members.map((member) => member.student_id))]

    const [{ data: profiles, error: profilesError }, { data: progressRows, error: progressError }] =
      await Promise.all([
        supabase
          .from('profiles')
          .select('id,email,full_name,role,created_at')
          .in('id', studentIds),
        supabase
          .from('student_progress')
          .select('student_id,data,updated_at')
          .in('student_id', studentIds),
      ])

    if (profilesError) throw profilesError
    if (progressError) throw progressError

    const profileById = new Map((profiles || []).map((profile) => [profile.id, profile]))
    const progressById = new Map(
      (progressRows || []).map((row) => [row.student_id, row]),
    )

    cloud.students = members
      .map((member) => {
        const profile = profileById.get(member.student_id)
        if (!profile) return null
        const progressRow = progressById.get(member.student_id)
        return {
          ...profile,
          classroom_id: member.classroom_id,
          classroom_name: roomById.get(member.classroom_id)?.name || 'Clase',
          joined_at: member.joined_at,
          progress: progressRow?.data || null,
          updated_at: progressRow?.updated_at || null,
        }
      })
      .filter(Boolean)

    cloud.lastLoaded = new Date().toISOString()
    return cloud.students
  } catch (error) {
    cloud.error = friendlyError(error, 'No se pudo cargar el progreso de los estudiantes.')
    throw new Error(cloud.error)
  } finally {
    cloud.studentsLoading = false
  }
}

export function studentsInClassroom(classroomId) {
  return cloud.students.filter((student) => student.classroom_id === classroomId)
}
