import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import ProductsView from './components/ProductsView';
import CustomersView from './components/CustomersView';
import OrdersView from './components/OrdersView';
import ProductModal from './components/ProductModal';
import CustomerModal from './components/CustomerModal';
import fallbackProductsList from '../../client/src/productsFallback.json';
import { 
  Menu, 
  RotateCw, 
  ShieldCheck, 
  ExternalLink,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dbConnected, setDbConnected] = useState(false);

  // Data States
  const [stats, setStats] = useState({
    totalRevenue: '0.00',
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    lowStockCount: 0
  });
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);

  // Modal States
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  // Toast State
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const API_BASE = 'http://localhost:5000/api';
  const STOREFRONT_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:5173'
    : 'https://shopsphere-ecommerce-flax.vercel.app';

  // =============================================================
  // Fetch All Admin Data (Dual-Mode: MySQL with Cloud Fallback)
  // =============================================================
  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Try connecting to Express MySQL Backend
      const [resStats, resProds, resUsers, resOrders] = await Promise.all([
        fetch(`${API_BASE}/admin/stats`),
        fetch(`${API_BASE}/admin/products`),
        fetch(`${API_BASE}/admin/users`),
        fetch(`${API_BASE}/admin/orders`)
      ]);

      if (resStats.ok && resProds.ok && resUsers.ok && resOrders.ok) {
        const dataStats = await resStats.json();
        const dataProds = await resProds.json();
        const dataUsers = await resUsers.json();
        const dataOrders = await resOrders.json();

        setStats(dataStats.stats || {});
        setProducts(dataProds.data || []);
        setUsers(dataUsers.data || []);
        setOrders(dataOrders.data || []);
        setDbConnected(true);

        // Save snapshot to local storage for cloud persistence
        localStorage.setItem('shopsphere_admin_snapshot', JSON.stringify({
          stats: dataStats.stats,
          products: dataProds.data,
          users: dataUsers.data,
          orders: dataOrders.data
        }));
        setLoading(false);
        return;
      }
    } catch (err) {
      console.warn('Backend unavailable, using persistent offline mode:', err.message);
    }

    // 2. Cloud Fallback Mode (For standalone Vercel deployment)
    setDbConnected(false);
    const saved = localStorage.getItem('shopsphere_admin_snapshot');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setStats(parsed.stats || {});
        setProducts(parsed.products || []);
        setUsers(parsed.users || []);
        setOrders(parsed.orders || []);
        setLoading(false);
        return;
      } catch (e) {}
    }

    // Initial seed if no local storage exists yet
    const initialProds = fallbackProductsList || [];
    const initialUsers = [
      { id: 1, name: 'Admin Master', email: 'admin@shopsphere.com', role: 'Admin', status: 'Active', last_login: new Date().toISOString(), orders_count: 0, total_spent: 0, created_at: new Date().toISOString() },
      { id: 2, name: 'Ali Khan', email: 'ali@example.com', role: 'Customer', status: 'Active', last_login: new Date(Date.now() - 3600000).toISOString(), orders_count: 1, total_spent: 109.95, created_at: '2026-10-27T10:00:00Z' },
      { id: 3, name: 'Sara Ahmed', email: 'sara@example.com', role: 'Customer', status: 'Active', last_login: new Date(Date.now() - 86400000).toISOString(), orders_count: 0, total_spent: 0, created_at: '2026-10-27T11:00:00Z' },
      { id: 4, name: 'Mahjbeen Afzal', email: 'maharajput941@gmail.com', role: 'Customer', status: 'Active', last_login: new Date().toISOString(), orders_count: 2, total_spent: 219.90, created_at: '2026-10-27T12:00:00Z' }
    ];
    const initialOrders = [
      {
        id: 1,
        user_name: 'Mahjbeen Afzal',
        user_email: 'maharajput941@gmail.com',
        phone: '+92 300 1234567',
        shipping_address: 'Gulberg III, Lahore',
        total_amount: 109.95,
        order_status: 'Delivered',
        created_at: new Date().toISOString(),
        items: [{ title: 'Fjallraven Backpack', price: 109.95, quantity: 1 }]
      }
    ];

    setProducts(initialProds);
    setUsers(initialUsers);
    setOrders(initialOrders);
    setStats({
      totalRevenue: '329.85',
      totalOrders: 3,
      totalCustomers: initialUsers.length - 1,
      totalProducts: initialProds.length,
      lowStockCount: 2
    });
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // =============================================================
  // Product Actions (Add, Edit, Delete)
  // =============================================================
  const handleSaveProduct = async (prodData) => {
    try {
      if (editingProduct) {
        // Edit
        await fetch(`${API_BASE}/admin/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(prodData)
        });
        setProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...p, ...prodData } : p));
        showToast(`✅ Product "${prodData.title.slice(0, 20)}..." updated successfully!`);
      } else {
        // Add
        const res = await fetch(`${API_BASE}/admin/products`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(prodData)
        });
        const data = await res.json();
        const newId = data.productId || Date.now();
        setProducts(prev => [{ id: newId, ...prodData }, ...prev]);
        showToast(`🎉 New product created successfully!`);
      }
    } catch (err) {
      // Offline fallback
      if (editingProduct) {
        setProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...p, ...prodData } : p));
        showToast(`✅ Product updated (Live Demo Mode)`);
      } else {
        setProducts(prev => [{ id: Date.now(), ...prodData }, ...prev]);
        showToast(`🎉 New product created (Live Demo Mode)`);
      }
    } finally {
      setProductModalOpen(false);
      setEditingProduct(null);
    }
  };

  const handleDeleteProduct = async (id, title) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${title}"?`)) return;

    try {
      await fetch(`${API_BASE}/admin/products/${id}`, { method: 'DELETE' });
    } catch (e) {}

    setProducts(prev => prev.filter(p => p.id !== id));
    showToast(`🗑️ Product #${id} deleted.`);
  };

  // =============================================================
  // Customer Actions (Add, Edit, Delete, Impersonate)
  // =============================================================
  const handleSaveCustomer = async (custData) => {
    try {
      if (editingCustomer) {
        await fetch(`${API_BASE}/admin/users/${editingCustomer.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(custData)
        });
        setUsers(prev => prev.map(u => u.id === editingCustomer.id ? { ...u, ...custData } : u));
        showToast(`✅ User "${custData.name}" updated!`);
      } else {
        const res = await fetch(`${API_BASE}/admin/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(custData)
        });
        const data = await res.json();
        const newId = data.userId || Date.now();
        setUsers(prev => [{ id: newId, ...custData, orders_count: 0, total_spent: 0, created_at: new Date().toISOString() }, ...prev]);
        showToast(`🎉 User "${custData.name}" registered!`);
      }
    } catch (err) {
      if (editingCustomer) {
        setUsers(prev => prev.map(u => u.id === editingCustomer.id ? { ...u, ...custData } : u));
        showToast(`✅ User updated (Live Demo Mode)`);
      } else {
        setUsers(prev => [{ id: Date.now(), ...custData, orders_count: 0, total_spent: 0, created_at: new Date().toISOString() }, ...prev]);
        showToast(`🎉 User created (Live Demo Mode)`);
      }
    } finally {
      setCustomerModalOpen(false);
      setEditingCustomer(null);
    }
  };

  const handleDeleteCustomer = async (id, name) => {
    if (!window.confirm(`Delete user "${name}"? This action cannot be undone.`)) return;

    try {
      await fetch(`${API_BASE}/admin/users/${id}`, { method: 'DELETE' });
    } catch (e) {}

    setUsers(prev => prev.filter(u => u.id !== id));
    showToast(`🗑️ User "${name}" deleted.`);
  };

  // 🎭 "LOGIN AS USER" (Impersonation Flow)
  const handleLoginAsUser = async (user) => {
    try {
      // 1. Notify backend to update user's last_login
      await fetch(`${API_BASE}/admin/login-as/${user.id}`, { method: 'POST' });
    } catch (e) {}

    // 2. Set user credentials in localStorage for storefront
    const authPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role || 'Customer'
    };
    localStorage.setItem('shopsphere_user', JSON.stringify(authPayload));

    // 3. Open storefront in new tab logged in as this customer!
    const targetUrl = `${STOREFRONT_URL}/?impersonated=true`;
    window.open(targetUrl, '_blank');

    showToast(`🔑 Switched session! Opened Storefront as "${user.name}".`);
  };

  // =============================================================
  // Order Actions
  // =============================================================
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await fetch(`${API_BASE}/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (e) {}

    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, order_status: newStatus } : o));
    showToast(`Order #ORD-${orderId} status set to "${newStatus}"!`);
  };

  return (
    <div className="admin-layout">
      {/* 1. Left Sidebar Navigation */}
      <Sidebar 
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        counts={{
          products: products.length,
          customers: users.filter(u => u.role !== 'Admin').length,
          orders: orders.length
        }}
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        storefrontUrl={STOREFRONT_URL}
      />

      {/* 2. Main Administration Area */}
      <div className="admin-main">
        {/* Top Header Bar */}
        <header className="admin-header">
          <div className="header-left">
            <button 
              className="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu size={22} />
            </button>
            <div className="page-title">
              <h2>
                {currentTab === 'dashboard' && 'Executive Dashboard'}
                {currentTab === 'products' && 'Product Inventory & Catalog'}
                {currentTab === 'customers' && 'Customers & User Directory'}
                {currentTab === 'orders' && 'Fulfillment & Orders Pipeline'}
              </h2>
              <p>ShopSphere Control Center • Multi-tenant Admin Suite</p>
            </div>
          </div>

          <div className="header-right">
            {/* Database Live Connectivity Badge */}
            <div className="db-status-badge">
              <span className="pulse-dot"></span>
              <span>{dbConnected ? 'MySQL Connected' : 'Cloud Standalone'}</span>
            </div>

            {/* Refresh Button */}
            <button 
              className="action-icon-btn" 
              onClick={fetchData} 
              title="Refresh all data"
            >
              <RotateCw size={15} />
            </button>

            {/* Admin Avatar Pill */}
            <div className="admin-profile-pill">
              <div className="admin-avatar">A</div>
              <div className="admin-info-text">
                <span className="admin-name">Admin Master</span>
                <span className="admin-role">Super Admin</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page View Body */}
        <main className="admin-content">
          {currentTab === 'dashboard' && (
            <DashboardView 
              stats={stats}
              products={products}
              users={users}
              orders={orders}
              onNavigate={(tab) => setCurrentTab(tab)}
              onOpenProductModal={() => { setEditingProduct(null); setProductModalOpen(true); }}
              onOpenCustomerModal={() => { setEditingCustomer(null); setCustomerModalOpen(true); }}
            />
          )}

          {currentTab === 'products' && (
            <ProductsView 
              products={products}
              onAddProduct={() => { setEditingProduct(null); setProductModalOpen(true); }}
              onEditProduct={(p) => { setEditingProduct(p); setProductModalOpen(true); }}
              onDeleteProduct={handleDeleteProduct}
            />
          )}

          {currentTab === 'customers' && (
            <CustomersView 
              users={users}
              onAddCustomer={() => { setEditingCustomer(null); setCustomerModalOpen(true); }}
              onEditCustomer={(u) => { setEditingCustomer(u); setCustomerModalOpen(true); }}
              onDeleteCustomer={handleDeleteCustomer}
              onLoginAsUser={handleLoginAsUser}
            />
          )}

          {currentTab === 'orders' && (
            <OrdersView 
              orders={orders}
              onUpdateOrderStatus={handleUpdateOrderStatus}
            />
          )}
        </main>
      </div>

      {/* Product Add/Edit Modal */}
      <ProductModal 
        isOpen={productModalOpen}
        onClose={() => { setProductModalOpen(false); setEditingProduct(null); }}
        product={editingProduct}
        onSave={handleSaveProduct}
      />

      {/* Customer Add/Edit Modal */}
      <CustomerModal 
        isOpen={customerModalOpen}
        onClose={() => { setCustomerModalOpen(false); setEditingCustomer(null); }}
        customer={editingCustomer}
        onSave={handleSaveCustomer}
      />

      {/* Toast Alert */}
      {toast && (
        <div className="admin-toast">
          {toast}
        </div>
      )}
    </div>
  );
}
