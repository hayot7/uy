import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const connectDB = async () => {
  await pool.connect();
  console.log("Postgres connected");

  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      price INTEGER NOT NULL,
      category TEXT NOT NULL,
      description TEXT,
      image TEXT
    );
  `);

  console.log("Products table ready");
};

export default pool;
