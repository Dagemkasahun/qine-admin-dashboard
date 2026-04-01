// src/pages/Riders.jsx
import { useState } from 'react';
import { Search, Plus, Bike, MapPin, Phone, Star } from 'lucide-react';

const Riders = () => {
  const [riders] = useState([
    { id: 1, name: 'Getachew T.', phone: '+251911223344', status: 'online', deliveries: 156, rating: 4.8, earnings: 12500, vehicle: 'Motorcycle' },
    { id: 2, name: 'Almaz K.', phone: '+251922334455', status: 'online', deliveries: 142, rating: 4.9, earnings: 11800, vehicle: 'Bicycle' },
    { id: 3, name: 'Berhanu M.', phone: '+251933445566', status: 'offline', deliveries: 98, rating: 4.5, earnings: 8900, vehicle: 'Motorcycle' },
    { id: 4, name: 'Tigist W.', phone: '+251944556677', status: 'online', deliveries: 134, rating: 4.7, earnings: 11200, vehicle: 'Scooter' },
    { id: 5, name: 'Henok D.', phone: '+251955667788', status: 'busy', deliveries: 112, rating: 4.6, earnings: 10200, vehicle: 'Motorcycle' },
  ]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Riders Management</h1>
        <button className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add New Rider
        </button>
      </div>

      {/* Live Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-600 text-sm">Total Riders</p>
          <p className="text-2xl font-bold">89</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-600 text-sm">Online Now</p>
          <p className="text-2xl font-bold text-green-600">45</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-600 text-sm">On Delivery</p>
          <p className="text-2xl font-bold text-blue-600">32</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-600 text-sm">Avg. Rating</p>
          <p className="text-2xl font-bold">4.7 ★</p>
        </div>
      </div>

      {/* Riders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {riders.map((rider) => (
          <div key={rider.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Bike className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold">{rider.name}</h3>
                  <p className="text-sm text-gray-600">{rider.vehicle}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs ${
                rider.status === 'online' ? 'bg-green-100 text-green-800' :
                rider.status === 'busy' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {rider.status}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm">
                <Phone className="w-4 h-4 mr-2 text-gray-400" />
                {rider.phone}
              </div>
              <div className="flex items-center text-sm">
                <Star className="w-4 h-4 mr-2 text-yellow-400" />
                {rider.rating} rating
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <p className="text-xs text-gray-500">Deliveries</p>
                <p className="font-semibold">{rider.deliveries}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Earnings</p>
                <p className="font-semibold">ETB {rider.earnings}</p>
              </div>
            </div>

            <div className="flex mt-4 space-x-2">
              <button className="flex-1 px-3 py-2 text-sm border rounded-lg hover:bg-gray-50">
                View Details
              </button>
              <button className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Assign Order
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Riders;