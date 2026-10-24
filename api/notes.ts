import { Redis } from '@upstash/redis'

export const config = {
  runtime: 'edge'
}

function getRedis() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN

  if (!url || !token) {
    return null
  }

  return new Redis({
    url,
    token
  })
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json'
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  const redis = getRedis()
  if (!redis) {
    return new Response(
      JSON.stringify({
        success: false,
        configured: false,
        notes: null,
        message: 'Vercel KV no configurado'
      }),
      { status: 200, headers: corsHeaders }
    )
  }

  try {
    if (req.method === 'GET') {
      const notes = await redis.get('andwhy_csharp_notes_v1')
      return new Response(
        JSON.stringify({
          success: true,
          configured: true,
          notes: notes ?? []
        }),
        { status: 200, headers: corsHeaders }
      )
    }

    if (req.method === 'POST') {
      const body = await req.json()
      // Body can be an array of notes or a single note action
      if (Array.isArray(body)) {
        await redis.set('andwhy_csharp_notes_v1', body)
      } else if (body.notes && Array.isArray(body.notes)) {
        await redis.set('andwhy_csharp_notes_v1', body.notes)
      } else if (body.id) {
        // Single note upsert
        const currentNotes = ((await redis.get('andwhy_csharp_notes_v1')) as Array<{ id: string }>) || []
        const exists = currentNotes.some((n) => n.id === body.id)
        const updated = exists
          ? currentNotes.map((n) => (n.id === body.id ? body : n))
          : [body, ...currentNotes]
        await redis.set('andwhy_csharp_notes_v1', updated)
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Notas actualizadas en Vercel KV' }),
        { status: 200, headers: corsHeaders }
      )
    }

    if (req.method === 'DELETE') {
      const url = new URL(req.url)
      const noteId = url.searchParams.get('id')
      if (noteId) {
        const currentNotes = ((await redis.get('andwhy_csharp_notes_v1')) as Array<{ id: string }>) || []
        const updated = currentNotes.filter((n) => n.id !== noteId)
        await redis.set('andwhy_csharp_notes_v1', updated)
      }
      return new Response(
        JSON.stringify({ success: true, message: 'Nota eliminada en Vercel KV' }),
        { status: 200, headers: corsHeaders }
      )
    }

    return new Response(
      JSON.stringify({ error: `Method ${req.method} not allowed` }),
      { status: 405, headers: corsHeaders }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error interno'
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: corsHeaders }
    )
  }
}
