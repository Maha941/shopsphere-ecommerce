import React from 'react';
import { X, Heart, ShoppingBag, Trash2 } from 'lucide-react';

export default function WishlistModal({ 
  isOpen, 
  onClose, 
  wishlistItems, 
  onRemoveFromWishlist, 
  onMoveToCart 
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box wishlist-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="orders-header">
          <div className="orders-title">
            <Heart size={24} color="#ef4444" fill="#ef4444" />
            <div>
              <h2>My Saved Wishlist</h2>
              <p>{wishlistItems.length} products saved for later</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="wishlist-scroll-box">
          {wishlistItems.length === 0 ? (
            <div className="empty-orders-view">
              <Heart size={44} color="#cbd5e1" />
              <h3>Your Wishlist is empty</h3>
              <p>Click the heart icon on any product to save it here for later.</p>
            </div>
          ) : (
            <div className="wishlist-grid">
              {wishlistItems.map((prod) => (
                <div key={prod.id} className="wishlist-card">
                  <img src={prod.image} alt={prod.title} />
                  <div className="wishlist-card-details">
                    <h4>{prod.title}</h4>
                    <div className="price-tag">${parseFloat(prod.price).toFixed(2)}</div>
                    
                    <div className="wishlist-actions">
                      <button 
                        className="wishlist-add-btn"
                        onClick={() => { onMoveToCart(prod); }}
                      >
                        <ShoppingBag size={14} />
                        <span>Move to Cart</span>
                      </button>
                      <button 
                        className="wishlist-del-btn"
                        onClick={() => onRemoveFromWishlist(prod.id)}
                        title="Remove"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
