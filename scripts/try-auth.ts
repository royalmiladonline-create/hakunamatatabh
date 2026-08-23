import pg from 'pg'

const { Client } = pg

const configs = [
  {
    label: 'ap-northeast-1 ssl:rejectUnauthorized:false',
    host: 'aws-0-ap-northeast-1.pooler.supabase.com',
    port: 6543,
    user: 'postgres.oxvxoddgbdlypvkwjfmq',
    password: 'Hakunamatata123',
    database: 'postgres',
    ssl: { rejectUnauthorized: false },
  },
  {
    label: 'ap-northeast-1 session mode (5432) ssl:false',
    host: 'aws-0-ap-northeast-1.pooler.supabase.com',
    port: 5432,
    user: 'postgres.oxvxoddgbdlypvkwjfmq',
    password: 'Hakunamatata123',
    database: 'postgres',
    ssl: false,
  },
  {
    label: 'ap-northeast-1 session mode (5432) ssl:rejectUnauthorized:false',
    host: 'aws-0-ap-northeast-1.pooler.supabase.com',
    port: 5432,
    user: 'postgres.oxvxoddgbdlypvkwjfmq',
    password: 'Hakunamatata123',
    database: 'postgres',
    ssl: { rejectUnauthorized: false },
  },
]

for (const config of configs) {
  const client = new Client(config)
  try {
    console.log(`Trying: ${config.label}...`)
    const connectPromise = client.connect()
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout after 10s')), 10000)
    )
    await Promise.race([connectPromise, timeoutPromise])
    console.log(`  ✓ CONNECTED!`)
    const result = await client.query('SELECT current_database(), current_user')
    console.log(`  DB: ${result.rows[0].current_database}, User: ${result.rows[0].current_user}`)
    await client.end()
    process.exit(0)
  } catch (err) {
    console.log(`  ✗ ${err.message?.substring(0, 150)}`)
    try { await client.end() } catch {}
  }
}

console.log('\nAll attempts failed.')
