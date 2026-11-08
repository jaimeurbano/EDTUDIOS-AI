export function formatNumber(value) {
  return new Intl.NumberFormat('es-ES').format(Math.round(value || 0))
}

export function formatDate(iso, options = {}) {
  if (!iso) return ''
  try {
    return new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'short',
      ...options,
    }).format(new Date(iso))
  } catch {
    return ''
  }
}

export function formatDuration(ms) {
  const totalSeconds = Math.max(0, Math.round(ms / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  if (!minutes) return `${seconds}s`
  return `${minutes}m ${String(seconds).padStart(2, '0')}s`
}

export function greeting() {
  const hour = new Date().getHours()
  if (hour < 6) return 'Buenas noches'
  if (hour < 12) return 'Buenos días'
  if (hour < 20) return 'Buenas tardes'
  return 'Buenas noches'
}

export function timeAgo(iso) {
  if (!iso) return ''
  const diff = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'hace un momento'
  if (minutes < 60) return `hace ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `hace ${hours} h`
  const days = Math.floor(hours / 24)
  if (days < 30) return `hace ${days} d`
  return formatDate(iso, { year: 'numeric' })
}

export function pluralize(count, singular, plural) {
  return `${count} ${count === 1 ? singular : plural}`
}
