import { computed, reactive, watch } from 'vue'
import { TOPICS } from '../data/questions'
import {
  buildSystemPrompt,
  getRelated,
  searchKnowledge,
  SUGGESTED_PROMPTS,
} from '../data/knowledge'
import { currentQuestion, quiz, topicLabel } from '../composables/useAdaptiveQuiz'
import {
  incrementAssistant,
  levelInfo,
  progress,
  weakConcepts,
} from './useProgress'

const CHAT_KEY = 'codequest.chat.v1'
const SOCRATIC_KEY = 'codequest.socratic.v1'

function loadSocratic() {
  try {
    const raw = localStorage.getItem(SOCRATIC_KEY)
    return raw === null ? true : raw === '1'
  } catch {
    return true
  }
}

const WELCOME = {
  id: 'welcome',
  role: 'assistant',
  content:
    '¡Hola! Soy **Mentor**, tu copiloto de aprendizaje. Puedo explicarte conceptos, ayudarte a leer un error y darte pistas sin revelarte la respuesta.\n\n¿En qué te atascaste hoy?',
  at: Date.now(),
  source: 'CodeQuizz-AI',
}

function loadChat() {
  try {
    const raw = localStorage.getItem(CHAT_KEY)
    if (!raw) return [WELCOME]
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed) || !parsed.length) return [WELCOME]
    return parsed.slice(-60)
  } catch {
    return [WELCOME]
  }
}

function normalize(text) {
  return String(text)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const assistant = reactive({
  messages: loadChat(),
  pending: false,
  error: null,
  socratic: loadSocratic(),
  context: { topic: null, question: null },
  prefill: '',
  lastSource: '',
})

export const suggestions = SUGGESTED_PROMPTS

export const isRemoteConfigured = computed(
  () =>
    progress.ai.mode === 'remote' &&
    Boolean(progress.ai.apiKey) &&
    Boolean(progress.ai.baseUrl) &&
    Boolean(progress.ai.model),
)

export const assistantStats = computed(() => ({
  messages: progress.assistantMessages || 0,
  conversations: assistant.messages.filter((m) => m.role === 'user').length,
}))

let persistTimer = null
watch(
  () => assistant.messages,
  () => {
    clearTimeout(persistTimer)
    persistTimer = setTimeout(() => {
      try {
        localStorage.setItem(CHAT_KEY, JSON.stringify(assistant.messages.slice(-60)))
      } catch {
        /* ignore */
      }
    }, 200)
  },
  { deep: true },
)

function pushMessage(role, content, extra = {}) {
  const message = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    content,
    at: Date.now(),
    ...extra,
  }
  assistant.messages.push(message)
  return message
}

function quizGuidance() {
  const question = currentQuestion.value
  if (!question) return null
  const topic = TOPICS[question.topic]
  let content = `Estás practicando **${question.concept}** en ${topic?.name || ''} (dificultad ${question.difficulty}/5).\n\n> ${question.prompt}\n\n`
  if (assistant.socratic) {
    content += `**Pista:** ${question.hint}\n\nAntes de elegir, pregúntate:\n1. ¿Qué me pide exactamente el enunciado?\n2. ¿Qué pasaría si ejecutara el código paso a paso?\n3. ¿Qué opción puedo descartar con seguridad?\n\nDime qué opción crees y por qué, y lo revisamos juntos.`
  } else {
    content += `**Respuesta:** ${question.options[question.answer]}\n\n${question.explanation}\n\n**Pista original:** ${question.hint}`
  }
  return { content, source: 'Contexto del quiz' }
}

