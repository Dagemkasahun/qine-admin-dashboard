import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bike, Phone, Star, Plus, X, Search, RefreshCw, UserPlus } from "lucide-react";
import apiClient from "../api/client";

const Riders = () => {
  const navigate = useNavigate();
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  // New rider form
  const [newRider, setNewRider] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    vehicleType: 'MOTORCYCLE',
    vehicleModel: '',
    vehiclePlate: '',
  });

  // Fetch real riders from API
  useEffect(() => {
    fetchRiders();
  }, []);

  const fetchRiders = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/riders');
      console.log('📋 Riders fetched:', response.data?.length);
      setRiders(response.data || []);
    } catch (error) {
      console.error('Error fetching riders:', error);
    } finally {
      setLoading(false);
    }
  };

  // Search users
  const handleSearch = async (query) => {
    setSearch(query);
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    
    setSearching(true);
    try {
      // Search all users and filter for non-rider users
      const response = await apiClient.get('/users');
      const allUsers = response.data || [];
      
      // Filter: only show users NOT already riders
      const existingUserIds = riders.map(r => r.userId);
      const filtered = allUsers.filter(
        u => !existingUserIds.includes(u.id) &&
             (u.firstName?.toLowerCase().includes(query.toLowerCase()) ||
              u.lastName?.toLowerCase().includes(query.toLowerCase()) ||
              u.username?.toLowerCase().includes(query.toLowerCase()) ||
              u.phone?.toLowerCase().includes(query.toLowerCase()) ||
              u.email?.toLowerCase().includes(query.toLowerCase()))
      ).slice(0, 10);
      
      setSearchResults(filtered);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  // Add existing user as rider
  const addRider = async (user) => {
    try {
      await apiClient.post('/riders', {
        userId: user.id,
        fullName: `${user.firstName} ${user.lastName}`,
        phone: user.phone || '',
        vehicleType: 'MOTORCYCLE',
      });
      
      setShowModal(false);
      setSearch("");
      setSearchResults([]);
      await fetchRiders();
      alert('✅ Rider added successfully!');
    } catch (error) {
      alert('❌ Error: ' + (error.response?.data?.error || error.message));
    }
  };

  // Create new user + rider
  const createNewRider = async () => {
    if (!newRider.username || !newRider.password || !newRider.firstName || !newRider.lastName) {
      alert('Username, password, first name, and last name are required');
      return;
    }

    try {
      // Step 1: Create user with RIDER role
      const userResponse = await apiClient.post('/auth/register', {
        username: newRider.username,
        email: newRider.email || null,
        phone: newRider.phone || null,
        password: newRider.password,
        firstName: newRider.firstName,
        lastName: newRider.lastName,
        role: 'RIDER',
      });

      const userId = userResponse.data.id;

      // Step 2: Create rider profile
      await apiClient.post('/riders', {
        userId: userId,
        fullName: `${newRider.firstName} ${newRider.lastName}`,
        phone: newRider.phone || '',
        vehicleType: newRider.vehicleType,
        vehicleModel: newRider.vehicleModel || '',
        vehiclePlate: newRider.vehiclePlate || '',
      });

      setShowCreateModal(false);
      setNewRider({
        username: '', firstName: '', lastName: '', email: '',
        phone: '', password: '', vehicleType: 'MOTORCYCLE',
        vehicleModel: '', vehiclePlate: '',
      });
      await fetchRiders();
      alert('✅ New rider created successfully!');
    } catch (error) {
      alert('❌ Error: ' + (error.response?.data?.error || error.message));
    }
  };

  const totalRiders = riders.length;
  const onlineRiders = riders.filter((r) => r.status === "ONLINE").length;
  const busyRiders = riders.filter((r) => r.status === "BUSY" || r.status === "ON_DELIVERY").length;
  const avgRating = riders.length > 0
    ? riders.reduce((acc, r) => acc + (r.rating || 0), 0) / riders.length
    : 0;

  const statusColor = (status) => {
    if (status === "ONLINE") return "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400";
    if (status === "BUSY" || status === "ON_DELIVERY") return "bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400";
    return "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400";
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 w-48 mb-6 rounded"></div>
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 text-gray-800 dark:text-gray-200">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Riders Management</h1>
        <div className="flex gap-2">
          <button
            onClick={fetchRiders}
            className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
          >
            <RefreshCw size={16} /> Refresh
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            <UserPlus size={18} /> New Rider
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus size={18} /> Add Existing
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border dark:border-gray-700">
          <p className="text-gray-500 text-sm">Total Riders</p>
          <h2 className="text-xl font-bold">{totalRiders}</h2>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border dark:border-gray-700">
          <p className="text-gray-500 text-sm">Online Now</p>
          <h2 className="text-xl font-bold text-green-600">{onlineRiders}</h2>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border dark:border-gray-700">
          <p className="text-gray-500 text-sm">On Delivery</p>
          <h2 className="text-xl font-bold text-blue-600">{busyRiders}</h2>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border dark:border-gray-700">
          <p className="text-gray-500 text-sm">Avg Rating</p>
          <h2 className="text-xl font-bold">{avgRating.toFixed(1)} ⭐</h2>
        </div>
      </div>

      {/* Riders Grid */}
      {riders.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl">
          <Bike size={48} className="text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No riders yet</p>
          <p className="text-gray-400 text-sm mt-1">Click "New Rider" to create one</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {riders.map((rider) => (
            <div
              key={rider.id}
              className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border dark:border-gray-700"
            >
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
                    <Bike size={18} className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">
                      {rider.user?.firstName} {rider.user?.lastName}
                    </h3>
                    <p className="text-sm text-gray-500">{rider.vehicleType || 'Motorcycle'}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${statusColor(rider.status)}`}>
                  {rider.status || 'OFFLINE'}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                <Phone size={14} />
                {rider.phone || rider.user?.phone || 'N/A'}
              </div>

              <div className="flex items-center gap-2 text-sm mb-3">
                <Star size={16} className="text-yellow-500" />
                {rider.rating?.toFixed(1) || '4.5'} rating
              </div>

              <hr className="my-3 border-gray-200 dark:border-gray-700" />

              <div className="text-sm mb-3">
                <p className="text-gray-500">Deliveries</p>
                <p className="font-semibold">{rider.totalDeliveries || 0}</p>
              </div>

              <button
                className="w-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-2 rounded-lg text-sm hover:bg-gray-200"
                onClick={() => navigate(`/riders/${rider.id}`)}
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ========== ADD EXISTING USER AS RIDER MODAL ========== */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
          <div className="bg-white dark:bg-gray-800 w-[450px] rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold dark:text-white">Add Existing User as Rider</h2>
              <X className="cursor-pointer dark:text-white" size={20} onClick={() => {
                setShowModal(false);
                setSearch("");
                setSearchResults([]);
              }} />
            </div>

            <p className="text-sm text-gray-500 mb-3">Search for a registered user to add as rider</p>

            <div className="flex items-center border rounded-lg px-3 py-2 mb-4 dark:border-gray-600">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search by name, username, phone, or email..."
                className="ml-2 outline-none w-full bg-transparent dark:text-white"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {searching && <p className="text-gray-500 text-sm text-center py-4">Searching...</p>}
              
              {search && !searching && searchResults.length === 0 && (
                <p className="text-gray-500 text-sm text-center py-4">No users found</p>
              )}

              {searchResults.map((user) => (
                <div
                  key={user.id}
                  className="flex justify-between items-center border p-3 rounded-lg dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <div>
                    <p className="font-medium dark:text-white">{user.firstName} {user.lastName}</p>
                    <p className="text-xs text-gray-500">@{user.username} • {user.email || user.phone || 'No contact'}</p>
                  </div>
                  <button
                    onClick={() => addRider(user)}
                    className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-700"
                  >
                    Add as Rider
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========== CREATE NEW RIDER MODAL ========== */}
      {showCreateModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
          <div className="bg-white dark:bg-gray-800 w-[500px] max-h-[90vh] overflow-y-auto rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold dark:text-white">Create New Rider</h2>
              <X className="cursor-pointer dark:text-white" size={20} onClick={() => setShowCreateModal(false)} />
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">Username *</label>
                  <input
                    type="text"
                    value={newRider.username}
                    onChange={(e) => setNewRider({...newRider, username: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="rider_username"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">Password *</label>
                  <input
                    type="password"
                    value={newRider.password}
                    onChange={(e) => setNewRider({...newRider, password: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="••••••"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">First Name *</label>
                  <input
                    type="text"
                    value={newRider.firstName}
                    onChange={(e) => setNewRider({...newRider, firstName: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">Last Name *</label>
                  <input
                    type="text"
                    value={newRider.lastName}
                    onChange={(e) => setNewRider({...newRider, lastName: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">Email</label>
                  <input
                    type="email"
                    value={newRider.email}
                    onChange={(e) => setNewRider({...newRider, email: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">Phone</label>
                  <input
                    type="tel"
                    value={newRider.phone}
                    onChange={(e) => setNewRider({...newRider, phone: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="+251..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">Vehicle Type</label>
                  <select
                    value={newRider.vehicleType}
                    onChange={(e) => setNewRider({...newRider, vehicleType: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="MOTORCYCLE">Motorcycle</option>
                    <option value="BICYCLE">Bicycle</option>
                    <option value="CAR">Car</option>
                    <option value="WALK">Walking</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">Model</label>
                  <input
                    type="text"
                    value={newRider.vehicleModel}
                    onChange={(e) => setNewRider({...newRider, vehicleModel: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Honda CB150"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">Plate #</label>
                  <input
                    type="text"
                    value={newRider.vehiclePlate}
                    onChange={(e) => setNewRider({...newRider, vehiclePlate: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="AA 12345"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 border rounded-lg dark:border-gray-600 dark:text-white"
              >
                Cancel
              </button>
              <button
                onClick={createNewRider}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Create Rider
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Riders;