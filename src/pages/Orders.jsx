import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, RefreshCw } from 'lucide-react';
import apiClient from '../api/client';

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editOrder, setEditOrder] = useState(null);

  // Fetch orders from API
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/orders');
      setOrders(response.data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'DELIVERED': 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100',
      'PENDING': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100',
      'CONFIRMED': 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100',
      'PREPARING': 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100',
      'READY': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-800 dark:text-indigo-100',
      'ASSIGNED': 'bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-100',
      'PICKED_UP': 'bg-teal-100 text-teal-800 dark:bg-teal-800 dark:text-teal-100',
      'IN_TRANSIT': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-800 dark:text-cyan-100',
      'CANCELLED': 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100';
  };

  const filteredOrders = orders.filter((order) => {
    const statusMatch = statusFilter === "all" || order.status === statusFilter;
    const searchMatch =
      !search ||
      order.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
      order.customer?.firstName?.toLowerCase().includes(search.toLowerCase()) ||
      order.merchant?.businessName?.toLowerCase().includes(search.toLowerCase());
    return statusMatch && searchMatch;
  });

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await apiClient.patch(`/orders/${orderId}/status`, { status: newStatus });
      fetchOrders();
      setEditOrder(null);
      setSelectedOrder(null);
      alert(`✅ Order status updated to ${newStatus}`);
    } catch (error) {
      alert('❌ Error updating order status');
    }
  };

  const parseItems = (items) => {
    if (!items) return [];
    if (Array.isArray(items)) return items;
    if (typeof items === 'string') {
      try { return JSON.parse(items); } catch { return []; }
    }
    return [];
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 w-64 mb-6 rounded"></div>
          <div className="grid grid-cols-5 gap-4 mb-6">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const orderStats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'PENDING').length,
    confirmed: orders.filter(o => o.status === 'CONFIRMED').length,
    preparing: orders.filter(o => o.status === 'PREPARING').length,
    ready: orders.filter(o => o.status === 'READY').length,
    delivered: orders.filter(o => o.status === 'DELIVERED').length,
    cancelled: orders.filter(o => o.status === 'CANCELLED').length,
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 dark:bg-gray-900">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          Orders Management
        </h1>
        <button
          onClick={fetchOrders}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4 mb-6 lg:mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{orderStats.total}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border dark:border-gray-700">
          <p className="text-sm text-gray-500">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{orderStats.pending}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border dark:border-gray-700">
          <p className="text-sm text-gray-500">Confirmed</p>
          <p className="text-2xl font-bold text-blue-600">{orderStats.confirmed}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border dark:border-gray-700">
          <p className="text-sm text-gray-500">Preparing</p>
          <p className="text-2xl font-bold text-purple-600">{orderStats.preparing}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border dark:border-gray-700">
          <p className="text-sm text-gray-500">Ready</p>
          <p className="text-2xl font-bold text-indigo-600">{orderStats.ready}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border dark:border-gray-700">
          <p className="text-sm text-gray-500">Delivered</p>
          <p className="text-2xl font-bold text-green-600">{orderStats.delivered}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border dark:border-gray-700">
          <p className="text-sm text-gray-500">Cancelled</p>
          <p className="text-2xl font-bold text-red-600">{orderStats.cancelled}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6 border dark:border-gray-700">
        <div className="flex flex-wrap gap-4 items-center">
          <Filter size={18} />
          <select
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border px-3 py-2 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PREPARING">Preparing</option>
            <option value="READY">Ready</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="PICKED_UP">Picked Up</option>
            <option value="IN_TRANSIT">In Transit</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order #, customer, or merchant..."
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border overflow-hidden dark:border-gray-700">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="py-4 px-6 text-left">Order #</th>
              <th className="py-4 px-6 text-left">Customer</th>
              <th className="py-4 px-6 text-left">Merchant</th>
              <th className="py-4 px-6 text-left">Items</th>
              <th className="py-4 px-6 text-left">Amount</th>
              <th className="py-4 px-6 text-left">Status</th>
              <th className="py-4 px-6 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => {
              const itemsList = parseItems(order.items);
              return (
                <tr
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className="border-t cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="py-4 px-6 font-medium">{order.orderNumber}</td>
                  <td className="py-4 px-6">
                    {order.customer?.firstName} {order.customer?.lastName}
                  </td>
                  <td className="py-4 px-6">{order.merchant?.businessName || 'N/A'}</td>
                  <td className="py-4 px-6">{itemsList.length}</td>
                  <td className="py-4 px-6 text-teal-600 font-semibold">ETB {order.total}</td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditOrder(order);
                        setSelectedOrder(null);
                      }}
                      className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm"
                    >
                      Update Status
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No orders found
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-[500px] max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              Order {selectedOrder.orderNumber}
            </h2>
            <p><b>Customer:</b> {selectedOrder.customer?.firstName} {selectedOrder.customer?.lastName}</p>
            <p><b>Email:</b> {selectedOrder.customer?.email || 'N/A'}</p>
            <p><b>Phone:</b> {selectedOrder.customer?.phone || 'N/A'}</p>
            <p><b>Merchant:</b> {selectedOrder.merchant?.businessName || 'N/A'}</p>
            <p><b>Payment:</b> {selectedOrder.paymentMethod} • {selectedOrder.paymentStatus}</p>
            <p><b>Status:</b> {selectedOrder.status}</p>

            <h3 className="font-semibold mt-4 mb-2">Items</h3>
            <ul className="list-disc ml-6">
              {parseItems(selectedOrder.items).map((item, i) => (
                <li key={i}>{item.quantity}x {item.name} - ETB {item.price * item.quantity}</li>
              ))}
            </ul>
            <p className="mt-3 font-bold">Total: ETB {selectedOrder.total}</p>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => {
                  setEditOrder(selectedOrder);
                  setSelectedOrder(null);
                }}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white"
              >
                Update Status
              </button>
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 rounded-lg bg-gray-300 dark:bg-gray-700 dark:text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Status Modal */}
      {editOrder && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-[400px]">
            <h2 className="text-xl font-bold mb-4">
              Update Status - {editOrder.orderNumber}
            </h2>

            <label className="block mb-2 font-medium">Status:</label>
            <select
              value={editOrder.status}
              onChange={(e) => setEditOrder({ ...editOrder, status: e.target.value })}
              className="w-full border px-3 py-2 mb-4 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="PREPARING">Preparing</option>
              <option value="READY">Ready</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="PICKED_UP">Picked Up</option>
              <option value="IN_TRANSIT">In Transit</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setEditOrder(null)}
                className="px-4 py-2 bg-gray-300 rounded-lg dark:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpdateStatus(editOrder.id, editOrder.status)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg"
              >
                Save Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;