import mysql from 'mysql2/promise';

/**
 * MySQL Connection Pool (promise-based).
 * Uses a pool instead of a single connection for better concurrency.
 * All route files import `pool` and call pool.query() / pool.execute().
 */
export const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'flight_reservation',
  port: Number(process.env.MYSQL_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

/**
 * Verify MySQL connectivity on startup.
 */
export const connectDB = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ MySQL connected:', `${process.env.MYSQL_HOST}:${process.env.MYSQL_PORT}/${process.env.MYSQL_DATABASE}`);
    connection.release();
  } catch (err) {
    console.error('❌ MySQL connection failed:', err);
    process.exit(1);
  }
};
