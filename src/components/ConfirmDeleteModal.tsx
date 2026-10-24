import { Trash2, AlertTriangle, X } from 'lucide-react'

interface ConfirmDeleteModalProps {
  isOpen: boolean
  title: string
  onClose: () => void
  onConfirm: () => void
}

export function ConfirmDeleteModal({
  isOpen,
  title,
  onClose,
  onConfirm
}: ConfirmDeleteModalProps) {
  if (!isOpen) return null

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card small delete-confirm-card"
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
            <span>Acción irreversible</span>
          </div>

          <h3 className="delete-modal-title">¿Eliminar esta nota?</h3>
          <p className="delete-modal-desc">
            Estás a punto de borrar permanentemente la nota:
          </p>

          <div className="delete-note-preview">
            <span>&ldquo;{title}&rdquo;</span>
          </div>

          <p className="delete-modal-subdesc">
            Esta información no se podrá recuperar.
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
              <span>Sí, eliminar nota</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
