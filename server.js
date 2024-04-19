// app.js
const postgres = require('postgres');
require('dotenv').config();
const express = require('express');
const app = express();
const port = 8000;
const { pool } = require("./config/dbconfig");
const cookieParser = require('cookie-parser');



async function getPgVersion() {
  try {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT version()');
      console.log(result.rows[0].version);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error getting PostgreSQL version:', error);
  }
}

getPgVersion();

app.use(express.json());
app.use(cookieParser());

app.use("/users", require("./routes/userroutes"));
app.use("/course", require("./routes/courseroutes"));
app.use("/enrollment", require("./routes/enrollmentroute"));

app.listen(port, ()=>{
  console.log(`server running on ${port}`);
});