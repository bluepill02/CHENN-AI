import { Client, Pool, PoolConfig } from 'pg';

// Global connection pools to avoid connection limits in serverless environments
declare global {
  var __pgPool: Pool | undefined;
  var __pgClient: Client | undefined;
}

// Connection configuration
const connectionConfig: PoolConfig = {
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false
  },
  max: 10, // Maximum connections in pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
};

// Get connection pool for multiple queries
export async function getPool(): Promise<Pool> {
  if (!global.__pgPool) {
    global.__pgPool = new Pool(connectionConfig);
    
    // Test connection
    try {
      const client = await global.__pgPool.connect();
      console.log('✅ PostgreSQL pool connected successfully');
      client.release();
    } catch (error) {
      console.error('❌ PostgreSQL pool connection failed:', error);
      throw error;
    }
  }

  return global.__pgPool;
}

// Get single client for transactions
export async function getClient(): Promise<Client> {
  if (!global.__pgClient) {
    global.__pgClient = new Client(connectionConfig);
    await global.__pgClient.connect();
    console.log('✅ PostgreSQL client connected successfully');
  }

  return global.__pgClient;
}

// Execute a query with connection pooling
export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
  const pool = await getPool();
  const client = await pool.connect();
  
  try {
    const result = await client.query(text, params);
    return result.rows;
  } catch (error) {
    console.error('Database query error:', { text, params, error });
    throw error;
  } finally {
    client.release();
  }
}

// Execute a single query and return one row
export async function queryOne<T = any>(text: string, params?: any[]): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] || null;
}

// Execute multiple queries in a transaction
export async function transaction<T>(
  queries: Array<{ text: string; params?: any[] }>
): Promise<T[]> {
  const client = await getClient();
  
  try {
    await client.query('BEGIN');
    
    const results: any[] = [];
    for (const q of queries) {
      const result = await client.query(q.text, q.params);
      results.push(result.rows);
    }
    
    await client.query('COMMIT');
    return results as T[];
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Transaction error:', error);
    throw error;
  }
}

// Close all connections (for cleanup)
export async function closeConnections(): Promise<void> {
  if (global.__pgPool) {
    await global.__pgPool.end();
    global.__pgPool = undefined;
  }
  
  if (global.__pgClient) {
    await global.__pgClient.end();
    global.__pgClient = undefined;
  }
  
  console.log('PostgreSQL connections closed');
}