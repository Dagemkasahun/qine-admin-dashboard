// src/components/merchants/layouts/ServiceLayout.jsx
import { Calendar, Users } from 'lucide-react';

const ServiceLayout = ({ merchant }) => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">About Our Services</h2>
      <div className="prose max-w-none mb-8">
        <p>Service description here...</p>
      </div>

      {/* Service-specific features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-2">Consultation</h3>
          <p className="text-gray-600 text-sm mb-3">1-hour session</p>
          <button className="text-blue-600 font-medium">Book Now →</button>
        </div>
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-2">Training</h3>
          <p className="text-gray-600 text-sm mb-3">Full day workshop</p>
          <button className="text-blue-600 font-medium">Book Now →</button>
        </div>
      </div>
    </div>
  );
};

export default ServiceLayout;