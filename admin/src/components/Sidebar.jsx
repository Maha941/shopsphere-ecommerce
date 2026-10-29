import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  ShoppingBag, 
  ExternalLink, 
  ShieldCheck, 
  X 
} from 'lucide-react';

export default function Sidebar({ 
  currentTab, 
  setCurrentTab, 
  counts = {}, 
  isOpen, 
  onClose,
  storefrontUrl = "http://localhost:5173"
}) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'products', label: 'Products Catalog', icon: Package, badge: counts.products },
    { id: 'customers', label: 'Customers & Users', icon: Users, badge: counts.customers },
    { id: 'orders', label: 'Customer Orders', icon: ShoppingBag, badge: counts.orders }
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="modal-backdrop" 
          style={{ zIndex: 45 }} 
          onClick={onClose} 
        />
      )}

      <aside className={`admin-sidebar ${isOpen ? 'open' : ''}`}>
        {/* Brand Header */}
        <div className="sidebar-brand">
          <div className="brand-icon-box">
            <ShieldCheck size={24} />
          </div>
          <div className="brand-text">
            <h1>ShopSphere</h1>
            <span>ADMIN CENTER</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="sidebar-nav">
          <div className="nav-section-title">Main Menu</div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                className={`nav-item-btn ${isActive ? 'active' : ''}`}
                onClick={() => {
                  setCurrentTab(item.id);
                  if (onClose) onClose();
                }}
              >
                <div className="nav-label-box">
                  <Icon size={18} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="nav-badge-pill">{item.badge}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="sidebar-footer">
          <a 
            href={storefrontUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="store-link-btn"
            title="Open customer storefront in a new tab"
          >
            <span>Live Storefront</span>
            <ExternalLink size={14} />
          </a>
        </div>
      </aside>
    </>
  );
}
