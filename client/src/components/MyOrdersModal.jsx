import React, { useState, useEffect } from 'react';
import { X, Package, Calendar, MapPin, Phone, RefreshCw } from 'lucide-react';

export default function MyOrdersModal({ isOpen, onClose, user }) {
  if (!isOpen) return null;

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const emailQuery = user?.email ? `?email=${encodeURIComponent(user.email)}` : '';
      const res = await fetch(`http://localhost:5000/api/orders${emailQuery}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setOrders(data.data || []);
      } else {
        setError(data.message || 'Could not fetch orders.');
      }
    } catch (err) {
      // Cloud Deployment Fallback: Load saved orders from localStorage
      const localOrders = JSON.parse(localStorage.getItem('shopsphere_local_orders') || '[]');
      if (localOrders.length > 0) {
        setOrders(localOrders);
      } else {
        setOrders([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box orders-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="orders-header">
          <div className="orders-title">
            <Package size={24} color="#8c5c6d" />
            <div>
              <h2>My Orders History</h2>
              <p>Orders saved in your XAMPP MySQL Database</p>
            </div>
          </div>
          <div className="header-actions">
            <button className="refresh-btn" onClick={fetchOrders} title="Refresh orders">
              <RefreshCw size={16} />
            </button>
            <button className="modal-close-btn" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="orders-content-scroll">
          {loading ? (
            <div className="loading-state-box">
              <div className="spinner"></div>
              <p>Fetching orders from MySQL Database...</p>
            </div>
          ) : error ? (
            <div className="checkout-alert error">{error}</div>
          ) : orders.length === 0 ? (
            <div className="empty-orders-view">
              <Package size={48} color="#94a3b8" />
              <h3>No orders found</h3>
              <p>You haven't placed any orders yet. Add items to your cart and checkout!</p>
            </div>
          ) : (
            <div className="orders-list">
              {orders.map((ord) => (
                <div key={ord.id} className="order-history-card">
                  <div className="order-card-header">
                    <div className="order-id-badge">
                      <span>Order #ORD-{ord.id}</span>
                      <span className="order-status-badge">{ord.order_status}</span>
                    </div>
                    <div className="order-date-text">
                      <Calendar size={13} />
                      <span>{new Date(ord.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Items Preview */}
                  <div className="order-items-preview-list">
                    {ord.items && ord.items.map((it, idx) => (
                      <div key={idx} className="order-sub-item">
                        <span>{it.title} <strong>(x{it.quantity})</strong></span>
                        <span>${(it.price * it.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="order-card-footer">
                    <div className="shipping-info-small">
                      <MapPin size={13} />
                      <span>{ord.shipping_address}</span>
                    </div>
                    <div className="order-total-highlight">
                      Total: <strong>${parseFloat(ord.total_amount).toFixed(2)}</strong>
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
