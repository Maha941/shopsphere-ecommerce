import React from 'react';
import { 
  DollarSign, 
  ShoppingBag, 
  Users, 
  Package, 
  ArrowUpRight, 
  Plus, 
  Clock, 
  ShieldCheck, 
  TrendingUp,
  AlertTriangle
} from 'lucide-react';

export default function DashboardView({ 
  stats = {}, 
  products = [], 
  users = [], 
  orders = [], 
  onNavigate,
  onOpenProductModal,
  onOpenCustomerModal
}) {
  const recentOrders = orders.slice(0, 5);
  const recentUsers = users.slice(0, 5);

  return (
    <div className="dashboard-view">
      {/* 1. KPI Stats Cards */}
      <div className="stats-grid">
        {/* Total Revenue */}
        <div className="stat-card">
          <div className="stat-meta">
            <p>Total Revenue</p>
            <h3>${parseFloat(stats.totalRevenue || 0).toFixed(2)}</h3>
            <div className="stat-subtext positive">
              <TrendingUp size={13} />
              <span>Real-time MySQL Sync</span>
            </div>
          </div>
          <div className="stat-icon-wrapper revenue">
            <DollarSign size={24} />
          </div>
        </div>

        {/* Total Orders */}
        <div className="stat-card">
          <div className="stat-meta">
            <p>Total Orders</p>
            <h3>{stats.totalOrders || 0}</h3>
            <div className="stat-subtext positive">
              <span>{orders.filter(o => o.order_status === 'Confirmed' || o.order_status === 'Delivered').length} Successful</span>
            </div>
          </div>
          <div className="stat-icon-wrapper orders">
            <ShoppingBag size={24} />
          </div>
        </div>

        {/* Registered Customers */}
        <div className="stat-card">
          <div className="stat-meta">
            <p>Total Customers</p>
            <h3>{stats.totalCustomers || 0}</h3>
            <div className="stat-subtext neutral">
              <span>Active users in MySQL</span>
            </div>
          </div>
          <div className="stat-icon-wrapper customers">
            <Users size={24} />
          </div>
        </div>

        {/* Live Catalog Products */}
        <div className="stat-card">
          <div className="stat-meta">
            <p>Products in Catalog</p>
            <h3>{stats.totalProducts || products.length}</h3>
            <div className="stat-subtext warning">
              {stats.lowStockCount > 0 ? (
                <>
                  <AlertTriangle size={13} />
                  <span>{stats.lowStockCount} Low Stock Alert</span>
                </>
              ) : (
                <span>All items in healthy stock</span>
              )}
            </div>
          </div>
          <div className="stat-icon-wrapper products">
            <Package size={24} />
          </div>
        </div>
      </div>

      {/* 2. Quick Action Bar */}
      <div style={{ display: 'flex', gap: '14px', marginBottom: '30px', flexWrap: 'wrap' }}>
        <button className="primary-action-btn" onClick={onOpenProductModal}>
          <Plus size={16} />
          <span>Add New Product</span>
        </button>
        <button 
          className="primary-action-btn" 
          style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
          onClick={onOpenCustomerModal}
        >
          <Plus size={16} />
          <span>Add Customer</span>
        </button>
      </div>

      {/* 3. Dual Grids: Recent Orders & Recent Users */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        
        {/* Recent Orders Card */}
        <div className="content-card">
          <div className="card-header-bar">
            <div className="card-title-box">
              <h3>Recent Customer Orders</h3>
              <p>Latest purchases recorded in database</p>
            </div>
            <button 
              className="action-icon-btn" 
              onClick={() => onNavigate('orders')} 
              title="View all orders"
            >
              <ArrowUpRight size={16} />
            </button>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', color: '#64748b', padding: '30px' }}>
                      No orders placed yet.
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((ord) => (
                    <tr key={ord.id}>
                      <td style={{ fontWeight: 700, color: '#818cf8' }}>
                        #ORD-{ord.id}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{ord.user_name}</div>
                        <div style={{ fontSize: '11px', color: '#9ca3af' }}>{ord.user_email}</div>
                      </td>
                      <td style={{ fontWeight: 700 }}>
                        ${parseFloat(ord.total_amount).toFixed(2)}
                      </td>
                      <td>
                        <span className={`order-status-badge ${(ord.order_status || 'confirmed').toLowerCase()}`}>
                          {ord.order_status || 'Confirmed'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Registered Users Card */}
        <div className="content-card">
          <div className="card-header-bar">
            <div className="card-title-box">
              <h3>Recent Customers & Activity</h3>
              <p>User accounts & last login timestamps</p>
            </div>
            <button 
              className="action-icon-btn" 
              onClick={() => onNavigate('customers')} 
              title="View all customers"
            >
              <ArrowUpRight size={16} />
            </button>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Last Login Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', color: '#64748b', padding: '30px' }}>
                      No registered users found.
                    </td>
                  </tr>
                ) : (
                  recentUsers.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <div className="customer-cell">
                          <div className={`customer-avatar ${u.role === 'Admin' ? 'admin' : ''}`}>
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="customer-meta">
                            <h4>{u.name}</h4>
                            <p>{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`role-badge ${(u.role || 'customer').toLowerCase()}`}>
                          {u.role || 'Customer'}
                        </span>
                      </td>
                      <td>
                        {u.last_login ? (
                          <div className="timestamp-box">
                            <Clock size={12} color="#38bdf8" />
                            <span>{new Date(u.last_login).toLocaleString()}</span>
                          </div>
                        ) : (
                          <span className="timestamp-box never">Never logged in</span>
                        )}
                      </td>
                      <td>
                        <span className={`status-badge ${(u.status || 'active').toLowerCase()}`}>
                          {u.status || 'Active'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