function buildLocalResponse(text) {
  const normalized = normalize(text)
  if (normalized.includes('explicame este codigo paso a paso')) {
    return {
      content:
        'La explicación línea por línea de código personalizado requiere conectar una IA generativa en **Ajustes → Mentor IA**. En modo local puedo consultar la base de conocimiento, pero no interpretar código arbitrario. Pega el fragmento después de “Código” y vuelve a enviarlo cuando la IA esté conectada.',
      source: 'Mentor local',
    }
  }

  if (normalized.includes('analiza este error de programacion')) {
    const error = text.match(/(?:ReferenceError|TypeError|SyntaxError|RangeError|Error)\s*:[^\n]+/i)
    if (!error) {
      return {
        content:
          'Para orientar el diagnóstico, incluye el **mensaje completo del error** (tipo, texto y línea) y el **código relacionado**. El mentor local no ejecuta código; con una IA conectada puede relacionar ambos y sugerir correcciones específicas.',
        source: 'Mentor local',
      }
    }

    const type = error[0].split(':')[0].toLowerCase()
    const causes = {
      referenceerror:
        'Normalmente indica que se usó un nombre que no está definido o no es accesible en ese ámbito. Revisa errores de escritura, imports y dónde se declara la variable.',
      typeerror:
        'Normalmente indica que una operación se aplicó a un valor incompatible, a menudo `null` o `undefined`. Comprueba el valor y su tipo justo antes de la línea que falla.',
      syntaxerror:
        'El intérprete no pudo analizar el código. Revisa la línea señalada y también la anterior: pueden faltar comillas, paréntesis o llaves.',
      rangeerror:
        'El valor está fuera del rango permitido por esa operación. Revisa límites, índices y argumentos numéricos.',
      error:
        'El texto del error por sí solo no confirma la causa. Compara el stack trace con el código que se ejecuta en esa línea.',
    }
    return {
      content: `**Error recibido:** \`${error[0]}\`\n\n${causes[type] || causes.error}\n\n1. Localiza la primera línea de tu código que aparece en el stack trace.\n2. Inspecciona los valores usados allí con \`console.log({ valor })\`.\n3. Compara el resultado con el tipo y valor que esperabas.\n\nEsta orientación local es general y no ejecuta el código. Para relacionar el error con tu fragmento y proponer un cambio concreto, conecta una IA en **Ajustes → Mentor IA**.`,
      source: 'Guía local de depuración',
    }
  }

  const asksAboutQuiz =
    /pregunta|quiz|pista|no entiendo|ayuda|respuesta|opcion|ejercicio|este codigo/.test(normalized)

  if (quiz.status === 'playing' && currentQuestion.value && asksAboutQuiz) {
    const guidance = quizGuidance()
    if (guidance) return guidance
  }

  const found = searchKnowledge(text)
  if (found) {
    const related = getRelated(found.entry)
    let content = found.entry.answer
    if (related.length) {
      content += `\n\n---\n**Sigue explorando:** ${related.map((r) => `*${r.title}*`).join(' · ')}`
    }
    return { content, source: `Base de conocimiento · ${found.entry.title}` }
  }

  return {
    content:
      'No encontré una respuesta exacta para eso en mi base local, pero puedo ayudarte si me das un poco más de contexto: ¿qué intentas hacer, qué esperabas que pasara y qué ocurrió realmente?\n\nMientras tanto, prueba con:\n- *“Explícame los closures con un ejemplo”*\n- *“¿Por qué `map` me devuelve undefined?”*\n- *“¿Cómo funciona `v-model`?”*\n- *“Centrar un div con flexbox”*\n\nTambién puedes activar un modelo de IA real en **Ajustes → Mentor IA** para preguntas abiertas.',
    source: 'Mentor local',
  }
}

async function callRemoteAI() {
  const base = progress.ai.baseUrl.replace(/\/+$/, '')
  const url = `${base}/chat/completions`
  const context = {
    profileName: progress.profile.name || 'estudiante',
    level: levelInfo.value.level,
    weakConcepts: weakConcepts(3).map((c) => ({
      label: `${c.label} (${c.topicName})`,
      mastery: c.mastery,
    })),
    currentQuestion: quiz.status === 'playing' ? currentQuestion.value : null,
    topic: quiz.status === 'playing' ? topicLabel.value : null,
  }

  const history = assistant.messages
    .slice(-10)
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .map((m) => ({ role: m.role, content: m.content }))

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 45000)

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${progress.ai.apiKey}`,
      },
      body: JSON.stringify({
        model: progress.ai.model,
        temperature: 0.5,
        max_tokens: 800,
        messages: [
          { role: 'system', content: buildSystemPrompt(context) },
          ...history,
        ],
      }),
      signal: controller.signal,
    })

    if (!response.ok) {
      const detail = await response.text().catch(() => '')
      throw new Error(`HTTP ${response.status}${detail ? ` · ${detail.slice(0, 120)}` : ''}`)
    }

    const data = await response.json()
    const content = data?.choices?.[0]?.message?.content
    if (!content) throw new Error('El proveedor devolvió una respuesta vacía.')
    return { content, source: `IA · ${progress.ai.model}` }
  } finally {
    clearTimeout(timeout)
  }
}

export async function sendMessage(rawText) {
  const text = String(rawText || '').trim()
  if (!text || assistant.pending) return

  pushMessage('user', text)
  incrementAssistant()
  assistant.pending = true
  assistant.error = null

  try {
    let response
    if (isRemoteConfigured.value) {
      try {
        response = await callRemoteAI()
      } catch (error) {
        assistant.error = `No se pudo conectar con la IA (${error.message}). Respondí con el mentor local.`
        await sleep(300)
        response = buildLocalResponse(text)
      }
    } else {
      await sleep(420 + Math.random() * 380)
      response = buildLocalResponse(text)
    }

    assistant.lastSource = response.source || ''
    pushMessage('assistant', response.content, { source: response.source })
  } catch (error) {
    assistant.error = 'Ocurrió un problema al generar la respuesta.'
    pushMessage(
      'assistant',
      'No pude procesar tu mensaje. Inténtalo de nuevo o reformúlalo con más detalle.',
      { source: 'Error' },
    )
    console.error(error)
  } finally {
    assistant.pending = false
  }
}

export function askMentor(prompt = '') {
  assistant.prefill = prompt
}

export function consumePrefill() {
  const value = assistant.prefill
  assistant.prefill = ''
  return value
}

export function clearChat() {
  assistant.messages = [WELCOME]
  assistant.error = null
  try {
    localStorage.removeItem(CHAT_KEY)
  } catch {
    /* ignore */
  }
}

export function setSocratic(value) {
  assistant.socratic = Boolean(value)
  try {
    localStorage.setItem(SOCRATIC_KEY, assistant.socratic ? '1' : '0')
  } catch {
    /* ignore */
  }
}
