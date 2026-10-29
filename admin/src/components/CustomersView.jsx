import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Clock, 
  Edit3, 
  Trash2, 
  LogIn, 
  Users, 
  ShieldCheck, 
  ShoppingBag,
  ExternalLink
} from 'lucide-react';

export default function CustomersView({ 
  users = [], 
  onAddCustomer, 
  onEditCustomer, 
  onDeleteCustomer, 
  onLoginAsUser 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredUsers = users.filter((u) => {
    const matchesRole = roleFilter === 'all' || u.role?.toLowerCase() === roleFilter.toLowerCase();
    const matchesStatus = statusFilter === 'all' || u.status?.toLowerCase() === statusFilter.toLowerCase();
    const matchesSearch = !searchTerm.trim() || 
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRole && matchesStatus && matchesSearch;
  });

  return (
    <div className="content-card">
      {/* Header Bar */}
      <div className="card-header-bar">
        <div className="card-title-box">
          <h3>Customer & User Accounts Hub</h3>
          <p>Manage customer profiles, access permissions, and track active sessions</p>
        </div>

        <div className="card-controls">
          {/* Search */}
          <div className="search-box">
            <Search size={15} />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Role Filter */}
          <select 
            className="filter-select"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">All Roles</option>
            <option value="Customer">Customer</option>
            <option value="Admin">Admin</option>
          </select>

          {/* Status Filter */}
          <select 
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Suspended">Suspended</option>
          </select>

          {/* Add User Button */}
          <button className="primary-action-btn" onClick={onAddCustomer}>
            <Plus size={16} />
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>Customer Profile</th>
              <th>Role</th>
              <th>Status</th>
              <th>Last Login Timestamp</th>
              <th>Orders / Spent</th>
              <th>Joined Date</th>
              <th style={{ textAlign: 'right' }}>Actions & Impersonate</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
                  <Users size={40} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                  <h4>No users found matching your filters</h4>
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => {
                const isAdmin = u.role?.toLowerCase() === 'admin';
                const isSuspended = u.status?.toLowerCase() === 'suspended';

                return (
                  <tr key={u.id}>
                    <td>
                      <div className="customer-cell">
                        <div className={`customer-avatar ${isAdmin ? 'admin' : ''}`}>
                          {u.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="customer-meta">
                          <h4>{u.name}</h4>
                          <p>{u.email}</p>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className={`role-badge ${isAdmin ? 'admin' : 'customer'}`}>
                        {u.role || 'Customer'}
                      </span>
                    </td>

                    <td>
                      <span className={`status-badge ${isSuspended ? 'suspended' : 'active'}`}>
                        {u.status || 'Active'}
                      </span>
                    </td>

                    {/* LAST LOGIN TIMESTAMP */}
                    <td>
                      {u.last_login ? (
                        <div className="timestamp-box">
                          <Clock size={13} color="#38bdf8" />
                          <div>
                            <div style={{ fontWeight: 600 }}>{new Date(u.last_login).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                            <div style={{ fontSize: '11px', color: '#94a3b8' }}>{new Date(u.last_login).toLocaleDateString()}</div>
                          </div>
                        </div>
                      ) : (
                        <span className="timestamp-box never">Never logged in</span>
                      )}
                    </td>

                    <td>
                      <div style={{ fontWeight: 700 }}>
                        {u.orders_count || 0} orders
                      </div>
                      <div style={{ fontSize: '11px', color: '#10b981' }}>
                        ${parseFloat(u.total_spent || 0).toFixed(2)} spent
                      </div>
                    </td>

                    <td style={{ fontSize: '12px', color: '#94a3b8' }}>
                      {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'Recent'}
                    </td>

                    <td>
                      <div className="table-actions" style={{ justifyContent: 'flex-end' }}>
                        {/* "LOGIN AS USER" BUTTON */}
                        {!isAdmin && (
                          <button 
                            className="login-as-btn"
                            onClick={() => onLoginAsUser(u)}
                            title={`Log into Storefront as ${u.name}`}
                          >
                            <LogIn size={13} />
                            <span>Login as User</span>
                          </button>
                        )}

                        <button 
                          className="action-icon-btn edit" 
                          onClick={() => onEditCustomer(u)}
                          title="Edit Customer Profile & Role"
                        >
                          <Edit3 size={15} />
                        </button>

                        <button 
                          className="action-icon-btn delete" 
                          onClick={() => onDeleteCustomer(u.id, u.name)}
                          title="Delete User Account"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
