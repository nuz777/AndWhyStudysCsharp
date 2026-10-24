import { useState } from 'react'
import {
  Cloud,
  CloudCheck,
  CloudOff,
  X,
  Server,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  RefreshCw,
  KeyRound
} from 'lucide-react'
import type { CloudStatusInfo } from '../services/storageService'
import {
  getCustomCloudConfig,
  setCustomCloudConfig
} from '../services/storageService'

interface CloudSyncModalProps {
  isOpen: boolean
  cloudStatus: CloudStatusInfo
  isSyncing: boolean
  onClose: () => void
  onForceSync: () => Promise<void>
  onConfigUpdated: () => void
}

export function CloudSyncModal({
  isOpen,
  cloudStatus,
  isSyncing,
  onClose,
  onForceSync,
  onConfigUpdated
}: CloudSyncModalProps) {
  const existingConfig = getCustomCloudConfig()
  const [url, setUrl] = useState(existingConfig?.url || '')
  const [token, setToken] = useState(existingConfig?.token || '')
  const [isClosing, setIsClosing] = useState(false)
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('')

  if (!isOpen && !isClosing) return null

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      setIsClosing(false)
      onClose()
    }, 220)
  }

  const handleSaveCustom = (e: React.FormEvent) => {
    e.preventDefault()
    if (url.trim() && token.trim()) {
      setCustomCloudConfig({ url: url.trim(), token: token.trim() })
      setSaveSuccessMsg('Credenciales guardadas correctamente')
    } else {
      setCustomCloudConfig(null)
      setSaveSuccessMsg('Credenciales removidas. Usando Vercel KV o modo local.')
    }
    setTimeout(() => setSaveSuccessMsg(''), 3000)
    onConfigUpdated()
  }

  const handleClearCustom = () => {
    setUrl('')
    setToken('')
    setCustomCloudConfig(null)
    setSaveSuccessMsg('Credenciales removidas.')
    setTimeout(() => setSaveSuccessMsg(''), 3000)
    onConfigUpdated()
  }

  return (
    <div
      className={`modal-backdrop ${isClosing ? 'modal-backdrop-exit' : 'modal-backdrop-enter'}`}
      onClick={handleClose}
    >
      <div
        className={`modal-window cloud-sync-modal ${
          isClosing ? 'modal-window-exit' : 'modal-window-enter'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header estilo Windows Fluent */}
        <div className="detail-window-titlebar">
          <div className="titlebar-left">
            <Cloud size={16} className="titlebar-icon text-cyan" />
            <span className="titlebar-title">
              Sincronización en la Nube &bull; Vercel KV
            </span>
          </div>
          <div className="titlebar-controls">
            <button
              type="button"
              className="window-btn btn-close"
              onClick={handleClose}
              title="Cerrar"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        <div className="cloud-sync-modal-body">
          {/* Status banner */}
          <div
            className={`cloud-status-banner ${
              cloudStatus.isConnected ? 'status-connected' : 'status-local'
            }`}
          >
            <div className="status-banner-icon">
              {cloudStatus.isConnected ? (
                <CloudCheck size={28} className="icon-green" />
              ) : (
                <CloudOff size={28} className="icon-amber" />
              )}
            </div>
            <div className="status-banner-info">
              <h3 className="status-banner-title">
                {cloudStatus.isConnected
                  ? 'Conectado a la Nube'
                  : 'Modo Local (Solo este navegador)'}
              </h3>
              <p className="status-banner-desc">
                {cloudStatus.isConnected
                  ? `Las notas y temas se guardan en la nube (${
                      cloudStatus.provider === 'vercel-kv'
                        ? 'Vercel KV Serverless'
                        : 'Upstash Redis'
                    }). Cualquier dispositivo verá los mismos apuntes.`
                  : 'Actualmente las notas se guardan en este dispositivo. Para verlas desde tu celular u otra PC al desplegar en Vercel, activa Vercel Storage.'}
              </p>
            </div>

            <button
              type="button"
              className="btn-sync-action"
              onClick={onForceSync}
              disabled={isSyncing}
            >
              <RefreshCw size={15} className={isSyncing ? 'animate-spin' : ''} />
              <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar Ahora'}</span>
            </button>
          </div>

          {/* Guide for Vercel Storage */}
          <div className="cloud-guide-card">
            <div className="guide-card-header">
              <Sparkles size={16} className="text-accent" />
              <h4>¿Cómo activar la persistencia en Vercel? (Recomendado)</h4>
            </div>

            <div className="guide-steps-list">
              <div className="guide-step-item">
                <span className="step-num">1</span>
                <div className="step-content">
                  <strong>Entra a tu proyecto en Vercel</strong>
                  <p>
                    Abre el panel de tu proyecto en{' '}
                    <a
                      href="https://vercel.com/dashboard"
                      target="_blank"
                      rel="noreferrer"
                      className="link-highlight"
                    >
                      vercel.com <ExternalLink size={12} />
                    </a>{' '}
                    y ve a la pestaña <strong>Storage</strong>.
                  </p>
                </div>
              </div>

              <div className="guide-step-item">
                <span className="step-num">2</span>
                <div className="step-content">
                  <strong>Crea una base de datos KV o Upstash</strong>
                  <p>
                    Haz clic en <strong>Create Database</strong> y elige{' '}
                    <strong>KV</strong> (o <strong>Upstash Redis</strong>). Es 100% gratuita.
                  </p>
                </div>
              </div>

              <div className="guide-step-item">
                <span className="step-num">3</span>
                <div className="step-content">
                  <strong>Conéctala al proyecto</strong>
                  <p>
                    Haz clic en <strong>Connect to Project</strong>. Vercel configurará las
                    variables <code>KV_REST_API_URL</code> y <code>KV_REST_API_TOKEN</code>{' '}
                    automáticamente. Al hacer un nuevo deploy, ¡todas tus notas se guardarán en la nube!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Optional Direct Upstash configuration */}
          <div className="cloud-manual-card">
            <div className="manual-card-header">
              <KeyRound size={16} className="text-cyan" />
              <h4>Conexión Directa Opcional (Upstash REST API)</h4>
            </div>
            <p className="manual-desc">
              Si prefieres conectar tu propia base de datos Upstash Redis directamente sin esperar a redesplegar en Vercel, ingresa tus credenciales REST:
            </p>

            <form onSubmit={handleSaveCustom} className="manual-form">
              <div className="form-group-cloud">
                <label>UPSTASH_REDIS_REST_URL:</label>
                <input
                  type="text"
                  placeholder="https://...upstash.io"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>

              <div className="form-group-cloud">
                <label>UPSTASH_REDIS_REST_TOKEN:</label>
                <input
                  type="password"
                  placeholder="AX..."
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                />
              </div>

              {saveSuccessMsg && (
                <div className="cloud-alert-msg">
                  <CheckCircle2 size={15} />
                  <span>{saveSuccessMsg}</span>
                </div>
              )}

              <div className="manual-form-actions">
                <button type="submit" className="btn-manual-save">
                  <Server size={14} />
                  <span>Guardar Credenciales</span>
                </button>
                {(url || token) && (
                  <button
                    type="button"
                    className="btn-manual-clear"
                    onClick={handleClearCustom}
                  >
                    Limpiar
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
