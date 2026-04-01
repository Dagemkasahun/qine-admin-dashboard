// src/pages/Orders.jsx
import { useState } from 'react';
import { Search, Filter, Eye, Package, Clock, CheckCircle, XCircle } from 'lucide-react';

const Orders = () => {
  const [orders] = useState([
    { id: '#1234', customer: 'Abebe Kebede', merchant: 'Restaurant A', amount: 450, status: 'delivered', time: '10:30 AM', items: 3 },
    { id: '#1235', customer: 'Sara Hailu', merchant: 'Supermarket B', amount: 890, status: 'pending', time: '11:15 AM', items: 5 },
    { id: '#1236', customer: 'Yonas Desta', merchant: 'Pharmacy C', amount: 230, status: 'in-progress', time: '11:45 AM', items: 2 },
    { id: '#1237', customer: 'Meron T.', merchant: 'Restaurant D', amount: 670, status: 'assigned', time: '12:00 PM', items: 4 },
    { id: '#1238', customer: 'Dawit L.', merchant: 'Store E', amount: 340, status: 'picked-up', time: '12:30 PM', items: 2 },
    { id: '#1239', customer: 'Tigist G.', merchant: 'Restaurant A', amount: 520, status: 'delivered', time: '01:15 PM', items: 3 },
  ]);

  const getStatusColor = (status) => {
    const colors = {
      'delivered': 'bg-green-100 text-green-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'in-progress': 'bg-blue-100 text-blue-800',
      'assigned': 'bg-purple-100 text-purple-800',
      'picked-up': 'bg-indigo-100 text-indigo-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Orders Management</h1>

      {/* Order Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-600 text-sm">Total Orders</p>
          <p className="text-2xl font-bold">3,421</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-600 text-sm">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">23</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-600 text-sm">In Progress</p>
          <p className="text-2xl font-bold text-blue-600">89</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-600 text-sm">Delivered</p>
          <p className="text-2xl font-bold text-green-600">3,128</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-600 text-sm">Revenue</p>
          <p className="text-2xl font-bold">ETB 456K</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium">Filter by:</span>
          </div>
          <select className="border rounded-lg px-3 py-2 text-sm">
            <option>All Status</option>
            <option>Pending</option>
            <option>In Progress</option>
            <option>Delivered</option>
            <option>Cancelled</option>
          </select>
          <select className="border rounded-lg px-3 py-2 text-sm">
            <option>All Merchants</option>
            <option>Restaurant A</option>
            <option>Supermarket B</option>
            <option>Pharmacy C</option>
          </select>
          <select className="border rounded-lg px-3 py-2 text-sm">
            <option>Today</option>
            <option>Yesterday</option>
            <option>This Week</option>
            <option>This Month</option>
          </select>
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search orders..."
              className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm"
            />
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left py-3 px-4">Order ID</th>
              <th className="text-left py-3 px-4">Customer</th>
              <th className="text-left py-3 px-4">Merchant</th>
              <th className="text-left py-3 px-4">Items</th>
              <th className="text-left py-3 px-4">Amount</th>
              <th className="text-left py-3 px-4">Status</th>
              <th className="text-left py-3 px-4">Time</th>
              <th className="text-left py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4 font-medium">{order.id}</td>
                <td className="py-3 px-4">{order.customer}</td>
                <td className="py-3 px-4">{order.merchant}</td>
                <td className="py-3 px-4">{order.items}</td>
                <td className="py-3 px-4">ETB {order.amount}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td className="py-3 px-4">{order.time}</td>
                <td className="py-3 px-4">
                  <button className="p-1 hover:bg-blue-100 rounded text-blue-600">
                    <Eye className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Orders;