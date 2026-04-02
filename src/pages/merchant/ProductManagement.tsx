// src/pages/merchant/ProductManagement.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  Package, Plus, Search, Edit3, Trash2, 
  DollarSign, Archive, TrendingUp, Eye,
  X, Save, Image as ImageIcon, Camera, 
  Loader2, Minus
} from 'lucide-react';
import apiClient from '../../api/client';
import merchantApi from '../../merchants';
const ProductManagement = () => {
  const { merchantId, businessModel, setBusinessModel } = useOutletContext();
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Product state
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [merchantId]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await merchantApi.getProducts(merchantId);
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await apiClient.get(`/merchants/${merchantId}/products`);
       const data = response.data;
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // Calculate stats from real products
  const lowStockProducts = products.filter(p => p.stock <= 5);
  const totalProducts = products.length;
  const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
  const topSeller = products.reduce((prev, current) => (prev.totalSold > current.totalSold) ? prev : current, products[0]);

  const handleAddProduct = async (productData) => {
    try {
      const newProduct = await merchantApi.createProduct(merchantId, {
        name: productData.name,
        description: productData.description,
        shortDesc: productData.description?.substring(0, 100),
        price: parseFloat(productData.price),
        stock: parseInt(productData.stock),
        sku: productData.sku || null,
        images: productData.image ? JSON.stringify([productData.image]) : null,
        categoryId: productData.categoryId || null,
        isActive: true,
        weight: productData.weight ? parseFloat(productData.weight) : null,
      });
      
      setProducts([...products, newProduct]);
      setIsProductModalOpen(false);
      alert(`✅ Product "${productData.name}" added successfully!`);
    } catch (error) {
      console.error('Error adding product:', error);
      alert('❌ Error adding product: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleUpdateProduct = async (productData) => {
    try {
      const updatedProduct = await merchantApi.updateProduct(editingProduct.id, {
        name: productData.name,
        description: productData.description,
        shortDesc: productData.description?.substring(0, 100),
        price: parseFloat(productData.price),
        stock: parseInt(productData.stock),
        sku: productData.sku || null,
        images: productData.image ? JSON.stringify([productData.image]) : null,
        categoryId: productData.categoryId || null,
      });
      
      setProducts(products.map(p => 
        p.id === editingProduct.id ? updatedProduct : p
      ));
      setEditingProduct(null);
      setIsProductModalOpen(false);
      alert(`✅ Product "${productData.name}" updated successfully!`);
    } catch (error) {
      console.error('Error updating product:', error);
      alert('❌ Error updating product: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteProduct = async (productId, productName) => {
    if (window.confirm(`Are you sure you want to delete "${productName}"?`)) {
      try {
        await merchantApi.deleteProduct(productId);
        setProducts(products.filter(p => p.id !== productId));
        alert('✅ Product deleted successfully!');
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('❌ Error deleting product: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const handleUpdateStock = async (productId, currentStock, change) => {
    const newStock = Math.max(0, currentStock + change);
    try {
      await merchantApi.updateStock(productId, newStock);
      setProducts(products.map(p => 
        p.id === productId ? { ...p, stock: newStock } : p
      ));
    } catch (error) {
      console.error('Error updating stock:', error);
      alert('❌ Error updating stock');
    }
  };

  const filteredProducts = products.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <span className="ml-3 text-slate-600">Loading products...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
        <Package className="w-12 h-12 text-red-400 mx-auto mb-3" />
        <p className="text-red-600 font-medium">{error}</p>
        <button 
          onClick={fetchProducts}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">Product Catalog</h1>
          <p className="text-slate-500 text-xs font-medium">Manage your products and inventory</p>
        </div>
        <button 
          onClick={() => {
            setEditingProduct(null);
            setIsProductModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition shadow-md"
        >
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <Package className="w-5 h-5 text-blue-500" />
            <span className="text-[9px] font-black text-slate-400 uppercase">Total</span>
          </div>
          <h3 className="text-2xl font-black text-slate-900">{totalProducts}</h3>
          <p className="text-[10px] text-slate-500 mt-1">Products</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-5 h-5 text-green-500" />
            <span className="text-[9px] font-black text-slate-400 uppercase">Value</span>
          </div>
          <h3 className="text-2xl font-black text-slate-900">ETB {totalValue.toLocaleString()}</h3>
          <p className="text-[10px] text-slate-500 mt-1">Inventory Value</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <Archive className="w-5 h-5 text-orange-500" />
            <span className="text-[9px] font-black text-slate-400 uppercase">Low Stock</span>
          </div>
          <h3 className="text-2xl font-black text-red-500">{lowStockProducts.length}</h3>
          <p className="text-[10px] text-slate-500 mt-1">Items need restock</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5 text-purple-500" />
            <span className="text-[9px] font-black text-slate-400 uppercase">Top Seller</span>
          </div>
          <h3 className="text-sm font-black text-slate-900 truncate">{topSeller?.name || '-'}</h3>
          <p className="text-[10px] text-slate-500 mt-1">{topSeller?.totalSold || 0} units sold</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
        <input 
          type="text" 
          placeholder="Search products by name, SKU, or category..." 
          className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50/50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Product</th>
              <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">SKU</th>
              <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Price</th>
              <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Stock</th>
              <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredProducts.map((product) => (
              <tr key={product.id} className="group hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                      {product.images ? (
                        <img 
                          src={JSON.parse(product.images)[0]} 
                          className="w-full h-full object-cover rounded-xl" 
                          alt={product.name} 
                        />
                      ) : (
                        <Package className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm tracking-tight">{product.name}</p>
                      <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest">
                        {product.category?.name || 'Uncategorized'}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs font-mono text-slate-500">{product.sku || '-'}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="font-bold text-slate-800">ETB {product.price}</span>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <button 
                      onClick={() => handleUpdateStock(product.id, product.stock, -1)}
                      className="p-1 hover:bg-red-50 rounded text-red-500 disabled:opacity-50"
                      disabled={product.stock <= 0}
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-black ${
                      product.stock <= 5 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                    }`}>
                      {product.stock} units
                    </span>
                    <button 
                      onClick={() => handleUpdateStock(product.id, product.stock, 1)}
                      className="p-1 hover:bg-green-50 rounded text-green-500"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => {
                        setEditingProduct(product);
                        setIsProductModalOpen(true);
                      }}
                      className="p-2 bg-white border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-200 rounded-lg transition"
                      title="Edit Product"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => handleDeleteProduct(product.id, product.name)}
                      className="p-2 bg-white border border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-200 rounded-lg transition"
                      title="Delete Product"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      className="p-2 bg-white border border-slate-200 text-slate-400 hover:text-blue-600 rounded-lg transition"
                      title="View Details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-400 font-medium">No products found</p>
            <button 
              onClick={() => setIsProductModalOpen(true)}
              className="mt-3 text-blue-600 text-sm font-medium hover:text-blue-700"
            >
              Add your first product →
            </button>
          </div>
        )}
      </div>

      {/* Product Modal */}
      {isProductModalOpen && (
        <ProductModal 
          product={editingProduct}
          categories={categories}
          onClose={() => {
            setIsProductModalOpen(false);
            setEditingProduct(null);
          }}
          onSave={editingProduct ? handleUpdateProduct : handleAddProduct}
        />
      )}
    </div>
  );
};

// Product Modal Component
const ProductModal = ({ product, categories, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || '',
    stock: product?.stock || '',
    sku: product?.sku || '',
    categoryId: product?.categoryId || '',
    image: product?.images ? JSON.parse(product.images)[0] : null
  });
  
  const [imagePreview, setImagePreview] = useState(
    product?.images ? JSON.parse(product.images)[0] : null
  );
  const [loading, setLoading] = useState(false);
  const imageInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData(prev => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price) {
      alert('❌ Please fill in Product Name and Price (required fields)');
      return;
    }
    
    setLoading(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Error saving product:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white p-6 border-b border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-bold">{product ? 'Edit Product' : 'Add New Product'}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Product Image Upload */}
          <div>
            <label className="text-xs font-bold uppercase text-slate-500 mb-2 block">Product Image (Optional)</label>
            <div className="relative h-40 bg-slate-50 rounded-xl overflow-hidden group border border-slate-200">
              {imagePreview ? (
                <img src={imagePreview} className="w-full h-full object-contain p-4" alt="Product preview" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center">
                  <ImageIcon className="w-12 h-12 text-slate-300 mb-2" />
                  <p className="text-xs text-slate-400">Click to upload product image</p>
                </div>
              )}
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="absolute inset-0 bg-black/50 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition"
              >
                <Camera className="w-5 h-5 text-white" />
                <span className="text-white text-sm">Upload Image</span>
              </button>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Recommended: Square format (1:1), PNG or JPG, clear image</p>
          </div>

          {/* Product Name - Required */}
          <div>
            <label className="text-xs font-bold uppercase text-slate-500 mb-1 block">
              Product Name <span className="text-red-500">*</span>
            </label>
            <input 
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="e.g., Organic White Honey (500g)"
            />
            <p className="text-[10px] text-slate-400 mt-1">Short and clear product name</p>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-bold uppercase text-slate-500 mb-1 block">Description</label>
            <textarea 
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none resize-none"
              placeholder="Brief description of the product (1-2 sentences)"
            />
            <p className="text-[10px] text-slate-400 mt-1">1-2 sentences describing the product</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Price - Required */}
            <div>
              <label className="text-xs font-bold uppercase text-slate-500 mb-1 block">
                Price (ETB) <span className="text-red-500">*</span>
              </label>
              <input 
                type="number"
                required
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                placeholder="0.00"
                step="0.01"
              />
              <p className="text-[10px] text-slate-400 mt-1">Current selling price</p>
            </div>
            
            {/* Stock Level */}
            <div>
              <label className="text-xs font-bold uppercase text-slate-500 mb-1 block">
                Stock Level <span className="text-red-500">*</span>
              </label>
              <input 
                type="number"
                required
                value={formData.stock}
                onChange={(e) => setFormData({...formData, stock: e.target.value})}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                placeholder="0"
              />
              <p className="text-[10px] text-slate-400 mt-1">Current inventory count</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* SKU */}
            <div>
              <label className="text-xs font-bold uppercase text-slate-500 mb-1 block">SKU (Optional)</label>
              <input 
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData({...formData, sku: e.target.value})}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                placeholder="e.g., HNY-001"
              />
            </div>
            
            {/* Category */}
            <div>
              <label className="text-xs font-bold uppercase text-slate-500 mb-1 block">Category</label>
              <select 
                value={formData.categoryId}
                onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold uppercase text-xs tracking-wider hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {product ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> {product ? 'Update Product' : 'Create Product'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductManagement;