// src/pages/LiveMap.jsx
import { useState, useEffect, useContext, useRef } from 'react';
import {
  Bike, RefreshCw, MapPin, Phone, Star,
  Clock, Search
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import apiClient from '../api/client';
import { ThemeContext } from '../context/ThemeContext';

// Fix Leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom rider icon
const createRiderIcon = (status) => {
  const colors = { ONLINE: '#22c55e', BUSY: '#f59e0b', ON_DELIVERY: '#3b82f6' };
  const color = colors[status] || '#6b7280';
  return L.divIcon({
    className: 'rider-marker',
    html: `<div style="width:36px;height:36px;background:${color};border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;font-size:18px;">🛵</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
};

// Fly to selected rider
const FlyToRider = ({ rider }) => {
  const map = useMap();
  useEffect(() => {
    if (rider?.currentLat && rider?.currentLng) {
      map.flyTo([rider.currentLat, rider.currentLng], 15, { duration: 1 });
    }
  }, [rider, map]);
  return null;
};

const ADDIS_ABABA = [9.0320, 38.7469];

const LiveMap = () => {
  const { darkMode } = useContext(ThemeContext);
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRider, setSelectedRider] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [lastUpdate, setLastUpdate] = useState(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    fetchRiders();
    intervalRef.current = setInterval(fetchRiders, 15000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const fetchRiders = async () => {
    try {
      const response = await apiClient.get('/locations/riders');
      setRiders(response.data || []);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching riders:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchRiders();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ONLINE': return 'bg-green-500';
      case 'BUSY': return 'bg-yellow-500';
      case 'ON_DELIVERY': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      ONLINE: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      BUSY: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      ON_DELIVERY: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const filteredRiders = riders.filter(r => {
    if (!searchTerm) return true;
    const s = searchTerm.toLowerCase();
    return (
      (r.fullName || '').toLowerCase().includes(s) ||
      (r.user?.firstName || '').toLowerCase().includes(s) ||
      (r.user?.lastName || '').toLowerCase().includes(s) ||
      (r.phone || '').includes(s) ||
      (r.vehiclePlate || '').toLowerCase().includes(s)
    );
  });

  const stats = {
    online: riders.filter(r => r.status === 'ONLINE').length,
    busy: riders.filter(r => r.status === 'BUSY').length,
    delivering: riders.filter(r => r.status === 'ON_DELIVERY').length,
    total: riders.length,
  };

  const cardClass = darkMode ? 'bg-gray-800 border border-gray-700 text-white' : 'bg-white border border-gray-200 text-gray-900';
  const mutedText = darkMode ? 'text-gray-400' : 'text-gray-500';
  const pageBg = darkMode ? 'bg-gray-900' : 'bg-gray-50';

  if (loading) {
    return (
      <div className={`p-6 min-h-screen ${pageBg} flex items-center justify-center`}>
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className={mutedText}>Loading live map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 min-h-screen ${pageBg}`}>
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div>
          <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            <MapPin className="inline w-6 h-6 mr-2 text-red-500" />
            Live Map
          </h1>
          <p className={mutedText}>
            {stats.total} active riders
            {lastUpdate && ` • Last update: ${lastUpdate.toLocaleTimeString()}`}
          </p>
        </div>
        <button onClick={handleRefresh} disabled={refreshing}
          className={`px-4 py-2 border rounded-lg flex items-center gap-2 ${
            darkMode ? 'border-gray-700 hover:bg-gray-800 text-gray-300' : 'border-gray-300 hover:bg-gray-50 text-gray-700'
          }`}
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="flex gap-6 flex-col lg:flex-row">
        {/* Map */}
        <div className="flex-1">
          <div className={`${cardClass} rounded-xl shadow overflow-hidden`} style={{ height: 'calc(100vh - 200px)', minHeight: 500 }}>
            <MapContainer center={ADDIS_ABABA} zoom={13} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <FlyToRider rider={selectedRider} />
              
              {filteredRiders.map((rider) => (
                <Marker
                  key={rider.id}
                  position={[rider.currentLat, rider.currentLng]}
                  icon={createRiderIcon(rider.status)}
                  eventHandlers={{ click: () => setSelectedRider(rider) }}
                >
                  <Popup>
                    <div style={{ minWidth: 200, padding: 4 }}>
                      <h3 style={{ fontWeight: 'bold', margin: '0 0 6px 0', fontSize: 14 }}>
                        {rider.user?.firstName} {rider.user?.lastName}
                      </h3>
                      <div style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.6 }}>
                        <div>Status: {rider.status?.replace(/_/g, ' ')}</div>
                        <div>⭐ {rider.rating?.toFixed(1) || 'N/A'}</div>
                        <div>📱 {rider.phone || 'N/A'}</div>
                        <div>🏍️ {rider.vehicleType} • {rider.vehiclePlate || 'No plate'}</div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {selectedRider && (
                <Circle
                  center={[selectedRider.currentLat, selectedRider.currentLng]}
                  radius={50}
                  pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.1, weight: 1 }}
                />
              )}
            </MapContainer>
          </div>
        </div>

        {/* Sidebar */}
        <div className={`w-full lg:w-80 ${cardClass} rounded-xl shadow p-4 flex flex-col`} style={{ maxHeight: 'calc(100vh - 200px)' }}>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-2 text-center`}>
              <p className="text-xs text-gray-500">Online</p>
              <p className="text-lg font-bold text-green-600">{stats.online}</p>
            </div>
            <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-2 text-center`}>
              <p className="text-xs text-gray-500">Busy</p>
              <p className="text-lg font-bold text-yellow-600">{stats.busy}</p>
            </div>
            <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-2 text-center`}>
              <p className="text-xs text-gray-500">Delivering</p>
              <p className="text-lg font-bold text-blue-600">{stats.delivering}</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text" placeholder="Search riders..." value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-9 pr-4 py-2 border rounded-lg text-sm ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300'
              }`}
            />
          </div>

          {/* Riders List */}
          <div className="flex-1 overflow-y-auto space-y-2">
            {filteredRiders.length === 0 ? (
              <div className="text-center py-8">
                <Bike className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className={mutedText}>{riders.length === 0 ? 'No active riders' : 'No matching riders'}</p>
              </div>
            ) : (
              filteredRiders.map((rider) => (
                <div key={rider.id} onClick={() => setSelectedRider(rider)}
                  className={`p-3 rounded-lg cursor-pointer border transition ${
                    selectedRider?.id === rider.id
                      ? darkMode ? 'bg-blue-900/30 border-blue-600' : 'bg-blue-50 border-blue-500'
                      : darkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-100 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${getStatusColor(rider.status)}`}></span>
                      <span className="font-medium text-sm">{rider.user?.firstName} {rider.user?.lastName?.charAt(0)}.</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(rider.status)}`}>
                      {rider.status?.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-500">{rider.vehicleType}</span>
                    <span className="text-xs text-gray-400">
                      <Clock className="w-3 h-3 inline mr-1" />
                      {rider.lastLocationUpdate
                        ? `${Math.round((Date.now() - new Date(rider.lastLocationUpdate).getTime()) / 60000)}m ago`
                        : 'N/A'}
                    </span>
                  </div>
                  {selectedRider?.id === rider.id && (
                    <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600 space-y-1">
                      <p className="text-xs text-gray-500"><Phone className="w-3 h-3 inline mr-1" />{rider.phone || 'N/A'}</p>
                      <p className="text-xs text-gray-500"><Star className="w-3 h-3 inline mr-1" />{rider.rating?.toFixed(1) || 'N/A'}</p>
                      <p className="text-xs text-gray-500"><MapPin className="w-3 h-3 inline mr-1" />{rider.currentLat?.toFixed(4)}, {rider.currentLng?.toFixed(4)}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveMap;