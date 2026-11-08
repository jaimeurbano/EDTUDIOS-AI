<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import AppIcon from '../components/AppIcon.vue'
import { CSS_CHALLENGES, JS_CHALLENGES, LAB_BASE_CSS } from '../data/challenges'
import { progress } from '../stores/useProgress'
import { copyText, renderMarkdown } from '../utils/markdown'
import { checkLogs, runUserCode } from '../utils/runner'
import { playFeedback } from '../utils/sound'

const LAB_KEY = 'codequest.lab.v1'
const MODES = [
  { id: 'js', label: 'JavaScript', icon: 'js', color: '#f7df1e' },
  { id: 'css', label: 'CSS', icon: 'css', color: '#5ba8ff' },
]

function loadSolved() {
  try {
    const raw = localStorage.getItem(LAB_KEY)
    const parsed = raw ? JSON.parse(raw) : {}
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

const mode = ref('js')
const selectedId = ref(JS_CHALLENGES[0].id)
const solved = ref(loadSolved())
const jsCode = ref({})
const cssCode = ref({})
const jsResult = ref(null)
const cssMessage = ref(null)
const previewSrc = ref('')
const running = ref(false)
const showHint = ref(false)
const showSolution = ref(false)
const solutionCopied = ref(false)

let previewTimer = null

const challenges = computed(() => (mode.value === 'js' ? JS_CHALLENGES : CSS_CHALLENGES))
const challenge = computed(
  () => challenges.value.find((item) => item.id === selectedId.value) || challenges.value[0],
)
const modeMeta = computed(() => MODES.find((item) => item.id === mode.value) || MODES[0])
const solvedCount = computed(() => challenges.value.filter((item) => solved.value[item.id]).length)
const progressPercent = computed(() =>
  challenges.value.length ? Math.round((solvedCount.value / challenges.value.length) * 100) : 0,
)

const editorCode = computed({
  get() {
    const store = mode.value === 'js' ? jsCode.value : cssCode.value
    const value = store[challenge.value.id]
    return value === undefined ? challenge.value.starter : value
  },
  set(value) {
    const store = mode.value === 'js' ? jsCode : cssCode
    store.value = { ...store.value, [challenge.value.id]: value }
  },
})

const briefHtml = computed(() => renderMarkdown(challenge.value.brief))
const hintHtml = computed(() => renderMarkdown(challenge.value.hint || ''))
const lineCount = computed(() => editorCode.value.split('\n').length)
const charCount = computed(() => editorCode.value.length)

const objectiveResults = computed(() => {
  if (mode.value !== 'css') return []
  return (challenge.value.objectives || []).map((objective) => {
    let passed = false
    try {
      passed = Boolean(objective.test(editorCode.value))
    } catch {
      passed = false
    }
    return { label: objective.label, passed }
  })
})
const passedObjectives = computed(
  () => objectiveResults.value.filter((objective) => objective.passed).length,
)

const jsStatus = computed(() => {
  if (!jsResult.value) return { label: 'Sin ejecutar', className: '' }
  if (jsResult.value.error) return { label: 'Error', className: 'chip-danger' }
  if (jsResult.value.check?.matches) return { label: 'Correcto', className: 'chip-brand' }
  return { label: 'Revisar', className: 'chip-warning' }
})

function solvedCountFor(modeId) {
  const list = modeId === 'js' ? JS_CHALLENGES : CSS_CHALLENGES
  return list.filter((item) => solved.value[item.id]).length
}

function persistSolved() {
  try {
    localStorage.setItem(LAB_KEY, JSON.stringify(solved.value))
  } catch {
    /* el almacenamiento es opcional */
  }
}

function markSolved() {
  const id = challenge.value.id
  const isNew = !solved.value[id]
  solved.value = { ...solved.value, [id]: new Date().toISOString() }
  persistSolved()
  if (isNew) playFeedback('correct', progress.profile.sound)
}

function resetPanels() {
  jsResult.value = null
  cssMessage.value = null
  showHint.value = false
  showSolution.value = false
  solutionCopied.value = false
}

function switchMode(next) {
  if (next === mode.value) return
  mode.value = next
  selectedId.value = next === 'js' ? JS_CHALLENGES[0].id : CSS_CHALLENGES[0].id
  resetPanels()
}

function selectChallenge(id) {
  if (id === selectedId.value) return
  selectedId.value = id
  resetPanels()
}

function buildPreview() {
  const html = challenge.value.html || ''
  return `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      ${LAB_BASE_CSS}
      ${editorCode.value}
    </style>
  </head>
  <body>${html}</body>
</html>`
}

function refreshPreview() {
  if (mode.value !== 'css') return
  clearTimeout(previewTimer)
  previewSrc.value = buildPreview()
}

watch(
  [editorCode, () => challenge.value.id],
  () => {
    if (mode.value !== 'css') return
    clearTimeout(previewTimer)
    previewTimer = setTimeout(() => {
      previewSrc.value = buildPreview()
    }, 380)
  },
  { immediate: true },
)

watch(
  () => challenge.value.id,
  () => resetPanels(),
)

onBeforeUnmount(() => clearTimeout(previewTimer))

async function runJs() {
  if (running.value) return
  const current = challenge.value
  running.value = true
  jsResult.value = null
  try {
    const outcome = await runUserCode(editorCode.value, 2500)
    if (current.id !== challenge.value.id) return
    const check = outcome.error ? null : checkLogs(outcome.logs, current.expected)
    jsResult.value = { ...outcome, check }
    if (check?.matches) markSolved()
  } finally {
    running.value = false
  }
}

function checkCss() {
  const results = objectiveResults.value
  const passed = results.filter((objective) => objective.passed).length
  if (passed === results.length) {
    cssMessage.value = {
      type: 'success',
      text: '¡Todos los objetivos cumplidos! Reto superado.',
    }
    markSolved()
  } else {
    cssMessage.value = {
      type: 'pending',
      text: `Cumpliste ${passed} de ${results.length} objetivos. Ajusta tu CSS y vuelve a comprobar.`,
    }
  }
}

function applySolution() {
  showSolution.value = true
  editorCode.value = challenge.value.solution
  if (mode.value === 'css') {
    nextTick(() => {
      clearTimeout(previewTimer)
      previewSrc.value = buildPreview()
    })
  }
}

function resetCode() {
  editorCode.value = challenge.value.starter
  resetPanels()
  if (mode.value === 'css') {
    nextTick(() => {
      clearTimeout(previewTimer)
      previewSrc.value = buildPreview()
    })
  }
}

async function copySolution() {
  const ok = await copyText(challenge.value.solution)
  if (!ok) return
  solutionCopied.value = true
  setTimeout(() => {
    solutionCopied.value = false
  }, 1600)
}

function insertTab(event) {
  const el = event.target
  const start = el.selectionStart
  const end = el.selectionEnd
  const value = el.value
  editorCode.value = `${value.slice(0, start)}  ${value.slice(end)}`
  nextTick(() => {
    el.selectionStart = start + 2
    el.selectionEnd = start + 2
  })
}
</script>

<template>
  <div class="lab-view">
    <header class="page-head animate-in">
      <div>
        <span class="eyebrow">Laboratorio</span>
        <h1>Escribe código, <span class="gradient-text">míralo cobrar vida</span></h1>
        <p>
          Retos cortos con ejecución real: JavaScript corre aislado en un Web Worker y CSS se
          previsualiza al instante. Sin instalar nada.
        </p>
      </div>
      <div class="lab-tabs" role="tablist" aria-label="Tecnología del laboratorio">
        <button
          v-for="item in MODES"
          :key="item.id"
          type="button"
          role="tab"
          class="lab-tab"
          :class="{ active: mode === item.id }"
          :aria-selected="mode === item.id"
          :style="{ '--tab-color': item.color }"
          @click="switchMode(item.id)"
        >
          <AppIcon :name="item.icon" :size="17" />
          {{ item.label }}
          <span class="tab-count">{{ solvedCountFor(item.id) }}</span>
        </button>
      </div>
    </header>

    <div class="lab-layout animate-in delay-1">
      <aside class="card challenge-rail">
        <div class="rail-head">
          <div>
            <h2>Retos</h2>
            <p class="tiny dim">{{ solvedCount }} de {{ challenges.length }} superados</p>
          </div>
          <span class="rail-percent">{{ progressPercent }}%</span>
        </div>
        <div class="bar bar-thin rail-bar">
          <span :style="{ width: `${progressPercent}%` }" />
        </div>

        <div class="rail-list">
          <button
            v-for="(item, index) in challenges"
            :key="item.id"
            type="button"
            class="rail-item"
            :class="{ active: item.id === challenge.id, solved: solved[item.id] }"
            @click="selectChallenge(item.id)"
          >
            <span class="rail-index">{{ String(index + 1).padStart(2, '0') }}</span>
            <span class="rail-copy">
              <strong>{{ item.title }}</strong>
              <small>{{ item.concept }}</small>
            </span>
            <span class="rail-status">
              <AppIcon v-if="solved[item.id]" name="check" :size="14" />
              <span v-else class="level-dots" aria-hidden="true">
                <i v-for="n in 5" :key="n" :class="{ on: n <= item.level }" />
              </span>
            </span>
          </button>
        </div>

        <div class="rail-tip">
          <AppIcon name="shield" :size="15" />
          <p>
            Tu código se ejecuta solo en tu navegador. Nada se envía a un servidor.
          </p>
        </div>
      </aside>

      <section class="lab-main">
        <article class="card lab-brief">
          <div class="row-between wrap brief-head">
            <div class="row wrap">
              <span class="chip chip-brand">
                <AppIcon name="flag" :size="13" />
                Nivel {{ challenge.level }} / 5
              </span>
              <span class="chip">{{ challenge.concept }}</span>
              <span v-if="solved[challenge.id]" class="chip chip-brand">
                <AppIcon name="check" :size="13" />
                Completado
              </span>
            </div>
            <button type="button" class="btn btn-ghost btn-sm" @click="resetCode">
              <AppIcon name="rotate" :size="14" />
              Reiniciar
            </button>
          </div>
          <h2>{{ challenge.title }}</h2>
          <div class="md lab-brief-text" v-html="briefHtml" />
        </article>

        <div class="lab-work">
          <div class="card editor-card">
            <div class="editor-head">
              <span class="editor-file">
                <AppIcon name="code" :size="14" />
                {{ mode === 'js' ? 'script.js' : 'styles.css' }}
              </span>
              <span class="editor-meta">{{ lineCount }} líneas</span>
            </div>

            <div class="editor-shell">
              <textarea
                v-model="editorCode"
                class="code-editor"
                spellcheck="false"
                autocapitalize="off"
                autocomplete="off"
                autocorrect="off"
                :aria-label="`Editor de código para el reto ${challenge.title}`"
                @keydown.tab.prevent="insertTab"
              />
            </div>

            <div class="editor-foot">
              <span>{{ charCount }} caracteres</span>
              <span>Tab inserta 2 espacios</span>
            </div>

            <div class="row wrap editor-actions">
              <button
                v-if="mode === 'js'"
                type="button"
                class="btn btn-primary"
                :disabled="running"
                @click="runJs"
              >
                <AppIcon name="play" :size="15" :class="{ spin: running }" />
                {{ running ? 'Ejecutando…' : 'Ejecutar código' }}
              </button>
              <button v-else type="button" class="btn btn-primary" @click="checkCss">
                <AppIcon name="check" :size="15" />
                Comprobar objetivos
              </button>

              <button type="button" class="btn btn-outline" @click="showHint = !showHint">
                <AppIcon name="lightbulb" :size="15" />
                {{ showHint ? 'Ocultar pista' : 'Ver pista' }}
              </button>

              <button type="button" class="btn btn-ghost" @click="applySolution">
                <AppIcon name="eye" :size="15" />
                {{ showSolution ? 'Solución aplicada' : 'Ver solución' }}
              </button>
            </div>

            <Transition name="slide">
              <div v-if="showHint" class="hint-box">
                <div class="hint-head">
                  <AppIcon name="lightbulb" :size="15" />
                  <strong>Pista</strong>
                </div>
                <div class="md" v-html="hintHtml" />
              </div>
            </Transition>

            <Transition name="slide">
              <div v-if="showSolution" class="solution-box">
                <div class="solution-head">
                  <span>Una posible solución</span>
                  <button type="button" class="btn btn-ghost btn-sm" @click="copySolution">
                    <AppIcon :name="solutionCopied ? 'check' : 'copy'" :size="13" />
                    {{ solutionCopied ? '¡Copiada!' : 'Copiar' }}
                  </button>
                </div>
                <pre><code>{{ challenge.solution }}</code></pre>
              </div>
            </Transition>
          </div>

          <div class="card output-card">
            <template v-if="mode === 'js'">
              <div class="output-head">
                <h3>
                  <AppIcon name="code" :size="16" />
                  Consola
                </h3>
                <span class="chip" :class="jsStatus.className">{{ jsStatus.label }}</span>
              </div>

              <div v-if="!jsResult" class="console-empty">
                <span class="console-empty-icon"><AppIcon name="play" :size="20" /></span>
                <p class="small muted">
                  Pulsa <strong class="strong">Ejecutar código</strong> para ver la salida de
                  <code>console.log</code>.
                </p>
              </div>

              <template v-else>
                <div v-if="jsResult.error" class="console-error">
                  <AppIcon name="alert" :size="16" />
                  <div>
                    <strong>No se pudo completar la ejecución</strong>
                    <p class="mono">{{ jsResult.error }}</p>
                  </div>
                </div>

                <div v-else class="console-logs">
                  <div
                    v-for="(line, index) in jsResult.logs"
                    :key="index"
                    class="console-line"
                  >
                    <span class="console-index">{{ index + 1 }}</span>
                    <code>{{ line }}</code>
                  </div>
                  <p v-if="!jsResult.logs.length" class="console-empty-line">
                    El código no imprimió nada en consola.
                  </p>
                </div>

                <div
                  v-if="jsResult.check"
                  class="check-result"
                  :class="jsResult.check.matches ? 'success' : 'pending'"
                >
                  <AppIcon
                    :name="jsResult.check.matches ? 'check' : 'info'"
                    :size="16"
                  />
                  <span>
                    {{
                      jsResult.check.matches
                        ? '¡Salida exacta! Reto superado.'
                        : `La salida no coincide todavía. Esperaba ${challenge.expected.length} línea(s).`
                    }}
                  </span>
                </div>

                <div v-if="jsResult.check && !jsResult.check.matches" class="expected-box">
                  <h4>Salida esperada</h4>
                  <div class="expected-list">
                    <code v-for="(line, index) in challenge.expected" :key="index">
                      {{ line }}
                    </code>
                  </div>
                </div>
              </template>
            </template>

            <template v-else>
              <div class="output-head">
                <h3>
                  <AppIcon name="eye" :size="16" />
                  Vista previa
                </h3>
                <button type="button" class="btn btn-ghost btn-sm" @click="refreshPreview">
                  <AppIcon name="refresh" :size="13" />
                  Actualizar
                </button>
              </div>

              <iframe
                :srcdoc="previewSrc"
                class="preview-frame"
                sandbox=""
                title="Vista previa del reto CSS"
              />

              <div class="objectives">
                <div class="row-between objectives-head">
                  <h4>Objetivos</h4>
                  <span class="tiny dim">
                    {{ passedObjectives }} / {{ objectiveResults.length }}
                  </span>
                </div>
                <ul class="objective-list">
                  <li
                    v-for="(objective, index) in objectiveResults"
                    :key="index"
                    :class="{ passed: objective.passed }"
                  >
                    <span class="objective-check">
                      <AppIcon :name="objective.passed ? 'check' : 'dot'" :size="11" />
                    </span>
                    {{ objective.label }}
                  </li>
                </ul>

                <div v-if="cssMessage" class="check-result" :class="cssMessage.type">
                  <AppIcon
                    :name="cssMessage.type === 'success' ? 'check' : 'info'"
                    :size="16"
                  />
                  <span>{{ cssMessage.text }}</span>
                </div>
              </div>
            </template>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.lab-tabs {
  display: inline-flex;
  gap: 5px;
  padding: 5px;
  border-radius: 14px;
  border: 1px solid var(--border);
  background: rgba(7, 10, 18, 0.6);
}

.lab-tab {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 15px;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: var(--muted);
  font-size: 0.84rem;
  font-weight: 600;
  transition: background 180ms ease, color 180ms ease;
}

.lab-tab:hover {
  color: var(--text);
  background: var(--surface-2);
}

.lab-tab.active {
  background: color-mix(in srgb, var(--tab-color) 14%, transparent);
  color: var(--tab-color);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--tab-color) 32%, transparent);
}

