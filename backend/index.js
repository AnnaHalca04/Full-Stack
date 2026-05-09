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

// Endpoint 1: GET /api/products
app.get('/api/products', (req, res) => {
    const categoryId = req.query.category_id;

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

// Endpoint 2: GET /api/products/:id
app.get('/api/products/:id', (req, res) => {
    const id = req.params.id;

    if (isNaN(id) || parseInt(id) <= 0) {
        res.status(400).json({ error: 'id invalid' });
        return;
    }

    const sql = `
        SELECT p.id, p.name, p.price, p.stock, p.category_id, 
               c.name AS category_name, p.created_at
        FROM products p
        JOIN categories c ON p.category_id = c.id
        WHERE p.id = ?
    `;

    db.query(sql, [parseInt(id)], (err, results) => {
        if (err) {
            res.status(500).json({ error: 'Eroare server' });
            return;
        }
        if (results.length === 0) {
            res.status(404).json({ error: 'Produsul nu există' });
            return;
        }
        res.json(results[0]);
    });
});

// Endpoint 3: POST /api/orders
app.post('/api/orders', (req, res) => {
    const { product_id, quantity, customer_email } = req.body;

    // Validări
    if (!product_id || isNaN(product_id) || parseInt(product_id) <= 0) {
        res.status(400).json({ error: 'product_id invalid' });
        return;
    }

    if (!quantity || isNaN(quantity) || parseInt(quantity) <= 0) {
        res.status(400).json({ error: 'quantity trebuie să fie un număr pozitiv' });
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!customer_email || !emailRegex.test(customer_email) || customer_email.length > 150) {
        res.status(400).json({ error: 'customer_email invalid' });
        return;
    }

    // Verifică dacă produsul există și are stoc suficient
    db.query('SELECT * FROM products WHERE id = ?', [parseInt(product_id)], (err, results) => {
        if (err) {
            res.status(500).json({ error: 'Eroare server' });
            return;
        }

        if (results.length === 0) {
            res.status(404).json({ error: 'Produsul nu există' });
            return;
        }

        const product = results[0];

        if (parseInt(quantity) > product.stock) {
            res.status(400).json({ error: `Stoc insuficient. Stoc disponibil: ${product.stock}` });
            return;
        }

        const total = parseFloat(product.price) * parseInt(quantity);

        // Tranzacție: creează comanda + scade stocul
        db.beginTransaction((err) => {
            if (err) {
                res.status(500).json({ error: 'Eroare server' });
                return;
            }

            const insertOrder = `
                INSERT INTO orders (product_id, quantity, customer_email, total)
                VALUES (?, ?, ?, ?)
            `;

            db.query(insertOrder, [parseInt(product_id), parseInt(quantity), customer_email, total], (err, orderResult) => {
                if (err) {
                    return db.rollback(() => {
                        res.status(500).json({ error: 'Eroare la crearea comenzii' });
                    });
                }

                const updateStock = 'UPDATE products SET stock = stock - ? WHERE id = ?';

                db.query(updateStock, [parseInt(quantity), parseInt(product_id)], (err) => {
                    if (err) {
                        return db.rollback(() => {
                            res.status(500).json({ error: 'Eroare la actualizarea stocului' });
                        });
                    }

                    db.commit((err) => {
                        if (err) {
                            return db.rollback(() => {
                                res.status(500).json({ error: 'Eroare la finalizarea comenzii' });
                            });
                        }

                        // Returnează comanda creată
                        db.query('SELECT * FROM orders WHERE id = ?', [orderResult.insertId], (err, rows) => {
                            if (err) {
                                res.status(500).json({ error: 'Eroare server' });
                                return;
                            }
                            res.status(201).json({
                                order_id: rows[0].id,
                                product_id: rows[0].product_id,
                                quantity: rows[0].quantity,
                                total: parseFloat(rows[0].total),
                                created_at: rows[0].created_at
                            });
                        });
                    });
                });
            });
        });
    });
});

// Pornire server
app.listen(3000, () => {
    console.log('Serverul rulează pe http://localhost:3000');
});