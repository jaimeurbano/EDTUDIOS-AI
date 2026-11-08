function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function inline(value) {
  return value
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>')
    .replace(
      /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
    )
}

function renderCodeBlock(block) {
  const code = escapeHtml(block.code)
  const encoded = encodeURIComponent(block.code)
  return `<div class="md-code"><div class="md-code-head"><span>${escapeHtml(
    block.lang,
  )}</span><button type="button" class="md-copy" data-code="${encoded}">Copiar</button></div><pre><code>${code}</code></pre></div>`
}

/**
 * Renderizador Markdown mínimo y seguro (sin dependencias).
 * Soporta encabezados, listas, tablas, citas, código en bloque y en línea,
 * negrita, cursiva y enlaces http(s).
 */
export function renderMarkdown(source = '') {
  if (!source) return ''

  const blocks = []
  let text = String(source).replace(/```(\w*)\r?\n([\s\S]*?)```/g, (_match, lang, code) => {
    const index = blocks.length
    blocks.push({ lang: lang || 'text', code: code.replace(/\n$/, '') })
    return `\n@@CODEBLOCK${index}@@\n`
  })

  text = escapeHtml(text)
  const lines = text.split(/\r?\n/)

  let html = ''
  let paragraph = []
  let listType = null
  let listItems = []

  const flushParagraph = () => {
    if (!paragraph.length) return
    html += `<p>${inline(paragraph.join(' '))}</p>`
    paragraph = []
  }

  const flushList = () => {
    if (!listType) return
    html += `<${listType}>${listItems.map((item) => `<li>${inline(item)}</li>`).join('')}</${listType}>`
    listType = null
    listItems = []
  }

  const flushAll = () => {
    flushParagraph()
    flushList()
  }

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i]
    const trimmed = line.trim()

    if (!trimmed) {
      flushAll()
      continue
    }

    const codeMatch = trimmed.match(/^@@CODEBLOCK(\d+)@@$/)
    if (codeMatch) {
      flushAll()
      html += renderCodeBlock(blocks[Number(codeMatch[1])])
      continue
    }

    if (/^---+$/.test(trimmed)) {
      flushAll()
      html += '<hr />'
      continue
    }

    const heading = trimmed.match(/^(#{1,4})\s+(.*)$/)
    if (heading) {
      flushAll()
      const level = Math.min(4, heading[1].length + 1)
      html += `<h${level}>${inline(heading[2])}</h${level}>`
      continue
    }

    if (trimmed.startsWith('&gt; ')) {
      flushAll()
      html += `<blockquote>${inline(trimmed.slice(5))}</blockquote>`
      continue
    }

    // Tabla: | a | b | seguida de | --- | --- |
    if (trimmed.startsWith('|') && lines[i + 1] && /^\|[\s:|-]+\|$/.test(lines[i + 1].trim())) {
      flushAll()
      const header = trimmed
        .split('|')
        .slice(1, -1)
        .map((cell) => cell.trim())
      i += 2
      const rows = []
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        const cells = lines[i]
          .trim()
          .split('|')
          .slice(1, -1)
          .map((cell) => cell.trim())
        rows.push(cells)
        i += 1
      }
      i -= 1
      html += `<div class="md-table-wrap"><table><thead><tr>${header
        .map((cell) => `<th>${inline(cell)}</th>`)
        .join('')}</tr></thead><tbody>${rows
        .map((row) => `<tr>${row.map((cell) => `<td>${inline(cell)}</td>`).join('')}</tr>`)
        .join('')}</tbody></table></div>`
      continue
    }

    const ordered = trimmed.match(/^\d+\.\s+(.*)$/)
    const unordered = trimmed.match(/^[-*]\s+(.*)$/)
    if (ordered || unordered) {
      flushParagraph()
      const type = ordered ? 'ol' : 'ul'
      if (listType && listType !== type) flushList()
      listType = type
      listItems.push((ordered || unordered)[1])
      continue
    }

    if (listType) flushList()
    paragraph.push(trimmed)
  }

  flushAll()

  return html.replace(/@@CODEBLOCK(\d+)@@/g, (_match, index) => renderCodeBlock(blocks[Number(index)]))
}

export function plainText(markdown = '') {
  return String(markdown)
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/[#>*_`|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export async function copyText(value) {
  const text = String(value)
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    try {
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      return true
    } catch {
      return false
    }
  }
}
