import React, { useState, useEffect } from 'react';
import { X, Save, UserPlus } from 'lucide-react';

export default function CustomerModal({ isOpen, onClose, customer, onSave }) {
  if (!isOpen) return null;

  const isEdit = !!customer;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Customer',
    status: 'Active'
  });

  const [error, setError] = useState('');

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name || '',
        email: customer.email || '',
        password: '',
        role: customer.role || 'Customer',
        status: customer.status || 'Active'
      });
    } else {
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'Customer',
        status: 'Active'
      });
    }
    setError('');
  }, [customer, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      setError('Name and Email are required.');
      return;
    }
    if (!isEdit && (!formData.password || formData.password.length < 6)) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    onSave(formData);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="admin-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{isEdit ? `Edit User: ${customer.name}` : 'Register New User / Admin'}</h3>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div style={{ padding: '10px 14px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>
                {error}
              </div>
            )}

            <div className="admin-form-group">
              <label>Full Name *</label>
              <input 
                type="text" 
                placeholder="e.g. Mahjbeen Afzal" 
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="admin-form-group">
              <label>Email Address *</label>
              <input 
                type="email" 
                placeholder="user@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="admin-form-group">
              <label>{isEdit ? 'New Password (Leave blank to keep unchanged)' : 'Initial Password *'}</label>
              <input 
                type="password" 
                placeholder={isEdit ? '••••••••' : 'Minimum 6 characters'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required={!isEdit}
              />
            </div>

            <div className="admin-form-row">
              <div className="admin-form-group">
                <label>Account Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="Customer">Customer</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              <div className="admin-form-group">
                <label>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="Active">Active</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="primary-action-btn">
              {isEdit ? <Save size={16} /> : <UserPlus size={16} />}
              <span>{isEdit ? 'Update User' : 'Create User'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