.tab-count {
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  font-size: 0.64rem;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.08);
  color: var(--muted);
}

.lab-tab.active .tab-count {
  background: color-mix(in srgb, var(--tab-color) 22%, transparent);
  color: var(--tab-color);
}

.lab-layout {
  display: grid;
  grid-template-columns: 264px minmax(0, 1fr);
  gap: 18px;
  align-items: start;
}

.challenge-rail {
  position: sticky;
  top: calc(var(--topbar-height) + 18px);
  padding: 16px;
}

.rail-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}

.rail-head h2 {
  font-size: 1rem;
}

.rail-percent {
  font-family: var(--font-display);
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--brand);
}

.rail-bar {
  margin: 12px 0 14px;
}

.rail-list {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.rail-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 9px 10px;
  border: 1px solid transparent;
  border-radius: 11px;
  background: transparent;
  color: var(--muted);
  text-align: left;
  transition: background 160ms ease, border-color 160ms ease, color 160ms ease;
}

.rail-item:hover {
  background: var(--surface-2);
  color: var(--text);
}

.rail-item.active {
  background: rgba(124, 245, 196, 0.08);
  border-color: rgba(124, 245, 196, 0.26);
  color: var(--text);
}

.rail-index {
  font-family: var(--font-mono);
  font-size: 0.66rem;
  color: var(--muted-2);
  flex: none;
}

