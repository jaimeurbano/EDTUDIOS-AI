// Ejecuta código del estudiante dentro de un Web Worker aislado.
// El timeout protege la interfaz frente a bucles infinitos.

const WORKER_SOURCE = `
  const format = (value) => {
    if (typeof value === 'string') return value
    if (typeof value === 'function') return '[Function]'
    if (typeof value === 'undefined') return 'undefined'
    if (value === null) return 'null'
    if (typeof value === 'object') {
      try { return JSON.stringify(value) } catch { return String(value) }
    }
    return String(value)
  }

  self.onmessage = async (event) => {
    const logs = []
    const fakeConsole = {
      log: (...args) => logs.push(args.map(format).join(' ')),
      info: (...args) => logs.push(args.map(format).join(' ')),
      warn: (...args) => logs.push(args.map(format).join(' ')),
      error: (...args) => logs.push(args.map(format).join(' ')),
    }
    try {
      const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor
      const fn = new AsyncFunction('console', '"use strict";\\n' + event.data)
      await fn(fakeConsole)
      self.postMessage({ logs, error: null })
    } catch (error) {
      self.postMessage({ logs, error: error && error.message ? error.message : String(error) })
    }
  }
`

export function runUserCode(code, timeoutMs = 2500) {
  return new Promise((resolve) => {
    if (typeof Worker === 'undefined') {
      resolve({ logs: [], error: 'Tu navegador no permite ejecutar código en el laboratorio.' })
      return
    }

    let worker
    let blobUrl
    const finish = (result) => {
      clearTimeout(timer)
      if (worker) worker.terminate()
      if (blobUrl) URL.revokeObjectURL(blobUrl)
      resolve(result)
    }

    const timer = setTimeout(() => {
      finish({
        logs: [],
        error: 'Tiempo de ejecución excedido (2.5s). Revisa si tienes un bucle infinito.',
      })
    }, timeoutMs)

    try {
      const blob = new Blob([WORKER_SOURCE], { type: 'application/javascript' })
      blobUrl = URL.createObjectURL(blob)
      worker = new Worker(blobUrl)
      worker.onmessage = (event) => finish(event.data)
      worker.onerror = (event) => finish({ logs: [], error: event.message || 'Error en el worker.' })
      worker.postMessage(code)
    } catch (error) {
      finish({ logs: [], error: error.message || 'No se pudo iniciar el laboratorio.' })
    }
  })
}

export function checkLogs(logs, expected) {
  const normalize = (value) => String(value).trim()
  const received = logs.map(normalize)
  const wanted = expected.map(normalize)
  const matches = received.length === wanted.length && received.every((value, i) => value === wanted[i])
  return {
    matches,
    received,
    expected: wanted,
    firstMismatch: matches
      ? -1
      : Math.max(
          0,
          received.findIndex((value, i) => value !== wanted[i]) === -1
            ? Math.min(received.length, wanted.length)
            : received.findIndex((value, i) => value !== wanted[i]),
        ),
  }
}
