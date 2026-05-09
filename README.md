# Catalog Produse — SoftPrim Technology

Aplicație web full-stack pentru afișarea și filtrarea unui catalog de produse electrice.

---

## Tehnologii folosite

| Componentă | Tehnologie |
|---|---|
| Backend | Node.js v24.15.0 + Express |
| Bază de date | MariaDB 10.4 (prin XAMPP) |
| Frontend | HTML + CSS + JavaScript vanilla |

---

## Structura proiectului

```
softprim/
├── backend/
│   ├── index.js          # Serverul Express + endpoint-urile API
│   ├── package.json
│   └── node_modules/
├── frontend/
│   └── index.html        # Interfața web
├── setup.sql             # Schema + datele bazei de date
└── README.md
```

---

## Pași de instalare

### 1. Baza de date

1. Instalează [XAMPP](https://www.apachefriends.org/) și pornește **Apache** și **MySQL** din panoul de control
2. Deschide [localhost/phpmyadmin](http://localhost/phpmyadmin)
3. Creează o bază de date nouă numită `softprim_test` cu colație `utf8mb4_unicode_ci`
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
    database: 'softprim_test'
});
```

Dacă ai o parolă diferită pentru MySQL, modifică câmpul `password`.

---

## Pornire

### 1. Pornește baza de date
Deschide XAMPP Control Panel și apasă **Start** lângă **Apache** și **MySQL**.

### 2. Pornește backend-ul
```bash
cd backend
node index.js
```
Serverul pornește pe **http://localhost:3000**

### 3. Deschide frontend-ul
Deschide fișierul `frontend/index.html` direct în browser (dublu click).

---

## Exemple de apel API

**Toate categoriile:**
```bash
curl http://localhost:3000/api/categories
```

**Toate produsele:**
```bash
curl http://localhost:3000/api/products
```

**Produse filtrate după categorie:**
```bash
curl http://localhost:3000/api/products?category_id=1
```

**Category_id invalid (răspuns 400):**
```bash
curl http://localhost:3000/api/products?category_id=abc
```

---

## Funcționalități implementate

- Afișare catalog complet de produse în format grid
- Filtrare dinamică după categorie prin butoane
- Denumirea categoriei afișată pe fiecare produs (JOIN între `products` și `categories`)
- Prețuri formatate cu 2 zecimale și sufix RON
- Produse cu stoc 0 afișate estompat cu badge „Stoc epuizat"
- Stare de încărcare (skeleton animation)
- Stare de eroare cu buton de reîncercare
- Stare de listă goală
- Design responsive (funcționează pe mobil de la 375px)
- CORS configurat pentru frontend pe origin diferit

---

## Decizii tehnice

- **Node.js + Express** — ales pentru simplitate și pentru că permite folosirea JavaScript atât în backend cât și în frontend
- **Vanilla JS în frontend** — fără framework, pentru a păstra dependențele minime și timpul de setup redus
- **Skeleton loading** în loc de spinner — experiență vizuală mai plăcută la încărcarea inițială
- Validarea `category_id` returnează **400 Bad Request** pentru orice valoare non-numerică sau negativă, conform cerințelor
