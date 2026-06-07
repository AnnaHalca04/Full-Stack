# Product Catalog Full-Stack App

API REST funcțional pentru un sistem de catalog produse și plasare comenzi, conectat la MySQL.

---

## Tehnologii folosite

| Componentă | Tehnologie |
|---|---|
| Backend | Node.js v24.15.0 + Express |
| Bază de date | MariaDB 10.4 (prin XAMPP) |
| Format API | JSON, encoding UTF-8 |

---

## Structura proiectului

```
backend/
├── index.js          # Serverul Express + toate endpoint-urile
├── package.json
├── package-lock.json
└── node_modules/
setup.sql             # Schema + datele bazei de date
README.md
```

---

## Pași de instalare

### 1. Baza de date

1. Instalează [XAMPP](https://www.apachefriends.org/) și pornește **Apache** și **MySQL** din panoul de control
2. Deschide [localhost/phpmyadmin](http://localhost/phpmyadmin)
3. Creează o bază de date nouă numită `product_catalog_db` cu colație `utf8mb4_unicode_ci`
4. Selectează baza de date, mergi la tab-ul **Import** și importă fișierul `setup.sql`

### 2. Backend

```bash
cd backend
npm install
```

---

## Configurare

Conexiunea la baza de date se află în `backend/index.js`:

```javascript
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',           // implicit gol în XAMPP
    database: 'product_catalog_db'
});
```

Dacă ai o parolă diferită pentru MySQL, modifică câmpul `password`.

---

## Pornire server

```bash
cd backend
node index.js
```

Serverul pornește pe **http://localhost:3000**

---

## Endpoint-uri

### GET /api/products

Returnează toate produsele cu denumirea categoriei. Suportă filtrare opțională după `category_id`.

```bash
# Toate produsele
curl http://localhost:3000/api/products

# Produse filtrate după categorie
curl http://localhost:3000/api/products?category_id=1

# Răspuns așteptat — 200 OK:
[
  {
    "id": 1,
    "name": "Siguranță automată 1P+N 16A curba C",
    "price": "45.50",
    "stock": 120,
    "category_id": 1,
    "category_name": "Întrerupătoare automate"
  }
]

# category_id invalid — 400 Bad Request:
curl http://localhost:3000/api/products?category_id=abc
{ "error": "category_id invalid" }
```

---

### GET /api/products/:id

Returnează detaliile unui singur produs după id.

```bash
# Produs existent
curl http://localhost:3000/api/products/1

# Răspuns așteptat — 200 OK:
{
  "id": 1,
  "name": "Siguranță automată 1P+N 16A curba C",
  "price": "45.50",
  "stock": 120,
  "category_id": 1,
  "category_name": "Întrerupătoare automate",
  "created_at": "2026-05-07T11:02:30.000Z"
}

# Produs inexistent — 404 Not Found:
curl http://localhost:3000/api/products/999
{ "error": "Produsul nu există" }

# Id invalid — 400 Bad Request:
curl http://localhost:3000/api/products/abc
{ "error": "id invalid" }
```

---

### POST /api/orders

Creează o comandă nouă și scade cantitatea din stocul produsului. Operația se face într-o tranzacție SQL — dacă oricare dintre pași eșuează, stocul rămâne neschimbat.

Totalul comenzii se calculează pe server (`price × quantity`), nu se preia din cerere.

```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{"product_id": 1, "quantity": 2, "customer_email": "client@exemplu.ro"}'

# Răspuns așteptat — 201 Created:
{
  "order_id": 1,
  "product_id": 1,
  "quantity": 2,
  "total": 91,
  "created_at": "2026-05-09T17:57:01.000Z"
}

# Produs inexistent — 404 Not Found
# Stoc insuficient — 400 Bad Request
# Email invalid — 400 Bad Request
```

---

## Decizii tehnice

- **Node.js + Express** — ales pentru simplitate și setup rapid
- **Tranzacție SQL** (`beginTransaction` / `commit` / `rollback`) pentru atomicitate la plasarea comenzilor — dacă inserarea în `orders` sau actualizarea stocului eșuează, întreaga operație este anulată
- Validările sunt făcute înainte de orice query la baza de date, pentru a evita operații inutile
