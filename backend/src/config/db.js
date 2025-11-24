import pg from 'pg';
const { Pool } = pg;

// Configuração da Conexão com o Banco
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: false
});

export default pool;