.rail-item.active .rail-index,
.rail-item.solved .rail-index {
  color: var(--brand);
}

.rail-copy {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  line-height: 1.3;
}

.rail-copy strong {
  font-size: 0.78rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.rail-copy small {
  font-size: 0.65rem;
  color: var(--muted-2);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.rail-status {
  flex: none;
  color: var(--brand);
  display: grid;
  place-items: center;
}

.level-dots {
  display: flex;
  gap: 2px;
}

.level-dots i {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.14);
}

.level-dots i.on {
  background: var(--muted);
}

.rail-item.active .level-dots i.on {
  background: var(--brand);
}

.rail-tip {
  display: flex;
  gap: 9px;
  align-items: flex-start;
  margin-top: 14px;
  padding: 11px;
  border-radius: 11px;
  background: rgba(91, 168, 255, 0.07);
  border: 1px solid rgba(91, 168, 255, 0.16);
  color: var(--brand-2);
}

.rail-tip p {
  font-size: 0.68rem;
  line-height: 1.45;
  color: var(--muted);
}

.lab-main {
  display: flex;
  flex-direction: column;
  gap: 18px;
  min-width: 0;
}

.lab-brief {
  padding: 22px 24px;
}

.brief-head {
  margin-bottom: 12px;
}

.lab-brief h2 {
  font-size: 1.35rem;
}

.lab-brief-text {
  margin-top: 8px;
  color: var(--muted);
  font-size: 0.88rem;
}

.lab-brief-text :deep(p) {
  margin: 0;
}

.lab-work {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
  gap: 18px;
  align-items: start;
}

.editor-card {
  padding: 0;
  overflow: hidden;
}

.editor-head,
.editor-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 9px 15px;
  background: rgba(255, 255, 255, 0.025);
  font-size: 0.7rem;
  color: var(--muted-2);
}

