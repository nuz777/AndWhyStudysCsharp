import { useState } from 'react'
import { X, FolderPlus } from 'lucide-react'
import type { Topic } from '../types/notes'

interface CreateTopicModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateTopic: (topic: Omit<Topic, 'id'>) => void
}

const COLOR_OPTIONS = [
  '#8b5cf6', // Violeta C#
  '#38bdf8', // Celeste .NET
  '#f59e0b', // Ámbar LINQ
  '#10b981', // Verde Esmeralda
  '#ec4899', // Rosa
  '#ef4444'  // Rojo
]

export function CreateTopicModal({ isOpen, onClose, onCreateTopic }: CreateTopicModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [badgeColor, setBadgeColor] = useState(COLOR_OPTIONS[0])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    onCreateTopic({
      name: name.trim(),
      description: description.trim() || 'Notas y apuntes de este tema.',
      badgeColor
    })

    setName('')
    setDescription('')
    setBadgeColor(COLOR_OPTIONS[0])
    onClose()
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card small translucent-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-with-icon">
            <div className="modal-icon-badge">
              <FolderPlus size={18} />
            </div>
            <div>
              <h2 className="modal-title">Nuevo Tema de Estudio</h2>
              <p className="modal-subtitle">Agrupa tus notas por categoría o módulo</p>
            </div>
          </div>
          <button type="button" className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="topic-name">Nombre del Tema</label>
            <input
              id="topic-name"
              type="text"
              placeholder="Ej: Entity Framework Core, Microservicios, ASP.NET..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="topic-desc">Descripción (opcional)</label>
            <textarea
              id="topic-desc"
              rows={2}
              placeholder="Breve resumen de qué conceptos aprenderás en este tema..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="form-textarea"
            />
          </div>

          <div className="form-group">
            <label>Color Distintivo</label>
            <div className="color-picker-row">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`color-bubble ${badgeColor === c ? 'selected' : ''}`}
                  style={{ backgroundColor: c }}
                  onClick={() => setBadgeColor(c)}
                  title={c}
                />
              ))}
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary-modal">
              Crear Tema
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
