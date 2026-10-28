import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';

export default function CartDrawer({ 
  isOpen, 
  onClose, 
  cartItems, 
  onUpdateQuantity, 
  onRemoveItem, 
  onProceedToCheckout 
}) {
  if (!isOpen) return null;

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal > 50 || subtotal === 0 ? 0 : 5.00;
  const grandTotal = subtotal + shipping;

  return (
    <div className="cart-backdrop" onClick={onClose}>
      <div className="cart-drawer-panel" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="cart-drawer-header">
          <div className="cart-title-box">
            <ShoppingBag size={22} color="#8c5c6d" />
            <h2>Your Shopping Cart</h2>
            <span className="cart-count-pill">{cartItems.length} items</span>
          </div>
          <button className="cart-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Free Shipping Progress */}
        <div className="shipping-bar-box">
          {subtotal >= 50 ? (
            <p className="free-shipping-text">🎉 You've unlocked <strong>FREE Shipping!</strong></p>
          ) : (
            <p className="shipping-progress-text">
              Add <strong>${(50 - subtotal).toFixed(2)}</strong> more for <strong>FREE Shipping</strong>
            </p>
          )}
          <div className="progress-track">
            <div 
              className="progress-fill" 
              style={{ width: `${Math.min(100, (subtotal / 50) * 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Cart Item List */}
        <div className="cart-items-scroll">
          {cartItems.length === 0 ? (
            <div className="empty-cart-view">
              <div className="empty-icon-circle">
                <ShoppingBag size={40} color="#94a3b8" />
              </div>
              <h3>Your cart is empty</h3>
              <p>Looks like you haven't added anything to your cart yet.</p>
              <button className="start-shopping-btn" onClick={onClose}>
                Start Shopping Now
              </button>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.id} className="cart-item-row">
                <div className="cart-item-img">
                  <img src={item.image} alt={item.title} />
                </div>
                <div className="cart-item-details">
                  <h4 className="cart-item-title" title={item.title}>{item.title}</h4>
                  <div className="cart-item-price">${parseFloat(item.price).toFixed(2)}</div>
                  
                  <div className="cart-item-controls">
                    <div className="qty-pill">
                      <button onClick={() => onUpdateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1}>
                        <Minus size={13} />
                      </button>
                      <span>{item.quantity}</span>
                      <button onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}>
                        <Plus size={13} />
                      </button>
                    </div>

                    <button 
                      className="cart-delete-btn" 
                      onClick={() => onRemoveItem(item.id)}
                      title="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer with Calculations */}
        {cartItems.length > 0 && (
          <div className="cart-drawer-footer">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Estimated Shipping</span>
              <span>{shipping === 0 ? <strong style={{ color: '#16a34a' }}>FREE</strong> : `$${shipping.toFixed(2)}`}</span>
            </div>
            <div className="summary-row total-row">
              <span>Total Amount</span>
              <span className="grand-total-price">${grandTotal.toFixed(2)}</span>
            </div>

            <button className="checkout-action-btn" onClick={onProceedToCheckout}>
              <span>Proceed to Checkout</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
