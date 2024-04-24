const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  password: '123',
  host: 'db',
  port: 5432, // default Postgres port
  database: 'rinha2023'
});

module.exports = {
  query: (text, params) => pool.query(text, params)
};