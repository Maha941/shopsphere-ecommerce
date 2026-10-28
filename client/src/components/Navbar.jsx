import React, { useState } from 'react';
import { ShoppingBag, Search, User, Menu, X, Heart, ShieldCheck, Package } from 'lucide-react';

export default function Navbar({ 
  cartCount = 0, 
  wishlistCount = 0,
  onSearch, 
  onCategorySelect,
  activeCategory = 'all',
  user = null,
  onOpenCart,
  onOpenAuth,
  onOpenOrders,
  onOpenWishlist,
  onLogout
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const categories = [
    { id: 'all', label: 'All Products' },
    { id: "men's clothing", label: "Men's Clothing" },
    { id: "women's clothing", label: "Women's Clothing" },
    { id: 'jewelery', label: 'Jewellery' },
    { id: 'electronics', label: 'Electronics' }
  ];

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    if (onSearch) onSearch(val);
  };

  return (
    <header className="navbar-wrapper">
      {/* 1. Top Offer Strip */}
      <div className="top-strip">
        <div className="container strip-content">
          <span>⚡ Free Shipping on all orders over $50 • 100% Genuine Brands</span>
          <div className="strip-right">
            <span className="secure-badge"><ShieldCheck size={14} /> MySQL Live Connected</span>
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Bar */}
      <nav className="main-navbar">
        <div className="container nav-content">
          {/* Logo */}
          <div className="brand-logo" onClick={() => onCategorySelect && onCategorySelect('all')}>
            <div className="logo-badge">
              <ShoppingBag size={22} />
            </div>
            <div className="logo-text">
              Shop<span>Sphere</span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="search-bar-wrapper">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search products by title, category, keywords..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
            {searchTerm && (
              <button 
                type="button" 
                className="clear-search-btn"
                onClick={() => { setSearchTerm(''); if (onSearch) onSearch(''); }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Right Action Icons */}
          <div className="nav-actions">
            {/* Wishlist Link */}
            <button className="nav-icon-badge-btn" onClick={onOpenWishlist} title="My Wishlist">
              <Heart size={20} />
              {wishlistCount > 0 && <span className="icon-badge">{wishlistCount}</span>}
            </button>

            {/* My Orders Button */}
            <button className="nav-icon-badge-btn" onClick={onOpenOrders} title="My Orders History">
              <Package size={20} />
            </button>

            {/* User Profile / Auth State */}
            {user ? (
              <div className="user-dropdown">
                <div className="user-pill" title={user.email}>
                  <div className="user-avatar-mini">{user.name.charAt(0).toUpperCase()}</div>
                  <span className="user-name-text">{user.name.split(' ')[0]}</span>
                </div>
                <button className="logout-btn" onClick={onLogout} title="Log Out">
                  Logout
                </button>
              </div>
            ) : (
              <button className="auth-btn" onClick={onOpenAuth}>
                <User size={18} />
                <span>Sign In</span>
              </button>
            )}

            {/* Shopping Cart Button with Dynamic Badge */}
            <button className="cart-icon-btn" onClick={onOpenCart} title="Open Shopping Cart">
              <ShoppingBag size={22} />
              <span className="cart-badge-counter">{cartCount}</span>
            </button>
          </div>
        </div>
      </nav>

      {/* 3. Category Filter Navigation Bar */}
      <div className="category-bar">
        <div className="container category-links">
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`cat-pill-btn ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => onCategorySelect && onCategorySelect(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
