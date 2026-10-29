import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Search, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  Truck, 
  PackageCheck, 
  Clock 
} from 'lucide-react';

export default function OrdersView({ 
  orders = [], 
  onUpdateOrderStatus 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredOrders = orders.filter((ord) => {
    const matchesStatus = statusFilter === 'all' || ord.order_status?.toLowerCase() === statusFilter.toLowerCase();
    const q = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm.trim() ||
      String(ord.id).includes(q) ||
      ord.user_name?.toLowerCase().includes(q) ||
      ord.user_email?.toLowerCase().includes(q) ||
      ord.shipping_address?.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const statuses = ['Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

  return (
    <div className="content-card">
      <div className="card-header-bar">
        <div className="card-title-box">
          <h3>Customer Orders & Fulfillment</h3>
          <p>Manage order pipeline, track delivery addresses, and update fulfillment stages</p>
        </div>

        <div className="card-controls">
          <div className="search-box">
            <Search size={15} />
            <input 
              type="text" 
              placeholder="Search by order #, name, email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select 
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            {statuses.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>Order ID & Date</th>
              <th>Customer</th>
              <th>Shipping Address</th>
              <th>Items Purchased</th>
              <th>Total Amount</th>
              <th style={{ textAlign: 'right' }}>Fulfillment Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
                  <ShoppingBag size={40} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                  <h4>No orders found matching your criteria</h4>
                </td>
              </tr>
            ) : (
              filteredOrders.map((ord) => (
                <tr key={ord.id}>
                  <td>
                    <div style={{ fontWeight: 800, color: '#818cf8', fontSize: '14px' }}>
                      #ORD-{ord.id}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#94a3b8', marginTop: '3px' }}>
                      <Calendar size={12} />
                      <span>{new Date(ord.created_at || Date.now()).toLocaleDateString()}</span>
                    </div>
                  </td>

                  <td>
                    <div style={{ fontWeight: 700, color: '#ffffff' }}>{ord.user_name}</div>
                    <div style={{ fontSize: '12px', color: '#9ca3af' }}>{ord.user_email}</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>{ord.phone}</div>
                  </td>

                  <td>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', maxWidth: '240px', fontSize: '12px', color: '#cbd5e1' }}>
                      <MapPin size={14} color="#6366f1" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{ord.shipping_address}</span>
                    </div>
                  </td>

                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxWidth: '220px' }}>
                      {ord.items && ord.items.map((it, idx) => (
                        <div key={idx} style={{ fontSize: '12px', color: '#cbd5e1', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          • {it.title} <strong style={{ color: '#818cf8' }}>(x{it.quantity})</strong>
                        </div>
                      ))}
                    </div>
                  </td>

                  <td style={{ fontWeight: 800, fontSize: '15px', color: '#10b981' }}>
                    ${parseFloat(ord.total_amount).toFixed(2)}
                  </td>

                  <td>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <select
                        className="filter-select"
                        style={{ 
                          padding: '6px 10px', 
                          fontSize: '12px',
                          fontWeight: 700,
                          backgroundColor: ord.order_status === 'Delivered' ? 'rgba(16, 185, 129, 0.15)' : 'var(--admin-card)',
                          borderColor: ord.order_status === 'Delivered' ? '#10b981' : 'var(--admin-border)'
                        }}
                        value={ord.order_status || 'Confirmed'}
                        onChange={(e) => onUpdateOrderStatus(ord.id, e.target.value)}
                      >
                        {statuses.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
