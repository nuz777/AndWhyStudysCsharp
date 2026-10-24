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

export default async function handler(req: Request): Promise<Response> {
  const redis = getRedis()

  // Handle CORS if needed
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  }

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  if (!redis) {
    return new Response(
      JSON.stringify({
        success: false,
        configured: false,
        message: 'Vercel KV o Upstash Redis no están configurados en las variables de entorno.'
      }),
      { status: 200, headers: corsHeaders }
    )
  }

  try {
    if (req.method === 'GET') {
      const [topics, notes] = await Promise.all([
        redis.get('andwhy_csharp_topics_v1'),
        redis.get('andwhy_csharp_notes_v1')
      ])

      return new Response(
        JSON.stringify({
          success: true,
          configured: true,
          topics: topics ?? null,
          notes: notes ?? null
        }),
        { status: 200, headers: corsHeaders }
      )
    }

    if (req.method === 'POST') {
      const body = await req.json()
      const { topics, notes } = body

      const updates: Promise<unknown>[] = []
      if (topics !== undefined) {
        updates.push(redis.set('andwhy_csharp_topics_v1', topics))
      }
      if (notes !== undefined) {
        updates.push(redis.set('andwhy_csharp_notes_v1', notes))
      }

      await Promise.all(updates)

      return new Response(
        JSON.stringify({
          success: true,
          configured: true,
          message: 'Datos guardados exitosamente en Vercel KV'
        }),
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
