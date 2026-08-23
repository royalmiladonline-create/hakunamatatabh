// SPDX-License-Identifier: Apache-2.0
// Copyright (C) 2026 Shogo Technologies, Inc.
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/prisma/client'

// Ensure .env is loaded in the server process
if (!process.env.DATABASE_URL) {
  try {
    const { readFileSync } = require('fs')
    const { resolve } = require('path')
    const envPath = resolve(process.cwd(), '.env')
    const envContent = readFileSync(envPath, 'utf-8')
    for (const line of envContent.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eqIdx = trimmed.indexOf('=')
      if (eqIdx > 0) {
        const key = trimmed.substring(0, eqIdx).trim()
        const val = trimmed.substring(eqIdx + 1).trim()
        if (!process.env[key]) process.env[key] = val
      }
    }
  } catch {}
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const url = process.env.DATABASE_URL
  if (!url) {
    console.error('[DB] DATABASE_URL is not set!')
    throw new Error('DATABASE_URL is not set')
  }
  console.log('[DB] Connecting to:', url.substring(0, 50) + '...')
  const adapter = new PrismaPg({
    connectionString: url,
  })
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
