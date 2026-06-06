import pg from 'pg'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const { Client } = pg
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Session pooler (port 5432) — supports DDL, needed for migrations
const DB_URL = `postgresql://postgres.ipibzijlsqsxajebbzcx:Oreldi12345.1@aws-0-eu-central-1.pooler.supabase.com:5432/postgres`

const MIGRATIONS = [
  '001_initial_schema.sql',
  '002_rls_policies.sql',
  '003_indexes.sql',
  '004_rpc_functions.sql',
  '005_commission_ledger_updates.sql',
  '006_featured_slots_update.sql',
]

async function run() {
  const client = new Client({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } })
  await client.connect()
  console.log('✓ Connected to Supabase\n')

  for (const file of MIGRATIONS) {
    const filePath = path.join(__dirname, '..', 'supabase', 'migrations', file)
    const sql = fs.readFileSync(filePath, 'utf8')
    process.stdout.write(`  Running ${file} ...`)
    try {
      await client.query(sql)
      console.log(' ✓')
    } catch (err) {
      console.log(` ✗\n  Error: ${err.message}\n`)
    }
  }

  // Set admin role for the account
  console.log('\n  Setting admin role for shehurecjana@gmail.com ...')
  try {
    const res = await client.query(
      `UPDATE public.users SET role = 'admin' WHERE email = $1 RETURNING id`,
      ['shehurecjana@gmail.com']
    )
    if (res.rowCount > 0) {
      console.log('  ✓ Admin role set')
    } else {
      console.log('  ℹ  User not found yet — sign up first at /auth/register, then re-run this script')
    }
  } catch (err) {
    console.log(`  ✗ ${err.message}`)
  }

  await client.end()
  console.log('\nDone.')
}

run().catch((err) => {
  console.error('Fatal:', err.message)
  process.exit(1)
})
