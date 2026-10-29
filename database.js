const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// XAMPP MySQL Default Settings:
const DB_CONFIG = {
    host: 'localhost',
    user: 'root',
    password: '',
    port: 3306
};

let pool;

async function initMySQL() {
    try {
        // Step 1: Connect to server and create database
        const connection = await mysql.createConnection(DB_CONFIG);
        await connection.query(`CREATE DATABASE IF NOT EXISTS my_api_db;`);
        console.log("✅ 1. XAMPP MySQL mein database 'my_api_db' check/create ho gaya.");
        await connection.end();

        // Step 2: Connection pool
        pool = mysql.createPool({
            ...DB_CONFIG,
            database: 'my_api_db',
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });

        // Step 3: 'users' table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(50) DEFAULT 'Customer',
                status VARCHAR(50) DEFAULT 'Active',
                last_login TIMESTAMP NULL,
                provider VARCHAR(50) DEFAULT 'local',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);

        // Safely add last_login and status if table already existed without them
        try {
            await pool.query(`ALTER TABLE users ADD COLUMN last_login TIMESTAMP NULL;`);
        } catch (e) { /* Column already exists */ }
        try {
            await pool.query(`ALTER TABLE users ADD COLUMN status VARCHAR(50) DEFAULT 'Active';`);
        } catch (e) { /* Column already exists */ }

        // Step 4: 'orders' table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS orders (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                user_name VARCHAR(255) NOT NULL,
                user_email VARCHAR(255) NOT NULL,
                phone VARCHAR(50) NOT NULL,
                shipping_address TEXT NOT NULL,
                total_amount DECIMAL(10, 2) NOT NULL,
                items_json LONGTEXT NOT NULL,
                order_status VARCHAR(50) DEFAULT 'Confirmed',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);

        // Step 5: 'products' table for Admin CRUD
        await pool.query(`
            CREATE TABLE IF NOT EXISTS products (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                price DECIMAL(10, 2) NOT NULL,
                description TEXT,
                category VARCHAR(100) NOT NULL,
                image TEXT,
                rating_rate DECIMAL(3, 2) DEFAULT 4.5,
                rating_count INT DEFAULT 120,
                stock INT DEFAULT 50,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);

        console.log("✅ 2. MySQL Tables ('users', 'orders', 'products') kamyabi se active hain.");

        // Step 6: Seed Admin user if not exists
        const [adminRows] = await pool.query(`SELECT id FROM users WHERE email = 'admin@shopsphere.com'`);
        if (adminRows.length === 0) {
            await pool.query(`
                INSERT INTO users (name, email, password, role, status, provider, last_login)
                VALUES ('Admin Master', 'admin@shopsphere.com', 'admin123', 'Admin', 'Active', 'local', NOW());
            `);
            console.log("👑 3. Default Admin user 'admin@shopsphere.com' (password: admin123) create ho gaya.");
        }

        // Step 7: Seed Products table from productsFallback.json if empty
        const [prodRows] = await pool.query(`SELECT COUNT(*) as count FROM products;`);
        if (prodRows[0].count === 0) {
            const fallbackPath = path.join(__dirname, 'client', 'src', 'productsFallback.json');
            if (fs.existsSync(fallbackPath)) {
                const fileContent = fs.readFileSync(fallbackPath, 'utf8').replace(/^\uFEFF/, '');
                const sampleProducts = JSON.parse(fileContent);
                for (const p of sampleProducts) {
                    await pool.query(`
                        INSERT INTO products (title, price, description, category, image, rating_rate, rating_count, stock)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    `, [
                        p.title,
                        p.price,
                        p.description,
                        p.category,
                        p.image,
                        p.rating?.rate || 4.5,
                        p.rating?.count || 120,
                        Math.floor(20 + Math.random() * 80)
                    ]);
                }
                console.log(`📦 4. ${sampleProducts.length} Products XAMPP MySQL 'products' table mein seed ho gaye!`);
            }
        }
    } catch (error) {
        console.error("❌ MySQL Error:", error.message);
    }
}

initMySQL();

module.exports = {
    query: async (sql, params) => {
        if (!pool) {
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        return pool.query(sql, params);
    }
};
