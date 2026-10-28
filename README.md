# 🛍️ ShopSphere - Modern Full-Stack E-Commerce Platform

A production-ready, fully responsive e-commerce web application featuring user authentication, live API product catalog, dynamic cart management, order placement, order history, and wishlist persistence.

Built with **React.js 18**, **Vite**, **Express.js**, **MySQL**, and integrated with the **Fake Store API**.

---

## 🚀 Live Demo & Repository
- **Live Deployment:** [Deploy on Vercel](https://vercel.com)
- **GitHub Repository:** [https://github.com/Maha941/shopsphere-ecommerce](https://github.com/Maha941/shopsphere-ecommerce)

---

## 🌟 Key Features

### 1. 🔐 User Authentication (MySQL & Cloud Fallback)
- **Sign Up Page:** Full name, email, password, and confirm password validations.
- **Sign In Page:** Secure authentication against database with password eye toggle.
- **Client & Server Validation:** Clear error/success alerts, password length enforcement.
- **Persistent State:** Logged-in user state saved securely in `localStorage`.
- **Protected Actions:** Unauthenticated users are prompted to log in before checking out or accessing order history.

### 2. 📦 Dynamic Products Listing (Fake Store API)
- Real-time dynamic product fetching from [Fake Store API](https://fakestoreapi.com/products).
- Complete product cards displaying:
  - Product Image with smooth hover zoom
  - Title and category badge
  - Price formatting
  - Star ratings & review counts
  - Direct "Add to Cart" and "Details" buttons
  - Wishlist toggle heart
- Loading spinner animation during network fetch.
- Graceful error alert with retry button if network fails.

### 3. 🔍 Search, Filter & Sorting
- **Live Search:** Instant keyword searching across product titles and descriptions.
- **Category Filter:** Filter by *All Products*, *Men's Clothing*, *Women's Clothing*, *Jewellery*, and *Electronics*.
- **Sorting Options:** Sort products by *Featured*, *Price: Low to High*, *Price: High to Low*, and *Highest Rated*.

### 4. 🛒 Interactive Shopping Cart
- Slide-over drawer panel with smooth backdrop blur.
- Quantity increment (`+`) and decrement (`−`) with instant price recalculation.
- Individual item removal with trash button.
- Dynamic **Free Shipping Progress Bar** (unlocks on orders over $50).
- Subtotal, calculated shipping, and grand total.

### 5. 💳 Checkout & Order Placement
- Shipping form collecting Full Name, Email, Phone, Shipping Address, and City.
- Live order preview with item thumbnails and price breakdown.
- Order submission saved to **MySQL Database (`orders` table)** with auto-increment Order ID (`#ORD-XXXX`).
- Order confirmation screen displaying receipt and delivery details.
- Cart automatically resets after order confirmation.

### 6. 📜 My Orders History & Wishlist
- **My Orders:** View past orders with dates, items, addresses, and status badges.
- **Wishlist:** Heart toggle to save favorite products with "Move to Cart" action.

### 7. 📱 100% Mobile & Tablet Responsive
- **Mobile (<600px):** 2-column native shopping card layout, wrapped full-width search bar, full-screen mobile cart drawer.
- **Tablet (768px - 1024px):** 3-column grid with responsive modal overlays.
- **Desktop (>1024px):** 4-column wide grid with sticky header and rich hover interactions.

---

## 💻 Tech Stack

- **Frontend:** React 18, Vite, Lucide React Icons, Pure CSS3 Design System.
- **Backend:** Node.js, Express.js, CORS.
- **Database:** MySQL (XAMPP / MariaDB) with automated connection pooling and table creation.
- **Data Source:** Fake Store API (`https://fakestoreapi.com/products`).
- **Deployment:** Vercel.

---

## 🛠️ Local Development Setup

### 1. Prerequisites
- Node.js (v18+)
- XAMPP (for MySQL) or any MySQL Server running on port 3306

### 2. Clone the Repository
```bash
git clone https://github.com/Maha941/shopsphere-ecommerce.git
cd shopsphere-ecommerce
```

### 3. Install Dependencies
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

### 4. Start MySQL Database
- Open XAMPP Control Panel and start **MySQL** on port `3306`.
- The Express server automatically creates the database `my_api_db` and tables (`users`, `orders`).

### 5. Run the Servers
```bash
# Terminal 1: Run Express Backend Server (Port 5000)
node index.js

# Terminal 2: Run React Frontend (Port 5173)
cd client
npm run dev
```

Open your browser at **http://localhost:5173**.

---

## 📂 Project Structure
```
shopsphere-ecommerce/
├── client/                     # React Frontend
│   ├── src/
│   │   ├── components/         # Modular UI Components
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProductCard.jsx
│   │   │   ├── ProductDetailsModal.jsx
│   │   │   ├── CartDrawer.jsx
│   │   │   ├── CheckoutModal.jsx
│   │   │   ├── AuthModal.jsx
│   │   │   ├── MyOrdersModal.jsx
│   │   │   └── WishlistModal.jsx
│   │   ├── App.jsx             # Main Application Logic
│   │   ├── index.css           # Responsive Design System
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── database.js                 # MySQL Pool & Auto-Table Initializer
├── index.js                    # Express REST API Server
├── vercel.json                 # Vercel Deployment Configuration
├── package.json                # Root Dependencies & Scripts
└── README.md                   # Documentation
```

---

## 👩‍💻 Author
**Mahjbeen Afzal** - [GitHub @Maha941](https://github.com/Maha941)
