// src/pages/merchant/OrderManagement.jsx
import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  ShoppingBag, Clock, CheckCircle, XCircle, 
  Truck, Package, Search, Filter, Eye,
  ChevronDown, ChevronUp, Phone, MapPin,
  Calendar, DollarSign, Loader2, RefreshCw
} from 'lucide-react';
import { merchantApi } from '../../api/merchants.js';
//import { merchantApi } from '../api/merchants';
const OrderManagement = () => {
  const { merchantId } = useOutletContext();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [merchantId]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await merchantApi.getOrders(merchantId);
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await merchantApi.updateOrderStatus(orderId, newStatus);
      await fetchOrders();
      alert(`✅ Order status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('❌ Error updating order status');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'PENDING': { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      'CONFIRMED': { color: 'bg-blue-100 text-blue-800', label: 'Confirmed' },
      'PREPARING': { color: 'bg-purple-100 text-purple-800', label: 'Preparing' },
      'READY': { color: 'bg-indigo-100 text-indigo-800', label: 'Ready' },
      'ASSIGNED': { color: 'bg-orange-100 text-orange-800', label: 'Assigned' },
      'PICKED_UP': { color: 'bg-teal-100 text-teal-800', label: 'Picked Up' },
      'IN_TRANSIT': { color: 'bg-cyan-100 text-cyan-800', label: 'In Transit' },
      'DELIVERED': { color: 'bg-green-100 text-green-800', label: 'Delivered' },
      'CANCELLED': { color: 'bg-red-100 text-red-800', label: 'Cancelled' }
    };
    return badges[status] || badges.PENDING;
  };

  const getNextStatusOptions = (currentStatus) => {
    const statusFlow = {
      'PENDING': ['CONFIRMED', 'CANCELLED'],
      'CONFIRMED': ['PREPARING', 'CANCELLED'],
      'PREPARING': ['READY', 'CANCELLED'],
      'READY': ['ASSIGNED'],
      'ASSIGNED': ['PICKED_UP'],
      'PICKED_UP': ['IN_TRANSIT'],
      'IN_TRANSIT': ['DELIVERED'],
    };
    return statusFlow[currentStatus] || [];
  };

  const filteredOrders = orders.filter(order => {
    if (statusFilter !== 'all' && order.status !== statusFilter) return false;
    if (searchTerm) {
      return order.orderNumber.includes(searchTerm) ||
             order.customer?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
             order.customer?.lastName?.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return true;
  });

  const orderStats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'PENDING').length,
    confirmed: orders.filter(o => o.status === 'CONFIRMED').length,
    preparing: orders.filter(o => o.status === 'PREPARING').length,
    ready: orders.filter(o => o.status === 'READY').length,
    inTransit: orders.filter(o => ['ASSIGNED', 'PICKED_UP', 'IN_TRANSIT'].includes(o.status)).length,
    delivered: orders.filter(o => o.status === 'DELIVERED').length,
    cancelled: orders.filter(o => o.status === 'CANCELLED').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <span className="ml-3 text-slate-600">Loading orders...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">Order Management</h1>
          <p className="text-slate-500 text-xs font-medium">Manage and track customer orders</p>
        </div>
        <button 
          onClick={handleRefresh}
          className="flex items-center gap-2 px-4 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-100">
          <p className="text-[9px] text-slate-400">Total</p>
          <p className="text-lg font-bold">{orderStats.total}</p>
        </div>
        <div className="bg-yellow-50 rounded-xl p-3 shadow-sm border border-yellow-100">
          <p className="text-[9px] text-yellow-600">Pending</p>
          <p className="text-lg font-bold text-yellow-700">{orderStats.pending}</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-3 shadow-sm border border-blue-100">
          <p className="text-[9px] text-blue-600">Confirmed</p>
          <p className="text-lg font-bold text-blue-700">{orderStats.confirmed}</p>
        </div>
        <div className="bg-purple-50 rounded-xl p-3 shadow-sm border border-purple-100">
          <p className="text-[9px] text-purple-600">Preparing</p>
          <p className="text-lg font-bold text-purple-700">{orderStats.preparing}</p>
        </div>
        <div className="bg-indigo-50 rounded-xl p-3 shadow-sm border border-indigo-100">
          <p className="text-[9px] text-indigo-600">Ready</p>
          <p className="text-lg font-bold text-indigo-700">{orderStats.ready}</p>
        </div>
        <div className="bg-orange-50 rounded-xl p-3 shadow-sm border border-orange-100">
          <p className="text-[9px] text-orange-600">In Transit</p>
          <p className="text-lg font-bold text-orange-700">{orderStats.inTransit}</p>
        </div>
        <div className="bg-green-50 rounded-xl p-3 shadow-sm border border-green-100">
          <p className="text-[9px] text-green-600">Delivered</p>
          <p className="text-lg font-bold text-green-700">{orderStats.delivered}</p>
        </div>
        <div className="bg-red-50 rounded-xl p-3 shadow-sm border border-red-100">
          <p className="text-[9px] text-red-600">Cancelled</p>
          <p className="text-lg font-bold text-red-700">{orderStats.cancelled}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium">Status:</span>
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="all">All Orders</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PREPARING">Preparing</option>
            <option value="READY">Ready</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_TRANSIT">In Transit</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by order # or customer..."
              className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map(order => {
          const statusBadge = getStatusBadge(order.status);
          const nextStatuses = getNextStatusOptions(order.status);
          const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;

          return (
            <div key={order.id} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
              {/* Order Header */}
              <div className="px-6 py-4 bg-gray-50 flex flex-wrap items-center justify-between">
                <div className="flex items-center space-x-4">
                  <ShoppingBag className="w-5 h-5 text-gray-500" />
                  <div>
                    <span className="font-semibold">{order.orderNumber}</span>
                    <span className="text-sm text-gray-500 ml-2">
                      • {new Date(order.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${statusBadge.color}`}>
                    {statusBadge.label}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedOrder(selectedOrder === order.id ? null : order.id)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  {selectedOrder === order.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
              </div>

              {/* Order Summary */}
              <div className="px-6 py-4 grid grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Customer</p>
                  <p className="font-medium">{order.customer?.firstName} {order.customer?.lastName}</p>
                  <div className="flex items-center text-sm text-gray-600 mt-1">
                    <Phone className="w-3 h-3 mr-1" />
                    {order.customer?.phone}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Items</p>
                  <p className="font-medium">{items?.length || 0} items</p>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                    {items?.map(i => i.name).join(', ')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total</p>
                  <p className="font-bold text-lg">ETB {order.total}</p>
                  <p className="text-xs text-gray-500">
                    {order.paymentMethod} • {order.paymentStatus}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Delivery</p>
                  <div className="flex items-center text-sm">
                    <MapPin className="w-3 h-3 mr-1 text-gray-400" />
                    {typeof order.deliveryAddress === 'string' ? 
                      JSON.parse(order.deliveryAddress)?.address : 
                      order.deliveryAddress?.address}
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {selectedOrder === order.id && (
                <div className="px-6 py-4 border-t bg-gray-50">
                  <h4 className="font-semibold mb-3">Order Items</h4>
                  <table className="w-full mb-4">
                    <thead className="text-xs text-gray-500">
                      <tr>
                        <th className="text-left py-2">Item</th>
                        <th className="text-left py-2">Qty</th>
                        <th className="text-left py-2">Price</th>
                        <th className="text-left py-2">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items?.map((item, idx) => (
                        <tr key={idx} className="border-t">
                          <td className="py-2">{item.name}</td>
                          <td className="py-2">{item.quantity}</td>
                          <td className="py-2">ETB {item.price}</td>
                          <td className="py-2">ETB {item.price * item.quantity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Action Buttons */}
                  {order.status === 'PENDING' && (
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'CONFIRMED')}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Accept Order
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'CANCELLED')}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject Order
                      </button>
                    </div>
                  )}

                  {nextStatuses.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Update Status:</p>
                      <div className="flex flex-wrap gap-2">
                        {nextStatuses.map(status => (
                          <button
                            key={status}
                            onClick={() => handleUpdateStatus(order.id, status)}
                            className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-700"
                          >
                            Mark as {status}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-400 font-medium">No orders found</p>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;