const mysql = require('mysql2/promise');

// XAMPP MySQL Default Settings:
// Host: localhost | Port: 3306 | User: root | Password: "" (blank)
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
                role VARCHAR(50) DEFAULT 'User',
                provider VARCHAR(50) DEFAULT 'local',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);

        // Step 4: 'orders' table for E-Commerce Checkout
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
        console.log("✅ 2. MySQL Tables ('users' aur 'orders') kamyabi se ban gayi hain.");

        // Step 5: Check sample users
        const [rows] = await pool.query(`SELECT COUNT(*) as count FROM users;`);
        if (rows[0].count === 0) {
            const insertSql = `INSERT INTO users (name, email, password, role, provider) VALUES ?`;
            const sampleValues = [
                ['Ali Khan', 'ali@example.com', 'password123', 'Developer', 'local'],
                ['Sara Ahmed', 'sara@example.com', 'password123', 'Designer', 'local'],
                ['Usman Tariq', 'usman@example.com', 'password123', 'Manager', 'local'],
                ['Mahjbeen Afzal', 'maharajput941@gmail.com', 'password123', 'Lead Developer', 'local']
            ];
            await pool.query(insertSql, [sampleValues]);
            console.log("✅ 3. Sample users XAMPP MySQL mein save ho gaye.");
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
