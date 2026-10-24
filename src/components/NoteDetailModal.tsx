import { useState } from 'react'
import {
  X,
  Minus,
  Square,
  Sparkles,
  Pencil,
  Copy,
  Check,
  Code,
  Calendar
} from 'lucide-react'
import type { Note, Topic } from '../types/notes'
import { getNoteBlocks } from '../types/notes'
import { renderFormattedContent } from '../utils/formatContent'
import { CSharpCodeBlock } from '../utils/CSharpCodeBlock'
import { PriorityBadge } from './PriorityBadge'

interface NoteDetailModalProps {
  isOpen: boolean
  note: Note | null
  topic?: Topic
  isExplorer?: boolean
  onClose: () => void
  onEdit: (note: Note) => void
  onToggleHighlight: (id: string) => void
}

export function NoteDetailModal({
  isOpen,
  note,
  topic,
  isExplorer = false,
  onClose,
  onEdit,
  onToggleHighlight
}: NoteDetailModalProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [isClosing, setIsClosing] = useState(false)
  const [isMaximized, setIsMaximized] = useState(false)

  if (!isOpen || !note) return null

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      setIsClosing(false)
      onClose()
    }, 220)
  }

  const handleCopyCode = (snippetId: string, code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedId(snippetId)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const formattedDate = new Date(note.createdAt).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })

  const blocks = getNoteBlocks(note)

  return (
    <div
      className={`modal-backdrop windows-backdrop ${isClosing ? 'modal-backdrop-exit' : ''}`}
      onClick={handleClose}
    >
      <div
        className={`windows-window ${note.isHighlighted ? 'highlighted-window' : ''} ${isMaximized ? 'maximized' : ''} ${isClosing ? 'windows-window-exit' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Línea superior luminosa si la nota está resaltada */}
        {note.isHighlighted && <div className="windows-highlight-accent-bar"></div>}

        {/* Barra de Título Estilo Ventana de Windows */}
        <div className="windows-titlebar">
          <div className="windows-titlebar-left">
            <div className={`windows-app-icon ${note.isHighlighted ? 'icon-highlighted' : ''}`}>
              <span>C#</span>
            </div>
            <span className="windows-title-text">
              Vista previa &mdash; {note.title}
            </span>
          </div>

          <div className="windows-controls">
            <button
              type="button"
              className="windows-btn btn-min"
              onClick={handleClose}
              title="Minimizar / Cerrar"
            >
              <Minus size={13} />
            </button>
            <button
              type="button"
              className="windows-btn btn-max"
              onClick={() => setIsMaximized(!isMaximized)}
              title={isMaximized ? 'Restaurar ventana' : 'Maximizar ventana'}
            >
              <Square size={11} />
            </button>
            <button
              type="button"
              className="windows-btn btn-close"
              onClick={handleClose}
              title="Cerrar ventana"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Contenido Amplio de la Ventana */}
        <div className="windows-body">
          {/* Metadatos: Tema, Prioridad, Resaltado, Fecha */}
          <div className="windows-meta-row">
            <div className="windows-meta-left">
              {topic && (
                <span
                  className="windows-topic-pill"
                  style={{
                    backgroundColor: `${topic.badgeColor}20`,
                    borderColor: `${topic.badgeColor}55`,
                    color: topic.badgeColor
                  }}
                >
                  {topic.name}
                </span>
              )}

              <PriorityBadge priority={note.priority} size="md" />

              {note.isHighlighted && (
                <span className="windows-highlight-pill glowing-badge">
                  <Sparkles size={13} />
                  <span>⭐ Nota Resaltada</span>
                </span>
              )}
            </div>

            <div className="windows-date-tag">
              <Calendar size={13} />
              <span>{formattedDate}</span>
            </div>
          </div>

          {/* Título Principal */}
          <div className="windows-title-section">
            <h1 className="windows-note-title">{note.title}</h1>
            {note.subtitle && (
              <h2 className="windows-note-subtitle">{note.subtitle}</h2>
            )}
          </div>

          {/* Flujo Secuencial tipo Respuesta de IA: Texto -> Código -> Texto -> Código */}
          <div className="windows-ai-flow-container">
            {blocks.map((block, index) => {
              if (block.type === 'text') {
                return (
                  <div key={block.id || `text-${index}`} className="windows-text-block">
                    {renderFormattedContent(block.text)}
                  </div>
                )
              }

              if (block.type === 'code') {
                const isCopied = copiedId === block.id
                return (
                  <div key={block.id || `code-${index}`} className="windows-code-container">
                    <div className="windows-code-header">
                      <span className="windows-code-tag">
                        <Code size={14} />
                        {block.title || 'Código C#'}
                      </span>
                      <button
                        type="button"
                        className={`windows-copy-btn ${isCopied ? 'copied' : ''}`}
                        onClick={() => handleCopyCode(block.id, block.code)}
                        title="Copiar código al portapapeles"
                      >
                        {isCopied ? (
                          <>
                            <Check size={14} className="copy-icon-success" />
                            <span>¡Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy size={13} />
                            <span>Copiar</span>
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="windows-code-pre">
                      <CSharpCodeBlock code={block.code} showLineNumbers={true} />
                    </pre>
                  </div>
                )
              }

              return null
            })}
          </div>
        </div>

        {/* Barra de Acciones Inferior Estilo Windows */}
        <div className="windows-statusbar">
          <div className="windows-status-left">
            {!isExplorer ? (
              <button
                type="button"
                className={`detail-action-btn detail-btn-highlight ${note.isHighlighted ? 'active' : ''}`}
                onClick={() => onToggleHighlight(note.id)}
                title={note.isHighlighted ? 'Quitar resalte de la nota' : 'Resaltar esta nota'}
              >
                <Sparkles size={15} />
                <span>{note.isHighlighted ? 'Nota Resaltada' : 'Resaltar Nota'}</span>
              </button>
            ) : (
              note.isHighlighted && (
                <span className="detail-action-btn detail-btn-highlight active" title="Nota destacada">
                  <Sparkles size={15} />
                  <span>Nota Destacada</span>
                </span>
              )
            )}
          </div>

          <div className="windows-status-right">
            {!isExplorer && (
              <button
                type="button"
                className="detail-action-btn detail-btn-edit"
                onClick={() => {
                  handleClose()
                  onEdit(note)
                }}
                title="Editar esta nota"
              >
                <Pencil size={15} />
                <span>Editar Nota</span>
              </button>
            )}

            <button
              type="button"
              className="detail-action-btn detail-btn-close"
              onClick={handleClose}
              title="Cerrar vista previa"
            >
              <span>Cerrar</span>
              <X size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
