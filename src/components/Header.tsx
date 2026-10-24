import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Plus, FolderPlus, Lock, Unlock, LogOut, EyeOff, Eye } from 'lucide-react'
import { useAuth } from '../context/useAuth'

interface HeaderProps {
  onOpenCreateNote?: () => void
  onOpenCreateTopic?: () => void
}

export function Header({ onOpenCreateNote, onOpenCreateTopic }: HeaderProps) {
  const { isAuthenticated, logout, openAccessModal } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const isPanel = location.pathname.startsWith('/panel')

  const [isHeaderHidden, setIsHeaderHidden] = useState(false)

  const handleAccess = () => {
    if (isAuthenticated) {
      navigate('/panel')
    } else {
      openAccessModal(() => {
        navigate('/panel')
      })
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <>
      {/* Botón flotante para restaurar la cabecera cuando está oculta */}
      {isHeaderHidden && (
        <button
          type="button"
          className="btn-show-header-floating"
          onClick={() => setIsHeaderHidden(false)}
          title="Mostrar barra de navegación"
        >
          <Eye size={16} />
          <span>Mostrar Cabecera</span>
        </button>
      )}

      {/* Header Principal */}
      <header className={`header ${isHeaderHidden ? 'header-hidden' : ''}`}>
        <div className="header-container">
          <Link to="/" className="brand">
            <div className="brand-badge">
              <span>C#</span>
            </div>
            <div className="brand-info">
              <span className="brand-title">AndWhy Studys</span>
              <span className="brand-subtitle">Notas &amp; Cuaderno C#</span>
            </div>
          </Link>

          <nav>
            <ul className="nav-links">
              <li>
                <Link to="/" className={`nav-link ${!isPanel ? 'active' : ''}`}>
                  Inicio
                </Link>
              </li>
              {isPanel ? (
                <>
                  <li>
                    <button
                      type="button"
                      className="nav-link-btn"
                      onClick={onOpenCreateTopic}
                    >
                      <FolderPlus size={14} />
                      <span>Nuevo Tema</span>
                    </button>
                  </li>
                </>
              ) : (
                <li>
                  <button
                    type="button"
                    className="nav-link-btn"
                    onClick={handleAccess}
                  >
                    Panel de Apuntes
                  </button>
                </li>
              )}
            </ul>
          </nav>

          <div className="header-actions">
            {/* Botón para ocultar el header */}
            <button
              type="button"
              className="btn-icon-subtle"
              onClick={() => setIsHeaderHidden(true)}
              title="Ocultar cabecera para ver más espacio"
            >
              <EyeOff size={16} />
              <span className="hide-btn-label">Ocultar</span>
            </button>

            {isPanel ? (
              <>
                {onOpenCreateNote && (
                  <button
                    className="btn-primary"
                    type="button"
                    onClick={onOpenCreateNote}
                  >
                    <Plus size={16} />
                    <span>Nueva Nota</span>
                  </button>
                )}
                <button
                  type="button"
                  className="btn-lock-status logout"
                  onClick={handleLogout}
                  title="Cerrar sesión y bloquear panel"
                >
                  <LogOut size={15} />
                  <span>Bloquear</span>
                </button>
              </>
            ) : (
              <>
                {isAuthenticated ? (
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => navigate('/panel')}
                  >
                    <Unlock size={15} />
                    <span>Ir al Panel</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={handleAccess}
                  >
                    <Lock size={15} />
                    <span>Ingresar</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </header>
    </>
  )
}