.editor-head {
  border-bottom: 1px solid var(--border);
}

.editor-foot {
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
}

.editor-file {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-weight: 600;
  letter-spacing: 0.05em;
  color: var(--muted);
}

.editor-shell {
  background: #070b14;
}

.code-editor {
  display: block;
  width: 100%;
  min-height: 330px;
  max-height: 520px;
  resize: vertical;
  padding: 16px;
  border: 0;
  background: transparent;
  color: #c9d7f2;
  font-family: var(--font-mono);
  font-size: 0.82rem;
  line-height: 1.7;
  tab-size: 2;
  outline: none;
}

.code-editor:focus {
  box-shadow: inset 0 0 0 1px rgba(124, 245, 196, 0.3);
}

.editor-actions {
  padding: 14px 15px;
}

.hint-box {
  margin: 0 15px 15px;
  padding: 13px 15px;
  border-radius: 12px;
  border: 1px solid rgba(251, 191, 36, 0.22);
  border-left: 3px solid var(--warning);
  background: rgba(251, 191, 36, 0.06);
}

.hint-head {
  display: flex;
  align-items: center;
  gap: 7px;
  color: var(--warning);
  font-size: 0.76rem;
  margin-bottom: 6px;
}

.hint-box .md {
  font-size: 0.82rem;
  color: #e4d8b9;
}

