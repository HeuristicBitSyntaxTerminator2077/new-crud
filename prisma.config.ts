// prisma.config.ts
import 'dotenv/config'
import { defineConfig, env } from '@prisma/config'

export default defineConfig({
  // Points to your schema file
  schema: 'prisma/schema.prisma',
  // Defines the database connection here instead
  datasource: {
    url: env('DATABASE_URL'),
  },
})