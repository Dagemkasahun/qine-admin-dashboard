import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bike, Phone, Star, Plus, X, Search, RefreshCw } from "lucide-react";
import apiClient from "../api/client";

const Riders = () => {
  const navigate = useNavigate();
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  // Fetch real riders from API
  useEffect(() => {
    fetchRiders();
  }, []);

  const fetchRiders = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/riders');
      setRiders(response.data || []);
    } catch (error) {
      console.error('Error fetching riders:', error);
    } finally {
      setLoading(false);
    }
  };

  // Search users with RIDER role
  const handleSearch = async (query) => {
    setSearch(query);
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    
    setSearching(true);
    try {
      const response = await apiClient.get(`/users/role/RIDER`);
      const allRiders = response.data || [];
      
      // Filter out already added riders
      const existingIds = riders.map(r => r.userId);
      const filtered = allRiders.filter(
        u => !existingIds.includes(u.id) &&
             (u.firstName?.toLowerCase().includes(query.toLowerCase()) ||
              u.lastName?.toLowerCase().includes(query.toLowerCase()) ||
              u.username?.toLowerCase().includes(query.toLowerCase()) ||
              u.phone?.includes(query))
      );
      setSearchResults(filtered.slice(0, 10));
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  // Add rider from search
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
      alert('❌ Error adding rider: ' + (error.response?.data?.error || error.message));
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
            className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-lg"
          >
            <RefreshCw size={16} /> Refresh
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            <Plus size={18} />
            Add Rider
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {riders.length === 0 ? (
          <div className="col-span-3 text-center py-12 text-gray-500">
            No riders found. Add riders using the "Add Rider" button.
          </div>
        ) : (
          riders.map((rider) => (
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
          ))
        )}
      </div>

      {/* ADD RIDER MODAL */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
          <div className="bg-white dark:bg-gray-800 w-[420px] rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold dark:text-white">Add Rider</h2>
              <X className="cursor-pointer dark:text-white" onClick={() => setShowModal(false)} />
            </div>

            <div className="flex items-center border rounded-lg px-3 py-2 mb-4 dark:border-gray-600">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search by name, username or phone..."
                className="ml-2 outline-none w-full bg-transparent dark:text-white"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto">
              {searching && <p className="text-gray-500 text-sm text-center">Searching...</p>}
              
              {search && !searching && searchResults.length === 0 && (
                <p className="text-gray-500 text-sm text-center">No RIDER users found.</p>
              )}

              {searchResults.map((user) => (
                <div
                  key={user.id}
                  className="flex justify-between items-center border p-3 rounded-lg dark:border-gray-600"
                >
                  <div>
                    <p className="font-medium dark:text-white">{user.firstName} {user.lastName}</p>
                    <p className="text-sm text-gray-500">@{user.username} • {user.phone || 'No phone'}</p>
                  </div>
                  <button
                    onClick={() => addRider(user)}
                    className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Riders;