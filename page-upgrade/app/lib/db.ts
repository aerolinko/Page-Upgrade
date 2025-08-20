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
        const query = `SELECT fecha_correcta, SUM(CASE WHEN tipodemovimiento = 'Produccion' AND peso='6kg' THEN cantidad
                                                       WHEN tipodemovimiento = 'Produccion' AND peso='3kg' THEN cantidad*0.5 ELSE 0 END) AS produccion,
                              SUM(CASE WHEN tipodemovimiento = 'Venta' AND peso='6kg' THEN cantidad
                                       WHEN tipodemovimiento = 'Venta' and peso='3kg' THEN cantidad*0.5 ELSE 0 END) AS venta
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

export async function getStock() {
    try{
        const query = `SELECT SUM(Case when tipodemovimiento='Produccion' and peso='6kg' then cantidad when tipodemovimiento='Produccion' and peso='3kg' then cantidad*0.5 else 0 end) - SUM(Case when tipodemovimiento='Venta' and peso='6kg' then cantidad when tipodemovimiento='Venta' and peso='3kg' then cantidad*0.5 else 0 end) as inventario from backup`;
        const [rows] = await pool.execute(query);
        return rows;
    }
    catch (err) {
        console.error('Error executing query:', err);
    }
}
