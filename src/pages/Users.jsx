// src/pages/Users.jsx
import { useState, useEffect, useContext } from "react";
import { 
  User, Search, Edit, Trash2, Save, X, Plus, 
  Shield, CheckCircle, XCircle, RefreshCw,
  Mail, Phone, Calendar, Users as UsersIcon,
  Filter, Clock, Ban, UserCheck, AlertCircle,
  CheckSquare, Square, ChevronDown
} from "lucide-react";
import apiClient from "../api/client";
import { ThemeContext } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

const USERS_PER_PAGE = 10;

const Users = () => {
  const { darkMode } = useContext(ThemeContext);
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  
  // Selection state
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    firstName: "",
    lastName: "",
    role: "CUSTOMER",
    status: "ACTIVE",
  });

  // Load users from API
  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/users');
      const transformedUsers = response.data.map(user => ({
        ...user,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || 'Unknown',
        createdAt: user.createdAt || new Date().toISOString(),
      }));
      setUsers(transformedUsers);
      // Clear selection on reload
      setSelectedUsers(new Set());
    } catch (error) {
      console.error('Error loading users:', error);
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadUsers();
  };

  // Selection handlers
  const toggleSelectAll = () => {
    const selectableUsers = currentUsers.filter(u => 
      u.role !== 'SUPER_ADMIN' && u.id !== currentUser?.id
    );
    
    if (selectedUsers.size === selectableUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(selectableUsers.map(u => u.id)));
    }
  };

  const toggleSelectUser = (userId, userRole) => {
    // Don't allow selecting SUPER_ADMIN or current user
    if (userRole === 'SUPER_ADMIN' || userId === currentUser?.id) {
      return;
    }
    
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const clearSelection = () => {
    setSelectedUsers(new Set());
    setShowBulkActions(false);
  };

  // Bulk actions
  const handleBulkDelete = async () => {
    const selectedArray = Array.from(selectedUsers);
    if (selectedArray.length === 0) return;
    
    if (!window.confirm(`Are you sure you want to delete ${selectedArray.length} selected user(s)? This action cannot be undone.`)) {
      return;
    }

    // Optimistically remove from UI
    setUsers(prevUsers => prevUsers.filter(user => !selectedUsers.has(user.id)));
    clearSelection();

    let successCount = 0;
    let failCount = 0;

    // Delete each selected user
    for (const userId of selectedArray) {
      try {
        await apiClient.delete(`/users/${userId}`);
        successCount++;
      } catch (error) {
        console.error(`Error deleting user ${userId}:`, error);
        failCount++;
      }
    }

    if (failCount === 0) {
      alert(`✅ ${successCount} user(s) deleted successfully`);
    } else {
      alert(`⚠️ ${successCount} deleted, ${failCount} failed. Refreshing...`);
    }
    
    await loadUsers();
  };

  const handleBulkStatusChange = async (newStatus) => {
    const selectedArray = Array.from(selectedUsers);
    if (selectedArray.length === 0) return;
    
    const action = newStatus === 'ACTIVE' ? 'activate' : 'suspend';
    
    if (!window.confirm(`Are you sure you want to ${action} ${selectedArray.length} selected user(s)?`)) {
      return;
    }

    // Optimistically update UI
    setUsers(prevUsers => prevUsers.map(u => 
      selectedUsers.has(u.id) ? { ...u, status: newStatus } : u
    ));
    clearSelection();

    let successCount = 0;
    let failCount = 0;

    for (const userId of selectedArray) {
      try {
        await apiClient.patch(`/users/${userId}`, { status: newStatus });
        successCount++;
      } catch (error) {
        console.error(`Error updating user ${userId}:`, error);
        failCount++;
      }
    }

    if (failCount === 0) {
      alert(`✅ ${successCount} user(s) ${action}d successfully`);
    } else {
      alert(`⚠️ ${successCount} ${action}d, ${failCount} failed.`);
    }
    
    await loadUsers();
  };

  // Handle Delete
  const handleDelete = async (id, userRole) => {
    if (userRole === 'SUPER_ADMIN') {
      alert('⚠️ Cannot delete Super Admin account');
      return;
    }
    
    if (id === currentUser?.id) {
      alert('⚠️ Cannot delete your own account');
      return;
    }

    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return;
    }

    // Optimistically remove from UI
    setUsers(prevUsers => prevUsers.filter(user => user.id !== id));
    setSelectedUser(null);
    setShowUserModal(false);
    setSelectedUsers(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });

    try {
      await apiClient.delete(`/users/${id}`);
      alert('✅ User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      
      if (error.response?.status === 404) {
        try {
          await apiClient.patch(`/users/${id}`, { status: 'DELETED' });
          alert('✅ User marked as deleted');
        } catch (patchError) {
          try {
            await apiClient.put(`/users/${id}`, { status: 'DELETED' });
            alert('✅ User marked as deleted (using fallback)');
          } catch (putError) {
            alert('⚠️ Backend endpoint not available. User will reappear on refresh.');
            await loadUsers();
          }
        }
      } else {
        alert('❌ Error: ' + (error.response?.data?.error || error.message));
        await loadUsers();
      }
    }
  };

  // Handle status toggle
  const handleToggleStatus = async (user) => {
    if (user.role === 'SUPER_ADMIN') {
      alert('⚠️ Cannot suspend Super Admin account');
      return;
    }
    
    if (user.id === currentUser?.id) {
      alert('⚠️ Cannot suspend your own account');
      return;
    }
    
    const newStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    const action = newStatus === 'ACTIVE' ? 'activate' : 'suspend';
    
    if (!window.confirm(`Are you sure you want to ${action} this user?`)) {
      return;
    }

    // Optimistically update UI
    setUsers(prevUsers => prevUsers.map(u => 
      u.id === user.id ? { ...u, status: newStatus } : u
    ));

    try {
      await apiClient.patch(`/users/${user.id}`, { status: newStatus });
      alert(`✅ User ${action}d successfully`);
    } catch (error) {
      console.error(`Error ${action}ing user:`, error);
      
      if (error.response?.status === 404) {
        try {
          await apiClient.put(`/users/${user.id}`, { status: newStatus });
          alert(`✅ User ${action}d successfully (using fallback)`);
        } catch (fallbackError) {
          setUsers(prevUsers => prevUsers.map(u => 
            u.id === user.id ? { ...u, status: user.status } : u
          ));
          alert('⚠️ Backend endpoint not available. Please redeploy your backend.');
        }
      } else {
        setUsers(prevUsers => prevUsers.map(u => 
          u.id === user.id ? { ...u, status: user.status } : u
        ));
        alert(`❌ Error ${action}ing user: ` + (error.response?.data?.error || error.message));
      }
    }
  };

  // Handle Add User
  const handleAddUser = async () => {
    if (!newUser.username || !newUser.password || !newUser.firstName || !newUser.lastName) {
      alert("Username, password, first name, and last name are required");
      return;
    }

    try {
      await apiClient.post('/auth/register', newUser);
      setNewUser({
        username: "", email: "", phone: "", password: "",
        firstName: "", lastName: "", role: "CUSTOMER", status: "ACTIVE",
      });
      setShowAddModal(false);
      await loadUsers();
      alert('✅ User created successfully');
    } catch (error) {
      console.error('Error creating user:', error);
      alert('❌ Error creating user: ' + (error.response?.data?.error || error.message));
    }
  };

  // Handle Update User
  const handleUpdateUser = async () => {
    if (editingUser.role === 'SUPER_ADMIN' && currentUser?.role !== 'SUPER_ADMIN') {
      alert('⚠️ Only Super Admin can modify Super Admin accounts');
      return;
    }

    try {
      await apiClient.patch(`/users/${editingUser.id}`, {
        firstName: editingUser.firstName,
        lastName: editingUser.lastName,
        email: editingUser.email,
        phone: editingUser.phone,
        role: editingUser.role,
        status: editingUser.status,
      });
      setEditingUser(null);
      setShowUserModal(false);
      await loadUsers();
      alert('✅ User updated successfully');
    } catch (error) {
      console.error('Error updating user:', error);
      
      if (error.response?.status === 404) {
        try {
          await apiClient.put(`/users/${editingUser.id}`, {
            firstName: editingUser.firstName,
            lastName: editingUser.lastName,
            phone: editingUser.phone,
          });
          setEditingUser(null);
          setShowUserModal(false);
          await loadUsers();
          alert('✅ User updated successfully (using fallback)');
        } catch (fallbackError) {
          alert('⚠️ Backend endpoint not available. Please redeploy your backend.');
        }
      } else {
        alert('❌ Error updating user: ' + (error.response?.data?.error || error.message));
      }
    }
  };

  // Filter and pagination
  const filteredUsers = users.filter((u) => {
    const matchesSearch = search === "" || 
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.username?.toLowerCase().includes(search.toLowerCase());
    
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    const matchesStatus = statusFilter === "all" || u.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);
  const startIndex = (page - 1) * USERS_PER_PAGE;
  const currentUsers = filteredUsers.slice(startIndex, startIndex + USERS_PER_PAGE);
  
  const selectableUsers = currentUsers.filter(u => 
    u.role !== 'SUPER_ADMIN' && u.id !== currentUser?.id
  );
  const allSelected = selectableUsers.length > 0 && 
    selectableUsers.every(u => selectedUsers.has(u.id));
  const someSelected = selectableUsers.some(u => selectedUsers.has(u.id)) && !allSelected;

  // Statistics
  const stats = {
    total: users.length,
    admin: users.filter(u => ['ADMIN', 'SUPER_ADMIN'].includes(u.role)).length,
    merchant: users.filter(u => u.role === 'MERCHANT').length,
    rider: users.filter(u => u.role === 'RIDER').length,
    customer: users.filter(u => u.role === 'CUSTOMER').length,
    active: users.filter(u => u.status === 'ACTIVE').length,
    suspended: users.filter(u => u.status === 'SUSPENDED').length,
    pending: users.filter(u => u.status === 'PENDING_VERIFICATION').length,
  };

  const getRoleBadge = (role) => {
    const badges = {
      SUPER_ADMIN: { color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300', label: 'Super Admin' },
      ADMIN: { color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300', label: 'Admin' },
      MERCHANT: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300', label: 'Merchant' },
      RIDER: { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300', label: 'Rider' },
      CUSTOMER: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300', label: 'Customer' },
      SUPPORT: { color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300', label: 'Support' },
    };
    return badges[role] || badges.CUSTOMER;
  };

  const getStatusBadge = (status) => {
    const badges = {
      ACTIVE: { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300', icon: CheckCircle },
      INACTIVE: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300', icon: Ban },
      SUSPENDED: { color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300', icon: XCircle },
      PENDING_VERIFICATION: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300', icon: Clock },
      DELETED: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300', icon: Trash2 },
    };
    return badges[status] || badges.ACTIVE;
  };

  const cardClass = darkMode
    ? 'bg-gray-800 border border-gray-700 text-white'
    : 'bg-white border border-gray-200 text-gray-900';

  const mutedClass = darkMode ? 'text-gray-400' : 'text-gray-500';

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className={mutedClass}>Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
          <button 
            onClick={handleRefresh}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const selectedCount = selectedUsers.size;

  return (
    <div className={`p-6 min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            User Management
          </h1>
          <p className={mutedClass}>Manage system users and permissions</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleRefresh}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition ${
              darkMode 
                ? 'border-gray-700 hover:bg-gray-800 text-gray-300' 
                : 'border-gray-300 hover:bg-gray-50 text-gray-700'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus size={16} /> Add User
          </button>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedCount > 0 && (
        <div className={`mb-4 p-3 rounded-lg flex items-center justify-between ${
          darkMode ? 'bg-blue-900/30 border border-blue-700' : 'bg-blue-50 border border-blue-200'
        }`}>
          <div className="flex items-center gap-3">
            <CheckSquare className="w-5 h-5 text-blue-600" />
            <span className="font-medium">{selectedCount} user(s) selected</span>
            <button
              onClick={clearSelection}
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              Clear
            </button>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setShowBulkActions(!showBulkActions)}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1 text-sm"
              >
                Bulk Actions <ChevronDown className="w-4 h-4" />
              </button>
              {showBulkActions && (
                <div className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg border z-10 ${
                  darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}>
                  <button
                    onClick={() => {
                      handleBulkStatusChange('ACTIVE');
                      setShowBulkActions(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4 text-green-500" /> Activate
                  </button>
                  <button
                    onClick={() => {
                      handleBulkStatusChange('SUSPENDED');
                      setShowBulkActions(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <Ban className="w-4 h-4 text-yellow-500" /> Suspend
                  </button>
                  <div className="border-t my-1 dark:border-gray-700"></div>
                  <button
                    onClick={() => {
                      handleBulkDelete();
                      setShowBulkActions(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-red-600"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
        <div className={`${cardClass} rounded-lg shadow p-4`}>
          <p className={`text-sm ${mutedClass}`}>Total Users</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className={`${cardClass} rounded-lg shadow p-4`}>
          <p className={`text-sm ${mutedClass}`}>Admins</p>
          <p className="text-2xl font-bold text-red-600">{stats.admin}</p>
        </div>
        <div className={`${cardClass} rounded-lg shadow p-4`}>
          <p className={`text-sm ${mutedClass}`}>Merchants</p>
          <p className="text-2xl font-bold text-blue-600">{stats.merchant}</p>
        </div>
        <div className={`${cardClass} rounded-lg shadow p-4`}>
          <p className={`text-sm ${mutedClass}`}>Riders</p>
          <p className="text-2xl font-bold text-green-600">{stats.rider}</p>
        </div>
        <div className={`${cardClass} rounded-lg shadow p-4`}>
          <p className={`text-sm ${mutedClass}`}>Customers</p>
          <p className="text-2xl font-bold text-purple-600">{stats.customer}</p>
        </div>
        <div className={`${cardClass} rounded-lg shadow p-4`}>
          <p className={`text-sm ${mutedClass}`}>Active</p>
          <p className="text-2xl font-bold text-emerald-600">{stats.active}</p>
        </div>
        <div className={`${cardClass} rounded-lg shadow p-4`}>
          <p className={`text-sm ${mutedClass}`}>Suspended</p>
          <p className="text-2xl font-bold text-red-600">{stats.suspended}</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className={`${cardClass} rounded-lg shadow p-4 mb-6`}>
        <div className="flex flex-wrap items-center gap-4">
          <Filter className="w-4 h-4 text-gray-500" />
          
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className={`border rounded-lg px-3 py-2 ${
              darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
            }`}
          >
            <option value="all">All Roles</option>
            <option value="SUPER_ADMIN">Super Admin</option>
            <option value="ADMIN">Admin</option>
            <option value="MERCHANT">Merchant</option>
            <option value="RIDER">Rider</option>
            <option value="CUSTOMER">Customer</option>
            <option value="SUPPORT">Support</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className={`border rounded-lg px-3 py-2 ${
              darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
            }`}
          >
            <option value="all">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="PENDING_VERIFICATION">Pending</option>
          </select>

          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name, email, or username..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className={`w-full pl-9 pr-4 py-2 border rounded-lg ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className={`${cardClass} rounded-lg shadow overflow-hidden`}>
        <table className="w-full">
          <thead className={`border-b ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
            <tr>
              <th className="px-4 py-3 text-left w-10">
                <button
                  onClick={toggleSelectAll}
                  className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  {allSelected ? (
                    <CheckSquare className="w-5 h-5 text-blue-600" />
                  ) : someSelected ? (
                    <CheckSquare className="w-5 h-5 text-blue-400 opacity-70" />
                  ) : (
                    <Square className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">User</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Contact</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Role</th>
              <th className="px-4 py-3 text0-left text-xs font-medium uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Joined</th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {currentUsers.map((user) => {
              const roleBadge = getRoleBadge(user.role);
              const statusBadge = getStatusBadge(user.status);
              const StatusIcon = statusBadge.icon;
              const isSuperAdmin = user.role === 'SUPER_ADMIN';
              const isCurrentUser = user.id === currentUser?.id;
              const isSelected = selectedUsers.has(user.id);
              const isSelectable = !isSuperAdmin && !isCurrentUser;
              
              return (
                <tr key={user.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition ${
                  isSelected ? (darkMode ? 'bg-blue-900/20' : 'bg-blue-50') : ''
                }`}>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleSelectUser(user.id, user.role)}
                      disabled={!isSelectable}
                      className={`p-1 rounded ${isSelectable ? 'hover:bg-gray-200 dark:hover:bg-gray-600' : 'cursor-not-allowed opacity-30'}`}
                    >
                      {isSelected ? (
                        <CheckSquare className="w-5 h-5 text-blue-600" />
                      ) : (
                        <Square className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                        {user.firstName?.charAt(0) || user.username?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="font-medium">
                          {user.firstName} {user.lastName}
                          {isCurrentUser && <span className="ml-2 text-xs text-blue-500">(You)</span>}
                        </p>
                        <p className={`text-xs ${mutedClass}`}>@{user.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-1">
                      <p className="text-sm flex items-center gap-1">
                        <Mail className="w-3 h-3" /> {user.email || '—'}
                      </p>
                      <p className="text-sm flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {user.phone || '—'}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleBadge.color}`}>
                      {roleBadge.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusBadge.color}`}>
                      <StatusIcon className="w-3 h-3" />
                      {user.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setEditingUser({ ...user });
                          setShowUserModal(true);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                        title="Edit User"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(user)}
                        disabled={isSuperAdmin || isCurrentUser}
                        className={`p-2 rounded-lg ${
                          isSuperAdmin || isCurrentUser
                            ? 'opacity-50 cursor-not-allowed'
                            : user.status === 'ACTIVE' 
                              ? 'text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20' 
                              : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                        }`}
                        title={
                          isSuperAdmin 
                            ? 'Cannot modify Super Admin' 
                            : isCurrentUser 
                              ? 'Cannot modify your own account'
                              : user.status === 'ACTIVE' ? 'Suspend User' : 'Activate User'
                        }
                      >
                        {user.status === 'ACTIVE' ? <Ban className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleDelete(user.id, user.role)}
                        disabled={isSuperAdmin || isCurrentUser}
                        className={`p-2 rounded-lg ${
                          isSuperAdmin || isCurrentUser
                            ? 'opacity-50 cursor-not-allowed'
                            : 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                        }`}
                        title={
                          isSuperAdmin 
                            ? 'Cannot delete Super Admin' 
                            : isCurrentUser 
                              ? 'Cannot delete your own account'
                              : 'Delete User'
                        }
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <UsersIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className={mutedClass}>No users found</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <p className={`text-sm ${mutedClass}`}>
            Showing {startIndex + 1}-{Math.min(startIndex + USERS_PER_PAGE, filteredUsers.length)} of {filteredUsers.length} users
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="px-4 py-2 border rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Previous
            </button>
            <span className={`px-4 py-2 ${mutedClass}`}>
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="px-4 py-2 border rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Add User Modal - same as before */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          {/* ... same modal content ... */}
          <div className={`rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto ${
            darkMode ? 'bg-gray-800 text-white' : 'bg-white'
          }`}>
            <div className={`p-6 border-b flex justify-between items-center ${
              darkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <h2 className="text-xl font-bold">Add New User</h2>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Username *</label>
                  <input type="text" value={newUser.username} onChange={(e) => setNewUser({ ...newUser, username: e.target.value })} className={`w-full border rounded-lg px-4 py-2 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white'}`} placeholder="johndoe" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Password *</label>
                  <input type="password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} className={`w-full border rounded-lg px-4 py-2 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white'}`} placeholder="••••••••" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">First Name *</label>
                  <input type="text" value={newUser.firstName} onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })} className={`w-full border rounded-lg px-4 py-2 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white'}`} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Last Name *</label>
                  <input type="text" value={newUser.lastName} onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })} className={`w-full border rounded-lg px-4 py-2 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white'}`} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} className={`w-full border rounded-lg px-4 py-2 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white'}`} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <input type="tel" value={newUser.phone} onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })} className={`w-full border rounded-lg px-4 py-2 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white'}`} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Role</label>
                  <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })} className={`w-full border rounded-lg px-4 py-2 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white'}`}>
                    <option value="CUSTOMER">Customer</option>
                    <option value="MERCHANT">Merchant</option>
                    <option value="RIDER">Rider</option>
                    <option value="ADMIN">Admin</option>
                    <option value="SUPPORT">Support</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select value={newUser.status} onChange={(e) => setNewUser({ ...newUser, status: e.target.value })} className={`w-full border rounded-lg px-4 py-2 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white'}`}>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="PENDING_VERIFICATION">Pending Verification</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-700">
                <button onClick={() => setShowAddModal(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
                <button onClick={handleAddUser} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"><Save className="w-4 h-4" /> Create User</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal - same as before */}
      {showUserModal && editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          {/* ... same modal content ... */}
          <div className={`rounded-xl max-w-2xl w-full ${
            darkMode ? 'bg-gray-800 text-white' : 'bg-white'
          }`}>
            <div className={`p-6 border-b flex justify-between items-center ${
              darkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <h2 className="text-xl font-bold">Edit User</h2>
              <button onClick={() => setShowUserModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Username</label>
                  <input type="text" value={editingUser.username || ''} disabled className={`w-full border rounded-lg px-4 py-2 bg-gray-100 dark:bg-gray-600 cursor-not-allowed`} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">First Name</label>
                  <input type="text" value={editingUser.firstName || ''} onChange={(e) => setEditingUser({ ...editingUser, firstName: e.target.value })} className={`w-full border rounded-lg px-4 py-2 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white'}`} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Last Name</label>
                  <input type="text" value={editingUser.lastName || ''} onChange={(e) => setEditingUser({ ...editingUser, lastName: e.target.value })} className={`w-full border rounded-lg px-4 py-2 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white'}`} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input type="email" value={editingUser.email || ''} onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })} className={`w-full border rounded-lg px-4 py-2 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white'}`} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <input type="tel" value={editingUser.phone || ''} onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })} className={`w-full border rounded-lg px-4 py-2 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white'}`} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Role</label>
                  <select value={editingUser.role || 'CUSTOMER'} onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })} disabled={editingUser.role === 'SUPER_ADMIN' || editingUser.id === currentUser?.id} className={`w-full border rounded-lg px-4 py-2 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white'} ${(editingUser.role === 'SUPER_ADMIN' || editingUser.id === currentUser?.id) ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <option value="CUSTOMER">Customer</option>
                    <option value="MERCHANT">Merchant</option>
                    <option value="RIDER">Rider</option>
                    <option value="ADMIN">Admin</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                    <option value="SUPPORT">Support</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select value={editingUser.status || 'ACTIVE'} onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value })} disabled={editingUser.role === 'SUPER_ADMIN' || editingUser.id === currentUser?.id} className={`w-full border rounded-lg px-4 py-2 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white'} ${(editingUser.role === 'SUPER_ADMIN' || editingUser.id === currentUser?.id) ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="SUSPENDED">Suspended</option>
                    <option value="PENDING_VERIFICATION">Pending Verification</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t dark:border-gray-700">
                <button onClick={() => handleDelete(editingUser.id, editingUser.role)} disabled={editingUser.role === 'SUPER_ADMIN' || editingUser.id === currentUser?.id} className={`px-4 py-2 rounded-lg flex items-center gap-2 ${(editingUser.role === 'SUPER_ADMIN' || editingUser.id === currentUser?.id) ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 text-white'}`}><Trash2 className="w-4 h-4" /> Delete User</button>
                <div className="flex gap-3">
                  <button onClick={() => setShowUserModal(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
                  <button onClick={handleUpdateUser} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"><Save className="w-4 h-4" /> Save Changes</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;