import { createPool } from 'mysql2/promise';

let pool = null;

async function criarPoolDeConexoes() {
    if (!pool) {
        pool = createPool({
            host: process.env.HOST,
            port: process.env.PORT_MYSQL,
            database: process.env.DATABASE,
            user: process.env.USER,
            password: process.env.PASSWORD,
            waitForConnections: true,
            connectionLimit: 100,
            multipleStatements: true
        });
    }
    return pool;
}

async function obterConexaoDoPool() {
    const pool = await criarPoolDeConexoes();
    return pool.getConnection();
}

export default obterConexaoDoPool;