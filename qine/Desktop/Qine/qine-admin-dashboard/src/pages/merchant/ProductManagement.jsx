// src/pages/merchant/ProductManagement.jsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Plus, Edit, Trash2, Image, Package, 
  Search, Filter, Upload, X, Save
} from 'lucide-react';

const ProductManagement = () => {
  const { merchantId } = useParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Mock data - replace with API calls
  useEffect(() => {
    // Simulate fetching merchant type and products
    setTimeout(() => {
      // For product-based merchants
      setProducts([
        {
          id: 1,
          name: 'White Honey - 500g',
          description: 'Pure white honey from Tigray highlands',
          price: 350,
          cost: 250,
          stock: 45,
          category: 'Honey',
          image: null,
          sku: 'HNY-001',
          isActive: true,
          createdAt: '2024-03-01'
        },
        {
          id: 2,
          name: 'Forest Honey - 1kg',
          description: 'Rich forest honey from Oromia',
          price: 600,
          cost: 400,
          stock: 30,
          category: 'Honey',
          image: null,
          sku: 'HNY-002',
          isActive: true,
          createdAt: '2024-03-01'
        },
        {
          id: 3,
          name: 'Bee Wax - 250g',
          description: 'Natural beeswax for various uses',
          price: 200,
          cost: 120,
          stock: 60,
          category: 'Wax',
          image: null,
          sku: 'WAX-001',
          isActive: true,
          createdAt: '2024-03-02'
        }
      ]);

      setCategories(['Honey', 'Wax', 'Propolis', 'Equipment']);
      setLoading(false);
    }, 1000);
  }, [merchantId]);

  // For restaurant-style menu
  const [menuMode, setMenuMode] = useState(false); // false = products, true = menu
  const [menuCategories, setMenuCategories] = useState([
    { id: 1, name: 'Breakfast', items: [] },
    { id: 2, name: 'Lunch', items: [] },
    { id: 3, name: 'Dinner', items: [] },
    { id: 4, name: 'Drinks', items: [] }
  ]);

  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowModal(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowModal(true);
  };

  const handleDeleteProduct = (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      setProducts(products.filter(p => p.id !== productId));
    }
  };

  const handleSaveProduct = (productData) => {
    if (editingProduct) {
      // Update existing product
      setProducts(products.map(p => 
        p.id === editingProduct.id ? { ...p, ...productData } : p
      ));
    } else {
      // Add new product
      const newProduct = {
        id: Date.now(),
        ...productData,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setProducts([...products, newProduct]);
    }
    setShowModal(false);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 w-64 mb-6"></div>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-40 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Product Management</h1>
          <p className="text-gray-600 mt-1">Manage your products and inventory</p>
        </div>
        <button
          onClick={handleAddProduct}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </button>
      </div>

      {/* Mode Toggle (for restaurants) */}
      <div className="mb-6 bg-white rounded-lg shadow p-2 inline-flex">
        <button
          onClick={() => setMenuMode(false)}
          className={`px-4 py-2 rounded-lg ${
            !menuMode ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Products
        </button>
        <button
          onClick={() => setMenuMode(true)}
          className={`px-4 py-2 rounded-lg ${
            menuMode ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Menu Mode
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search products..."
              className="w-full pl-9 pr-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Product Grid */}
      {!menuMode ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map(product => (
            <div key={product.id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition">
              {/* Product Image */}
              <div className="h-48 bg-gray-100 relative group">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center space-x-2">
                  <button className="p-2 bg-white rounded-full hover:bg-gray-100">
                    <Upload className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{product.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{product.category}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                  {product.description}
                </p>

                <div className="mt-4 flex justify-between items-center">
                  <div>
                    <p className="text-lg font-bold text-blue-600">ETB {product.price}</p>
                    <p className="text-xs text-gray-500">Cost: ETB {product.cost}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditProduct(product)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* SKU */}
                <div className="mt-2 text-xs text-gray-400">
                  SKU: {product.sku}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Menu Mode - for restaurants */
        <div className="space-y-6">
          {menuCategories.map(category => (
            <div key={category.id} className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center">
                <h3 className="font-semibold text-lg">{category.name}</h3>
                <button className="text-blue-600 hover:text-blue-800">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4">
                {category.items.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No items in this category</p>
                ) : (
                  <div className="space-y-2">
                    {/* Menu items would go here */}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Product Modal */}
      {showModal && (
        <ProductModal
          product={editingProduct}
          categories={categories}
          onSave={handleSaveProduct}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

// Product Modal Component
const ProductModal = ({ product, categories, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || '',
    cost: product?.cost || '',
    stock: product?.stock || '',
    category: product?.category || '',
    sku: product?.sku || '',
    isActive: product?.isActive ?? true
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">
            {product ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Basic Info */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name *
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                rows="3"
                value={formData.description}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Selling Price (ETB) *
                </label>
                <input
                  type="number"
                  name="price"
                  required
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cost Price (ETB)
                </label>
                <input
                  type="number"
                  name="cost"
                  min="0"
                  step="0.01"
                  value={formData.cost}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Stock and Category */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock Quantity *
                </label>
                <input
                  type="number"
                  name="stock"
                  required
                  min="0"
                  value={formData.stock}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* SKU */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SKU (Stock Keeping Unit)
              </label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                placeholder="e.g., HNY-001"
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Image
              </label>
              <div className="border-2 border-dashed rounded-lg p-4 text-center">
                <Image className="mx-auto h-8 w-8 text-gray-400" />
                <p className="mt-1 text-sm text-gray-600">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-gray-500">
                  PNG, JPG up to 5MB
                </p>
                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">
                Active (visible to customers)
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div className="mt-6 flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Save className="w-4 h-4 mr-2" />
              {product ? 'Update' : 'Save'} Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductManagement;