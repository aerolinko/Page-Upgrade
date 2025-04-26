import pool from "./db-connection"

// Real database implementation
export async function query(sql: string, params: any[] = []) {
    const [results] = await pool.execute(sql, params);
    return results;
}

// Example function to get all users
export async function getInventory():Promise<any> {
    try{
    return await query('SELECT * FROM registrocompleto');
    }
    catch (error){
        console.log(error);
    }
}

export async function getDates():Promise<any> {
    try{
        return await query('SELECT cantidad,tipodemovimiento,fecha FROM registrocompleto');
    }
    catch (error){
        console.log(error);
    }
}

