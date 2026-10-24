import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import type { Plugin } from 'vite'
import { Redis } from '@upstash/redis'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const redisUrl = env.KV_REST_API_URL || env.UPSTASH_REDIS_REST_URL
  const redisToken = env.KV_REST_API_TOKEN || env.UPSTASH_REDIS_REST_TOKEN
  const redis = redisUrl && redisToken ? new Redis({ url: redisUrl, token: redisToken }) : null

  const devApiPlugin: Plugin = {
    name: 'vite-plugin-vercel-api-dev',
    configureServer(server) {
      server.middlewares.use('/api/data', async (req, res) => {
        res.setHeader('Content-Type', 'application/json')
        if (!redis) {
          res.statusCode = 200
          res.end(
            JSON.stringify({
              success: false,
              configured: false,
              message: 'KV_REST_API_URL o TOKEN no configurados localmente.'
            })
          )
          return
        }

        if (req.method === 'GET') {
          try {
            const [topics, notes] = await Promise.all([
              redis.get('andwhy_csharp_topics_v1'),
              redis.get('andwhy_csharp_notes_v1')
            ])
            res.statusCode = 200
            res.end(JSON.stringify({ success: true, configured: true, topics, notes }))
          } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Error interno'
            res.statusCode = 500
            res.end(JSON.stringify({ success: false, error: message }))
          }
          return
        }

        if (req.method === 'POST') {
          let body = ''
          req.on('data', (chunk) => {
            body += chunk
          })
          req.on('end', async () => {
            try {
              const { topics, notes } = JSON.parse(body)
              const updates: Promise<unknown>[] = []
              if (topics !== undefined) {
                updates.push(redis.set('andwhy_csharp_topics_v1', topics))
              }
              if (notes !== undefined) {
                updates.push(redis.set('andwhy_csharp_notes_v1', notes))
              }
              await Promise.all(updates)
              res.statusCode = 200
              res.end(JSON.stringify({ success: true, configured: true }))
            } catch (err: unknown) {
              const message = err instanceof Error ? err.message : 'Error interno'
              res.statusCode = 500
              res.end(JSON.stringify({ success: false, error: message }))
            }
          })
          return
        }

        res.statusCode = 405
        res.end(JSON.stringify({ error: 'Method not allowed' }))
      })
    }
  }

  return {
    plugins: [react(), devApiPlugin]
  }
})
