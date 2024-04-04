const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  password: '123',
  host: '172.17.0.2',
  port: 5432, // default Postgres port
  database: 'rinha2023'
});

module.exports = {
  query: (text, params) => pool.query(text, params)
};