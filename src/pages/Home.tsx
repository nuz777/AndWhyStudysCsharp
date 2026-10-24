import { useNavigate } from 'react-router-dom'
import {
  BookOpen,
  ArrowRight,
  Sparkles,
  BrickWall,
  Scale,
  Leaf,
  Lock,
  Terminal,
  Layers,
  Zap
} from 'lucide-react'
import { useAuth } from '../context/useAuth'
import { Header } from '../components/Header'

export function Home() {
  const { isAuthenticated, openAccessModal } = useAuth()
  const navigate = useNavigate()

  const handleEnter = (topicId?: string) => {
    const targetState = topicId ? { initialTopic: topicId } : undefined
    if (isAuthenticated) {
      navigate('/panel', { state: targetState })
    } else {
      openAccessModal(() => {
        navigate('/panel', { state: targetState })
      })
    }
  }

  return (
    <div className="home-page">
      <Header />

      {/* Hero Section con /saku.png de fondo */}
      <section className="hero-section">
        <div className="hero-overlay"></div>

        <div className="hero-content">
          <div className="badge-tag">
            <span className="badge-dot"></span>
            <Sparkles size={14} />
            <span>Espacio de Aprendizaje &bull; C# &amp; .NET</span>
          </div>

          <h1 className="hero-title">
            Mis Apuntes y Notas de{' '}
            <span className="highlight-csharp">C#</span>
          </h1>

          <p className="hero-description">
            Cuaderno personal de estudio donde documento conceptos clave, sintaxis moderna,
            patrones de desarrollo en .NET y notas organizadas por prioridad.
          </p>

          <div className="hero-actions">
            <button
              type="button"
              className="btn-hero-primary"
              onClick={() => handleEnter()}
            >
              <BookOpen size={18} />
              <span>Explorar Apuntes</span>
              <ArrowRight size={16} />
            </button>

            {!isAuthenticated && (
              <button
                type="button"
                className="btn-hero-secondary"
                onClick={() => handleEnter()}
              >
                <Lock size={16} />
                <span>Acceso con Clave</span>
              </button>
            )}
          </div>

          {/* Leyenda explicativa de prioridades en el Hero */}
          <div className="hero-priority-legend">
            <span className="legend-title">Prioridades de estudio:</span>
            <span className="legend-item legend-fuerte" title="Concepto fuerte e inmutable">
              <BrickWall size={14} /> Fuerte (Concreto)
            </span>
            <span className="legend-item legend-intermedio" title="Concepto intermedio a sopesar">
              <Scale size={14} /> Intermedio (Balanza)
            </span>
            <span className="legend-item legend-bajo" title="Tip secundario o detalle leve">
              <Leaf size={14} /> Bajo (Hoja)
            </span>
          </div>
        </div>

        {/* Las tres cards que estaban abajo del hero */}
        <div className="hero-cards-grid" id="temas">
          <div
            className="topic-card clickable-card"
            onClick={() => handleEnter('fundamentos')}
          >
            <div className="card-icon-wrap card-icon-purple">
              <Terminal size={22} />
            </div>
            <h3 className="card-title">Fundamentos &amp; Tipado</h3>
            <p className="card-desc">
              Tipos por valor vs referencia, memoria stack/heap y switch expressions.
            </p>
            <span className="card-footer-action">
              Entrar al tema &rarr;
            </span>
          </div>

          <div
            className="topic-card clickable-card"
            onClick={() => handleEnter('poo-solid')}
          >
            <div className="card-icon-wrap card-icon-blue">
              <Layers size={22} />
            </div>
            <h3 className="card-title">POO &amp; Principios SOLID</h3>
            <p className="card-desc">
              Inversión de dependencias, interfaces limpias, polimorfismo y buenas prácticas.
            </p>
            <span className="card-footer-action">
              Entrar al tema &rarr;
            </span>
          </div>

          <div
            className="topic-card clickable-card"
            onClick={() => handleEnter('linq-async')}
          >
            <div className="card-icon-wrap card-icon-amber">
              <Zap size={22} />
            </div>
            <h3 className="card-title">LINQ &amp; Concurrencia</h3>
            <p className="card-desc">
              Consultas declarativas, Task/async/await y pipelines de datos eficientes.
            </p>
            <span className="card-footer-action">
              Entrar al tema &rarr;
            </span>
          </div>
        </div>
      </section>
    </div>
  )
}
