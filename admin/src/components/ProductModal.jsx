import React, { useState, useEffect } from 'react';
import { X, Image as ImageIcon, Save, Plus } from 'lucide-react';

export default function ProductModal({ isOpen, onClose, product, onSave }) {
  if (!isOpen) return null;

  const isEdit = !!product;

  const [formData, setFormData] = useState({
    title: '',
    price: '',
    category: "men's clothing",
    stock: 50,
    image: '',
    description: ''
  });

  const [error, setError] = useState('');

  useEffect(() => {
    if (product) {
      setFormData({
        title: product.title || '',
        price: product.price || '',
        category: product.category || "men's clothing",
        stock: product.stock !== undefined ? product.stock : 50,
        image: product.image || '',
        description: product.description || ''
      });
    } else {
      setFormData({
        title: '',
        price: '',
        category: "men's clothing",
        stock: 50,
        image: 'https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg',
        description: ''
      });
    }
    setError('');
  }, [product, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.price || !formData.category) {
      setError('Please provide title, valid price, and category.');
      return;
    }

    onSave({
      ...formData,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock) || 0
    });
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="admin-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{isEdit ? `Edit Product #${product.id}` : 'Add New Product to Catalog'}</h3>
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
              <label>Product Title *</label>
              <input 
                type="text" 
                placeholder="e.g. Modern Wireless Noise-Cancelling Headphones" 
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="admin-form-row">
              <div className="admin-form-group">
                <label>Price ($ USD) *</label>
                <input 
                  type="number" 
                  step="0.01" 
                  min="0.01" 
                  placeholder="29.99"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>

              <div className="admin-form-group">
                <label>Initial Stock / Quantity</label>
                <input 
                  type="number" 
                  min="0" 
                  placeholder="50"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                />
              </div>
            </div>

            <div className="admin-form-group">
              <label>Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="men's clothing">Men's Clothing</option>
                <option value="women's clothing">Women's Clothing</option>
                <option value="jewelery">Jewellery</option>
                <option value="electronics">Electronics</option>
              </select>
            </div>

            <div className="admin-form-group">
              <label>Product Image URL</label>
              <input 
                type="url" 
                placeholder="https://example.com/image.jpg"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              />
              {formData.image && (
                <div className="img-preview-box">
                  <img src={formData.image} alt="Preview" onError={(e) => { e.target.src = 'https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg'; }} />
                </div>
              )}
            </div>

            <div className="admin-form-group">
              <label>Full Description</label>
              <textarea 
                rows="3" 
                placeholder="Detailed specifications, features, materials..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="primary-action-btn">
              {isEdit ? <Save size={16} /> : <Plus size={16} />}
              <span>{isEdit ? 'Save Changes' : 'Create Product'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
