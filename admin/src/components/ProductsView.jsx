import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Star, 
  Package, 
  ExternalLink 
} from 'lucide-react';

export default function ProductsView({ 
  products = [], 
  onAddProduct, 
  onEditProduct, 
  onDeleteProduct 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const categories = ['all', "men's clothing", "women's clothing", 'jewelery', 'electronics'];

  const filteredProducts = products.filter((prod) => {
    const matchesCategory = categoryFilter === 'all' || prod.category?.toLowerCase() === categoryFilter.toLowerCase();
    const matchesSearch = !searchTerm.trim() || 
      prod.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prod.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="content-card">
      {/* Header & Controls Bar */}
      <div className="card-header-bar">
        <div className="card-title-box">
          <h3>Products Catalog Management</h3>
          <p>Showing {filteredProducts.length} of {products.length} live products in inventory</p>
        </div>

        <div className="card-controls">
          {/* Live Search */}
          <div className="search-box">
            <Search size={15} />
            <input 
              type="text" 
              placeholder="Search products by title..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Category Filter */}
          <select 
            className="filter-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="men's clothing">Men's Clothing</option>
            <option value="women's clothing">Women's Clothing</option>
            <option value="jewelery">Jewellery</option>
            <option value="electronics">Electronics</option>
          </select>

          {/* Add Product Button */}
          <button className="primary-action-btn" onClick={onAddProduct}>
            <Plus size={16} />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>Product Details</th>
              <th>Category</th>
              <th>Price</th>
              <th>Inventory / Stock</th>
              <th>Rating</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
                  <Package size={40} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                  <h4>No products found matching your search</h4>
                </td>
              </tr>
            ) : (
              filteredProducts.map((prod) => {
                const stockQty = prod.stock !== undefined ? prod.stock : 45;
                const stockClass = stockQty === 0 ? 'out-of-stock' : stockQty <= 15 ? 'low-stock' : 'in-stock';
                const stockLabel = stockQty === 0 ? 'Out of Stock' : stockQty <= 15 ? `Low (${stockQty})` : `In Stock (${stockQty})`;

                return (
                  <tr key={prod.id}>
                    <td>
                      <div className="product-cell">
                        <div className="product-thumb">
                          <img src={prod.image} alt={prod.title} loading="lazy" />
                        </div>
                        <div className="product-meta">
                          <h4 title={prod.title}>{prod.title}</h4>
                          <span style={{ fontSize: '11px', color: '#64748b' }}>ID: #{prod.id}</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="category-tag">{prod.category}</span>
                    </td>

                    <td style={{ fontWeight: 800, fontSize: '14px', color: '#ffffff' }}>
                      ${parseFloat(prod.price).toFixed(2)}
                    </td>

                    <td>
                      <span className={`stock-pill ${stockClass}`}>
                        {stockLabel}
                      </span>
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Star size={13} fill="#f59e0b" color="#f59e0b" />
                        <span style={{ fontWeight: 700 }}>
                          {prod.rating_rate || prod.rating?.rate || 4.5}
                        </span>
                        <span style={{ fontSize: '11px', color: '#9ca3af' }}>
                          ({prod.rating_count || prod.rating?.count || 120})
                        </span>
                      </div>
                    </td>

                    <td>
                      <div className="table-actions" style={{ justifyContent: 'flex-end' }}>
                        <button 
                          className="action-icon-btn edit" 
                          onClick={() => onEditProduct(prod)}
                          title="Edit Product Details"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button 
                          className="action-icon-btn delete" 
                          onClick={() => onDeleteProduct(prod.id, prod.title)}
                          title="Delete Product from Catalog"
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
