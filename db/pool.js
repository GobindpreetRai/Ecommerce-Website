// db/pool.js
require("dotenv").config();
const { Pool } = require("pg");

// basic database pool configuration
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT,
});

// test connection
pool.connect()
    .then(() => console.log("PostgreSQL connected successfully."))
    .catch((err) => console.error("PostgreSQL connection error:", err));

module.exports = pool;
