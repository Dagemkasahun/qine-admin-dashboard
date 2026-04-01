// components/Dashboard/QuickActions.jsx
import { Plus, Upload, Download, Settings, Users, Store, Bike } from 'lucide-react';

const QuickActions = () => {
  const actions = [
    { icon: Plus, label: 'Add Merchant', color: 'bg-green-500' },
    { icon: Users, label: 'Add Rider', color: 'bg-blue-500' },
    { icon: Store, label: 'Bulk Upload', color: 'bg-purple-500' },
    { icon: Download, label: 'Generate Report', color: 'bg-orange-500' },
    { icon: Settings, label: 'Settings', color: 'bg-gray-500' }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
      <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {actions.map((action, index) => (
          <button
            key={index}
            className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 transition group"
          >
            <div className={`${action.color} p-3 rounded-lg text-white mb-2 group-hover:scale-110 transition`}>
              <action.icon className="w-5 h-5" />
            </div>
            <span className="text-sm text-gray-600">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;