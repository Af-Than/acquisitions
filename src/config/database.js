import 'dotenv/config';
import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

// If running with Neon Local proxy (e.g. in development Docker container)
if (process.env.NEON_LOCAL === 'true' || process.env.NEON_LOCAL_ENDPOINT) {
  neonConfig.fetchEndpoint = process.env.NEON_LOCAL_ENDPOINT || 'http://neon-local:5432/sql';
  neonConfig.useSecureWebSocket = false;
  neonConfig.poolQueryViaFetch = true;
}

export const sql = neon(process.env.DATABASE_URL);
export const db = drizzle(sql);

