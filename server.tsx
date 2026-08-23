import { Hono } from 'hono'
import { serveStatic } from 'hono/bun'
import customRoutes from './custom-routes'
import { createToolsHandlers } from '@shogo-ai/sdk/tools/server'

const app = new Hono()

// CORS — manual middleware so the wildcard always propagates
app.use('*', async (c, next) => {
  c.res.headers.set('Access-Control-Allow-Origin', '*')
  c.res.headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS')
  c.res.headers.set('Access-Control-Allow-Headers', 'Content-Type,Authorization')
  if (c.req.method === 'OPTIONS') return c.text('', 204)
  await next()
})

app.onError((err, c) => {
  console.error('[SERVER ERROR]', err.message, err.stack?.substring(0, 500))
  return c.json({ error: err.message }, 500)
})

// Health check endpoint
app.get('/health', (c) => c.json({ ok: true, timestamp: new Date().toISOString() }))

// CRUD routes
try {
  const { createAllRoutes } = await import('./src/generated')
  const { prisma } = await import('./src/lib/db')
  app.route('/api', createAllRoutes(prisma))
} catch {
  // No generated routes yet
}

// Custom API routes
app.route('/api', customRoutes)

// Tools proxy
const tools = createToolsHandlers({})
app.post('/api/tools/execute', (c) => tools.execute(c.req.raw))
app.get('/api/tools/schemas', (c) => tools.list(c.req.raw))

// Serve static files in production
app.use('/*', serveStatic({ root: './dist' }))
app.get('*', serveStatic({ path: './dist/index.html', root: './dist' }))

const port = Number(process.env.PORT) || 3001
console.log(`🚀 Server running on port ${port}`)

Bun.serve({ 
  port, 
  hostname: '0.0.0.0', 
  fetch: app.fetch 
})// Serve static assets (JS, CSS, images) from /dist
app.use('/*', serveStatic({ root: './dist' }))

// SPA Fallback: Serve index.html for all non-API routes
app.get('*', async (c, next) => {
  // If request starts with /api, pass it along
  if (c.req.path.startsWith('/api')) return next()
  
  try {
    const html = await Bun.file('./dist/index.html').text()
    return c.html(html)
  } catch {
    return c.text('Build output not found in ./dist', 404)
  }
})