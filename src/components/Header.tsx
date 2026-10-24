import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { Plus, FolderPlus, Lock, Unlock, LogOut, EyeOff, Eye, Menu, X } from 'lucide-react'
import { useAuth } from '../context/useAuth'

interface HeaderProps {
  onOpenCreateNote?: () => void
  onOpenCreateTopic?: () => void
}

export function Header({ onOpenCreateNote, onOpenCreateTopic }: HeaderProps) {
  const { isAuthenticated, isExplorer, logout, openAccessModal } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const isPanel = location.pathname.startsWith('/panel')

  const [isHeaderHidden, setIsHeaderHidden] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [prevPathname, setPrevPathname] = useState(location.pathname)

  // Cerrar el menú desplegable móvil cuando cambia de página o ruta
  if (prevPathname !== location.pathname) {
    setPrevPathname(location.pathname)
    setIsMobileMenuOpen(false)
  }

  // Detectar scroll para aumentar sutilmente la opacidad del fondo (efecto SauNuz)
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleAccess = () => {
    if (isAuthenticated || isExplorer) {
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

      {/* Header Flotante Glassmorphism estilo SauNuz */}
      <header
        className={`header ${isScrolled ? 'scrolled' : ''} ${
          isHeaderHidden ? 'header-hidden' : ''
        }`}
      >
        <div className="header-container">
          {/* Logo y título a la izquierda */}
          <Link
            to="/"
            className="brand"
            onClick={() => setIsMobileMenuOpen(false)}
            title="AndWhy Studys - Inicio"
          >
            <div className="brand-badge">
              <span>C#</span>
            </div>
            <div className="brand-info">
              <span className="brand-title">AndWhy Studys</span>
              <span className="brand-subtitle">Notas &amp; Cuaderno C#</span>
            </div>
          </Link>

          {/* Enlaces de navegación desktop (Centro / Derecha) */}
          <nav className="desktop-nav">
            <ul className="nav-links">
              <li>
                <NavLink
                  to="/"
                  end
                  className={({ isActive }) =>
                    `nav-link ${isActive ? 'active' : ''}`
                  }
                >
                  Inicio
                </NavLink>
              </li>
              <li>
                {isPanel ? (
                  <NavLink
                    to="/panel"
                    className={({ isActive }) =>
                      `nav-link ${isActive ? 'active' : ''}`
                    }
                  >
                    Panel de Apuntes
                  </NavLink>
                ) : (
                  <button
                    type="button"
                    className={`nav-link ${isPanel ? 'active' : ''}`}
                    onClick={handleAccess}
                  >
                    Panel de Apuntes
                  </button>
                )}
              </li>
              {isPanel && !isExplorer && onOpenCreateTopic && (
                <li>
                  <button
                    type="button"
                    className="nav-link nav-link-topic"
                    onClick={onOpenCreateTopic}
                    title="Crear un nuevo tema de C#"
                  >
                    <FolderPlus size={14} />
                    <span>Nuevo Tema</span>
                  </button>
                </li>
              )}
            </ul>
          </nav>

          {/* Acciones del Header (Botones a la derecha) */}
          <div className="header-actions">
            {/* Botón para ocultar el header */}
            <button
              type="button"
              className="btn-icon-subtle btn-header-hide"
              onClick={() => setIsHeaderHidden(true)}
              title="Ocultar cabecera para ver más espacio"
            >
              <EyeOff size={15} />
              <span className="hide-btn-label">Ocultar</span>
            </button>

            {isPanel ? (
              <>
                {/* Solo administradores pueden agregar notas */}
                {!isExplorer && onOpenCreateNote && (
                  <button
                    className="btn-primary"
                    type="button"
                    onClick={onOpenCreateNote}
                    title="Nueva Nota"
                  >
                    <Plus size={15} />
                    <span className="header-btn-text">Nueva Nota</span>
                  </button>
                )}

                {/* Si está en modo explorador, botón para desbloquear con clave de admin */}
                {isExplorer && (
                  <button
                    type="button"
                    className="btn-header-admin"
                    onClick={() => openAccessModal()}
                    title="Ingresar contraseña de administrador para editar"
                  >
                    <Lock size={14} />
                    <span className="header-btn-text">Admin</span>
                  </button>
                )}

                <button
                  type="button"
                  className="btn-lock-status logout"
                  onClick={handleLogout}
                  title={isExplorer ? 'Salir del modo explorador' : 'Cerrar sesión y bloquear panel'}
                >
                  <LogOut size={15} />
                  <span className="header-btn-text">{isExplorer ? 'Salir' : 'Bloquear'}</span>
                </button>
              </>
            ) : (
              <>
                {isAuthenticated || isExplorer ? (
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => navigate('/panel')}
                    title="Ir al Panel"
                  >
                    <Unlock size={15} />
                    <span className="header-btn-text">Ir al Panel</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={handleAccess}
                    title="Ingresar con contraseña"
                  >
                    <Lock size={15} />
                    <span className="header-btn-text">Ingresar</span>
                  </button>
                )}
              </>
            )}

            {/* Botón hamburguesa para móvil */}
            <button
              type="button"
              className="btn-mobile-menu"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? 'Cerrar menú' : 'Abrir menú de navegación'}
              title="Menú"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Menú desplegable móvil con estética Glassmorphism */}
        {isMobileMenuOpen && (
          <div className="mobile-nav-dropdown">
            <ul className="mobile-nav-links">
              <li>
                <NavLink
                  to="/"
                  end
                  className={({ isActive }) =>
                    `mobile-nav-link ${isActive ? 'active' : ''}`
                  }
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Inicio
                </NavLink>
              </li>
              <li>
                {isPanel ? (
                  <NavLink
                    to="/panel"
                    className={({ isActive }) =>
                      `mobile-nav-link ${isActive ? 'active' : ''}`
                    }
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Panel de Apuntes
                  </NavLink>
                ) : (
                  <button
                    type="button"
                    className="mobile-nav-link"
                    onClick={() => {
                      setIsMobileMenuOpen(false)
                      handleAccess()
                    }}
                  >
                    Panel de Apuntes
                  </button>
                )}
              </li>
              {isPanel && !isExplorer && onOpenCreateTopic && (
                <li>
                  <button
                    type="button"
                    className="mobile-nav-link mobile-nav-btn"
                    onClick={() => {
                      setIsMobileMenuOpen(false)
                      onOpenCreateTopic()
                    }}
                  >
                    <FolderPlus size={15} />
                    <span>Nuevo Tema</span>
                  </button>
                </li>
              )}
            </ul>
          </div>
        )}
      </header>

      {/* Backdrop transparente para cerrar menú móvil al hacer clic fuera */}
      {isMobileMenuOpen && (
        <div
          className="mobile-menu-backdrop"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  )
}
