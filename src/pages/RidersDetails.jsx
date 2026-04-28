import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Phone, Mail, Bike, Star, Shield, MapPin } from "lucide-react";
import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext.jsx";
import apiClient from "../api/client";

const RiderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { darkMode } = useContext(ThemeContext);
  const [rider, setRider] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRiderDetails();
  }, [id]);

  const fetchRiderDetails = async () => {
    try {
      const response = await apiClient.get(`/riders/${id}`);
      setRider(response.data);
    } catch (error) {
      console.error('Error fetching rider:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <p>Loading rider data...</p>
      </div>
    );
  }

  if (!rider) {
    return (
      <div className="p-6">
        <p>Rider not found</p>
        <button
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
          onClick={() => navigate("/riders")}
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className={`${darkMode ? "bg-gray-900 text-white" : "bg-gray-100"} min-h-screen p-6`}>
      <div className="flex items-center mb-6">
        <button onClick={() => navigate("/riders")} className="mr-4">
          <ArrowLeft />
        </button>
        <h1 className="text-2xl font-bold">Rider Details</h1>
      </div>

      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
        {/* Profile Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
            <Bike size={28} className="text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">
              {rider.user?.firstName} {rider.user?.lastName}
            </h2>
            <p className={`text-sm px-2 py-0.5 rounded-full inline-block mt-1 ${
              rider.status === 'ONLINE' ? 'bg-green-100 text-green-700' :
              rider.status === 'BUSY' ? 'bg-yellow-100 text-yellow-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {rider.status || 'OFFLINE'}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{rider.totalDeliveries || 0}</p>
            <p className="text-xs text-gray-500">Deliveries</p>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-2xl font-bold text-green-600">ETB {rider.totalEarnings || 0}</p>
            <p className="text-xs text-gray-500">Earned</p>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-2xl font-bold text-yellow-600">{rider.rating?.toFixed(1) || '4.5'}</p>
            <p className="text-xs text-gray-500">Rating</p>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <Phone size={18} className="text-gray-500" />
            <div>
              <p className="text-xs text-gray-500">Phone</p>
              <p className="font-medium">{rider.phone || rider.user?.phone || 'N/A'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <Mail size={18} className="text-gray-500" />
            <div>
              <p className="text-xs text-gray-500">Email</p>
              <p className="font-medium">{rider.user?.email || 'N/A'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <Bike size={18} className="text-gray-500" />
            <div>
              <p className="text-xs text-gray-500">Vehicle</p>
              <p className="font-medium">{rider.vehicleType} • {rider.vehicleModel || 'N/A'} • {rider.vehiclePlate || 'No plate'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <Shield size={18} className="text-gray-500" />
            <div>
              <p className="text-xs text-gray-500">License</p>
              <p className="font-medium">{rider.licenseNumber || 'Not provided'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <Star size={18} className="text-gray-500" />
            <div>
              <p className="text-xs text-gray-500">Performance</p>
              <p className="font-medium">
                Rating: {rider.rating?.toFixed(1)} • Completion: {rider.completedRate}% • On-Time: {rider.onTimeRate}%
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiderDetails;