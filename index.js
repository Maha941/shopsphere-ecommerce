const express = require('express');
const path = require('path');
const cors = require('cors');
const db = require('./database'); // XAMPP MySQL Database Module

const app = express();
const PORT = 5000;

// Middlewares
app.use(cors()); // Allow frontend storefront (5173) and admin panel (5174)
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
        const cleanRole = role ? role.trim() : "Customer";

        const insertSql = `
            INSERT INTO users (name, email, password, role, status, last_login, provider)
            VALUES (?, ?, ?, ?, 'Active', NOW(), 'local')
        `;

        const [result] = await db.query(insertSql, [cleanName, cleanEmail, password, cleanRole]);

        res.status(201).json({
            success: true,
            message: "Account XAMPP MySQL Database mein create ho gaya! Ab aap login kar sakte hain.",
            user: { id: result.insertId, name: cleanName, email: cleanEmail, role: cleanRole, status: 'Active' }
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

// [POST] Login: XAMPP MySQL se verify karna aur last_login update karna
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

        if (user.status === 'Suspended') {
            return res.status(403).json({
                success: false,
                message: "Aapka account admin ne suspend kar diya hai. Admin se rabta karein."
            });
        }

        // Record Last Login timestamp
        await db.query(`UPDATE users SET last_login = NOW() WHERE id = ?`, [user.id]);
        user.last_login = new Date();

        res.status(200).json({
            success: true,
            message: `Khush amdeed ${user.name}! Login kamyab raha.`,
            user: sanitizeUser(user)
        });
    } catch (err) {
        res.status(500).json({ success: false, message: "MySQL Error: " + err.message });
    }
});

