const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT,
});

export async function getUser(username: string, password: string) {
    try {
        const query = `SELECT * FROM nueva_tabla WHERE cosa = ? AND pass = ?`;
        const [rows, fields] = await pool.execute(query, [username, password]);
        if (rows.length > 0) {
            return rows[0].cosa;
        }
        return null;
    } catch (err) {
        console.error('Error executing query:', err);
        throw err;
    }
}