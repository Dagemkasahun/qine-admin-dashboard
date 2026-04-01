// src/pages/TestAPI.jsx
import { useState } from 'react';
import { api } from '../services/api';

const TestAPI = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testEndpoint = async (endpoint) => {
    setLoading(true);
    try {
      let data;
      switch (endpoint) {
        case 'health':
          data = await api.system.health();
          break;
        case 'merchants':
          data = await api.merchants.getAll();
          break;
        case 'stats':
          data = await api.stats.getAdminStats();
          break;
        default:
          data = null;
      }
      setResult(data);
    } catch (error) {
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">API Test Page</h1>
      
      <div className="space-x-4 mb-6">
        <button
          onClick={() => testEndpoint('health')}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Test Health
        </button>
        <button
          onClick={() => testEndpoint('merchants')}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Get Merchants
        </button>
        <button
          onClick={() => testEndpoint('stats')}
          className="bg-purple-600 text-white px-4 py-2 rounded"
        >
          Get Stats
        </button>
      </div>

      {loading && <p>Loading...</p>}
      
      {result && (
        <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
};

export default TestAPI;