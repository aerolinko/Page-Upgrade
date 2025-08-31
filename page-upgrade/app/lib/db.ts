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
        const query = `SELECT username,nombre FROM usuarios,rol WHERE username = ? AND pass = ? and rol_id = fk_rol`;
        const [rows, fields] = await pool.execute(query, [username, password]);
        if (rows.length > 0) {
            return ({usuario:rows[0].username,rol:rows[0].nombre});
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
        const query = `Select * from (SELECT fecha_correcta, SUM(CASE WHEN tipodemovimiento = 'Produccion' AND peso='3kg' THEN cantidad END) AS produccion,
                              SUM(CASE WHEN tipodemovimiento = 'Venta' AND peso='3kg' THEN cantidad END) AS venta
                       FROM registrocompleto
                       WHERE tipodemovimiento IN ('Produccion', 'Venta') and fecha_correcta between ? and ?
                       GROUP BY fecha_correcta
                       ORDER BY fecha_correcta desc) as T where produccion is not null or venta is not null order by fecha_correcta desc`;
        const [rows] = await pool.execute(query, [fin, inicio]);
        return rows;
    }
    catch (err) {
        console.error('Error executing query:', err);
    }
}

export async function getOnly6kg(inicio: string, fin: string) {
    try{
        const query = `Select * from (SELECT fecha_correcta, SUM(CASE WHEN tipodemovimiento = 'Produccion' AND peso='6kg' THEN cantidad END) AS produccion,
                                             SUM(CASE WHEN tipodemovimiento = 'Venta' AND peso='6kg' THEN cantidad END) AS venta
                                      FROM registrocompleto
                                      WHERE tipodemovimiento IN ('Produccion', 'Venta') and fecha_correcta between ? and ?
                                      GROUP BY fecha_correcta
                                      ORDER BY fecha_correcta desc) as T where produccion is not null or venta is not null order by fecha_correcta desc`;
        const [rows] = await pool.execute(query, [fin, inicio]);
        return rows;
    }
    catch (err) {
        console.error('Error executing query:', err);
    }
}


export async function getAllData() {
    try{
        const query = `SELECT registro_id, fecha_correcta, tipodemovimiento, cantidad, peso,hora, cedula
                       FROM registrocompleto left join distribuidor on cod_distribuidor=distribuidor_id
                       ORDER BY registro_id desc`;
        const [rows] = await pool.execute(query);
        return rows;
    }
    catch (err) {
        console.error('Error executing query:', err);
    }
}

export async function getTypeData(tipo: string) {
    try{
        const query = `SELECT registro_id, fecha_correcta, tipodemovimiento, cantidad, peso,hora
                       FROM registrocompleto WHERE tipodemovimiento=?
                       ORDER BY registro_id desc`;
        const [rows] = await pool.execute(query,[tipo]);
        return rows;
    }
    catch (err) {
        console.error('Error executing query:', err);
    }
}

export async function getSpecialData() {
    try{
        const query = `SELECT registro_id, fecha_correcta, tipodemovimiento, cantidad, peso,hora
                       FROM registrocompleto WHERE tipodemovimiento!='Produccion' AND tipodemovimiento!='Venta'
                       ORDER BY registro_id desc`;
        const [rows] = await pool.execute(query);
        return rows;
    }
    catch (err) {
        console.error('Error executing query:', err);
    }
}

export async function getDistributor(ced:number) {
    try{
        const query = `SELECT *
                       FROM distribuidor WHERE cedula=${ced}`;
        const [rows] = await pool.execute(query);
        return rows;
    }
    catch (err) {
        console.error('Error executing query:', err);
    }
}

export async function guardarDistribuidor(ced:number,firstName:string,secondFirstName:string,secondLastName:string, lastName:string,phoneNumber:string) {
        const query = `INSERT INTO distribuidor (cedula, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido,telefono) 
VALUES (${ced},'${firstName}','${secondFirstName}','${lastName}','${secondLastName}','${phoneNumber}')`;
        const [rows] = await pool.execute(query);
        return rows;
}


