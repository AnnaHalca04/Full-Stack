const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Conexiunea la baza de date
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'softprim_test'
});

db.connect((err) => {
    if (err) {
        console.log('Eroare la conectare:', err);
        return;
    }
    console.log('Conectat la MySQL!');
});

// Endpoint 1: GET /api/categories
app.get('/api/categories', (req, res) => {
    const sql = 'SELECT * FROM categories ORDER BY name ASC';
    db.query(sql, (err, results) => {
        if (err) {
            res.status(500).json({ error: 'Eroare server' });
            return;
        }
        res.json(results);
    });
});

// Endpoint 2: GET /api/products
app.get('/api/products', (req, res) => {
    const categoryId = req.query.category_id;

    // Validare category_id dacă există
    if (categoryId !== undefined) {
        if (isNaN(categoryId) || parseInt(categoryId) <= 0) {
            res.status(400).json({ error: 'category_id invalid' });
            return;
        }
    }

    let sql = `
        SELECT p.id, p.name, p.price, p.stock, p.category_id, c.name AS category_name
        FROM products p
        JOIN categories c ON p.category_id = c.id
    `;

    const params = [];
    if (categoryId !== undefined) {
        sql += ' WHERE p.category_id = ?';
        params.push(parseInt(categoryId));
    }

    db.query(sql, params, (err, results) => {
        if (err) {
            res.status(500).json({ error: 'Eroare server' });
            return;
        }
        res.json(results);
    });
});

// Pornire server
app.listen(3000, () => {
    console.log('Serverul rulează pe http://localhost:3000');
});