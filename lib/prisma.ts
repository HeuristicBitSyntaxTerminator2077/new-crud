import { PrismaClient } from '@prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { readFileSync } from 'fs'
import { join } from 'path'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Parse DATABASE_URL or use individual environment variables
function getConnectionConfig() {
  const databaseUrl = process.env.DATABASE_URL
  
  if (databaseUrl) {
    try {
      // Parse MySQL connection string: mysql://user:password@host:port/database?params
      const url = new URL(databaseUrl)
      // Extract database name (remove leading '/' and any query params that might be in pathname)
      let database = url.pathname.slice(1)
      if (database.includes('?')) {
        database = database.split('?')[0]
      }
      
      if (!database) {
        throw new Error('DATABASE_URL is missing database name. Format: mysql://user:password@host:port/database_name')
      }
      
      // Parse query parameters for SSL configuration
      const params = new URLSearchParams(url.search)
      const sslCa = params.get('sslca')
      const sslAccept = params.get('sslaccept')
      
      const config: any = {
        host: url.hostname,
        port: url.port ? parseInt(url.port) : 3306,
        user: url.username,
        password: url.password,
        database,
        connectionLimit: 5,
        connectTimeout: 30000, // 30 seconds timeout for TiDB Cloud
      }
      
      // Configure SSL for TiDB Cloud
      if (sslCa || sslAccept) {
        const ssl: any = {}
        
        if (sslCa) {
          try {
            // Handle Windows absolute paths (C:\ or C:/) and Unix absolute paths (/)
            // Also handle relative paths
            let certPath: string
            // Check if it's a Windows absolute path (drive letter + colon)
            const isWindowsAbsolute = /^[A-Z]:[\\/]/.test(sslCa)
            if (isWindowsAbsolute || sslCa.startsWith('/')) {
              // Absolute path (Windows or Unix) - use as-is
              certPath = sslCa
            } else {
              // Relative path - resolve from project root
              certPath = join(process.cwd(), sslCa)
            }
            ssl.ca = readFileSync(certPath, 'utf8')
          } catch (error: any) {
            // In production (Vercel), the certificate file won't exist
            // TiDB Cloud connections work without custom CA when using sslaccept=strict
            console.warn(`SSL certificate not found at ${sslCa}, using default SSL settings`)
          }
        }
        
        if (sslAccept === 'strict') {
          ssl.rejectUnauthorized = true
        } else {
          ssl.rejectUnauthorized = false
        }
        
        config.ssl = ssl
      }
      
      return config
    } catch (error) {
      if (error instanceof TypeError) {
        throw new Error(`Invalid DATABASE_URL format. Expected: mysql://user:password@host:port/database_name. Got: ${databaseUrl}`)
      }
      throw error
    }
  }
  
  // Fallback to individual environment variables
  const host = process.env.DATABASE_HOST || 'localhost'
  const port = process.env.DATABASE_PORT ? parseInt(process.env.DATABASE_PORT) : 3306
  const user = process.env.DATABASE_USER || 'root'
  const password = process.env.DATABASE_PASSWORD || ''
  const database = process.env.DATABASE_NAME || ''
  
  if (!database) {
    throw new Error(
      'Database configuration is missing!\n\n' +
      'Please create a .env file with one of the following:\n\n' +
      'Option 1 - Connection string:\n' +
      'DATABASE_URL="mysql://user:password@localhost:3306/database_name"\n\n' +
      'Option 2 - Individual variables:\n' +
      'DATABASE_HOST=localhost\n' +
      'DATABASE_PORT=3306\n' +
      'DATABASE_USER=root\n' +
      'DATABASE_PASSWORD=your_password\n' +
      'DATABASE_NAME=your_database_name\n\n' +
      'After creating .env, run: npx prisma migrate dev'
    )
  }
  
  return {
    host,
    port,
    user,
    password,
    database,
    connectionLimit: 5,
  }
}

const adapter = new PrismaMariaDb(getConnectionConfig())

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

