import pg from 'pg'

const { Client } = pg

// Try multiple pooler configurations to find the right one
const configs = [
  {
    label: 'us-east-1 pooler with project user',
    host: 'aws-0-us-east-1.pooler.supabase.com',
    port: 6543,
    user: 'postgres.oxvxoddgbdlypvkwjfmq',
    password: 'Hakunamatata123',
    database: 'postgres',
    ssl: { rejectUnauthorized: false },
  },
  {
    label: 'direct connection with SSL',
    host: 'db.oxvxoddgbdlypvkwjfmq.supabase.co',
    port: 5432,
    user: 'postgres',
    password: 'Hakunamatata123',
    database: 'postgres',
    ssl: { rejectUnauthorized: false },
    options: '-c statement_timeout=10000',
  },
]

async function tryConnection(config) {
  const client = new Client(config)
  try {
    console.log(`Trying: ${config.label}...`)
    const connectPromise = client.connect()
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout after 10s')), 10000)
    )
    await Promise.race([connectPromise, timeoutPromise])
    console.log(`  ✓ Connected!`)
    
    const result = await client.query('SELECT current_database(), current_user, version()')
    console.log(`  Database: ${result.rows[0].current_database}`)
    console.log(`  User: ${result.rows[0].current_user}`)
    console.log(`  Version: ${result.rows[0].version}`)
    
    await client.end()
    return true
  } catch (err) {
    console.log(`  ✗ Failed: ${err.message}`)
    try { await client.end() } catch {}
    return false
  }
}

for (const config of configs) {
  const ok = await tryConnection(config)
  if (ok) break
}
