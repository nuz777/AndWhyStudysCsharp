import { useState, useEffect, useMemo, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import {
  Search,
  Sparkles,
  Layers,
  FolderPlus,
  Plus,
  BookOpen,
  Filter,
  Lock,
  Trash2,
  CloudCheck,
  CloudOff
} from 'lucide-react'
import type { Topic, Note, PriorityLevel } from '../types/notes'
import { Header } from '../components/Header'
import { NoteCard } from '../components/NoteCard'
import { PriorityBadge } from '../components/PriorityBadge'
import { NoteModal } from '../components/NoteModal'
import { NoteDetailModal } from '../components/NoteDetailModal'
import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal'
import { DeleteTopicModal } from '../components/DeleteTopicModal'
import { CreateTopicModal } from '../components/CreateTopicModal'
import { CloudSyncModal } from '../components/CloudSyncModal'
import { useAuth } from '../context/useAuth'
import {
  getLocalTopics,
  getLocalNotes,
  saveLocalTopics,
  saveLocalNotes,
  fetchRemoteData,
  syncRemoteData
} from '../services/storageService'
import type { CloudStatusInfo } from '../services/storageService'

export function Panel() {
  const { isAuthenticated, openAccessModal } = useAuth()
  const location = useLocation()
  const initialTopicFromNav = (location.state as { initialTopic?: string } | null)?.initialTopic

  // Load topics and notes from local storage / initial state
  const [topics, setTopics] = useState<Topic[]>(() => getLocalTopics())
  const [notes, setNotes] = useState<Note[]>(() => getLocalNotes())

  // Cloud status and sync
  const [cloudStatus, setCloudStatus] = useState<CloudStatusInfo>({
    isConnected: false,
    provider: 'none',
    message: 'Comprobando sincronización...'
  })
  const [isSyncing, setIsSyncing] = useState(false)
  const [isCloudModalOpen, setIsCloudModalOpen] = useState(false)
  const isInitialSyncDone = useRef(false)

  // Fetch from cloud on mount
  useEffect(() => {
    let isMounted = true
    const initCloud = async () => {
      setIsSyncing(true)
      const remote = await fetchRemoteData()
      if (!isMounted) return

      setCloudStatus(remote.status)
      if (remote.status.isConnected) {
        if (remote.topics && remote.topics.length > 0) {
          setTopics(remote.topics)
          saveLocalTopics(remote.topics)
        } else {
          // Cloud has no topics yet, seed with current local topics
          const initialT = getLocalTopics()
          const initialN = getLocalNotes()
          syncRemoteData(initialT, initialN)
        }
        if (remote.notes && remote.notes.length > 0) {
          setNotes(remote.notes)
          saveLocalNotes(remote.notes)
        }
      }
      setIsSyncing(false)
      isInitialSyncDone.current = true
    }

    initCloud()
    return () => {
      isMounted = false
    }
  }, [])

  // Sync to local and cloud on changes
  useEffect(() => {
    if (!isInitialSyncDone.current) return

    saveLocalTopics(topics)
    saveLocalNotes(notes)

    const timer = setTimeout(async () => {
      const res = await syncRemoteData(topics, notes)
      setCloudStatus(res)
    }, 500)

    return () => clearTimeout(timer)
  }, [topics, notes])

  const handleForceSync = async () => {
    setIsSyncing(true)
    const remote = await fetchRemoteData()
    setCloudStatus(remote.status)
    if (remote.status.isConnected && remote.topics && remote.notes) {
      setTopics(remote.topics)
      setNotes(remote.notes)
    } else {
      await syncRemoteData(topics, notes)
    }
    setIsSyncing(false)
  }

  const handleConfigUpdated = async () => {
    setIsSyncing(true)
    const remote = await fetchRemoteData()
    setCloudStatus(remote.status)
    if (remote.status.isConnected) {
      if (remote.topics && remote.notes) {
        setTopics(remote.topics)
        setNotes(remote.notes)
      } else {
        await syncRemoteData(topics, notes)
      }
    }
    setIsSyncing(false)
  }

  const [selectedTopicId, setSelectedTopicId] = useState<string | 'all'>(
    initialTopicFromNav || 'all'
  )
  const [searchQuery, setSearchQuery] = useState('')
  const [priorityFilter, setPriorityFilter] = useState<PriorityLevel | 'all'>('all')
  const [onlyHighlighted, setOnlyHighlighted] = useState(false)

  // Modals state
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [deletingNote, setDeletingNote] = useState<Note | null>(null)
  const [detailNote, setDetailNote] = useState<Note | null>(null)
  const [topicToDelete, setTopicToDelete] = useState<Topic | null>(null)
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false)

  // Save Note (Create or Edit)
  const handleSaveNote = (noteData: Omit<Note, 'id' | 'createdAt'>) => {
    if (editingNote) {
      setNotes((prev) =>
        prev.map((n) => (n.id === editingNote.id ? { ...n, ...noteData } : n))
      )
      if (detailNote && detailNote.id === editingNote.id) {
        setDetailNote((prev) => (prev ? { ...prev, ...noteData } : null))
      }
      setEditingNote(null)
    } else {
      const newNote: Note = {
        ...noteData,
        id: `note-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        createdAt: Date.now()
      }
      setNotes((prev) => [newNote, ...prev])
    }
    setIsNoteModalOpen(false)
  }

  const handleOpenEdit = (note: Note) => {
    setEditingNote(note)
    setIsNoteModalOpen(true)
  }

  const handleOpenCreate = () => {
    setEditingNote(null)
    setIsNoteModalOpen(true)
  }

  const handleToggleHighlight = (id: string) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isHighlighted: !n.isHighlighted } : n))
    )
    if (detailNote && detailNote.id === id) {
      setDetailNote((prev) =>
        prev ? { ...prev, isHighlighted: !prev.isHighlighted } : null
      )
    }
  }

  // Delete Note with Confirmation
  const handleRequestDelete = (note: Note) => {
    setDeletingNote(note)
  }

  const handleConfirmDelete = () => {
    if (deletingNote) {
      setNotes((prev) => prev.filter((n) => n.id !== deletingNote.id))
      if (detailNote && detailNote.id === deletingNote.id) {
        setDetailNote(null)
      }
      setDeletingNote(null)
    }
  }

  // Topic Handlers
  const handleCreateTopic = (newTopicData: Omit<Topic, 'id'>) => {
    const newTopic: Topic = {
      ...newTopicData,
      id: `topic-${Date.now()}`
    }
    setTopics((prev) => [...prev, newTopic])
    setSelectedTopicId(newTopic.id)
  }

  const handleConfirmDeleteTopic = () => {
    if (!topicToDelete) return
    const topicId = topicToDelete.id
    // Remove topic
    setTopics((prev) => prev.filter((t) => t.id !== topicId))
    // Remove its notes
    setNotes((prev) => prev.filter((n) => n.topicId !== topicId))
    // Reset selection if this topic was selected
    if (selectedTopicId === topicId) {
      setSelectedTopicId('all')
    }
    setTopicToDelete(null)
  }

  // Selected topic object
  const currentTopic = useMemo(() => {
    return selectedTopicId === 'all'
      ? null
      : topics.find((t) => t.id === selectedTopicId)
  }, [topics, selectedTopicId])

  // Filtered notes
  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      if (selectedTopicId !== 'all' && note.topicId !== selectedTopicId) {
        return false
      }
      if (priorityFilter !== 'all' && note.priority !== priorityFilter) {
        return false
      }
      if (onlyHighlighted && !note.isHighlighted) {
        return false
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const matchTitle = note.title.toLowerCase().includes(query)
        const matchContent = note.content.toLowerCase().includes(query)
        const matchCode = note.codeSnippet?.toLowerCase().includes(query)
        if (!matchTitle && !matchContent && !matchCode) return false
      }
      return true
    })
  }, [notes, selectedTopicId, priorityFilter, onlyHighlighted, searchQuery])

  // Note counts
  const notesCountByTopic = useMemo(() => {
    const map: Record<string, number> = {}
    notes.forEach((n) => {
      map[n.topicId] = (map[n.topicId] || 0) + 1
    })
    return map
  }, [notes])

  // If not authenticated, show guarded screen
  if (!isAuthenticated) {
    return (
      <div className="panel-page-locked">
        <Header />
        <div className="panel-overlay"></div>
        <div className="locked-container">
          <div className="locked-card">
            <div className="locked-icon-wrap">
              <Lock size={36} />
            </div>
            <h2>Panel de Notas Protegido</h2>
            <p>Debes ingresar la contraseña de acceso para ver y editar tus notas de C#.</p>
            <button
              type="button"
              className="btn-primary"
              onClick={() => openAccessModal()}
            >
              Ingresar Contraseña
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="panel-page">
      <Header
        onOpenCreateNote={handleOpenCreate}
        onOpenCreateTopic={() => setIsTopicModalOpen(true)}
      />

      {/* Fondo /saku.png con overlay nítido */}
      <div className="panel-overlay"></div>

      <main className="panel-content">
        <div className="panel-container">
          {/* Header del Panel */}
          <div className="section-header">
            <div className="section-title-wrap">
              <span className="section-badge">
                <BookOpen size={14} />
                Panel de Estudio &bull; C# &amp; .NET
              </span>
              <h1 className="section-heading">Cuaderno de Apuntes</h1>
              <p className="section-subheading">
                Administra tus conceptos por tema, haz clic en una tarjeta para verla en ventana
                amplia, asigna prioridades y gestiona tus temas.
              </p>
            </div>

            <div className="section-header-actions">
              <button
                type="button"
                className={`btn-cloud-status ${cloudStatus.isConnected ? 'connected' : 'local'}`}
                onClick={() => setIsCloudModalOpen(true)}
                title={
                  cloudStatus.isConnected
                    ? 'Notas sincronizadas en la nube'
                    : 'Modo local: haz clic para ver cómo sincronizar en Vercel'
                }
              >
                {cloudStatus.isConnected ? (
                  <CloudCheck size={16} />
                ) : (
                  <CloudOff size={16} />
                )}
                <span>{cloudStatus.isConnected ? 'Nube Conectada' : 'Modo Local'}</span>
              </button>
              <button
                type="button"
                className="btn-create-topic"
                onClick={() => setIsTopicModalOpen(true)}
              >
                <FolderPlus size={16} />
                <span>Nuevo Tema</span>
              </button>
              <button
                type="button"
                className="btn-create-note"
                onClick={handleOpenCreate}
              >
                <Plus size={18} />
                <span>Nueva Nota</span>
              </button>
            </div>
          </div>

          {/* Selector de Temas con opción de borrado */}
          <div className="topics-tabs-bar">
            <div className="topics-scroll-area">
              <button
                type="button"
                className={`topic-tab-btn ${selectedTopicId === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedTopicId('all')}
              >
                <Layers size={16} />
                <span>Todos los temas</span>
                <span className="topic-count-pill">{notes.length}</span>
              </button>

              {topics.map((topic) => {
                const count = notesCountByTopic[topic.id] || 0
                const isSelected = selectedTopicId === topic.id
                return (
                  <button
                    key={topic.id}
                    type="button"
                    className={`topic-tab-btn ${isSelected ? 'active' : ''}`}
                    onClick={() => setSelectedTopicId(topic.id)}
                    style={
                      isSelected
                        ? {
                            borderColor: topic.badgeColor,
                            boxShadow: `0 0 15px ${topic.badgeColor}40`
                          }
                        : {}
                    }
                  >
                    <span
                      className="topic-indicator-dot"
                      style={{ backgroundColor: topic.badgeColor }}
                    />
                    <span>{topic.name}</span>
                    <span className="topic-count-pill">{count}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Banner del tema activo con acción para borrar tema */}
          {currentTopic && (
            <div
              className="current-topic-banner"
              style={{ borderLeftColor: currentTopic.badgeColor }}
            >
              <div>
                <div className="topic-banner-title-row">
                  <h2 className="current-topic-title">{currentTopic.name}</h2>
                  <button
                    type="button"
                    className="btn-delete-topic-inline"
                    onClick={() => setTopicToDelete(currentTopic)}
                    title="Eliminar este tema y sus notas"
                  >
                    <Trash2 size={14} />
                    <span>Eliminar Tema</span>
                  </button>
                </div>
                <p className="current-topic-desc">{currentTopic.description}</p>
              </div>
              <span className="current-topic-badge">
                {notesCountByTopic[currentTopic.id] || 0} notas guardadas
              </span>
            </div>
          )}

          {/* Barra de Filtros y Búsqueda */}
          <div className="notes-toolbar">
            <div className="search-bar-wrap">
              <Search size={16} className="search-icon-inside" />
              <input
                type="text"
                placeholder="Buscar por concepto, sintaxis o código C#..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input-field"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="clear-search-btn"
                  onClick={() => setSearchQuery('')}
                >
                  Limpiar
                </button>
              )}
            </div>

            <div className="filters-group">
              {/* Filtro por prioridad */}
              <div className="priority-filter-tabs">
                <span className="filter-label">
                  <Filter size={13} />
                  Prioridad:
                </span>
                <button
                  type="button"
                  className={`filter-chip ${priorityFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setPriorityFilter('all')}
                >
                  Todas
                </button>
                <button
                  type="button"
                  className={`filter-chip chip-fuerte ${priorityFilter === 'fuerte' ? 'active' : ''}`}
                  onClick={() => setPriorityFilter('fuerte')}
                >
                  <PriorityBadge priority="fuerte" size="sm" />
                </button>
                <button
                  type="button"
                  className={`filter-chip chip-intermedio ${priorityFilter === 'intermedio' ? 'active' : ''}`}
                  onClick={() => setPriorityFilter('intermedio')}
                >
                  <PriorityBadge priority="intermedio" size="sm" />
                </button>
                <button
                  type="button"
                  className={`filter-chip chip-bajo ${priorityFilter === 'bajo' ? 'active' : ''}`}
                  onClick={() => setPriorityFilter('bajo')}
                >
                  <PriorityBadge priority="bajo" size="sm" />
                </button>
              </div>

              {/* Toggle de resaltadas */}
              <button
                type="button"
                className={`filter-chip chip-highlight ${onlyHighlighted ? 'active' : ''}`}
                onClick={() => setOnlyHighlighted(!onlyHighlighted)}
              >
                <Sparkles size={14} />
                <span>Resaltadas</span>
              </button>
            </div>
          </div>

          {/* Grid de Tarjetas de Notas (Al tocar abre ventana amplia) */}
          {filteredNotes.length > 0 ? (
            <div className="notes-grid">
              {filteredNotes.map((note) => {
                const topic = topics.find((t) => t.id === note.topicId)
                return (
                  <NoteCard
                    key={note.id}
                    note={note}
                    topic={topic}
                    onToggleHighlight={handleToggleHighlight}
                    onEditNote={handleOpenEdit}
                    onDeleteNote={handleRequestDelete}
                    onOpenDetail={(n) => setDetailNote(n)}
                  />
                )
              })}
            </div>
          ) : (
            <div className="empty-notes-state">
              <div className="empty-icon-wrap">
                <BookOpen size={36} />
              </div>
              <h3 className="empty-title">No hay notas que coincidan</h3>
              <p className="empty-desc">
                {searchQuery || priorityFilter !== 'all' || onlyHighlighted
                  ? 'Prueba modificando tus filtros o el término de búsqueda.'
                  : 'Aún no tienes notas en este tema. ¡Crea la primera para comenzar!'}
              </p>
              <button
                type="button"
                className="btn-create-note"
                onClick={handleOpenCreate}
              >
                <Plus size={16} />
                <span>Crear Nota Ahora</span>
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Ventana Amplia Estilo Windows (Vista Previa de la Nota) */}
      <NoteDetailModal
        isOpen={Boolean(detailNote)}
        note={detailNote}
        topic={topics.find((t) => t.id === detailNote?.topicId)}
        onClose={() => setDetailNote(null)}
        onEdit={handleOpenEdit}
        onToggleHighlight={handleToggleHighlight}
      />

      {/* Modal de Creación / Edición de Nota */}
      <NoteModal
        key={editingNote ? editingNote.id : 'new-note'}
        isOpen={isNoteModalOpen}
        topics={topics}
        selectedTopicId={selectedTopicId === 'all' ? (topics[0]?.id ?? '') : selectedTopicId}
        initialData={editingNote}
        onClose={() => {
          setIsNoteModalOpen(false)
          setEditingNote(null)
        }}
        onSave={handleSaveNote}
        onOpenCreateTopic={() => setIsTopicModalOpen(true)}
      />

      {/* Modal de Confirmación para Eliminar Nota */}
      <ConfirmDeleteModal
        isOpen={Boolean(deletingNote)}
        title={deletingNote?.title || ''}
        onClose={() => setDeletingNote(null)}
        onConfirm={handleConfirmDelete}
      />

      {/* Modal de Confirmación para Eliminar Tema */}
      <DeleteTopicModal
        isOpen={Boolean(topicToDelete)}
        topic={topicToDelete}
        notesCount={topicToDelete ? (notesCountByTopic[topicToDelete.id] || 0) : 0}
        onClose={() => setTopicToDelete(null)}
        onConfirm={handleConfirmDeleteTopic}
      />

      {/* Modal de Creación de Tema */}
      <CreateTopicModal
        isOpen={isTopicModalOpen}
        onClose={() => setIsTopicModalOpen(false)}
        onCreateTopic={handleCreateTopic}
      />

      {/* Modal de Sincronización en la Nube */}
      <CloudSyncModal
        isOpen={isCloudModalOpen}
        cloudStatus={cloudStatus}
        isSyncing={isSyncing}
        onClose={() => setIsCloudModalOpen(false)}
        onForceSync={handleForceSync}
        onConfigUpdated={handleConfigUpdated}
      />
    </div>
  )
}
