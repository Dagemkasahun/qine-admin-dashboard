// src/pages/Users.jsx
import { useState } from 'react';
import { Search, Plus, Edit, Trash2, Eye, Filter } from 'lucide-react';

const Users = () => {
  const [users, setUsers] = useState([
    { id: 1, name: 'Abebe Kebede', email: 'abebe@email.com', phone: '+251911223344', status: 'active', joined: '2024-01-15', orders: 23 },
    { id: 2, name: 'Sara Hailu', email: 'sara@email.com', phone: '+251922334455', status: 'active', joined: '2024-02-20', orders: 45 },
    { id: 3, name: 'Yonas Desta', email: 'yonas@email.com', phone: '+251933445566', status: 'inactive', joined: '2024-01-10', orders: 12 },
    { id: 4, name: 'Meron Tesfaye', email: 'meron@email.com', phone: '+251944556677', status: 'active', joined: '2024-03-05', orders: 34 },
    { id: 5, name: 'Dawit Lemma', email: 'dawit@email.com', phone: '+251955667788', status: 'blocked', joined: '2024-02-28', orders: 5 },
  ]);

  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      blocked: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Users Management</h1>
        <button className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add New User
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <button className="flex items-center px-3 py-2 border rounded-lg hover:bg-gray-50">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </button>
            <select className="border rounded-lg px-3 py-2">
              <option>All Status</option>
              <option>Active</option>
              <option>Inactive</option>
              <option>Blocked</option>
            </select>
          </div>
          
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search users..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left py-3 px-4 font-semibold text-sm">Name</th>
              <th className="text-left py-3 px-4 font-semibold text-sm">Email</th>
              <th className="text-left py-3 px-4 font-semibold text-sm">Phone</th>
              <th className="text-left py-3 px-4 font-semibold text-sm">Status</th>
              <th className="text-left py-3 px-4 font-semibold text-sm">Orders</th>
              <th className="text-left py-3 px-4 font-semibold text-sm">Joined</th>
              <th className="text-left py-3 px-4 font-semibold text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4">{user.name}</td>
                <td className="py-3 px-4">{user.email}</td>
                <td className="py-3 px-4">{user.phone}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadge(user.status)}`}>
                    {user.status}
                  </span>
                </td>
                <td className="py-3 px-4">{user.orders}</td>
                <td className="py-3 px-4">{user.joined}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-2">
                    <button className="p-1 hover:bg-blue-100 rounded text-blue-600">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-1 hover:bg-green-100 rounded text-green-600">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-1 hover:bg-red-100 rounded text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 bg-gray-50">
          <p className="text-sm text-gray-600">Showing 1 to 5 of 50 users</p>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1 border rounded hover:bg-gray-100">Previous</button>
            <button className="px-3 py-1 bg-blue-600 text-white rounded">1</button>
            <button className="px-3 py-1 border rounded hover:bg-gray-100">2</button>
            <button className="px-3 py-1 border rounded hover:bg-gray-100">3</button>
            <button className="px-3 py-1 border rounded hover:bg-gray-100">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Users;