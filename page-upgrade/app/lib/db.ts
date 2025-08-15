const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    database: 'sys',
    password: 'prueba123',
    port: 3306,
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