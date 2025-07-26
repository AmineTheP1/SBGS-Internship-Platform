import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function getUsers() {
  const res = await pool.query('SELECT * FROM users');
  return res.rows;
}