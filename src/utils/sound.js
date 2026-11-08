let audioContext = null

function getContext() {
  if (typeof window === 'undefined') return null
  const Ctx = window.AudioContext || window.webkitAudioContext
  if (!Ctx) return null
  if (!audioContext) audioContext = new Ctx()
  if (audioContext.state === 'suspended') audioContext.resume()
  return audioContext
}

function note(context, frequency, start, duration, volume = 0.05, type = 'sine') {
  const oscillator = context.createOscillator()
  const gain = context.createGain()
  oscillator.type = type
  oscillator.frequency.setValueAtTime(frequency, start)
  gain.gain.setValueAtTime(0.0001, start)
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.015)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)
  oscillator.connect(gain)
  gain.connect(context.destination)
  oscillator.start(start)
  oscillator.stop(start + duration + 0.02)
}

export function playFeedback(kind, enabled = true) {
  if (!enabled) return
  try {
    const context = getContext()
    if (!context) return
    const now = context.currentTime
    if (kind === 'correct') {
      note(context, 523.25, now, 0.14, 0.045)
      note(context, 783.99, now + 0.09, 0.2, 0.04)
    } else if (kind === 'wrong') {
      note(context, 196, now, 0.2, 0.04, 'triangle')
      note(context, 155.56, now + 0.11, 0.24, 0.035, 'triangle')
    } else if (kind === 'level') {
      note(context, 523.25, now, 0.12, 0.04)
      note(context, 659.25, now + 0.1, 0.12, 0.04)
      note(context, 783.99, now + 0.2, 0.24, 0.045)
    }
  } catch {
    /* el audio es un extra: nunca debe romper la app */
  }
}
