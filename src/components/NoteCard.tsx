import { useState } from 'react'
import { Sparkles, Trash2, Copy, Check, Code, Pencil, Maximize2 } from 'lucide-react'
import type { Note, Topic } from '../types/notes'
import { getNoteBlocks } from '../types/notes'
import { renderFormattedContent } from '../utils/formatContent'
import { CSharpCodeBlock } from '../utils/CSharpCodeBlock'
import { PriorityBadge } from './PriorityBadge'

interface NoteCardProps {
  note: Note
  topic?: Topic
  isExplorer?: boolean
  onToggleHighlight: (id: string) => void
  onEditNote: (note: Note) => void
  onDeleteNote: (note: Note) => void
  onOpenDetail: (note: Note) => void
}

export function NoteCard({
  note,
  topic,
  isExplorer = false,
  onToggleHighlight,
  onEditNote,
  onDeleteNote,
  onOpenDetail
}: NoteCardProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const blocks = getNoteBlocks(note)

  const handleCopyCode = (e: React.MouseEvent, code: string, id: string) => {
    e.stopPropagation()
    navigator.clipboard.writeText(code)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <article
      className={`note-card ${note.isHighlighted ? 'highlighted' : ''} note-card-interactive`}
      onClick={() => onOpenDetail(note)}
      title="Haz clic para abrir vista previa amplia estilo ventana"
    >
      {/* Header de la tarjeta */}
      <div className="note-card-header">
        <PriorityBadge priority={note.priority} size="sm" />

        <div className="note-card-actions" onClick={(e) => e.stopPropagation()}>
          {!isExplorer ? (
            <>
              <button
                type="button"
                className={`action-btn highlight-btn ${note.isHighlighted ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleHighlight(note.id)
                }}
                title={note.isHighlighted ? 'Quitar resalte' : 'Resaltar nota'}
              >
                <Sparkles size={14} />
                <span>{note.isHighlighted ? 'Resaltada' : 'Resaltar'}</span>
              </button>

              <button
                type="button"
                className="action-btn edit-btn"
                onClick={(e) => {
                  e.stopPropagation()
                  onEditNote(note)
                }}
                title="Editar nota"
              >
                <Pencil size={14} />
              </button>

              <button
                type="button"
                className="action-btn delete-btn"
                onClick={(e) => {
                  e.stopPropagation()
                  onDeleteNote(note)
                }}
                title="Eliminar nota"
              >
                <Trash2 size={14} />
              </button>
            </>
          ) : (
            note.isHighlighted && (
              <span className="action-btn highlight-btn active" title="Nota destacada">
                <Sparkles size={14} />
                <span>Destacada</span>
              </span>
            )
          )}
        </div>
      </div>

      {/* Título de la tarjeta */}
      <div className="note-card-clickable-area">
        <h3 className="note-card-title">{note.title}</h3>
      </div>

      {/* Flujo Secuencial tipo IA: Explicación -> Código -> Explicación... */}
      <div className="card-ai-flow">
        {blocks.map((block, index) => {
          if (block.type === 'text') {
            return (
              <div key={block.id || `text-${index}`} className="note-card-body">
                {renderFormattedContent(block.text)}
              </div>
            )
          }

          if (block.type === 'code') {
            const isCopied = copiedId === block.id
            return (
              <div
                key={block.id || `code-${index}`}
                className="note-code-wrapper"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="note-code-bar">
                  <span className="code-lang-tag">
                    <Code size={13} />
                    {block.title || `C# #${index + 1}`}
                  </span>
                  <button
                    type="button"
                    className="copy-code-btn"
                    onClick={(e) => handleCopyCode(e, block.code, block.id)}
                    title="Copiar código C#"
                  >
                    {isCopied ? <Check size={13} color="#4ade80" /> : <Copy size={13} />}
                    <span>{isCopied ? 'Copiado' : 'Copiar'}</span>
                  </button>
                </div>
                <pre className="note-code-block">
                  <CSharpCodeBlock code={block.code} />
                </pre>
              </div>
            )
          }

          return null
        })}
      </div>

      {/* Footer con el tema asociado y botón de zoom */}
      <div className="note-card-footer">
        {topic && (
          <span
            className="topic-tag-pill"
            style={{
              borderColor: `${topic.badgeColor}40`,
              backgroundColor: `${topic.badgeColor}15`,
              color: topic.badgeColor
            }}
          >
            {topic.name}
          </span>
        )}

        <span className="open-detail-hint">
          <Maximize2 size={12} />
          <span>Vista amplia</span>
        </span>
      </div>
    </article>
  )
}
