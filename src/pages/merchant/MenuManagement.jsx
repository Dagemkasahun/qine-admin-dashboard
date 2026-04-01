// src/pages/merchant/MenuManagement.jsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Edit, Trash2, ChevronDown, ChevronUp, Save, X, Star } from 'lucide-react';

const MenuManagement = () => {
  const { merchantId } = useParams();
  
  // State for categories and items
  const [categories, setCategories] = useState([
    { id: 1, name: 'Breakfast', items: [] },
    { id: 2, name: 'Lunch', items: [] },
    { id: 3, name: 'Dinner', items: [] },
    { id: 4, name: 'Drinks', items: [] }
  ]);
  
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
    }
  ]);

  // UI State
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [showItemModal, setShowItemModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState('');

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    
    const newCategory = {
      id: Date.now(),
      name: newCategoryName,
      items: []
    };
    
    setCategories([...categories, newCategory]);
    setNewCategoryName('');
    setShowCategoryModal(false);
  };

  const handleDeleteCategory = (categoryId) => {
    if (window.confirm('Are you sure? This will also remove all items in this category.')) {
      setCategories(categories.filter(c => c.id !== categoryId));
      setMenuItems(menuItems.filter(item => item.categoryId !== categoryId));
    }
  };

  const handleSaveItem = (itemData) => {
    if (editingItem) {
      setMenuItems(menuItems.map(item => 
        item.id === editingItem.id ? { ...itemData, id: item.id } : item
      ));
    } else {
      setMenuItems([...menuItems, { ...itemData, id: Date.now() }]);
    }
    setShowItemModal(false);
    setEditingItem(null);
  };

  const handleDeleteItem = (itemId) => {
    if (window.confirm('Delete this item?')) {
      setMenuItems(menuItems.filter(item => item.id !== itemId));
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Menu Management</h1>
          <p className="text-gray-600">Organize your food items and categories</p>
        </div>
        <button 
          onClick={() => setShowCategoryModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </button>
      </div>

      <div className="space-y-4">
        {categories.map((category) => (
          <div key={category.id} className="border rounded-lg bg-white overflow-hidden shadow-sm">
            <div className="p-4 flex items-center justify-between bg-gray-50">
              <div 
                className="flex items-center flex-1 cursor-pointer"
                onClick={() => setExpandedCategory(expandedCategory === category.id ? null : category.id)}
              >
                {expandedCategory === category.id ? <ChevronUp className="w-5 h-5 mr-2" /> : <ChevronDown className="w-5 h-5 mr-2" />}
                <h3 className="font-semibold text-lg">{category.name}</h3>
                <span className="ml-3 text-sm text-gray-500">
                  ({menuItems.filter(item => item.categoryId === category.id).length} items)
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => {
                    setSelectedCategoryId(category.id);
                    setEditingItem(null);
                    setShowItemModal(true);
                  }}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                  title="Add Item"
                >
                  <Plus className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => handleDeleteCategory(category.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {expandedCategory === category.id && (
              <div className="p-4 border-t divide-y">
                {menuItems.filter(item => item.categoryId === category.id).map((item) => (
                  <div key={item.id} className="py-4 flex justify-between items-center">
                    <div className="flex items-center">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover mr-4" />
                      ) : (
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mr-4">
                          <Plus className="text-gray-400" />
                        </div>
                      )}
                      <div>
                        <div className="flex items-center">
                          <h4 className="font-medium">{item.name}</h4>
                          {item.isPopular && <Star className="w-4 h-4 text-yellow-500 fill-current ml-2" />}
                        </div>
                        <p className="text-sm text-gray-600">{item.description}</p>
                        <div className="flex items-center mt-1 text-sm text-gray-500">
                          <span className="font-semibold text-gray-800">{item.price} ETB</span>
                          <span className="mx-2">•</span>
                          <span>{item.preparationTime}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => {
                          setEditingItem(item);
                          setSelectedCategoryId(category.id);
                          setShowItemModal(true);
                        }}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {menuItems.filter(item => item.categoryId === category.id).length === 0 && (
                  <p className="text-center py-8 text-gray-500 italic">No items in this category yet.</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add New Category</h2>
            <form onSubmit={handleAddCategory}>
              <input
                autoFocus
                type="text"
                className="w-full border rounded-lg px-4 py-2 mb-4 focus:outline-none focus:border-blue-500"
                placeholder="Category Name (e.g. Desserts)"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
              />
              <div className="flex justify-end space-x-3">
                <button type="button" onClick={() => setShowCategoryModal(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Item Modal */}
      {showItemModal && (
        <ItemModal 
          item={editingItem} 
          categoryId={selectedCategoryId}
          onClose={() => setShowItemModal(false)} 
          onSave={handleSaveItem} 
        />
      )}
    </div>
  );
};

const ItemModal = ({ item, categoryId, onClose, onSave }) => {
  const [formData, setFormData] = useState(item || {
    name: '',
    description: '',
    price: '',
    preparationTime: '',
    isPopular: false,
    categoryId: categoryId
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white">
          <h2 className="text-xl font-bold">{item ? 'Edit Item' : 'Add New Item'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
            <input
              required
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full border rounded-lg px-4 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full border rounded-lg px-4 py-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (ETB)</label>
              <input
                required
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                className="w-full border rounded-lg px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prep Time</label>
              <input
                type="text"
                placeholder="e.g. 20 min"
                value={formData.preparationTime}
                onChange={(e) => setFormData({...formData, preparationTime: e.target.value})}
                className="w-full border rounded-lg px-4 py-2"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="popular"
              checked={formData.isPopular}
              onChange={(e) => setFormData({...formData, isPopular: e.target.checked})}
              className="h-4 w-4 text-blue-600 rounded"
            />
            <label htmlFor="popular" className="ml-2 text-sm text-gray-700">Mark as Popular</label>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center">
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