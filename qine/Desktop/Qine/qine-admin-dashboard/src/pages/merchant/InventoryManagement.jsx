// src/pages/merchant/InventoryManagement.jsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Package, AlertTriangle, Search, Filter, 
  Plus, Minus, Edit, Save, X, ArrowUp, ArrowDown,
  History, Download
} from 'lucide-react';

const InventoryManagement = () => {
  const { merchantId } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [adjustQuantity, setAdjustQuantity] = useState(0);
  const [adjustReason, setAdjustReason] = useState('restock');
  const [showHistory, setShowHistory] = useState(false);
  const [lowStockThreshold, setLowStockThreshold] = useState(10);

  // Fetch products from API
  useEffect(() => {
    fetchProducts();
  }, [merchantId]);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`http://localhost:5001/api/merchants/${merchantId}/products`);
      const data = await response.json();
      setProducts(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setLoading(false);
    }
  };

  // Update product stock
  const updateStock = async (productId, newStock) => {
    try {
      await fetch(`http://localhost:5001/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: newStock })
      });
      fetchProducts(); // Refresh the list
    } catch (error) {
      console.error('Error updating stock:', error);
    }
  };

  const handleAdjustStock = () => {
    if (selectedProduct) {
      const newStock = selectedProduct.stock + adjustQuantity;
      updateStock(selectedProduct.id, newStock);
      setShowAdjustModal(false);
      setSelectedProduct(null);
      setAdjustQuantity(0);
    }
  };

  const getStockStatus = (stock) => {
    if (stock <= 0) return { label: 'Out of Stock', color: 'bg-red-100 text-red-800' };
    if (stock <= lowStockThreshold) return { label: 'Low Stock', color: 'bg-yellow-100 text-yellow-800' };
    return { label: 'In Stock', color: 'bg-green-100 text-green-800' };
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockProducts = products.filter(p => p.stock <= lowStockThreshold && p.stock > 0);
  const outOfStockProducts = products.filter(p => p.stock <= 0);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 w-64 mb-6"></div>
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-200 rounded"></div>)}
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
          <h1 className="text-2xl font-bold">Inventory Management</h1>
          <p className="text-gray-600 mt-1">Track and manage your stock levels</p>
        </div>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center"
        >
          <History className="w-4 h-4 mr-2" />
          Stock History
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Total Products</p>
          <p className="text-2xl font-bold">{products.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Total Items</p>
          <p className="text-2xl font-bold">
            {products.reduce((sum, p) => sum + p.stock, 0)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Low Stock</p>
          <p className="text-2xl font-bold text-yellow-600">{lowStockProducts.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Out of Stock</p>
          <p className="text-2xl font-bold text-red-600">{outOfStockProducts.length}</p>
        </div>
      </div>

      {/* Low Stock Alerts */}
      {lowStockProducts.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center mb-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
            <h3 className="font-semibold text-yellow-800">Low Stock Alerts</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {lowStockProducts.slice(0, 3).map(p => (
              <div key={p.id} className="flex justify-between items-center bg-white p-2 rounded">
                <span className="text-sm font-medium">{p.name}</span>
                <span className="text-sm text-yellow-600">Stock: {p.stock}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search products by name or SKU..."
              className="w-full pl-9 pr-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            value={lowStockThreshold}
            onChange={(e) => setLowStockThreshold(Number(e.target.value))}
            className="border rounded-lg px-3 py-2"
          >
            <option value="5">Low stock: ≤5</option>
            <option value="10">Low stock: ≤10</option>
            <option value="20">Low stock: ≤20</option>
            <option value="50">Low stock: ≤50</option>
          </select>
          <button className="flex items-center px-3 py-2 border rounded-lg hover:bg-gray-50">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left py-3 px-4 font-semibold text-sm">Product</th>
              <th className="text-left py-3 px-4 font-semibold text-sm">SKU</th>
              <th className="text-left py-3 px-4 font-semibold text-sm">Price</th>
              <th className="text-left py-3 px-4 font-semibold text-sm">Current Stock</th>
              <th className="text-left py-3 px-4 font-semibold text-sm">Status</th>
              <th className="text-left py-3 px-4 font-semibold text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map(product => {
              const status = getStockStatus(product.stock);
              return (
                <tr key={product.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg mr-3 flex items-center justify-center">
                        <Package className="w-5 h-5 text-gray-500" />
                      </div>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-xs text-gray-500">{product.description?.substring(0, 50)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm">{product.sku || '-'}</td>
                  <td className="py-3 px-4 font-medium">ETB {product.price}</td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-lg">{product.stock}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${status.color}`}>
                      {status.label}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedProduct(product);
                          setAdjustQuantity(-1);
                          setAdjustReason('sale');
                          setShowAdjustModal(true);
                        }}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        title="Sell one"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedProduct(product);
                          setAdjustQuantity(1);
                          setAdjustReason('restock');
                          setShowAdjustModal(true);
                        }}
                        className="p-1 text-green-600 hover:bg-green-50 rounded"
                        title="Add one"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedProduct(product);
                          setAdjustQuantity(0);
                          setShowAdjustModal(true);
                        }}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="Adjust stock"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Adjust Stock Modal */}
      {showAdjustModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold">Adjust Stock</h2>
              <button onClick={() => setShowAdjustModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <p className="font-medium">{selectedProduct.name}</p>
                <p className="text-sm text-gray-500">Current Stock: {selectedProduct.stock}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adjustment Type
                  </label>
                  <select
                    value={adjustReason}
                    onChange={(e) => setAdjustReason(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="restock">Restock (Add)</option>
                    <option value="sale">Sale (Subtract)</option>
                    <option value="damage">Damaged/Lost</option>
                    <option value="return">Customer Return</option>
                    <option value="count">Physical Count</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity to Adjust
                  </label>
                  <div className="flex items-center">
                    <button
                      onClick={() => setAdjustQuantity(prev => prev - 1)}
                      className="p-2 border rounded-l-lg hover:bg-gray-100"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <input
                      type="number"
                      value={adjustQuantity}
                      onChange={(e) => setAdjustQuantity(Number(e.target.value))}
                      className="w-24 text-center border-t border-b py-2 focus:outline-none"
                    />
                    <button
                      onClick={() => setAdjustQuantity(prev => prev + 1)}
                      className="p-2 border rounded-r-lg hover:bg-gray-100"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    New stock will be: {selectedProduct.stock + adjustQuantity}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes (Optional)
                  </label>
                  <textarea
                    className="w-full border rounded-lg px-3 py-2"
                    rows="2"
                    placeholder="Add notes about this adjustment..."
                  ></textarea>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowAdjustModal(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdjustStock}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Confirm Adjustment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryManagement;