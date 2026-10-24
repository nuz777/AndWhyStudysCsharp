import type { ReactNode } from 'react'

/**
 * Parsea el texto del apunte reconociendo:
 * - ## Subtítulo
 * - ### Subtítulo secundario
 * - - Viñeta o elemento de lista
 * - **Texto en negrita**
 * - `Código inline`
 */
export function renderFormattedContent(text: string): ReactNode {
  if (!text) return null

  const lines = text.split('\n')
  const elements: ReactNode[] = []

  lines.forEach((line, index) => {
    const trimmed = line.trim()

    // Subtítulo principal (## Subtítulo)
    if (trimmed.startsWith('## ')) {
      const headingText = trimmed.replace(/^##\s+/, '')
      elements.push(
        <h4 key={`h2-${index}`} className="rendered-subtitle">
          <span className="subtitle-hash">##</span>
          {renderInlineFormatting(headingText)}
        </h4>
      )
      return
    }

    // Subtítulo secundario (### Subtítulo)
    if (trimmed.startsWith('### ')) {
      const headingText = trimmed.replace(/^###\s+/, '')
      elements.push(
        <h5 key={`h3-${index}`} className="rendered-subsubtitle">
          <span className="subtitle-hash">###</span>
          {renderInlineFormatting(headingText)}
        </h5>
      )
      return
    }

    // Elemento de lista (- item o * item)
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const bulletText = trimmed.replace(/^[-*]\s+/, '')
      elements.push(
        <div key={`li-${index}`} className="rendered-bullet-row">
          <span className="bullet-dot">&bull;</span>
          <span className="bullet-text">{renderInlineFormatting(bulletText)}</span>
        </div>
      )
      return
    }

    // Espacio en blanco
    if (trimmed === '') {
      elements.push(<div key={`sp-${index}`} className="rendered-spacer" />)
      return
    }

    // Párrafo normal
    elements.push(
      <p key={`p-${index}`} className="rendered-paragraph">
        {renderInlineFormatting(line)}
      </p>
    )
  })

  return <div className="rendered-content-flow">{elements}</div>
}

function renderInlineFormatting(text: string): ReactNode {
  // Regex para dividir por **negrita** o `código`
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="rendered-bold">
          {part.slice(2, -2)}
        </strong>
      )
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={i} className="rendered-inline-code">
          {part.slice(1, -1)}
        </code>
      )
    }
    return part
  })
}
