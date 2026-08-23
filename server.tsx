// Replace these bottom lines in server.tsx:

// Serve static files in production
app.use('/*', serveStatic({ root: './dist' }))
app.get('*', serveStatic({ path: './dist/index.html', root: './dist' }))

const port = Number(process.env.PORT) || 3001
console.log(`🚀 Server running on port ${port}`)

// Add hostname: '0.0.0.0' so Render can route external web traffic to it
Bun.serve({ 
  port, 
  hostname: '0.0.0.0', 
  fetch: app.fetch 
})