// [POST] Social Login
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
            await db.query(`UPDATE users SET last_login = NOW() WHERE id = ?`, [rows[0].id]);
            return res.status(200).json({
                success: true,
                message: `${provider} login successful! Khush amdeed wapis, ${rows[0].name}.`,
                isNewUser: false,
                user: sanitizeUser(rows[0])
            });
        } else {
            const insertSql = `
                INSERT INTO users (name, email, password, role, status, last_login, provider)
                VALUES (?, ?, ?, 'Customer', 'Active', NOW(), ?)
            `;
            const dummyPassword = `oauth_${provider.toLowerCase()}_token_verified`;

            const [result] = await db.query(insertSql, [cleanName, cleanEmail, dummyPassword, provider]);

            const newUser = {
                id: result.insertId,
                name: cleanName,
                email: cleanEmail,
                role: 'Customer',
                status: 'Active',
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
// 2. Customer Storefront Endpoints (/api/users, /api/orders)
// =============================================================

app.get('/api/users', async (req, res) => {
    try {
        const [rows] = await db.query(`SELECT id, name, email, role, status, last_login, created_at FROM users ORDER BY id ASC`);
        res.status(200).json({
            success: true,
            count: rows.length,
            data: rows
        });
    } catch (err) {
        res.status(500).json({ success: false, message: "MySQL Error: " + err.message });
    }
});

// [POST] Order save karna
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

// [GET] Orders fetch karna
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

// =============================================================
// 3. ADMIN PANEL API ENDPOINTS (/api/admin/...)
// =============================================================

// [GET] Admin Stats Overview (Revenue, Orders, Customers, Products)
app.get('/api/admin/stats', async (req, res) => {
    try {
        const [[orderStats]] = await db.query(`
            SELECT 
                COUNT(*) as total_orders, 
                COALESCE(SUM(total_amount), 0) as total_revenue 
            FROM orders
        `);
        const [[userStats]] = await db.query(`SELECT COUNT(*) as total_users FROM users WHERE role != 'Admin'`);
        const [[prodStats]] = await db.query(`
            SELECT 
                COUNT(*) as total_products,
                COALESCE(SUM(CASE WHEN stock <= 15 THEN 1 ELSE 0 END), 0) as low_stock
            FROM products
        `);

        res.status(200).json({
            success: true,
            stats: {
                totalRevenue: parseFloat(orderStats.total_revenue || 0).toFixed(2),
                totalOrders: orderStats.total_orders || 0,
                totalCustomers: userStats.total_users || 0,
                totalProducts: prodStats.total_products || 0,
                lowStockCount: prodStats.low_stock || 0
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: "Admin Stats Error: " + err.message });
    }
});

// [GET] Admin: Saari Products fetch karna
app.get('/api/admin/products', async (req, res) => {
    try {
        const [rows] = await db.query(`SELECT * FROM products ORDER BY id DESC`);
        res.status(200).json({
            success: true,
            count: rows.length,
            data: rows
        });
    } catch (err) {
        res.status(500).json({ success: false, message: "Fetch Products Error: " + err.message });
    }
});

// [POST] Admin: Nayi Product Add karna
app.post('/api/admin/products', async (req, res) => {
    try {
        const { title, price, description, category, image, stock } = req.body;

        if (!title || !price || !category) {
            return res.status(400).json({
                success: false,
                message: "Title, Price, aur Category lazmi hain!"
            });
        }

        const insertSql = `
            INSERT INTO products (title, price, description, category, image, rating_rate, rating_count, stock)
            VALUES (?, ?, ?, ?, ?, 4.5, 1, ?)
        `;

        const [result] = await db.query(insertSql, [
            title.trim(),
            parseFloat(price) || 0.00,
            description || '',
            category.trim(),
            image || 'https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg',
            parseInt(stock) || 50
        ]);

        res.status(201).json({
            success: true,
            message: `Product "${title}" kamyabi se add ho gayi!`,
            productId: result.insertId,
            product: { id: result.insertId, title, price, description, category, image, stock: stock || 50 }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: "Add Product Error: " + err.message });
    }
});

// [PUT] Admin: Product Update karna
app.put('/api/admin/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, price, description, category, image, stock } = req.body;

        const updateSql = `
            UPDATE products 
            SET title = COALESCE(?, title),
                price = COALESCE(?, price),
                description = COALESCE(?, description),
                category = COALESCE(?, category),
                image = COALESCE(?, image),
                stock = COALESCE(?, stock)
            WHERE id = ?
        `;

        const [result] = await db.query(updateSql, [
            title ? title.trim() : null,
            price ? parseFloat(price) : null,
            description ? description.trim() : null,
            category ? category.trim() : null,
            image ? image.trim() : null,
            stock !== undefined ? parseInt(stock) : null,
            id
        ]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Product nahi mili!" });
        }

        res.status(200).json({
            success: true,
            message: `Product #${id} kamyabi se update ho gayi!`
        });
    } catch (err) {
        res.status(500).json({ success: false, message: "Update Product Error: " + err.message });
    }
});

// [DELETE] Admin: Product Delete karna
app.delete('/api/admin/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await db.query(`DELETE FROM products WHERE id = ?`, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Product nahi mili!" });
        }

        res.status(200).json({
            success: true,
            message: `Product #${id} kamyabi se delete ho gayi!`
        });
    } catch (err) {
        res.status(500).json({ success: false, message: "Delete Product Error: " + err.message });
    }
});

// [GET] Admin: Saare Customers / Users with Details & Total Spent
app.get('/api/admin/users', async (req, res) => {
    try {
        const query = `
            SELECT 
                u.id, 
                u.name, 
                u.email, 
                u.role, 
                u.status, 
                u.provider, 
                u.last_login, 
                u.created_at,
                COUNT(o.id) as orders_count,
                COALESCE(SUM(o.total_amount), 0) as total_spent
            FROM users u
            LEFT JOIN orders o ON LOWER(u.email) = LOWER(o.user_email)
            GROUP BY u.id
            ORDER BY u.id DESC
        `;
        const [rows] = await db.query(query);

        res.status(200).json({
            success: true,
            count: rows.length,
            data: rows
        });
    } catch (err) {
        res.status(500).json({ success: false, message: "Admin Users Error: " + err.message });
    }
});