export async function guardarVentaDistributor(ced:number,cantidad:number,peso:number) {
        const dist = await getDistributor(ced);
        if (dist.length>0) {
            const cod = dist[0].distribuidor_id;
            await guardarMovimiento('Venta', cantidad, peso, cod);
        } else {
            throw new Error(`distribuidor con cedula ${ced} no encontrado`);
        }
}


export async function getStock() {
    try{
        const query = `SELECT SUM(Case when tipodemovimiento='Produccion' then cantidad else 0 end) - 
                       SUM(Case when tipodemovimiento!='Produccion' then cantidad else 0 end) as inventario from registrocompleto`;
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
                       SUM(Case when tipodemovimiento!='Produccion' and peso='6kg' then cantidad else 0 end) as peso_6kg, SUM(Case when tipodemovimiento='Produccion' and peso='3kg' then cantidad else 0 end) -
                       SUM(Case when tipodemovimiento!='Produccion' and peso='3kg' then cantidad else 0 end) as peso_3kg from registrocompleto`;
        const [rows] = await pool.execute(query);
        return rows;
    }
    catch (err) {
        console.error('Error executing query:', err);
    }
}

export async function guardarMovimiento(tipodemovimiento:string, cantidad:number, peso:number, distribuidor:number|null) {
    try{
        const date = new Date();
        const formattedTime = new Intl.DateTimeFormat('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        }).format(date).replace(/\bAM\b/gi, 'a.m.').replace(/\bPM\b/gi, 'p.m.');
        const formattedDate= format(date,'yyyy-MM-dd');

        const query = `INSERT INTO registrocompleto (tipodemovimiento,cantidad,peso,hora,fecha_correcta,cod_distribuidor) 
                       VALUES (?,?,?,?,?,?)`;
        const [rows,fields] = await pool.execute(query,[tipodemovimiento,cantidad,peso,formattedTime,formattedDate,distribuidor]);
        return rows;
    }
    catch (err) {
        console.error('Error executing query:', err);
    }
}

export async function borrarMovimiento(id:number) {
    try{
        const query = `DELETE from registrocompleto where registro_id = (${id})`;
        const [rows,fields] = await pool.execute(query);
        return rows;
    }
    catch (err) {
        console.error('Error executing query:', err);
    }
}

export async function borrarDistribuidor(id:number) {
    try{
        const query = `DELETE from distribuidor where distribuidor_id = (${id})`;
        const [rows,fields] = await pool.execute(query);
        return rows;
    }
    catch (err) {
        console.error('Error executing query:', err);
    }
}

export async function editarMovimiento(id:number,cantidad:number,tipodemovimiento:string,peso:string) {
    try{
        const query = `UPDATE registrocompleto set cantidad=(${cantidad}), tipodemovimiento=('${tipodemovimiento}'), peso=('${peso}')
                        where registro_id='${id}'`;
        const [rows,fields] = await pool.execute(query);
        return rows;
    }
    catch (err) {
        console.error('Error executing query:', err);
    }
}

export async function editarDistribuidor(id:number,nombre:string,apellido:string,estado:string) {
    try{
        const query = `UPDATE distribuidor set primer_nombre=('${nombre}'), primer_apellido=('${apellido}'), activo=('${estado}')
                        where distribuidor_id='${id}'`;
        const [rows,fields] = await pool.execute(query);
        return rows;
    }
    catch (err) {
        console.error('Error executing query:', err);
    }
}

export async function getDistributorsData(fecha:string,modo:string) {
    try{
        if(modo==='todos'){
            const query = `SELECT primer_nombre, primer_apellido, cedula, SUM(CASE WHEN tipodemovimiento = 'Venta' THEN cantidad END) AS venta
                       FROM registrocompleto, distribuidor
                       WHERE cod_distribuidor=distribuidor_id and YEAR(fecha_correcta) = YEAR('${fecha}') and MONTH(fecha_correcta) = MONTH('${fecha}') 
                       and activo=true
                       GROUP BY MONTH(fecha_correcta), primer_nombre, primer_apellido, cedula
                       Union
                       SELECT 'Tienda Hielo' AS primer_nombre, 'Tía Ana' as primer_apellido, 1000 as cedula, SUM(CASE WHEN tipodemovimiento = 'Venta' THEN cantidad END) AS venta
                       FROM registrocompleto
                       WHERE cod_distribuidor is null and YEAR(fecha_correcta) = YEAR('${fecha}') and MONTH(fecha_correcta)=MONTH('${fecha}')
                       GROUP BY MONTH(fecha_correcta), primer_nombre, primer_apellido, cedula`;
            const [rows] = await pool.execute(query);
            return rows;
        }
        else{
            const query = `SELECT primer_nombre, primer_apellido, cedula, SUM(CASE WHEN tipodemovimiento = 'Venta' THEN cantidad END) AS venta
                       FROM registrocompleto, distribuidor
                       WHERE cod_distribuidor=distribuidor_id and YEAR(fecha_correcta) = YEAR('${fecha}') and MONTH(fecha_correcta) = MONTH('${fecha}') 
                       and activo=true
                       GROUP BY MONTH(fecha_correcta), primer_nombre, primer_apellido, cedula`;
            const [rows] = await pool.execute(query);
            return rows;
        }
    }
    catch (err) {
        console.error('Error executing query:', err);
    }
}

export async function getDistributorsDataByWeight(fecha:string,modo:string, peso:string) {
    try{
        if(modo==='todos'){
            const query = `SELECT primer_nombre, primer_apellido, cedula, SUM(CASE WHEN tipodemovimiento = 'Venta' THEN cantidad END) AS venta
                       FROM registrocompleto, distribuidor
                       WHERE cod_distribuidor=distribuidor_id and YEAR(fecha_correcta) = YEAR('${fecha}') and MONTH(fecha_correcta) = MONTH('${fecha}') 
                       and activo=true AND peso='${peso}'
                       GROUP BY MONTH(fecha_correcta), primer_nombre, primer_apellido, cedula
                       Union
                       SELECT 'Tienda Hielo' AS primer_nombre, 'Tía Ana' as primer_apellido, 1000 as cedula, SUM(CASE WHEN tipodemovimiento = 'Venta' THEN cantidad END) AS venta
                       FROM registrocompleto
                       WHERE cod_distribuidor is null and YEAR(fecha_correcta) = YEAR('${fecha}') and MONTH(fecha_correcta)=MONTH('${fecha}') AND peso='${peso}'
                       GROUP BY MONTH(fecha_correcta), primer_nombre, primer_apellido, cedula`;
            const [rows] = await pool.execute(query);
            return rows;
        }
        else{
            const query = `SELECT primer_nombre, primer_apellido, cedula, SUM(CASE WHEN tipodemovimiento = 'Venta' THEN cantidad END) AS venta
                       FROM registrocompleto, distribuidor
                       WHERE cod_distribuidor=distribuidor_id and YEAR(fecha_correcta) = YEAR('${fecha}') and MONTH(fecha_correcta) = MONTH('${fecha}') 
                       and activo=true AND peso='${peso}'
                       GROUP BY MONTH(fecha_correcta), primer_nombre, primer_apellido, cedula`;
            const [rows] = await pool.execute(query);
            return rows;
        }
    }
    catch (err) {
        console.error('Error executing query:', err);
    }
}

export async function getAllDistData() {
    try{
        const query = `SELECT * FROM distribuidor`;
        const [rows] = await pool.execute(query);
        return rows;
    }
    catch (err) {
        console.error('Error executing query:', err);
    }
}

export async function getDataGoalPerMonth() {
    try{
        const query = `SELECT SUM(cantidad) as venta, meta FROM registrocompleto, meta
                       WHERE tipodemovimiento='Venta' AND MONTH(fecha_correcta)=MONTH(NOW())
                       AND meta_id=(SELECT max(meta_id) from meta) GROUP BY meta`;
        const [rows,fields] = await pool.execute(query);
        return rows;
    }
    catch (err) {
        console.error('Error executing query:', err);
    }
}

