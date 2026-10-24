import type { Topic, Note } from '../types/notes'
import { INITIAL_TOPICS, INITIAL_NOTES } from '../data/initialData'

export const STORAGE_KEYS = {
  TOPICS: 'andwhy_csharp_topics_v1',
  NOTES: 'andwhy_csharp_notes_v1',
  CUSTOM_CLOUD: 'andwhy_custom_cloud_v1'
}

export interface CloudStatusInfo {
  isConnected: boolean
  provider: 'vercel-kv' | 'custom-upstash' | 'none'
  message: string
}

export interface CustomCloudConfig {
  url: string
  token: string
}

export function getCustomCloudConfig(): CustomCloudConfig | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.CUSTOM_CLOUD)
    if (saved) return JSON.parse(saved)
  } catch {
    // fallback
  }

  const envUrl = import.meta.env.VITE_KV_REST_API_URL
  const envToken = import.meta.env.VITE_KV_REST_API_TOKEN
  if (envUrl && envToken) {
    return { url: envUrl, token: envToken }
  }

  return null
}

export function setCustomCloudConfig(config: CustomCloudConfig | null) {
  if (config && config.url && config.token) {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_CLOUD, JSON.stringify(config))
  } else {
    localStorage.removeItem(STORAGE_KEYS.CUSTOM_CLOUD)
  }
}

export function getLocalTopics(): Topic[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.TOPICS)
    return saved ? JSON.parse(saved) : INITIAL_TOPICS
  } catch {
    return INITIAL_TOPICS
  }
}

export function getLocalNotes(): Note[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTES)
    return saved ? JSON.parse(saved) : INITIAL_NOTES
  } catch {
    return INITIAL_NOTES
  }
}

export function saveLocalTopics(topics: Topic[]) {
  localStorage.setItem(STORAGE_KEYS.TOPICS, JSON.stringify(topics))
}

export function saveLocalNotes(notes: Note[]) {
  localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes))
}

// Fetch from Vercel Serverless API (/api/data) or Custom Upstash
export async function fetchRemoteData(): Promise<{
  topics: Topic[] | null
  notes: Note[] | null
  status: CloudStatusInfo
}> {
  // 1. Try Vercel Serverless Function first
  try {
    const res = await fetch('/api/data', {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    })

    if (res.ok) {
      const data = await res.json()
      if (data.configured) {
        return {
          topics: data.topics,
          notes: data.notes,
          status: {
            isConnected: true,
            provider: 'vercel-kv',
            message: 'Conectado a Vercel KV'
          }
        }
      }
    }
  } catch {
    // Ignore network error or 404 in local dev
  }

  // 2. Try Custom Upstash client config if present
  const custom = getCustomCloudConfig()
  if (custom && custom.url && custom.token) {
    try {
      const cleanUrl = custom.url.replace(/\/+$/, '')
      const [topicsRes, notesRes] = await Promise.all([
        fetch(`${cleanUrl}/get/andwhy_csharp_topics_v1`, {
          headers: { Authorization: `Bearer ${custom.token}` }
        }),
        fetch(`${cleanUrl}/get/andwhy_csharp_notes_v1`, {
          headers: { Authorization: `Bearer ${custom.token}` }
        })
      ])

      if (topicsRes.ok && notesRes.ok) {
        const topicsData = await topicsRes.json()
        const notesData = await notesRes.json()

        const topics = topicsData.result
          ? (typeof topicsData.result === 'string'
              ? JSON.parse(topicsData.result)
              : topicsData.result)
          : null

        const notes = notesData.result
          ? (typeof notesData.result === 'string'
              ? JSON.parse(notesData.result)
              : notesData.result)
          : null

        return {
          topics,
          notes,
          status: {
            isConnected: true,
            provider: 'custom-upstash',
            message: 'Conectado a Upstash Redis'
          }
        }
      }
    } catch {
      // Custom config failed
    }
  }

  // 3. Fallback to Local mode
  return {
    topics: null,
    notes: null,
    status: {
      isConnected: false,
      provider: 'none',
      message: 'Modo Local (Sin sincronización en la nube)'
    }
  }
}

// Sync current data to Cloud
export async function syncRemoteData(
  topics: Topic[],
  notes: Note[]
): Promise<CloudStatusInfo> {
  // Always update local storage first
  saveLocalTopics(topics)
  saveLocalNotes(notes)

  // 1. Try Vercel Serverless Function
  try {
    const res = await fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topics, notes })
    })

    if (res.ok) {
      const data = await res.json()
      if (data.configured) {
        return {
          isConnected: true,
          provider: 'vercel-kv',
          message: 'Guardado y sincronizado en Vercel KV'
        }
      }
    }
  } catch {
    // API not available
  }

  // 2. Try Custom Upstash client config
  const custom = getCustomCloudConfig()
  if (custom && custom.url && custom.token) {
    try {
      const cleanUrl = custom.url.replace(/\/+$/, '')
      const [topicsRes, notesRes] = await Promise.all([
        fetch(`${cleanUrl}/set/andwhy_csharp_topics_v1`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${custom.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(topics)
        }),
        fetch(`${cleanUrl}/set/andwhy_csharp_notes_v1`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${custom.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(notes)
        })
      ])

      if (topicsRes.ok && notesRes.ok) {
        return {
          isConnected: true,
          provider: 'custom-upstash',
          message: 'Guardado y sincronizado en Upstash Redis'
        }
      }
    } catch {
      // Failed custom sync
    }
  }

  return {
    isConnected: false,
    provider: 'none',
    message: 'Guardado solo localmente en este navegador'
  }
}
