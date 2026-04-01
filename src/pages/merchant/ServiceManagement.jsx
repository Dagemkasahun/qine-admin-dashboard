// src/pages/merchant/ServiceManagement.jsx
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Edit, Trash2, Clock, DollarSign, Save, X } from 'lucide-react';

const ServiceManagement = () => {
  const { merchantId } = useParams();
  const [services, setServices] = useState([
    {
      id: 1,
      name: 'Business Plan Consultation',
      description: 'One-on-one session to develop your business plan',
      duration: '2 hours',
      price: 2500,
      isActive: true
    },
    {
      id: 2,
      name: 'Market Research',
      description: 'Comprehensive market analysis report',
      duration: '1 week',
      price: 15000,
      isActive: true
    },
    {
      id: 3,
      name: 'Financial Advisory',
      description: 'Expert financial advice for your business',
      duration: '1 hour',
      price: 1200,
      isActive: true
    }
  ]);

  const [team, setTeam] = useState([
    {
      id: 1,
      name: 'Abebe Kebede',
      title: 'Senior Consultant',
      bio: '15 years experience in business strategy',
      image: null
    },
    {
      id: 2,
      name: 'Sara Hailu',
      title: 'Financial Advisor',
      bio: 'Expert in financial planning and analysis',
      image: null
    }
  ]);

  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [editingTeam, setEditingTeam] = useState(null);
  const [activeTab, setActiveTab] = useState('services');

  const handleSaveService = (serviceData) => {
    if (editingService) {
      setServices(services.map(s => 
        s.id === editingService.id ? { ...s, ...serviceData } : s
      ));
    } else {
      setServices([...services, { id: Date.now(), ...serviceData }]);
    }
    setShowServiceModal(false);
    setEditingService(null);
  };

  const handleDeleteService = (serviceId) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      setServices(services.filter(s => s.id !== serviceId));
    }
  };

  const handleSaveTeam = (teamData) => {
    if (editingTeam) {
      setTeam(team.map(t => 
        t.id === editingTeam.id ? { ...t, ...teamData } : t
      ));
    } else {
      setTeam([...team, { id: Date.now(), ...teamData }]);
    }
    setShowTeamModal(false);
    setEditingTeam(null);
  };

  const handleDeleteTeam = (teamId) => {
    if (window.confirm('Are you sure you want to remove this team member?')) {
      setTeam(team.filter(t => t.id !== teamId));
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Service Management</h1>
          <p className="text-gray-600 mt-1">Manage your services and team members</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b mb-6">
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab('services')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'services'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Services
          </button>
          <button
            onClick={() => setActiveTab('team')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'team'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Team Members
          </button>
        </div>
      </div>

      {/* Services Tab */}
      {activeTab === 'services' && (
        <div>
          <div className="flex justify-end mb-4">
            <button
              onClick={() => {
                setEditingService(null);
                setShowServiceModal(true);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Service
            </button>
          </div>

          <div className="grid gap-4">
            {services.map(service => (
              <div key={service.id} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition">
                <div className="flex justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{service.name}</h3>
                    <p className="text-gray-600 mt-1">{service.description}</p>
                    <div className="flex items-center mt-3 space-x-4">
                      <span className="flex items-center text-sm text-gray-500">
                        <Clock className="w-4 h-4 mr-1" />
                        {service.duration}
                      </span>
                      <span className="flex items-center text-sm text-gray-500">
                        <DollarSign className="w-4 h-4 mr-1" />
                        ETB {service.price}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2 ml-4">
                    <button
                      onClick={() => {
                        setEditingService(service);
                        setShowServiceModal(true);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteService(service.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Team Tab */}
      {activeTab === 'team' && (
        <div>
          <div className="flex justify-end mb-4">
            <button
              onClick={() => {
                setEditingTeam(null);
                setShowTeamModal(true);
              }}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Team Member
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {team.map(member => (
              <div key={member.id} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition">
                <div className="flex items-center mb-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full mr-4"></div>
                  <div>
                    <h3 className="font-semibold">{member.name}</h3>
                    <p className="text-sm text-gray-600">{member.title}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4">{member.bio}</p>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => {
                      setEditingTeam(member);
                      setShowTeamModal(true);
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteTeam(member.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Service Modal */}
      {showServiceModal && (
        <ServiceModal
          service={editingService}
          onClose={() => setShowServiceModal(false)}
          onSave={handleSaveService}
        />
      )}

      {/* Team Modal */}
      {showTeamModal && (
        <TeamModal
          member={editingTeam}
          onClose={() => setShowTeamModal(false)}
          onSave={handleSaveTeam}
        />
      )}
    </div>
  );
};

// Service Modal Component
const ServiceModal = ({ service, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: service?.name || '',
    description: service?.description || '',
    duration: service?.duration || '',
    price: service?.price || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">
            {service ? 'Edit Service' : 'Add New Service'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Service Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="3"
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration *
                </label>
                <input
                  type="text"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                  placeholder="e.g., 2 hours"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (ETB) *
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                  required
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Save className="w-4 h-4 mr-2" />
              {service ? 'Update' : 'Save'} Service
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Team Modal Component
const TeamModal = ({ member, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: member?.name || '',
    title: member?.title || '',
    bio: member?.bio || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">
            {member ? 'Edit Team Member' : 'Add Team Member'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title/Position *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                placeholder="e.g., Senior Consultant"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bio
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows="3"
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Profile Photo
              </label>
              <div className="border-2 border-dashed rounded-lg p-4 text-center">
                <p className="text-sm text-gray-600">Click to upload photo</p>
                <input type="file" accept="image/*" className="hidden" />
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center"
            >
              <Save className="w-4 h-4 mr-2" />
              {member ? 'Update' : 'Save'} Member
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServiceManagement;