// src/pages/merchant/InventoryManagement.jsx
import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  Package, AlertTriangle, ArrowUpRight, Search, 
  Edit3, Download, History, Plus, Minus, X, Save, 
  Loader2, TrendingDown, TrendingUp
} from 'lucide-react';
//import apiClient from '@/api/client'; // No `.ts` needed
//import merchantApi from '@/api/merchants';  // named import, matches your export
//import inventoryApi from '@/api/inventory'; // named import, matches your export
import apiClient from '@/api/client';
import { merchantApi } from '@/api/merchants';
import { inventoryApi } from '@/api/inventory';

const InventoryManagement = () => {
  const { merchantId, businessModel } = useOutletContext();
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustmentValue, setAdjustmentValue] = useState(0);
  const [adjustReason, setAdjustReason] = useState('restock');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [movements, setMovements] = useState([]);

  useEffect(() => {
    fetchInventory();
  }, [merchantId]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await merchantApi.getProducts(merchantId);
      setProducts(data);
      
      // Fetch inventory movements if history is open
      if (showHistory) {
        const movementsData = await inventoryApi.getMovements(merchantId);
        setMovements(movementsData);
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
      setError('Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  const fetchMovements = async () => {
    try {
      const data = await inventoryApi.getMovements(merchantId);
      setMovements(data);
    } catch (error) {
      console.error('Error fetching movements:', error);
    }
  };

  const handleOpenAdjust = (product) => {
    setSelectedProduct(product);
    setAdjustmentValue(0);
    setAdjustReason('restock');
    setShowAdjustModal(true);
  };

  const handleConfirmAdjustment = async () => {
    try {
      await inventoryApi.adjustInventory(
        selectedProduct.id, 
        adjustmentValue, 
        adjustReason
      );
      await fetchInventory();
      setShowAdjustModal(false);
      alert(`✅ Stock adjusted successfully!`);
    } catch (error) {
      console.error('Error adjusting stock:', error);
      alert('❌ Error adjusting stock');
    }
  };

  const handleQuickAdjust = async (productId, currentStock, change) => {
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

  const handleExport = () => {
    const csv = products.map(p => 
      `${p.sku || ''},${p.name},${p.stock},${p.price}`
    ).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    alert('✅ Inventory exported successfully!');
  };

  const handleViewHistory = async () => {
    setShowHistory(!showHistory);
    if (!showHistory) {
      await fetchMovements();
    }
  };

  const lowStockItems = products.filter(p => p.stock <= (p.lowStock || 5));
  const totalStockValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
  const outOfStockCount = products.filter(p => p.stock === 0).length;

  const getStockStatus = (stock, lowStock) => {
    if (stock === 0) return { label: 'Out of Stock', color: 'bg-red-100 text-red-600' };
    if (stock <= (lowStock || 5)) return { label: 'Low Stock', color: 'bg-yellow-100 text-yellow-600' };
    return { label: 'In Stock', color: 'bg-green-100 text-green-600' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <span className="ml-3 text-slate-600">Loading inventory...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
        <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-3" />
        <p className="text-red-600 font-medium">{error}</p>
        <button 
          onClick={fetchInventory}
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
          <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">Inventory Intelligence</h1>
          <p className="text-slate-500 text-xs font-medium">Real-time stock tracking and valuation</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleExport}
            className="p-3 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition shadow-sm"
            title="Export Inventory"
          >
            <Download className="w-4 h-4" />
          </button>
          <button 
            onClick={handleViewHistory}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition ${
              showHistory 
                ? 'bg-blue-600 text-white' 
                : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
          >
            <History className="w-4 h-4" /> {showHistory ? 'Hide History' : 'Audit Log'}
          </button>
        </div>
      </div>

      {/* Analytics Mini-Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Stock Value</p>
          <h3 className="text-xl font-black text-slate-900">ETB {totalStockValue.toLocaleString()}</h3>
          <div className="flex items-center gap-1 mt-1 text-emerald-600 text-[10px] font-bold">
            <ArrowUpRight className="w-3 h-3" /> +4.2%
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Items</p>
          <h3 className="text-xl font-black text-slate-900">
            {products.reduce((sum, p) => sum + p.stock, 0)}
          </h3>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-red-50 shadow-sm relative overflow-hidden cursor-pointer hover:shadow-md transition"
             onClick={() => {
               const lowItems = lowStockItems.map(i => i.name).join('\n');
               alert(`⚠️ Low Stock Items:\n${lowItems || 'None'}`);
             }}>
          <p className="text-[9px] font-black text-red-400 uppercase tracking-widest mb-1">Alerts</p>
          <h3 className="text-xl font-black text-red-600">{lowStockItems.length} SKUs Low</h3>
          <AlertTriangle className="absolute -right-2 -bottom-2 w-12 h-12 text-red-500/5" />
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Out of Stock</p>
          <h3 className="text-xl font-black text-orange-600">{outOfStockCount}</h3>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
        <input 
          type="text" 
          placeholder="Search by SKU or name..." 
          className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50/50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Product SKU</th>
              <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Product Name</th>
              <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Stock</th>
              <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
              <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
             </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {products.filter(p => 
              p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
            ).map((product) => {
              const status = getStockStatus(product.stock, product.lowStock);
              return (
                <tr key={product.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-xs font-mono text-slate-500">{product.sku || '-'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                        <Package className="w-4 h-4 text-slate-400" />
                      </div>
                      <span className="font-medium text-slate-800">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button 
                        onClick={() => handleQuickAdjust(product.id, product.stock, -1)}
                        className="p-1 hover:bg-red-50 rounded text-red-500 disabled:opacity-50"
                        disabled={product.stock <= 0}
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className={`text-base font-black min-w-[60px] text-center ${
                        product.stock <= (product.lowStock || 5) ? 'text-red-500' : 'text-slate-900'
                      }`}>
                        {product.stock}
                      </span>
                      <button 
                        onClick={() => handleQuickAdjust(product.id, product.stock, 1)}
                        className="p-1 hover:bg-green-50 rounded text-green-500"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="w-24 h-1 bg-slate-100 rounded-full mt-1 mx-auto overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${product.stock <= (product.lowStock || 5) ? 'bg-red-400' : 'bg-blue-500'}`}
                        style={{ width: `${Math.min((product.stock / 100) * 100, 100)}%` }}
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-black ${status.color}`}>
                      {status.label}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-1.5">
                      <button 
                        onClick={() => handleOpenAdjust(product)}
                        className="p-2 bg-slate-900 text-white rounded-lg shadow-md hover:bg-blue-600 transition-all"
                        title="Adjust stock"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {products.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-400 font-medium">No products found</p>
            <p className="text-slate-400 text-sm">Add products to start tracking inventory</p>
          </div>
        )}
      </div>

      {/* Movement History Section */}
      {showHistory && (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <History className="w-4 h-4" />
              Inventory Movement History
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3 text-xs font-black text-slate-400 uppercase">Date</th>
                  <th className="px-6 py-3 text-xs font-black text-slate-400 uppercase">Product</th>
                  <th className="px-6 py-3 text-xs font-black text-slate-400 uppercase">Type</th>
                  <th className="px-6 py-3 text-xs font-black text-slate-400 uppercase">Quantity</th>
                  <th className="px-6 py-3 text-xs font-black text-slate-400 uppercase">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {movements.slice(0, 10).map((movement, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="px-6 py-3 text-sm text-slate-600">
                      {new Date(movement.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3 text-sm font-medium text-slate-800">{movement.productName}</td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-black ${
                        movement.type === 'IN' ? 'bg-green-100 text-green-600' : 
                        movement.type === 'OUT' ? 'bg-red-100 text-red-600' : 
                        'bg-yellow-100 text-yellow-600'
                      }`}>
                        {movement.type === 'IN' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {movement.type}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm text-slate-600">
                      {movement.quantity > 0 ? `+${movement.quantity}` : movement.quantity}
                    </td>
                    <td className="px-6 py-3 text-sm text-slate-500 capitalize">{movement.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Adjustment Modal */}
      {showAdjustModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Adjust Stock</h2>
              <button onClick={() => setShowAdjustModal(false)} className="p-2 hover:bg-slate-50 rounded-full transition">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 mb-6">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{selectedProduct?.sku || 'Product'}</p>
              <h4 className="font-bold text-slate-800">{selectedProduct?.name}</h4>
              <p className="text-sm text-slate-500 mt-2">Current Stock: <span className="font-bold">{selectedProduct?.stock}</span></p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase text-slate-500 mb-1 block">Adjustment Type</label>
                <select 
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                >
                  <option value="restock">Restock (Add)</option>
                  <option value="sale">Sale (Subtract)</option>
                  <option value="damage">Damaged/Lost</option>
                  <option value="return">Customer Return</option>
                  <option value="count">Physical Count</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-slate-500 mb-1 block">Quantity</label>
                <div className="flex items-center justify-between bg-slate-50 p-2 rounded-xl border border-slate-100">
                  <button 
                    onClick={() => setAdjustmentValue(prev => prev - 1)}
                    className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm text-slate-600 hover:text-red-600 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <div className="text-center">
                    <span className={`text-xl font-black ${adjustmentValue >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                      {adjustmentValue > 0 ? `+${adjustmentValue}` : adjustmentValue}
                    </span>
                  </div>
                  <button 
                    onClick={() => setAdjustmentValue(prev => prev + 1)}
                    className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm text-slate-600 hover:text-emerald-600 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100/30 text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Final Inventory</p>
                <span className="text-lg font-black text-slate-900">
                  {Math.max(0, (selectedProduct?.stock || 0) + adjustmentValue)} Units
                </span>
              </div>

              <button 
                onClick={handleConfirmAdjustment}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all uppercase text-[10px] tracking-widest"
              >
                <Save className="w-4 h-4" /> Save Adjustment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryManagement;