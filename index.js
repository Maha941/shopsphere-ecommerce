const express = require('express');
const path = require('path');
const cors = require('cors');
const db = require('./database'); // XAMPP MySQL Database Module

const app = express();
const PORT = 5000;

// Middlewares
app.use(cors()); // React frontend (Port 5173) ko allow karne ke liye
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Helper: Response se password remove karna (Security)
const sanitizeUser = (user) => {
    if (!user) return null;
    const { password, ...safeUser } = user;
    return safeUser;
};

// =============================================================
// 1. Authentication Endpoints (/api/auth)
// =============================================================

// [POST] Signup: Naya account MySQL mein save karna
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Validation Error: 'name', 'email', aur 'password' teeno zaroori hain!"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password kam az kam 6 characters ka hona chahiye!"
            });
        }

        const cleanEmail = email.trim().toLowerCase();
        const cleanName = name.trim();
        const cleanRole = role ? role.trim() : "User";

        const insertSql = `
            INSERT INTO users (name, email, password, role, provider)
            VALUES (?, ?, ?, ?, 'local')
        `;

        const [result] = await db.query(insertSql, [cleanName, cleanEmail, password, cleanRole]);

        res.status(201).json({
            success: true,
            message: "Account XAMPP MySQL Database mein create ho gaya! Ab aap login kar sakte hain.",
            user: { id: result.insertId, name: cleanName, email: cleanEmail, role: cleanRole }
        });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({
                success: false,
                message: "Yeh email pehle se registered hai! Login karein."
            });
        }
        res.status(500).json({ success: false, message: "MySQL Error: " + err.message });
    }
});

// [POST] Login: XAMPP MySQL se verify karna
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email aur password dono provide karein!"
            });
        }

        const cleanEmail = email.trim().toLowerCase();
        const [rows] = await db.query(`SELECT * FROM users WHERE email = ?`, [cleanEmail]);

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Is email ke sath koi account MySQL database mein nahi mila!"
            });
        }

        const user = rows[0];

        if (user.password !== password) {
            return res.status(401).json({
                success: false,
                message: "Ghalat password! Baraye meherbani sahi password daalein."
            });
        }

        res.status(200).json({
            success: true,
            message: `Khush amdeed ${user.name}! Login kamyab raha.`,
            user: sanitizeUser(user)
        });
    } catch (err) {
        res.status(500).json({ success: false, message: "MySQL Error: " + err.message });
    }
});

// [POST] Social Login: Google, Apple, Facebook
app.post('/api/auth/social-login', async (req, res) => {
    try {
        const { provider, email, name } = req.body;

        if (!provider || !email) {
            return res.status(400).json({
                success: false,
                message: "Validation Error: 'provider' aur 'email' lazmi hain!"
            });
        }

        const cleanEmail = email.trim().toLowerCase();
        const cleanName = name ? name.trim() : `${provider} User`;

        const [rows] = await db.query(`SELECT * FROM users WHERE email = ?`, [cleanEmail]);

        if (rows.length > 0) {
            return res.status(200).json({
                success: true,
                message: `${provider} authentication successful! Khush amdeed wapis, ${rows[0].name}.`,
                isNewUser: false,
                user: sanitizeUser(rows[0])
            });
        } else {
            const insertSql = `
                INSERT INTO users (name, email, password, role, provider)
                VALUES (?, ?, ?, 'Customer', ?)
            `;
            const dummyPassword = `oauth_${provider.toLowerCase()}_token_verified`;

            const [result] = await db.query(insertSql, [cleanName, cleanEmail, dummyPassword, provider]);

            const newUser = {
                id: result.insertId,
                name: cleanName,
                email: cleanEmail,
                role: 'Customer',
                provider: provider
            };

            return res.status(201).json({
                success: true,
                message: `${provider} account XAMPP MySQL Database mein save ho gaya!`,
                isNewUser: true,
                user: newUser
            });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: "MySQL Error: " + err.message });
    }
});

// =============================================================
// 2. Users Management Endpoints (/api/users)
// =============================================================
app.get('/api/users', async (req, res) => {
    try {
        const [rows] = await db.query(`SELECT id, name, email, role, provider, created_at FROM users ORDER BY id ASC`);
        res.status(200).json({
            success: true,
            count: rows.length,
            data: rows
        });
    } catch (err) {
        res.status(500).json({ success: false, message: "MySQL Error: " + err.message });
    }
});

// =============================================================
// 3. E-Commerce Orders Endpoints (/api/orders)
// =============================================================

// [POST] Naya Order MySQL Database mein save karna
app.post('/api/orders', async (req, res) => {
    try {
        const { userId, userName, userEmail, phone, shippingAddress, totalAmount, items } = req.body;

        if (!userName || !userEmail || !phone || !shippingAddress || !items || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Validation Error: Name, Email, Phone, Address aur Cart Items lazmi hain!"
            });
        }

        const itemsJsonString = typeof items === 'string' ? items : JSON.stringify(items);

        const insertOrderSql = `
            INSERT INTO orders (user_id, user_name, user_email, phone, shipping_address, total_amount, items_json)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        const [result] = await db.query(insertOrderSql, [
            userId || null,
            userName.trim(),
            userEmail.trim().toLowerCase(),
            phone.trim(),
            shippingAddress.trim(),
            parseFloat(totalAmount) || 0.00,
            itemsJsonString
        ]);

        res.status(201).json({
            success: true,
            message: "🎉 Order kamyabi se place ho gaya aur MySQL mein save ho chuka hai!",
            orderId: result.insertId,
            orderSummary: {
                id: result.insertId,
                customer: userName,
                email: userEmail,
                total: totalAmount,
                status: 'Confirmed'
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: "Order Save Error: " + err.message });
    }
});

// [GET] User ke orders fetch karna
app.get('/api/orders', async (req, res) => {
    try {
        const { email } = req.query;
        let sql = `SELECT * FROM orders ORDER BY id DESC`;
        let params = [];

        if (email) {
            sql = `SELECT * FROM orders WHERE user_email = ? ORDER BY id DESC`;
            params = [email.trim().toLowerCase()];
        }

        const [rows] = await db.query(sql, params);

        // Parse items_json
        const formattedOrders = rows.map(order => ({
            ...order,
            items: JSON.parse(order.items_json || '[]')
        }));

        res.status(200).json({
            success: true,
            count: formattedOrders.length,
            data: formattedOrders
        });
    } catch (err) {
        res.status(500).json({ success: false, message: "MySQL Error: " + err.message });
    }
});

// Server Start
app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(` Server chal raha hai: http://localhost:${PORT}`);
    console.log(` Database: XAMPP MySQL (my_api_db)`);
    console.log(` React Frontend: http://localhost:5173`);
    console.log(`===============================================`);
});