.solution-box {
  margin: 0 15px 15px;
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
  background: #070b14;
}

.solution-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 8px 12px;
  border-bottom: 1px solid var(--border);
  background: rgba(255, 255, 255, 0.03);
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--muted);
}

.solution-box pre {
  margin: 0;
  padding: 14px;
  overflow-x: auto;
  font-family: var(--font-mono);
  font-size: 0.79rem;
  line-height: 1.65;
  color: #c9d7f2;
}

.solution-box code {
  background: none;
  border: 0;
  padding: 0;
  color: inherit;
  font-size: inherit;
}

.output-card {
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-width: 0;
}

.output-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.output-head h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1rem;
  color: var(--muted);
}

.console-empty {
  min-height: 240px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 24px;
  border: 1px dashed var(--border);
  border-radius: 12px;
  text-align: center;
}

.console-empty-icon {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: var(--surface-2);
  color: var(--brand);
}

.console-error {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 14px;
  border-radius: 12px;
  border: 1px solid rgba(251, 113, 133, 0.3);
  background: rgba(251, 113, 133, 0.08);
  color: var(--danger);
}

.console-error strong {
  font-size: 0.8rem;
}

.console-error p {
  margin-top: 4px;
  color: #f3b7c1;
  font-size: 0.75rem;
  overflow-wrap: anywhere;
}

