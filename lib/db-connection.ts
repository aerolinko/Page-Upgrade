
import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
}

const pool = mysql.createPool({
  host: dbConfig.host,
  user: dbConfig.user,
  password: dbConfig.password,
  database: dbConfig.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;

export async function query(sql: string, params?: any[]) {
  try {
    const [rows] = await pool.execute(sql, params);
    return { rows };
  } catch (error) {
    console.error("Query error:", error);
    throw error;
  }
}


// MongoDB Connection Example:
/*
import { MongoClient } from 'mongodb';

const uri = 'mongodb://hello:hello@0.0.0.0:27017/dashboard';
const client = new MongoClient(uri);

let dbConnection: any;

export async function connectToDatabase() {
  try {
    await client.connect();
    dbConnection = client.db('dashboard');
    console.log('Connected to MongoDB');
    return dbConnection;
  } catch (error) {
    console.error('Could not connect to MongoDB', error);
    throw error;
  }
}

export function getDb() {
  return dbConnection;
}
*/
