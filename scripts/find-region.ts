import pg from 'pg'

const { Client } = pg

const regions = [
  'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2',
  'eu-west-1', 'eu-west-2', 'eu-west-3', 'eu-central-1',
  'ap-southeast-1', 'ap-northeast-1',
]

for (const region of regions) {
  const client = new Client({
    host: `aws-0-${region}.pooler.supabase.com`,
    port: 6543,
    user: 'postgres.oxvxoddgbdlypvkwjfmq',
    password: 'Hakunamatata123',
    database: 'postgres',
    ssl: { rejectUnauthorized: false },
  })
  try {
    const connectPromise = client.connect()
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), 8000)
    )
    await Promise.race([connectPromise, timeoutPromise])
    console.log(`✓ ${region} — CONNECTED!`)
    const result = await client.query('SELECT version()')
    console.log(`  Version: ${result.rows[0].version}`)
    await client.end()
    process.exit(0)
  } catch (err) {
    const msg = err.message?.substring(0, 80) || 'unknown'
    console.log(`✗ ${region} — ${msg}`)
    try { await client.end() } catch {}
  }
}
console.log('No region matched.')
