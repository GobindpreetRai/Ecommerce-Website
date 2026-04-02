// server.js
// basic backend for our Nile / Ecommerce project

require("dotenv").config();
const express = require("express");
const session = require("express-session");
const bcrypt = require("bcrypt");
const pool = require("./db/pool");  // our pg connection

const app = express();
app.use(express.json());

// simple session setup
app.use(
    session({
        secret: process.env.SESSION_SECRET || "keyboardcat",
        resave: false,
        saveUninitialized: false,
        cookie: { maxAge: 1000 * 60 * 60 }, // 1 hour
    })
);


// DATABASE SETUP 


async function initDB() {
    try {
        // users table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL
            );
        `);

        // products table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS products (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                price NUMERIC(10,2) NOT NULL,
                image TEXT
            );
        `);

        // Insert sample data if empty
        const check = await pool.query("SELECT COUNT(*) FROM products;");
        if (check.rows[0].count === "0") {
            console.log("Inserting sample products...");
            await pool.query(`
                INSERT INTO products (name, price, image) VALUES
                ('RTX 4090 GPU', 1599.99, 'photos/4090.png'),
                ('Intel i9 CPU', 529.99, 'photos/i9.png'),
                ('Corsair 32GB RAM', 119.99, 'photos/ram.png'),
                ('1TB SSD Samsung 980', 89.99, 'photos/ssd.png');
            `);
        }

        console.log("Database is ready.");
    } catch (err) {
        console.error("Error initializing DB:", err);
    }
}
initDB();


// USER AUTH ROUTES


app.post("/api/register", async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password)
        return res.status(400).json({ error: "Missing fields" });

    try {
        const hash = await bcrypt.hash(password, 10);
        await pool.query(
            `INSERT INTO users (username, email, password) VALUES ($1,$2,$3)`,
            [username, email, hash]
        );
        res.json({ success: true });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Registration failed" });
    }
});

<<<<<<< HEAD
import express from 'express';
import bcrypt from 'bcrypt';
const router = express.Router();
// Register new user
router.post('/register', async (req, res) => {
const { username, password } = req.body;
try {
// Hash the password before saving — never store plain text passwords
const hash = await bcrypt.hash(password, 10);
const pool = req.app.get('pool');
await pool.query('INSERT INTO webuser_db (username, email, password) VALUES ($1, $2)', [username, hash]);
res.json({ message: 'User registered' });
} catch (err) {
res.status(500).json({ message: 'Error registering user', error: err.message });
}
});

// Authenticate existing user
router.post('/login', async (req, res) => {
const { username, password } = req.body;
try {
const pool = req.app.get('pool');
const result = await pool.query('SELECT * FROM users WHERE username=$1', [username]);
if (result.rowCount === 0) return res.status(401).json({ message: 'Invalid credentials' });
const user = result.rows[0];
const match = await bcrypt.compare(password, user.password);
res.json(match ? { message: 'Login successful' } : { message: 'Invalid credentials' });
} catch (err) {
res.status(500).json({ message: 'Error logging in', error: err.message });
}
});
export default router;

console.log(message);
=======
app.post("/api/login", async (req, res) => {
    const { username, password } = req.body;

    const userRes = await pool.query(
        "SELECT * FROM users WHERE username=$1",
        [username]
    );

    if (userRes.rows.length === 0)
        return res.status(400).json({ error: "User not found" });

    const user = userRes.rows[0];

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: "Wrong password" });

    req.session.userId = user.id;
    res.json({ success: true });
});

app.get("/api/logout", (req, res) => {
    req.session.destroy(() => {
        res.json({ success: true });
    });
});

// get current user
app.get("/api/me", async (req, res) => {
    if (!req.session.userId) return res.json({ user: null });

    const user = await pool.query(
        "SELECT id, username, email FROM users WHERE id=$1",
        [req.session.userId]
    );

    res.json({ user: user.rows[0] });
});


// PRODUCTS ROUTE 


app.get("/api/products", async (req, res) => {
    try {
        const products = await pool.query("SELECT * FROM products;");
        res.json(products.rows);
    } catch (err) {
        console.error("Error fetching products:", err);
        res.status(500).json({ error: "Could not load products" });
    }
});


// CHECKOUT 

app.post("/api/checkout", async (req, res) => {
    if (!req.session.userId)
        return res.status(401).json({ error: "You must be logged in" });

    // this is a fake checkout (no payment gateway)
    res.json({ message: "Order placed successfully!" });
});

// -------------------------------------------------------

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
>>>>>>> ce418e6cfd908fcbe6b60ed64c283cc7f2eea7eb

