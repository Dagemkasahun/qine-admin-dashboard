// src/pages/Orders.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter } from 'lucide-react';

const Orders = () => {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([
    { 
      id: '#1234', 
      customer: 'Abebe Kebede', 
      merchant: 'Restaurant A', 
      amount: 450, 
      status: 'delivered', 
      time: '10:30 AM',
      date: '2026-03-10',
      items: 3,
      customerEmail: 'abebe@example.com',
      customerName: 'Abebe Kebede',
      address: 'Bole, Addis Ababa',
      itemsList: [{ name: 'Burger', quantity: 2 }, { name: 'Fries', quantity: 1 }]
    },
    { 
      id: '#1235', 
      customer: 'Sara Hailu', 
      merchant: 'Supermarket B', 
      amount: 890, 
      status: 'pending', 
      time: '11:15 AM',
      date: '2026-03-10',
      items: 5,
      customerEmail: 'sara@example.com',
      customerName: 'Sara Hailu',
      address: 'Piassa, Addis Ababa',
      itemsList: [{ name: 'Milk', quantity: 4 }, { name: 'Bread', quantity: 1 }]
    },
    { 
      id: '#1236', 
      customer: 'Yonas Desta', 
      merchant: 'Pharmacy C', 
      amount: 230, 
      status: 'in-progress', 
      time: '11:45 AM',
      date: '2026-03-10',
      items: 2,
      customerEmail: 'yonas@example.com',
      customerName: 'Yonas Desta',
      address: 'CMC, Addis Ababa',
      itemsList: [{ name: 'Paracetamol', quantity: 1 }, { name: 'Mask', quantity: 1 }]
    },
    { 
      id: '#1237', 
      customer: 'Meron T.', 
      merchant: 'Restaurant D', 
      amount: 670, 
      status: 'cancelled', 
      time: '12:00 PM',
      date: '2026-03-10',
      items: 4,
      customerEmail: 'meron@example.com',
      customerName: 'Meron T.',
      address: 'Kazanchis, Addis Ababa',
      itemsList: [{ name: 'Pizza', quantity: 1 }, { name: 'Salad', quantity: 1 }]
    },
  ]);

  const [statusFilter,setStatusFilter] = useState("all");
  const [merchantFilter,setMerchantFilter] = useState("all");
  const [search,setSearch] = useState("");
  const [selectedOrder,setSelectedOrder] = useState(null);
  const [editOrder,setEditOrder] = useState(null);

  const getStatusColor = (status) => {
    const colors = {
      delivered:'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100',
      pending:'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100',
      'in-progress':'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100',
      cancelled:'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100';
  };

  const filteredOrders = orders.filter((order)=>{
    const statusMatch = statusFilter==="all" || order.status===statusFilter;
    const merchantMatch = merchantFilter==="all" || order.merchant===merchantFilter;
    const searchMatch =
      order.id.toLowerCase().includes(search.toLowerCase()) ||
      order.customer.toLowerCase().includes(search.toLowerCase()) ||
      order.merchant.toLowerCase().includes(search.toLowerCase());

    return statusMatch && merchantMatch && searchMatch;
  });

  const saveEditOrder = (updatedOrder) => {
    setOrders(orders.map(o => o.id === updatedOrder.id ? updatedOrder : o));
    setEditOrder(null);
  };

  const deleteOrder = (id) => {
    if(window.confirm("Are you sure you want to delete this order?")) {
      setOrders(orders.filter(o => o.id !== id));
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 dark:bg-gray-900">

      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-900 dark:text-white">
        Orders Management
      </h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6 lg:mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Orders</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{orders.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">Pending</p>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {orders.filter(o=>o.status==="pending").length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">In Progress</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {orders.filter(o=>o.status==="in-progress").length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">Delivered</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {orders.filter(o=>o.status==="delivered").length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">Cancelled</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            {orders.filter(o=>o.status==="cancelled").length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6 border dark:border-gray-700">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2 text-gray-900 dark:text-white">
            <Filter size={18}/>
            <span>Filter by:</span>
          </div>

          <select
            onChange={(e)=>setStatusFilter(e.target.value)}
            className="border px-3 py-2 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            onChange={(e)=>setMerchantFilter(e.target.value)}
            className="border px-3 py-2 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="all">All Merchants</option>
            {[...new Set(orders.map(o=>o.merchant))].map(m=>(
              <option key={m} value={m}>{m}</option>
            ))}
          </select>

          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400 dark:text-gray-300"/>
            <input
              type="text"
              placeholder="Search orders..."
              onChange={(e)=>setSearch(e.target.value)}
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
              <th className="py-4 px-6 text-left text-gray-900 dark:text-gray-100">Order ID</th>
              <th className="py-4 px-6 text-left text-gray-900 dark:text-gray-100">Customer</th>
              <th className="py-4 px-6 text-left text-gray-900 dark:text-gray-100">Merchant</th>
              <th className="py-4 px-6 text-left text-gray-900 dark:text-gray-100">Items</th>
              <th className="py-4 px-6 text-left text-gray-900 dark:text-gray-100">Amount</th>
              <th className="py-4 px-6 text-left text-gray-900 dark:text-gray-100">Status</th>
              <th className="py-4 px-6 text-left text-gray-900 dark:text-gray-100">Assign Rider</th>
            </tr>
          </thead>

          <tbody>
            {filteredOrders.map(order=>(
              <tr
                key={order.id}
                onClick={()=>setSelectedOrder(order)}
                className="border-t cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <td className="py-4 px-6">{order.id}</td>
                <td className="py-4 px-6">{order.customer}</td>
                <td className="py-4 px-6">{order.merchant}</td>
                <td className="py-4 px-6">{order.items}</td>
                <td className="py-4 px-6 text-teal-600 font-semibold">ETB {order.amount}</td>
                <td className="py-4 px-6">
                  <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <button
                    onClick={(e)=>{
                      e.stopPropagation();
                      navigate(`/assign-rider/${order.id}`);
                    }}
                    className="px-3 py-1 bg-teal-600 text-white rounded-lg text-sm"
                  >
                    Assign
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-[450px]">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Order {selectedOrder.id}</h2>

            <p><b>Customer:</b> {selectedOrder.customerName}</p>
            <p><b>Email:</b> {selectedOrder.customerEmail}</p>
            <p><b>Address:</b> {selectedOrder.address}</p>
            <p><b>Merchant:</b> {selectedOrder.merchant}</p>

            <h3 className="font-semibold mt-4">Items</h3>
            <ul className="list-disc ml-6">
              {selectedOrder.itemsList.map((item,i)=>(
                <li key={i}>{item.name} × {item.quantity}</li>
              ))}
            </ul>

            <div className="flex justify-end gap-2 mt-6">

              <button
                onClick={()=>{
                  setEditOrder(selectedOrder);
                  setSelectedOrder(null);
                }}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white"
              >
                Edit
              </button>

              <button
                onClick={()=>{
                  deleteOrder(selectedOrder.id);
                  setSelectedOrder(null);
                }}
                className="px-4 py-2 rounded-lg bg-red-600 text-white"
              >
                Delete
              </button>

              <button
                onClick={()=>setSelectedOrder(null)}
                className="px-4 py-2 rounded-lg bg-gray-300 dark:bg-gray-700 dark:text-white"
              >
                Close
              </button>

            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editOrder && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-[450px]">
            <h2 className="text-xl font-bold mb-4">Edit Order {editOrder.id}</h2>

            <label>Status:</label>
            <select 
              value={editOrder.status} 
              onChange={(e)=>setEditOrder({...editOrder, status:e.target.value})}
              className="w-full border px-3 py-2 mb-4 rounded-lg"
            >
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <label>Amount:</label>
            <input 
              type="number"
              value={editOrder.amount}
              onChange={(e)=>setEditOrder({...editOrder, amount:Number(e.target.value)})}
              className="w-full border px-3 py-2 mb-4 rounded-lg"
            />

            <div className="flex justify-end gap-2">
              <button onClick={()=>setEditOrder(null)} className="px-4 py-2 bg-gray-300 rounded-lg">
                Cancel
              </button>
              <button onClick={()=>saveEditOrder(editOrder)} className="px-4 py-2 bg-teal-600 text-white rounded-lg">
                Save
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Orders;