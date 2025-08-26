import {format} from "date-fns";

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
        const query = `SELECT * FROM usuarios WHERE username = ? AND pass = ?`;
        const [rows, fields] = await pool.execute(query, [username, password]);
        if (rows.length > 0) {
            console.log(rows);
            return rows[0].username;
        }
        return null;
    } catch (err) {
        console.error('Error executing query:', err);
        throw err;
    }
}

export async function getData(inicio: string, fin: string) {
    try{
        const query = `SELECT fecha_correcta, SUM(CASE WHEN tipodemovimiento = 'Produccion' THEN cantidad
                        ELSE 0 END) AS produccion,
                       SUM(CASE WHEN tipodemovimiento = 'Venta' THEN cantidad
                       ELSE 0 END) AS venta
                       FROM registrocompleto
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

export async function getOnly3kg(inicio: string, fin: string) {
    try{
        const query = `SELECT fecha_correcta, SUM(CASE WHEN tipodemovimiento = 'Produccion' AND peso='3kg' THEN cantidad
                                                       ELSE 0 END) AS produccion,
                              SUM(CASE WHEN tipodemovimiento = 'Venta' AND peso='3kg' THEN cantidad
                                       ELSE 0 END) AS venta
                       FROM registrocompleto
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

export async function getOnly6kg(inicio: string, fin: string) {
    try{
        const query = `SELECT fecha_correcta, SUM(CASE WHEN tipodemovimiento = 'Produccion' AND peso='6kg' THEN cantidad
                       ELSE 0 END) AS produccion,
                       SUM(CASE WHEN tipodemovimiento = 'Venta' AND peso='6kg' THEN cantidad
                       ELSE 0 END) AS venta
                       FROM registrocompleto
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
        const query = `SELECT registro_id, fecha_correcta, tipodemovimiento, cantidad, peso,hora
                       FROM registrocompleto
                       ORDER BY registro_id desc`;
        const [rows] = await pool.execute(query);
        return rows;
    }
    catch (err) {
        console.error('Error executing query:', err);
    }
}

export async function getStock() {
    try{
        const query = `SELECT SUM(Case when tipodemovimiento='Produccion' then cantidad else 0 end) - 
                       SUM(Case when tipodemovimiento='Venta' then cantidad else 0 end) as inventario from registrocompleto`;
        const [rows] = await pool.execute(query);
        return rows;
    }
    catch (err) {
        console.error('Error executing query:', err);
    }
}

export async function getStockComponents() {
    try{
        const query = `SELECT SUM(Case when tipodemovimiento='Produccion' and peso='6kg' then cantidad else 0 end) - 
                       SUM(Case when tipodemovimiento='Venta' and peso='6kg' then cantidad else 0 end) as peso_6kg, SUM(Case when tipodemovimiento='Produccion' and peso='3kg' then cantidad else 0 end) -
                       SUM(Case when tipodemovimiento='Venta' and peso='3kg' then cantidad else 0 end) as peso_3kg from registrocompleto`;
        const [rows] = await pool.execute(query);
        return rows;
    }
    catch (err) {
        console.error('Error executing query:', err);
    }
}

export async function guardarProduccion(tipodemovimiento:string, cantidad:number, peso:number) {
    try{
        const date = new Date();
        const formattedTime = new Intl.DateTimeFormat('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        }).format(date).replace(/\bAM\b/gi, 'a.m.').replace(/\bPM\b/gi, 'p.m.');
        const formattedDate= format(date,'yyyy-MM-dd');

        const query = `INSERT INTO registrocompleto (tipodemovimiento,cantidad,peso,hora,fecha_correcta) 
                       VALUES (?,?,?,?,?)`;
        const [rows,fields] = await pool.execute(query,[tipodemovimiento,cantidad,peso,formattedTime,formattedDate]);
        return rows;
    }
    catch (err) {
        console.error('Error executing query:', err);
    }
}