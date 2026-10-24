import { useState, useRef } from 'react'
import {
  X,
  Sparkles,
  FolderPlus,
  Code2,
  Pencil,
  BookPlus,
  Trash2,
  Plus,
  Heading2,
  List,
  Bold,
  Code,
  AlignLeft,
  Bot
} from 'lucide-react'
import type { Note, Topic, PriorityLevel, NoteBlock } from '../types/notes'
import { PRIORITY_CONFIG, getNoteBlocks } from '../types/notes'
import { renderFormattedContent } from '../utils/formatContent'
import { CSharpCodeBlock } from '../utils/CSharpCodeBlock'

interface NoteModalProps {
  isOpen: boolean
  topics: Topic[]
  selectedTopicId: string
  initialData?: Note | null
  onClose: () => void
  onSave: (noteData: Omit<Note, 'id' | 'createdAt'>) => void
  onOpenCreateTopic: () => void
}

export function NoteModal({
  isOpen,
  topics,
  selectedTopicId,
  initialData,
  onClose,
  onSave,
  onOpenCreateTopic
}: NoteModalProps) {
  const isEditing = Boolean(initialData)

  const [title, setTitle] = useState(initialData?.title || '')
  const [topicId, setTopicId] = useState(
    initialData?.topicId || selectedTopicId || (topics[0]?.id ?? '')
  )
  const [priority, setPriority] = useState<PriorityLevel>(
    initialData?.priority || 'fuerte'
  )
  const [isHighlighted, setIsHighlighted] = useState(
    initialData?.isHighlighted || false
  )

  // Flujo secuencial tipo IA de bloques (Texto -> Código -> Texto -> Código...)
  const [blocks, setBlocks] = useState<NoteBlock[]>(() => {
    if (initialData) {
      return getNoteBlocks(initialData)
    }
    // Inicializar vacío y limpio para nuevas notas
    return [
      {
        id: `block-${Date.now()}`,
        type: 'text',
        text: ''
      }
    ]
  })

  const [isClosing, setIsClosing] = useState(false)
  const textareaRefs = useRef<Record<string, HTMLTextAreaElement | null>>({})

  const resetForm = () => {
    setTitle('')
    setBlocks([
      {
        id: `block-${Date.now()}`,
        type: 'text',
        text: ''
      }
    ])
    setIsHighlighted(false)
    setPriority('fuerte')
  }

  if (!isOpen && !isClosing) return null

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      setIsClosing(false)
      resetForm()
      onClose()
    }, 220)
  }

  // Contar bloques de código (máximo 3)
  const codeBlocksCount = blocks.filter((b) => b.type === 'code').length

  const handleAddTextBlock = () => {
    setBlocks((prev) => [
      ...prev,
      {
        id: `text-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        type: 'text',
        text: ''
      }
    ])
  }

  const handleAddCodeBlock = () => {
    if (codeBlocksCount >= 3) return
    setBlocks((prev) => [
      ...prev,
      {
        id: `code-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        type: 'code',
        title: '',
        code: ''
      }
    ])
  }

  const handleRemoveBlock = (id: string) => {
    if (blocks.length <= 1) return
    setBlocks((prev) => prev.filter((b) => b.id !== id))
  }

  const handleUpdateText = (id: string, newText: string) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id && b.type === 'text' ? { ...b, text: newText } : b))
    )
  }

  const handleUpdateCodeTitle = (id: string, newTitle: string) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id && b.type === 'code' ? { ...b, title: newTitle } : b))
    )
  }

  const handleUpdateCode = (id: string, newCode: string) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id && b.type === 'code' ? { ...b, code: newCode } : b))
    )
  }

  // Aplicar formato en tiempo real al texto seleccionado
  const handleApplyFormat = (
    blockId: string,
    formatType: 'bold' | 'subtitle' | 'list' | 'code'
  ) => {
    const textarea = textareaRefs.current[blockId]
    const currentBlock = blocks.find((b) => b.id === blockId && b.type === 'text')
    if (!currentBlock || currentBlock.type !== 'text') return

    const val = currentBlock.text

    if (!textarea) {
      if (formatType === 'bold') handleUpdateText(blockId, val + (val ? ' ' : '') + '**Texto**')
      if (formatType === 'subtitle') handleUpdateText(blockId, val + (val ? '\n\n' : '') + '## Subtítulo')
      if (formatType === 'list') handleUpdateText(blockId, val + (val ? '\n' : '') + '- Elemento')
      if (formatType === 'code') handleUpdateText(blockId, val + (val ? ' ' : '') + '`código`')
      return
    }

    const start = textarea.selectionStart ?? val.length
    const end = textarea.selectionEnd ?? val.length
    const selectedText = val.substring(start, end)

    let replacement = ''
    let newCursorStart = start
    let newCursorEnd = end

    switch (formatType) {
      case 'bold': {
        if (selectedText.length > 0) {
          if (
            selectedText.startsWith('**') &&
            selectedText.endsWith('**') &&
            selectedText.length >= 4
          ) {
            replacement = selectedText.slice(2, -2)
            newCursorStart = start
            newCursorEnd = start + replacement.length
          } else {
            replacement = `**${selectedText}**`
            newCursorStart = start
            newCursorEnd = start + replacement.length
          }
        } else {
          replacement = '****'
          newCursorStart = start + 2
          newCursorEnd = start + 2
        }
        break
      }
      case 'subtitle': {
        if (selectedText.length > 0) {
          const clean = selectedText.replace(/^##\s*/, '')
          const needsNewlineBefore = start > 0 && val[start - 1] !== '\n'
          const needsNewlineAfter = end < val.length && val[end] !== '\n'
          const prefix = needsNewlineBefore ? '\n## ' : '## '
          const suffix = needsNewlineAfter ? '\n' : ''
          replacement = `${prefix}${clean}${suffix}`
          newCursorStart = start
          newCursorEnd = start + replacement.length
        } else {
          const needsNewline = start > 0 && val[start - 1] !== '\n'
          replacement = needsNewline ? '\n## ' : '## '
          newCursorStart = start + replacement.length
          newCursorEnd = start + replacement.length
        }
        break
      }
      case 'list': {
        if (selectedText.length > 0) {
          const lines = selectedText.split('\n')
          const formatted = lines
            .map((l) => (l.startsWith('- ') ? l.replace(/^- \s*/, '') : `- ${l}`))
            .join('\n')
          replacement = formatted
          newCursorStart = start
          newCursorEnd = start + replacement.length
        } else {
          const needsNewline = start > 0 && val[start - 1] !== '\n'
          replacement = needsNewline ? '\n- ' : '- '
          newCursorStart = start + replacement.length
          newCursorEnd = start + replacement.length
        }
        break
      }
      case 'code': {
        if (selectedText.length > 0) {
          if (
            selectedText.startsWith('`') &&
            selectedText.endsWith('`') &&
            selectedText.length >= 2
          ) {
            replacement = selectedText.slice(1, -1)
            newCursorStart = start
            newCursorEnd = start + replacement.length
          } else {
            replacement = `\`${selectedText}\``
            newCursorStart = start
            newCursorEnd = start + replacement.length
          }
        } else {
          replacement = '``'
          newCursorStart = start + 1
          newCursorEnd = start + 1
        }
        break
      }
    }

    const newText = val.substring(0, start) + replacement + val.substring(end)
    handleUpdateText(blockId, newText)

    // Restaurar foco y selección
    requestAnimationFrame(() => {
      textarea.focus()
      textarea.setSelectionRange(newCursorStart, newCursorEnd)
    })
  }

  const handleTextareaKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
    blockId: string
  ) => {
    if ((e.ctrlKey || e.metaKey) && (e.key === 'b' || e.key === 'B')) {
      e.preventDefault()
      handleApplyFormat(blockId, 'bold')
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    // Limpiar bloques vacíos
    const cleanBlocks = blocks.filter((b) => {
      if (b.type === 'text') return b.text.trim().length > 0
      if (b.type === 'code') return b.code.trim().length > 0
      return false
    })

    if (cleanBlocks.length === 0) return

    // Generar resumen textual para content
    const textPieces = cleanBlocks
      .filter((b) => b.type === 'text')
      .map((b) => (b as { text: string }).text)
    const summaryContent = textPieces.join('\n\n')

    // Extraer fragmentos de código para compatibilidad
    const codeBlocks = cleanBlocks.filter((b): b is { id: string; type: 'code'; title?: string; code: string } => b.type === 'code')
    const snippets = codeBlocks.map((c) => ({ id: c.id, title: c.title, code: c.code }))

    setIsClosing(true)
    setTimeout(() => {
      onSave({
        title: title.trim(),
        content: summaryContent || cleanBlocks[0]?.type === 'code' ? 'Fragmento de código C#' : '',
        codeSnippet: snippets[0]?.code || undefined,
        codeSnippets: snippets.length > 0 ? snippets : undefined,
        blocks: cleanBlocks,
        topicId: topicId || topics[0]?.id || 'general',
        priority,
        isHighlighted
      })
      setIsClosing(false)
      resetForm()
    }, 200)
  }

  const priorities: PriorityLevel[] = ['fuerte', 'intermedio', 'bajo']

  // Contador de qué número de bloque de código es cada uno
  let currentCodeCounter = 0
  let currentTextCounter = 0

  return (
    <div
      className={`modal-backdrop ${isClosing ? 'modal-backdrop-exit' : ''}`}
      onClick={handleClose}
    >
      <div
        className={`modal-card modal-horizontal-glass ${isClosing ? 'modal-card-exit' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera del modal */}
        <div className="modal-header-compact">
          <div className="modal-title-group">
            <div className="modal-icon-mini">
              {isEditing ? <Pencil size={18} /> : <BookPlus size={18} />}
            </div>
            <div>
              <h2 className="modal-heading-sm">
                {isEditing ? 'Editar Nota de Estudio' : 'Nueva Nota de Estudio'}
              </h2>
              <span className="modal-subheading-sm">
                Flujo interactivo: bloques de explicación alternados con código C#
              </span>
            </div>
          </div>
          <button
            type="button"
            className="modal-close-mini"
            onClick={handleClose}
            title="Cerrar modal"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form-horizontal">
          {/* Fila 1: Tema y Prioridad */}
          <div className="modal-horizontal-top-row">
            <div className="form-group-compact topic-col">
              <label htmlFor="modal-topic-select">Tema de Estudio</label>
              <div className="topic-select-with-btn">
                <select
                  id="modal-topic-select"
                  value={topicId}
                  onChange={(e) => setTopicId(e.target.value)}
                  className="input-select-compact"
                  required
                >
                  {topics.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  className="btn-create-topic-inside-modal"
                  onClick={() => {
                    handleClose()
                    onOpenCreateTopic()
                  }}
                  title="Crear un nuevo tema de estudio"
                >
                  <FolderPlus size={15} />
                  <span>+ Crear Tema</span>
                </button>
              </div>
            </div>

            <div className="form-group-compact priority-col">
              <label>Nivel de Prioridad</label>
              <div className="priority-pill-selector">
                {priorities.map((p) => {
                  const conf = PRIORITY_CONFIG[p]
                  const Icon = conf.icon
                  const isSelected = priority === p
                  return (
                    <button
                      key={p}
                      type="button"
                      className={`priority-pill-btn ${conf.badgeClass} ${isSelected ? 'active' : ''}`}
                      onClick={() => setPriority(p)}
                      title={conf.description}
                    >
                      <Icon size={15} strokeWidth={2.4} />
                      <span>{conf.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Fila 2: Título del Concepto */}
          <div className="form-group-compact">
            <label htmlFor="modal-note-title">Título del Concepto</label>
            <input
              id="modal-note-title"
              type="text"
              placeholder="Título de la nota..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-field-compact input-title-wide"
              required
              autoFocus
            />
          </div>

          {/* Fila 3: Flujo de Bloques tipo IA (Texto + Código + Texto + Código) */}
          <div className="ai-blocks-container">
            <div className="ai-blocks-header">
              <div className="ai-blocks-tag">
                <Bot size={15} />
                <span>Flujo de Contenido (Explicaciones y hasta 3 Códigos C#)</span>
              </div>
              <span className="ai-snippets-count">
                Fragmentos de código: <strong>{codeBlocksCount}/3</strong>
              </span>
            </div>

            <div className="ai-blocks-list">
              {blocks.map((block, index) => {
                if (block.type === 'text') {
                  currentTextCounter++
                  return (
                    <div key={block.id} className="ai-block-card text-block">
                      <div className="ai-block-bar">
                        <div className="ai-block-label">
                          <span className="block-step-badge">#{index + 1}</span>
                          <AlignLeft size={14} />
                          <span>Explicación #{currentTextCounter}</span>
                        </div>

                        {/* Barra de formato rápido para este bloque de texto */}
                        <div className="block-tools-row">
                          <button
                            type="button"
                            className="format-btn format-btn-sub"
                            onClick={() => handleApplyFormat(block.id, 'subtitle')}
                            title="Aplica Subtítulo (##) al texto seleccionado o crea uno nuevo"
                          >
                            <Heading2 size={12} />
                            <span>+ Subtítulo</span>
                          </button>
                          <button
                            type="button"
                            className="format-btn"
                            onClick={() => handleApplyFormat(block.id, 'list')}
                            title="Aplica Viñeta (-) a las líneas seleccionadas"
                          >
                            <List size={12} />
                            <span>Viñeta</span>
                          </button>
                          <button
                            type="button"
                            className="format-btn format-btn-bold"
                            onClick={() => handleApplyFormat(block.id, 'bold')}
                            title="Aplica Negrita (**) al texto seleccionado (Ctrl+B)"
                          >
                            <Bold size={12} />
                            <span>Negrita</span>
                          </button>
                          <button
                            type="button"
                            className="format-btn"
                            onClick={() => handleApplyFormat(block.id, 'code')}
                            title="Aplica Código en línea (`) al texto seleccionado"
                          >
                            <Code size={12} />
                          </button>

                          {blocks.length > 1 && (
                            <button
                              type="button"
                              className="btn-remove-block"
                              onClick={() => handleRemoveBlock(block.id)}
                              title="Eliminar este bloque"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Input de texto con Ref y soporte para selección */}
                      <textarea
                        ref={(el) => {
                          textareaRefs.current[block.id] = el
                        }}
                        rows={3}
                        value={block.text}
                        onChange={(e) => handleUpdateText(block.id, e.target.value)}
                        onKeyDown={(e) => handleTextareaKeyDown(e, block.id)}
                        placeholder="Escribe aquí... Selecciona cualquier texto con cursor o Ctrl+A y dale a 'Negrita' o '+ Subtítulo'"
                        className="ai-block-textarea"
                      />

                      {/* Contenedor de Vista en Vivo en tiempo real */}
                      <div className="live-preview-container">
                        <div className="live-preview-header">
                          <div className="live-preview-badge">
                            <Sparkles size={13} className="sparkle-cyan" />
                            <span>Vista en Vivo (Resultado Real):</span>
                          </div>
                          <span className="live-preview-hint">
                            {block.text.trim()
                              ? 'Reflejando cambios al instante'
                              : 'Escribe o formatea arriba para previsualizar aquí'}
                          </span>
                        </div>

                        <div className="live-preview-box">
                          {block.text.trim() ? (
                            renderFormattedContent(block.text)
                          ) : (
                            <div className="live-preview-empty">
                              <span>Prueba a seleccionar texto y presionar </span>
                              <strong className="sample-bold">Negrita</strong> o{' '}
                              <span className="sample-sub">## Subtítulo</span> para ver cómo queda en vivo.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                }

                if (block.type === 'code') {
                  currentCodeCounter++
                  return (
                    <div key={block.id} className="ai-block-card code-block">
                      <div className="ai-block-bar">
                        <div className="ai-block-label code-label">
                          <span className="block-step-badge code-badge">#{index + 1}</span>
                          <Code2 size={14} />
                          <span>Fragmento C# ({currentCodeCounter}/3)</span>
                        </div>

                        <div className="code-title-input-wrap">
                          <input
                            type="text"
                            value={block.title || ''}
                            onChange={(e) => handleUpdateCodeTitle(block.id, e.target.value)}
                            placeholder="Etiqueta opcional (ej: Ejemplo C#)"
                            className="code-title-inline-input"
                          />
                        </div>

                        <button
                          type="button"
                          className="btn-remove-block"
                          onClick={() => handleRemoveBlock(block.id)}
                          title="Eliminar este código"
                        >
                          <Trash2 size={13} />
                          <span>Quitar</span>
                        </button>
                      </div>

                      <textarea
                        rows={4}
                        value={block.code}
                        onChange={(e) => handleUpdateCode(block.id, e.target.value)}
                        placeholder="// Escribe o pega tu código C# aquí..."
                        className="ai-block-code-textarea"
                      />

                      {block.code.trim() && (
                        <div className="modal-code-live-preview">
                          <div className="modal-code-live-header">
                            <Sparkles size={12} className="sparkle-cyan" />
                            <span>Vista resaltada C# (Clases, métodos, tipos):</span>
                          </div>
                          <div className="modal-code-live-box">
                            <CSharpCodeBlock code={block.code} showLineNumbers={false} />
                          </div>
                        </div>
                      )}
                    </div>
                  )
                }

                return null
              })}
            </div>

            {/* Botones para añadir el siguiente paso del flujo */}
            <div className="ai-add-block-actions">
              <button
                type="button"
                className="btn-add-step-text"
                onClick={handleAddTextBlock}
              >
                <Plus size={14} />
                <AlignLeft size={14} />
                <span>+ Agregar Explicación</span>
              </button>

              {codeBlocksCount < 3 && (
                <button
                  type="button"
                  className="btn-add-step-code"
                  onClick={handleAddCodeBlock}
                >
                  <Plus size={14} />
                  <Code2 size={14} />
                  <span>+ Agregar Código C# ({codeBlocksCount + 1}/3)</span>
                </button>
              )}
            </div>
          </div>

          {/* Barra inferior: Resaltar + Acciones */}
          <div className="modal-bottom-bar">
            <label className="compact-highlight-checkbox">
              <input
                type="checkbox"
                checked={isHighlighted}
                onChange={(e) => setIsHighlighted(e.target.checked)}
              />
              <span className="checkbox-tick"></span>
              <span className="checkbox-text">
                <Sparkles size={15} className="sparkle-gold" />
                Resaltar nota (destacará en la lista y en la vista previa)
              </span>
            </label>

            <div className="modal-actions-compact">
              <button
                type="button"
                className="btn-cancel-compact"
                onClick={handleClose}
              >
                Cancelar
              </button>
              <button type="submit" className="btn-submit-compact">
                {isEditing ? 'Guardar Cambios' : 'Crear Nota'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
