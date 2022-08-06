require('dotenv').config();
const express = require('express')
const app = express()
const port = process.env.PORT || 3000

const mysql = require('mysql2/promise')

const config = {
  connectionLimit: 3,
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  debug: false
};
console.log(config);
var pool = mysql.createPool(config);

pool.on('acquire', function (connection) {
  console.log('Connection %d acquired', connection.threadId);
});

pool.on('connection', function (connection) {
  console.log('Connection %d connection', connection.threadId);
});

pool.on('enqueue', function () {
  console.log('Waiting for available connection slot');
});

pool.on('release', function (connection) {
  console.log('Connection %d released', connection.threadId);
});

app.get('/', async (req, res) => {
  const connection = await pool.getConnection();
  const rows = await connection.query('SELECT CONNECTION_ID()');
  await connection.release();
  res.send(rows[0]);
})

app.get('/end', async (req, res) => {
  try {
    await pool.end();
  } catch (err) {
    console.log(err);
  }
  res.send('OK');
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
