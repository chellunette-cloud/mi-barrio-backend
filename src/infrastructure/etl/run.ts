import 'dotenv/config';
import { Pool } from 'pg';
import { databaseUrl } from '../../config/database.js';
import { loadBarrio } from './loadBarrio.js';
import { loadEstrato } from './loadEstrato.js';
import { loadLugares } from './loadLugares.js';

async function run(): Promise<void> {
  const pool = new Pool({ connectionString: databaseUrl });
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await loadBarrio(client);
    await loadEstrato(client);
    await loadLugares(client);
    await client.query('COMMIT');
    console.log('ETL Fase 1 y 2 completado en una transacción.');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch((error: unknown) => {
  console.error('ETL fallido:', error);
  process.exit(1);
});
