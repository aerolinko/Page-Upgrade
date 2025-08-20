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

export async function getData(inicio: string, fin: string) {
    try{
        const query = `SELECT fecha_correcta, SUM(CASE WHEN tipodemovimiento = 'Produccion' THEN cantidad ELSE 0 END) AS produccion,
                              SUM(CASE WHEN tipodemovimiento = 'Venta' THEN cantidad ELSE 0 END) AS venta
                       FROM backup
                       WHERE tipodemovimiento IN ('Produccion', 'Venta') and fecha_correcta between ? and ?
                       GROUP BY fecha_correcta
                       ORDER BY fecha_correcta desc`;
        const [rows] = await pool.execute(query, [fin, inicio]);
        return rows;
    }
    catch (err) {
        console.error('Error executing query:', err);
    }
}

export async function getAllData() {
    try{
        const query = `SELECT fecha_correcta, tipodemovimiento, cantidad, peso
                       FROM backup
                       ORDER BY fecha_correcta desc`;
        const [rows] = await pool.execute(query);
        return rows;
    }
    catch (err) {
        console.error('Error executing query:', err);
    }
}
