// src/components/merchants/layouts/ProductLayout.jsx
import { ShoppingCart, Package } from 'lucide-react';

const ProductLayout = ({ merchant }) => {
  return (
    <div>
      {/* Product-specific features */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Our Products</h2>
          <button className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg">
            <ShoppingCart className="w-4 h-4 mr-2" />
            Cart (0)
          </button>
        </div>
        
        {/* Categories */}
        <div className="flex space-x-4 mt-4 overflow-x-auto pb-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">All</button>
          <button className="px-4 py-2 border rounded-lg hover:bg-gray-50">Honey</button>
          <button className="px-4 py-2 border rounded-lg hover:bg-gray-50">Bee Wax</button>
          <button className="px-4 py-2 border rounded-lg hover:bg-gray-50">Propolis</button>
        </div>
      </div>
    </div>
  );
};

export default ProductLayout;