// [POST] Admin: Naya User/Customer Add karna
app.post('/api/admin/users', async (req, res) => {
    try {
        const { name, email, password, role, status } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: "Name, email, aur password lazmi hain!" });
        }

        const insertSql = `
            INSERT INTO users (name, email, password, role, status, provider, last_login)
            VALUES (?, ?, ?, ?, ?, 'local', NULL)
        `;

        const [result] = await db.query(insertSql, [
            name.trim(),
            email.trim().toLowerCase(),
            password,
            role || 'Customer',
            status || 'Active'
        ]);

        res.status(201).json({
            success: true,
            message: `User "${name}" kamyabi se add ho gaya!`,
            userId: result.insertId
        });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, message: "Yeh email pehle se exist karti hai!" });
        }
        res.status(500).json({ success: false, message: "Add User Error: " + err.message });
    }
});

// [PUT] Admin: User Status / Role / Details Update karna
app.put('/api/admin/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, role, status } = req.body;

        const updateSql = `
            UPDATE users 
            SET name = COALESCE(?, name),
                email = COALESCE(?, email),
                role = COALESCE(?, role),
                status = COALESCE(?, status)
            WHERE id = ?
        `;

        const [result] = await db.query(updateSql, [
            name ? name.trim() : null,
            email ? email.trim().toLowerCase() : null,
            role ? role.trim() : null,
            status ? status.trim() : null,
            id
        ]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "User nahi mila!" });
        }

        res.status(200).json({
            success: true,
            message: `User #${id} ki details update ho gayin!`
        });
    } catch (err) {
        res.status(500).json({ success: false, message: "Update User Error: " + err.message });
    }
});

// [DELETE] Admin: User Delete karna
app.delete('/api/admin/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await db.query(`DELETE FROM users WHERE id = ?`, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "User nahi mila!" });
        }

        res.status(200).json({
            success: true,
            message: `User #${id} delete ho gaya!`
        });
    } catch (err) {
        res.status(500).json({ success: false, message: "Delete User Error: " + err.message });
    }
});

// [POST] Admin: "Login As User" (Impersonation session)
app.post('/api/admin/login-as/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.query(`SELECT id, name, email, role, status FROM users WHERE id = ?`, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: "User nahi mila!" });
        }

        const impersonatedUser = rows[0];

        // Record impersonation login
        await db.query(`UPDATE users SET last_login = NOW() WHERE id = ?`, [id]);

        res.status(200).json({
            success: true,
            message: `Aap ab "${impersonatedUser.name}" ke account mein login ho rahe hain!`,
            user: impersonatedUser,
            storefrontUrl: `http://localhost:5173/?impersonate=${encodeURIComponent(JSON.stringify(impersonatedUser))}`
        });
    } catch (err) {
        res.status(500).json({ success: false, message: "Impersonate Error: " + err.message });
    }
});

// [GET] Admin: Saare Orders with full details
app.get('/api/admin/orders', async (req, res) => {
    try {
        const [rows] = await db.query(`SELECT * FROM orders ORDER BY id DESC`);
        const formatted = rows.map(o => ({
            ...o,
            items: JSON.parse(o.items_json || '[]')
        }));

        res.status(200).json({
            success: true,
            count: formatted.length,
            data: formatted
        });
    } catch (err) {
        res.status(500).json({ success: false, message: "Admin Orders Error: " + err.message });
    }
});

// [PUT] Admin: Order Status Update karna (Confirmed -> Shipped -> Delivered)
app.put('/api/admin/orders/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ success: false, message: "Status zaroori hai!" });
        }

        const [result] = await db.query(`UPDATE orders SET order_status = ? WHERE id = ?`, [status, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Order nahi mila!" });
        }

        res.status(200).json({
            success: true,
            message: `Order #${id} ka status badal kar "${status}" kar diya gaya!`
        });
    } catch (err) {
        res.status(500).json({ success: false, message: "Update Order Status Error: " + err.message });
    }
});

// =============================================================
// Server Start
// =============================================================
app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(` Server chal raha hai: http://localhost:${PORT}`);
    console.log(` Database: XAMPP MySQL (my_api_db)`);
    console.log(` Customer Storefront: http://localhost:5173`);
    console.log(` Admin Portal:        http://localhost:5174`);
    console.log(`===============================================`);
});
