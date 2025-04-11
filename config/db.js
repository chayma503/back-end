const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'qcm',
    password: 'admin',
    port: 5432,
  });
  
module.exports = pool;
