import React from 'react';
import { Star, ShoppingBag, Eye, Heart } from 'lucide-react';

export default function ProductCard({ 
  product, 
  onAddToCart, 
  onViewDetails, 
  isWishlisted = false, 
  onToggleWishlist 
}) {
  const { id, title, price, image, category, rating } = product;

  return (
    <div className="product-card">
      {/* Category & Wishlist Badge Header */}
      <div className="product-card-top">
        <span className="product-cat-tag">{category}</span>
        <button 
          className={`wishlist-btn ${isWishlisted ? 'active' : ''}`}
          onClick={(e) => { e.stopPropagation(); onToggleWishlist(product); }}
          title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
        >
          <Heart size={16} fill={isWishlisted ? "#ef4444" : "none"} color={isWishlisted ? "#ef4444" : "#94a3b8"} />
        </button>
      </div>

      {/* Product Image */}
      <div className="product-img-wrapper" onClick={() => onViewDetails(product)}>
        <img src={image} alt={title} loading="lazy" />
      </div>

      {/* Product Info */}
      <div className="product-info">
        <div className="product-rating">
          <div className="stars">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                size={13} 
                fill={i < Math.round(rating?.rate || 4) ? "#f59e0b" : "none"} 
                color={i < Math.round(rating?.rate || 4) ? "#f59e0b" : "#cbd5e1"} 
              />
            ))}
          </div>
          <span className="rating-count">({rating?.count || 120})</span>
        </div>

        <h3 className="product-title" title={title} onClick={() => onViewDetails(product)}>
          {title}
        </h3>

        <div className="product-price-row">
          <div className="price-tag">${parseFloat(price).toFixed(2)}</div>
        </div>

        {/* Buttons */}
        <div className="product-card-actions">
          <button 
            className="details-btn"
            onClick={() => onViewDetails(product)}
            title="View Details"
          >
            <Eye size={16} />
            <span>Details</span>
          </button>
          <button 
            className="add-to-cart-btn"
            onClick={() => onAddToCart(product)}
            title="Add to Shopping Cart"
          >
            <ShoppingBag size={16} />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
}
