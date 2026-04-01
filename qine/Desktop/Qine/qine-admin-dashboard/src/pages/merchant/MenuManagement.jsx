// src/pages/merchant/MenuManagement.jsx
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Edit, Trash2, ChevronDown, ChevronUp, Save, X } from 'lucide-react';

const MenuManagement = () => {
  const { merchantId } = useParams();
  const [categories, setCategories] = useState([
    { id: 1, name: 'Breakfast', items: [] },
    { id: 2, name: 'Lunch', items: [] },
    { id: 3, name: 'Dinner', items: [] },
    { id: 4, name: 'Drinks', items: [] }
  ]);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  // Mock menu items - replace with API data
  const [menuItems, setMenuItems] = useState([
    {
      id: 1,
      categoryId: 2,
      name: 'Kitfo',
      description: 'Traditional minced meat with spices',
      price: 450,
      preparationTime: '20 min',
      isPopular: true,
      image: null
    },
    {
      id: 2,
      categoryId: 2,
      name: 'Doro Wat',
      description: 'Spicy chicken stew with eggs',
      price: 380,
      preparationTime: '25 min',
      isPopular: true,
      image: null
    },
    {
      id: 3,
      categoryId: 1,
      name: 'Firfir',
      description: 'Traditional breakfast dish',
      price: 180,
      preparationTime: '10 min',
      isPopular: false,
      image: null
    }
  ]);

  const toggleCategory = (categoryId) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  const handleAddItem = (categoryId) => {
    setSelectedCategory(categoryId);
    setEditingItem(null);
    setShowAddItemModal(true);
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setSelectedCategory(item.categoryId);
    setShowAddItemModal(true);
  };

  const handleDeleteItem = (itemId) => {
    if (window.confirm('Are you sure you want to delete this menu item?')) {
      setMenuItems(menuItems.filter(item => item.id !== itemId));
    }
  };

  const getItemsByCategory = (categoryId) => {
    return menuItems.filter(item => item.categoryId === categoryId);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Menu Management</h1>
          <p className="text-gray-600 mt-1">Manage your restaurant menu and categories</p>
        </div>
        <button
          onClick={() => {
            setSelectedCategory(null);
            setEditingItem(null);
            setShowAddItemModal(true);
          }}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </button>
      </div>

      {/* Menu Categories */}
      <div className="space-y-4">
        {categories.map(category => {
          const items = getItemsByCategory(category.id);
          const isExpanded = expandedCategory === category.id;

          return (
            <div key={category.id} className="bg-white rounded-lg shadow overflow-hidden">
              {/* Category Header */}
              <div 
                className="px-6 py-4 bg-gray-50 flex justify-between items-center cursor-pointer hover:bg-gray-100"
                onClick={() => toggleCategory(category.id)}
              >
                <div className="flex items-center">
                  <h3 className="font-semibold text-lg">{category.name}</h3>
                  <span className="ml-3 text-sm text-gray-500">({items.length} items)</span>
                </div>
                <div className="flex items-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddItem(category.id);
                    }}
                    className="mr-3 p-1 text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </div>
              </div>

              {/* Category Items */}
              {isExpanded && (
                <div className="p-4">
                  {items.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No items in this category</p>
                  ) : (
                    <div className="space-y-3">
                      {items.map(item => (
                        <div key={item.id} className="border rounded-lg p-4 hover:shadow-md transition">
                          <div className="flex justify-between">
                            <div className="flex-1">
                              <div className="flex items-center">
                                <h4 className="font-semibold">{item.name}</h4>
                                {item.isPopular && (
                                  <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                                    Popular
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                              <div className="flex items-center mt-2 text-sm text-gray-500">
                                <span>Prep time: {item.preparationTime}</span>
                              </div>
                            </div>
                            <div className="text-right ml-4">
                              <p className="text-lg font-bold text-green-600">ETB {item.price}</p>
                              <div className="flex mt-2 space-x-2">
                                <button
                                  onClick={() => handleEditItem(item)}
                                  className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteItem(item.id)}
                                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add/Edit Item Modal */}
      {showAddItemModal && (
        <MenuItemModal
          categories={categories}
          selectedCategory={selectedCategory}
          item={editingItem}
          onClose={() => setShowAddItemModal(false)}
          onSave={(itemData) => {
            if (editingItem) {
              // Update existing item
              setMenuItems(menuItems.map(item => 
                item.id === editingItem.id ? { ...item, ...itemData } : item
              ));
            } else {
              // Add new item
              const newItem = {
                id: Date.now(),
                categoryId: selectedCategory,
                ...itemData
              };
              setMenuItems([...menuItems, newItem]);
            }
            setShowAddItemModal(false);
          }}
        />
      )}
    </div>
  );
};

// Menu Item Modal Component
const MenuItemModal = ({ categories, selectedCategory, item, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: item?.name || '',
    description: item?.description || '',
    price: item?.price || '',
    preparationTime: item?.preparationTime || '15 min',
    categoryId: item?.categoryId || selectedCategory || categories[0]?.id,
    isPopular: item?.isPopular || false
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
            {item ? 'Edit Menu Item' : 'Add New Menu Item'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Category Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: Number(e.target.value) })}
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                required
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Item Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Item Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            {/* Description */}
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

            {/* Price and Prep Time */}
            <div className="grid grid-cols-2 gap-4">
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preparation Time
                </label>
                <input
                  type="text"
                  value={formData.preparationTime}
                  onChange={(e) => setFormData({ ...formData, preparationTime: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                  placeholder="e.g., 15 min"
                />
              </div>
            </div>

            {/* Popular Checkbox */}
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isPopular}
                onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">
                Mark as Popular Item
              </label>
            </div>
          </div>

          {/* Form Actions */}
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
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
            >
              <Save className="w-4 h-4 mr-2" />
              {item ? 'Update' : 'Save'} Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MenuManagement;