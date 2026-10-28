import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ProductCard from './components/ProductCard';
import ProductDetailsModal from './components/ProductDetailsModal';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import AuthModal from './components/AuthModal';
import MyOrdersModal from './components/MyOrdersModal';
import WishlistModal from './components/WishlistModal';
import fallbackProducts from './productsFallback.json';
import { ShoppingBag, RefreshCw, AlertCircle, ArrowUpDown } from 'lucide-react';

export default function App() {
  // 1. API Products State
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 2. Filters & Sort State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy, setSortBy] = useState('default');

  // 3. Cart State (Persistent in localStorage)
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('shopsphere_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // 4. Wishlist State (Persistent in localStorage)
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('shopsphere_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // 5. Auth State (Persistent in localStorage)
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('shopsphere_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // 6. Modals Open/Close States
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  // 7. Toast Alerts State
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Sync Cart to LocalStorage
  useEffect(() => {
    localStorage.setItem('shopsphere_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Sync Wishlist to LocalStorage
  useEffect(() => {
    localStorage.setItem('shopsphere_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // =============================================================
  // Fetch Products dynamically from Fake Store API
  // =============================================================
  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('https://fakestoreapi.com/products');
      if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.warn('Fake Store API fetch issue:', err.message);
      if (fallbackProducts && fallbackProducts.length > 0) {
        setProducts(fallbackProducts);
      } else {
        setError('Fake Store API se products load nahi ho sake: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // =============================================================
  // Cart Actions
  // =============================================================
  const handleAddToCart = (product, qty = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + qty } : item
        );
      }
      return [...prev, { ...product, quantity: qty }];
    });
    showToast(`🛍️ "${product.title.slice(0, 20)}..." added to Cart!`);
  };

  const handleUpdateQuantity = (productId, newQty) => {
    if (newQty <= 0) {
      handleRemoveFromCart(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => (item.id === productId ? { ...item, quantity: newQty } : item))
    );
  };

  const handleRemoveFromCart = (productId) => {
    setCartItems((prev) => prev.filter((item) => item.id !== productId));
    showToast('🗑️ Item removed from Cart');
  };

  // =============================================================
  // Wishlist Actions
  // =============================================================
  const handleToggleWishlist = (product) => {
    const exists = wishlist.some((item) => item.id === product.id);
    if (exists) {
      setWishlist((prev) => prev.filter((item) => item.id !== product.id));
      showToast('Removed from Wishlist');
    } else {
      setWishlist((prev) => [...prev, product]);
      showToast('❤️ Added to Wishlist!');
    }
  };

  const handleMoveToCart = (product) => {
    handleAddToCart(product, 1);
    setWishlist((prev) => prev.filter((item) => item.id !== product.id));
  };

  // =============================================================
  // Checkout & Auth
  // =============================================================
  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    // Protected check: If not logged in, prompt Auth Modal
    if (!user) {
      showToast('⚠️ Please Sign In first to complete your checkout!');
      setIsAuthOpen(true);
      return;
    }
    setIsCheckoutOpen(true);
  };

  const handleOrderSuccess = (orderId) => {
    setCartItems([]);
    showToast(`🎉 Order #ORD-${orderId} placed & saved to MySQL!`);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('shopsphere_user');
    showToast('Logged out successfully.');
  };

  // =============================================================
  // Filter & Sort Logic
  // =============================================================
  const filteredProducts = products
    .filter((prod) => {
      // Category filter
      if (activeCategory !== 'all' && prod.category.toLowerCase() !== activeCategory.toLowerCase()) {
        return false;
      }
      // Search filter
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        return prod.title.toLowerCase().includes(q) || prod.description.toLowerCase().includes(q);
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating') return (b.rating?.rate || 0) - (a.rating?.rate || 0);
      return 0;
    });

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="app-root">
      {/* 1. Header Navigation Bar */}
      <Navbar
        cartCount={totalCartCount}
        wishlistCount={wishlist.length}
        onSearch={(q) => setSearchQuery(q)}
        onCategorySelect={(cat) => setActiveCategory(cat)}
        activeCategory={activeCategory}
        user={user}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenOrders={() => {
          if (!user) {
            showToast('⚠️ Sign in to view your MySQL order history.');
            setIsAuthOpen(true);
          } else {
            setIsOrdersOpen(true);
          }
        }}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onLogout={handleLogout}
      />

      {/* 2. Main Content Container */}
      <main className="container">
        {/* Controls: Results count & Sort Dropdown */}
        <div className="shop-controls-bar">
          <div className="results-count">
            Showing <strong>{filteredProducts.length}</strong> products
            {activeCategory !== 'all' && ` in "${activeCategory}"`}
            {searchQuery && ` matching "${searchQuery}"`}
          </div>

          <div className="sort-wrapper">
            <span className="sort-label">Sort By:</span>
            <select
              className="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="default">Featured / Default</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>

        {/* Loading Indicator State */}
        {loading && (
          <div className="loading-state-box">
            <div className="spinner"></div>
            <p>Fetching 20+ live products from Fake Store API...</p>
          </div>
        )}

        {/* Error Handling State */}
        {error && (
          <div className="empty-state-card">
            <AlertCircle size={44} color="#ef4444" style={{ margin: '0 auto 14px' }} />
            <h3>Failed to Load Products</h3>
            <p style={{ color: '#64748b', marginBottom: '16px' }}>{error}</p>
            <button className="confirm-order-btn" style={{ maxWidth: '180px', margin: '0 auto' }} onClick={fetchProducts}>
              <RefreshCw size={16} /> Retry Fetch
            </button>
          </div>
        )}

        {/* Empty Search/Filter State */}
        {!loading && !error && filteredProducts.length === 0 && (
          <div className="empty-state-card">
            <ShoppingBag size={48} color="#94a3b8" style={{ margin: '0 auto 14px' }} />
            <h3>No products found</h3>
            <p style={{ color: '#64748b' }}>Try adjusting your search terms or category filter.</p>
          </div>
        )}

        {/* 3. Products Grid */}
        {!loading && !error && (
          <div className="products-grid">
            {filteredProducts.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                onAddToCart={(p) => handleAddToCart(p, 1)}
                onViewDetails={(p) => setSelectedProduct(p)}
                isWishlisted={wishlist.some((w) => w.id === prod.id)}
                onToggleWishlist={handleToggleWishlist}
              />
            ))}
          </div>
        )}
      </main>

      {/* ================= MODALS & DRAWERS ================= */}

      {/* Product Details Modal */}
      <ProductDetailsModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
      />

      {/* Cart Slide-Over Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onProceedToCheckout={handleProceedToCheckout}
      />

      {/* Checkout & Purchase Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        user={user}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* Auth Modal (Sign In / Sign Up) */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={(u) => {
          setUser(u);
          showToast(`Welcome, ${u.name}! Logged in via MySQL.`);
        }}
      />

      {/* My Orders Modal */}
      <MyOrdersModal
        isOpen={isOrdersOpen}
        onClose={() => setIsOrdersOpen(false)}
        user={user}
      />

      {/* Wishlist Modal */}
      <WishlistModal
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlistItems={wishlist}
        onRemoveFromWishlist={(id) => setWishlist((prev) => prev.filter((p) => p.id !== id))}
        onMoveToCart={handleMoveToCart}
      />

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="toast-alert">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
