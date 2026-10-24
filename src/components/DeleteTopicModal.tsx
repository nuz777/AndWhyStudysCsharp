import { Trash2, AlertTriangle, X } from 'lucide-react'
import type { Topic } from '../types/notes'

interface DeleteTopicModalProps {
  isOpen: boolean
  topic: Topic | null
  notesCount: number
  onClose: () => void
  onConfirm: () => void
}

export function DeleteTopicModal({
  isOpen,
  topic,
  notesCount,
  onClose,
  onConfirm
}: DeleteTopicModalProps) {
  if (!isOpen || !topic) return null

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card small delete-confirm-card modal-compact-glass"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="close-btn delete-close-btn" onClick={onClose}>
          <X size={18} />
        </button>

        <div className="delete-modal-content">
          <div className="delete-icon-pulse">
            <div className="delete-icon-inner">
              <Trash2 size={26} />
            </div>
          </div>

          <div className="delete-badge-warning">
            <AlertTriangle size={13} />
            <span>Eliminar Tema</span>
          </div>

          <h3 className="delete-modal-title">¿Eliminar este tema?</h3>
          <p className="delete-modal-desc">
            Estás a punto de borrar el tema de estudio:
          </p>

          <div className="delete-note-preview" style={{ color: topic.badgeColor }}>
            <span>&ldquo;{topic.name}&rdquo;</span>
          </div>

          <p className="delete-modal-subdesc">
            {notesCount > 0
              ? `Se eliminarán también las ${notesCount} nota(s) que contiene este tema.`
              : 'Este tema no contiene notas actualmente.'}
          </p>

          <div className="modal-actions delete-modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button
              type="button"
              className="btn-danger-confirm"
              onClick={() => {
                onConfirm()
                onClose()
              }}
            >
              <Trash2 size={15} />
              <span>Sí, eliminar tema</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
