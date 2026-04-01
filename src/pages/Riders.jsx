import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bike, Phone, Star, Plus, X, Search } from "lucide-react";

const Riders = ({ riders, setRiders }) => {
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");

  const [registeredRiders] = useState([
    { id: 11, name: "Samuel A.", phone: "+251911000111", vehicle: "Motorcycle" },
    { id: 12, name: "Marta T.", phone: "+251922111222", vehicle: "Bicycle" },
    { id: 13, name: "Dawit K.", phone: "+251933222333", vehicle: "Scooter" },
    { id: 14, name: "Helen G.", phone: "+251944333444", vehicle: "Motorcycle" },
    { id: 15, name: "Kebede F.", phone: "+251955444555", vehicle: "Bicycle" },
  ]);

  // Filter riders based on search input
  const filteredUsers = registeredRiders.filter((user) =>
    user.name.toLowerCase().includes(search.toLowerCase())
  );

  // Add rider function
  const addRider = (user) => {
    const newRider = {
      ...user,
      deliveries: 0,
      rating: 5,
      status: "offline",
    };

    setRiders([...riders, newRider]);
    setShowModal(false);
    setSearch("");
  };

  const totalRiders = riders.length;
  const onlineRiders = riders.filter((r) => r.status === "online").length;
  const busyRiders = riders.filter((r) => r.status === "busy").length;

  const avgRating =
    riders.length > 0
      ? riders.reduce((acc, r) => acc + r.rating, 0) / riders.length
      : 0;

  const statusColor = (status) => {
    if (status === "online")
      return "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400";
    if (status === "busy")
      return "bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400";

    return "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400";
  };

  return (
    <div className="p-6 text-gray-800 dark:text-gray-200">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Riders Management</h1>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          <Plus size={18} />
          Add Rider
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm">
          <p className="text-gray-500 text-sm">Total Riders</p>
          <h2 className="text-xl font-bold">{totalRiders}</h2>
        </div>
        <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm">
          <p className="text-gray-500 text-sm">Online Now</p>
          <h2 className="text-xl font-bold text-green-600">{onlineRiders}</h2>
        </div>
        <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm">
          <p className="text-gray-500 text-sm">On Delivery</p>
          <h2 className="text-xl font-bold text-blue-600">{busyRiders}</h2>
        </div>
        <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm">
          <p className="text-gray-500 text-sm">Avg Rating</p>
          <h2 className="text-xl font-bold">{avgRating.toFixed(1)} ⭐</h2>
        </div>
      </div>

      {/* Riders Grid */}
      <div className="grid grid-cols-3 gap-6">
        {riders.map((rider) => (
          <div
            key={rider.id}
            className="bg-white dark:bg-gray-900 p-5 rounded-xl shadow-sm"
          >
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
                  <Bike size={18} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold">{rider.name}</h3>
                  <p className="text-sm text-gray-500">{rider.vehicle}</p>
                </div>
              </div>
              <span
                className={`text-xs px-2 py-1 rounded-full ${statusColor(
                  rider.status
                )}`}
              >
                {rider.status}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
              <Phone size={14} />
              {rider.phone}
            </div>

            <div className="flex items-center gap-2 text-sm mb-3">
              <Star size={16} className="text-yellow-500" />
              {rider.rating} rating
            </div>

            <hr className="my-3 border-gray-200 dark:border-gray-700" />

            <div className="text-sm mb-3">
              <p className="text-gray-500">Deliveries</p>
              <p className="font-semibold">{rider.deliveries}</p>
            </div>

            {/* View Details Button */}
            <button
              className="w-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-2 rounded-lg text-sm"
              onClick={() => navigate(`/riders/${rider.id}`)}
            >
              View Details
            </button>
          </div>
        ))}
      </div>

      {/* ADD RIDER MODAL */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 w-[420px] rounded-xl shadow-lg p-6">

            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Add Rider</h2>
              <X className="cursor-pointer" onClick={() => setShowModal(false)} />
            </div>

            {/* Search Bar */}
            <div className="flex items-center border rounded-lg px-3 py-2 mb-4 dark:border-gray-700">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search registered riders..."
                className="ml-2 outline-none w-full bg-transparent"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Search Results */}
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {/* Show message if search typed but no results */}
              {search && filteredUsers.length === 0 && (
                <p className="text-gray-500 text-sm">No riders found.</p>
              )}

              {/* Only show users if search is not empty */}
              {search &&
                filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex justify-between items-center border p-3 rounded-lg dark:border-gray-700"
                  >
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.phone}</p>
                    </div>
                    <button
                      onClick={() => addRider(user)}
                      className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm"
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