.console-logs {
  min-height: 200px;
  max-height: 260px;
  overflow: auto;
  padding: 10px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: #070b14;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.console-line {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 3px 6px;
  border-radius: 6px;
}

.console-line:nth-child(odd) {
  background: rgba(255, 255, 255, 0.02);
}

.console-index {
  flex: none;
  width: 18px;
  text-align: right;
  font-family: var(--font-mono);
  font-size: 0.65rem;
  color: var(--muted-2);
  padding-top: 2px;
}

.console-line code {
  background: none;
  border: 0;
  padding: 0;
  color: #b9f5dd;
  font-size: 0.78rem;
  overflow-wrap: anywhere;
}

.console-empty-line {
  padding: 6px;
  font-size: 0.78rem;
  color: var(--muted-2);
}

.check-result {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  padding: 11px 13px;
  border-radius: 11px;
  font-size: 0.78rem;
  line-height: 1.45;
  border: 1px solid var(--border);
  color: var(--muted);
}

.check-result.success {
  border-color: rgba(52, 211, 153, 0.3);
  background: rgba(52, 211, 153, 0.08);
  color: #9df3cd;
}

.check-result.pending {
  border-color: rgba(251, 191, 36, 0.25);
  background: rgba(251, 191, 36, 0.07);
  color: #f6d98b;
}

.expected-box {
  padding: 12px 14px;
  border: 1px dashed var(--border);
  border-radius: 11px;
}

.expected-box h4 {
  font-size: 0.74rem;
  color: var(--muted-2);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 8px;
}

.expected-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 130px;
  overflow: auto;
}

.expected-list code {
  align-self: flex-start;
  font-size: 0.74rem;
  background: rgba(255, 255, 255, 0.04);
  border-color: var(--border);
  color: var(--muted);
}

.preview-frame {
  width: 100%;
  height: 320px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: #0b1120;
}

.objectives {
  padding-top: 2px;
}

.objectives-head {
  margin-bottom: 9px;
}

.objectives-head h4 {
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--muted-2);
}

.objective-list {
  list-style: none;
  padding: 0;
  margin: 0 0 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.objective-list li {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  font-size: 0.78rem;
  color: var(--muted);
  line-height: 1.4;
}

.objective-check {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  flex: none;
  margin-top: 1px;
  background: rgba(255, 255, 255, 0.05);
  color: var(--muted-2);
}

.objective-list li.passed {
  color: #b7f4dd;
}

.objective-list li.passed .objective-check {
  background: rgba(52, 211, 153, 0.16);
  color: var(--success);
}

.spin {
  animation: labSpin 900ms linear infinite;
}

@keyframes labSpin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 1180px) {
  .lab-layout {
    grid-template-columns: 1fr;
  }

  .challenge-rail {
    position: static;
  }

  .rail-list {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  }

  .rail-tip {
    display: none;
  }
}

@media (max-width: 980px) {
  .lab-work {
    grid-template-columns: 1fr;
  }

  .code-editor {
    min-height: 260px;
  }
}

@media (max-width: 520px) {
  .lab-tabs {
    width: 100%;
  }

  .lab-tab {
    flex: 1;
    justify-content: center;
  }

  .lab-brief {
    padding: 18px;
  }

  .editor-actions .btn {
    flex: 1;
  }

  .preview-frame {
    height: 260px;
  }
}
</style>
