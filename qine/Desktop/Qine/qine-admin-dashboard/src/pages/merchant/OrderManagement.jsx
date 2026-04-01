// src/pages/merchant/OrderManagement.jsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  ShoppingBag, Clock, CheckCircle, XCircle, 
  Truck, Package, Search, Filter, Eye,
  ChevronDown, ChevronUp, Phone, MapPin,
  Calendar, DollarSign
} from 'lucide-react';

const OrderManagement = () => {
  const { merchantId } = useParams();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('today');

  // Mock data - replace with API calls
  useEffect(() => {
    fetchOrders();
  }, [merchantId]);

  const fetchOrders = async () => {
    // Simulate API call
    setTimeout(() => {
      setOrders([
        {
          id: 'ORD-001',
          orderNumber: '#1234',
          customer: {
            name: 'Abebe Kebede',
            phone: '+251911223344',
            address: 'Bole, Addis Ababa'
          },
          items: [
            { name: 'White Honey - 500g', quantity: 2, price: 350 },
            { name: 'Bee Wax - 250g', quantity: 1, price: 200 }
          ],
          subtotal: 900,
          deliveryFee: 50,
          total: 950,
          status: 'pending',
          paymentMethod: 'cash',
          paymentStatus: 'pending',
          createdAt: '2024-03-12T10:30:00',
          estimatedDelivery: '2024-03-12T12:30:00'
        },
        {
          id: 'ORD-002',
          orderNumber: '#1235',
          customer: {
            name: 'Sara Hailu',
            phone: '+251922334455',
            address: 'Merkato, Addis Ababa'
          },
          items: [
            { name: 'Forest Honey - 1kg', quantity: 1, price: 600 }
          ],
          subtotal: 600,
          deliveryFee: 50,
          total: 650,
          status: 'confirmed',
          paymentMethod: 'card',
          paymentStatus: 'paid',
          createdAt: '2024-03-12T11:15:00',
          estimatedDelivery: '2024-03-12T13:15:00'
        },
        {
          id: 'ORD-003',
          orderNumber: '#1236',
          customer: {
            name: 'Yonas Desta',
            phone: '+251933445566',
            address: 'Piassa, Addis Ababa'
          },
          items: [
            { name: 'Notebook A4', quantity: 5, price: 85 },
            { name: 'Pen Pack', quantity: 2, price: 120 }
          ],
          subtotal: 665,
          deliveryFee: 0,
          total: 665,
          status: 'preparing',
          paymentMethod: 'wallet',
          paymentStatus: 'paid',
          createdAt: '2024-03-12T09:45:00',
          estimatedDelivery: '2024-03-12T11:45:00'
        }
      ]);
      setLoading(false);
    }, 1000);
  };

  const handleAcceptOrder = (orderId) => {
    setOrders(orders.map(o => 
      o.id === orderId ? { ...o, status: 'confirmed' } : o
    ));
  };

  const handleRejectOrder = (orderId) => {
    setOrders(orders.map(o => 
      o.id === orderId ? { ...o, status: 'cancelled' } : o
    ));
  };

  const handleUpdateStatus = (orderId, newStatus) => {
    setOrders(orders.map(o => 
      o.id === orderId ? { ...o, status: newStatus } : o
    ));
  };

  const getStatusBadge = (status) => {
    const badges = {
      'pending': { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      'confirmed': { color: 'bg-blue-100 text-blue-800', label: 'Confirmed' },
      'preparing': { color: 'bg-purple-100 text-purple-800', label: 'Preparing' },
      'ready': { color: 'bg-indigo-100 text-indigo-800', label: 'Ready for Pickup' },
      'assigned': { color: 'bg-orange-100 text-orange-800', label: 'Assigned to Rider' },
      'picked_up': { color: 'bg-teal-100 text-teal-800', label: 'Picked Up' },
      'in_transit': { color: 'bg-cyan-100 text-cyan-800', label: 'In Transit' },
      'delivered': { color: 'bg-green-100 text-green-800', label: 'Delivered' },
      'cancelled': { color: 'bg-red-100 text-red-800', label: 'Cancelled' }
    };
    return badges[status] || badges.pending;
  };

  const getNextStatusOptions = (currentStatus) => {
    const statusFlow = {
      'pending': ['confirmed', 'cancelled'],
      'confirmed': ['preparing', 'cancelled'],
      'preparing': ['ready', 'cancelled'],
      'ready': ['assigned'],
      'assigned': ['picked_up'],
      'picked_up': ['in_transit'],
      'in_transit': ['delivered'],
      'delivered': [],
      'cancelled': []
    };
    return statusFlow[currentStatus] || [];
  };

  const filteredOrders = orders.filter(order => {
    if (statusFilter !== 'all' && order.status !== statusFilter) return false;
    if (searchTerm) {
      return order.orderNumber.includes(searchTerm) ||
             order.customer.name.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return true;
  });

  const orderStats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    preparing: orders.filter(o => o.status === 'preparing').length,
    ready: orders.filter(o => o.status === 'ready').length,
    inTransit: orders.filter(o => ['assigned', 'picked_up', 'in_transit'].includes(o.status)).length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 w-64 mb-6"></div>
          <div className="grid grid-cols-7 gap-4 mb-6">
            {[1,2,3,4,5,6,7].map(i => <div key={i} className="h-20 bg-gray-200 rounded"></div>)}
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
          <h1 className="text-2xl font-bold">Order Management</h1>
          <p className="text-gray-600 mt-1">Manage and track customer orders</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="border rounded-lg px-3 py-2"
          >
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-7 gap-3 mb-6">
        <div className="bg-white rounded-lg shadow p-3">
          <p className="text-xs text-gray-600">Total</p>
          <p className="text-xl font-bold">{orderStats.total}</p>
        </div>
        <div className="bg-yellow-50 rounded-lg shadow p-3 border border-yellow-100">
          <p className="text-xs text-yellow-800">Pending</p>
          <p className="text-xl font-bold text-yellow-600">{orderStats.pending}</p>
        </div>
        <div className="bg-blue-50 rounded-lg shadow p-3 border border-blue-100">
          <p className="text-xs text-blue-800">Confirmed</p>
          <p className="text-xl font-bold text-blue-600">{orderStats.confirmed}</p>
        </div>
        <div className="bg-purple-50 rounded-lg shadow p-3 border border-purple-100">
          <p className="text-xs text-purple-800">Preparing</p>
          <p className="text-xl font-bold text-purple-600">{orderStats.preparing}</p>
        </div>
        <div className="bg-orange-50 rounded-lg shadow p-3 border border-orange-100">
          <p className="text-xs text-orange-800">In Transit</p>
          <p className="text-xl font-bold text-orange-600">{orderStats.inTransit}</p>
        </div>
        <div className="bg-green-50 rounded-lg shadow p-3 border border-green-100">
          <p className="text-xs text-green-800">Delivered</p>
          <p className="text-xl font-bold text-green-600">{orderStats.delivered}</p>
        </div>
        <div className="bg-red-50 rounded-lg shadow p-3 border border-red-100">
          <p className="text-xs text-red-800">Cancelled</p>
          <p className="text-xl font-bold text-red-600">{orderStats.cancelled}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
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
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="preparing">Preparing</option>
            <option value="ready">Ready</option>
            <option value="assigned">Assigned</option>
            <option value="in_transit">In Transit</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
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

          return (
            <div key={order.id} className="bg-white rounded-lg shadow overflow-hidden">
              {/* Order Header */}
              <div className="px-6 py-4 bg-gray-50 flex flex-wrap items-center justify-between">
                <div className="flex items-center space-x-4">
                  <ShoppingBag className="w-5 h-5 text-gray-500" />
                  <div>
                    <span className="font-semibold">{order.orderNumber}</span>
                    <span className="text-sm text-gray-500 ml-2">
                      • {new Date(order.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${statusBadge.color}`}>
                    {statusBadge.label}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setSelectedOrder(selectedOrder === order.id ? null : order.id)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {selectedOrder === order.id ? <ChevronUp /> : <ChevronDown />}
                  </button>
                </div>
              </div>

              {/* Order Summary */}
              <div className="px-6 py-4 grid grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Customer</p>
                  <p className="font-medium">{order.customer.name}</p>
                  <div className="flex items-center text-sm text-gray-600 mt-1">
                    <Phone className="w-3 h-3 mr-1" />
                    {order.customer.phone}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Items</p>
                  <p className="font-medium">{order.items.length} items</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {order.items.map(i => i.name).join(', ')}
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
                    {order.customer.address}
                  </div>
                  <div className="flex items-center text-sm text-gray-600 mt-1">
                    <Clock className="w-3 h-3 mr-1" />
                    Est: {new Date(order.estimatedDelivery).toLocaleTimeString()}
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
                      {order.items.map((item, idx) => (
                        <tr key={idx} className="border-t">
                          <td className="py-2">{item.name}</td>
                          <td className="py-2">{item.quantity}</td>
                          <td className="py-2">ETB {item.price}</td>
                          <td className="py-2">ETB {item.quantity * item.price}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Action Buttons */}
                  {order.status === 'pending' && (
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleAcceptOrder(order.id)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Accept Order
                      </button>
                      <button
                        onClick={() => handleRejectOrder(order.id)}
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
                      <div className="flex space-x-2">
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
    </div>
  );
};

export default OrderManagement;