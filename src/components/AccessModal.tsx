import { useState } from 'react'
import { Lock, Eye, EyeOff, ShieldCheck, X, Compass } from 'lucide-react'
import { useAuth } from '../context/useAuth'

export function AccessModal() {
  const { isAccessModalOpen, closeAccessModal, login, loginAsExplorer } = useAuth()
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(false)

  if (!isAccessModalOpen) return null

  const handleClose = () => {
    setPassword('')
    setError(false)
    closeAccessModal()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const success = login(password)
    if (success) {
      setPassword('')
      setError(false)
    } else {
      setError(true)
    }
  }

  const handleExplorer = () => {
    loginAsExplorer()
    setPassword('')
    setError(false)
  }

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div
        className={`modal-card small access-card translucent-modal ${error ? 'shake' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="modal-title-with-icon">
            <div className="access-icon-badge">
              <Lock size={22} />
            </div>
            <div>
              <h2 className="modal-title">Acceso al Cuaderno</h2>
              <p className="modal-subtitle">Ingresa la clave de administrador o entra como explorador</p>
            </div>
          </div>
          <button type="button" className="close-btn" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="access-pwd">Contraseña de Administrador</label>
            <div className="password-input-wrap">
              <input
                id="access-pwd"
                type={showPassword ? 'text' : 'password'}
                placeholder="Ingresa la contraseña..."
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (error) setError(false)
                }}
                className={`form-input ${error ? 'input-error' : ''}`}
                autoFocus
                required
              />
              <button
                type="button"
                className="pwd-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {error && <p className="error-text">Contraseña incorrecta. Inténtalo de nuevo.</p>}
          </div>

          <div className="access-hint-box">
            <ShieldCheck size={16} />
            <span>Acceso total para crear, editar y eliminar notas y temas.</span>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={handleClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary-modal">
              Acceso Administrador
            </button>
          </div>
        </form>

        <div className="access-divider">
          <span>o entra sin clave</span>
        </div>

        <div className="explorer-option-wrap">
          <button
            type="button"
            className="btn-enter-explorer"
            onClick={handleExplorer}
          >
            <Compass size={17} />
            <div className="explorer-btn-text">
              <strong>Entrar como Explorador</strong>
              <small>Consulta y lee todos los apuntes sin editar</small>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
