import React, { useState } from 'react';
import { X, Star, ShoppingBag, ShieldCheck, Truck, RotateCcw } from 'lucide-react';

export default function ProductDetailsModal({ product, onClose, onAddToCart }) {
  if (!product) return null;

  const [quantity, setQuantity] = useState(1);

  const handleAdd = () => {
    onAddToCart(product, quantity);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box product-detail-box" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className="modal-close-btn" onClick={onClose}>
          <X size={20} />
        </button>

        <div className="detail-grid">
          {/* Left: Product Image */}
          <div className="detail-img-box">
            <img src={product.image} alt={product.title} />
          </div>

          {/* Right: Info */}
          <div className="detail-info-box">
            <span className="product-cat-tag">{product.category}</span>
            <h2 className="detail-title">{product.title}</h2>

            <div className="detail-rating-row">
              <div className="stars">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={16} 
                    fill={i < Math.round(product.rating?.rate || 4) ? "#f59e0b" : "none"} 
                    color={i < Math.round(product.rating?.rate || 4) ? "#f59e0b" : "#cbd5e1"} 
                  />
                ))}
              </div>
              <span className="rating-text">
                <strong>{product.rating?.rate || 4.5}</strong> ({product.rating?.count || 120} reviews)
              </span>
            </div>

            <div className="detail-price">${parseFloat(product.price).toFixed(2)}</div>

            <p className="detail-description">{product.description}</p>

            {/* Quantity Picker & Add To Cart */}
            <div className="detail-action-row">
              <div className="qty-picker">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)}>+</button>
              </div>

              <button className="detail-add-btn" onClick={handleAdd}>
                <ShoppingBag size={18} />
                <span>Add To Cart • ${(product.price * quantity).toFixed(2)}</span>
              </button>
            </div>

            {/* Guarantees */}
            <div className="detail-guarantees">
              <div className="guarantee-item">
                <Truck size={16} color="#8c5c6d" />
                <span>Fast 48-Hour Delivery</span>
              </div>
              <div className="guarantee-item">
                <ShieldCheck size={16} color="#8c5c6d" />
                <span>100% Authentic Guarantee</span>
              </div>
              <div className="guarantee-item">
                <RotateCcw size={16} color="#8c5c6d" />
                <span>30-Day Easy Returns</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
