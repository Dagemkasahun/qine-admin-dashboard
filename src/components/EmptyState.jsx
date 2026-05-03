// src/components/EmptyState.jsx
import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import { Package, ShoppingBag, Users, FileText, Inbox } from 'lucide-react';

const icons = {
  package: Package,
  order: ShoppingBag,
  user: Users,
  file: FileText,
  default: Inbox,
};

const EmptyState = ({ 
  title = 'No data found', 
  description = 'There are no items to display yet.',
  icon = 'default',
  action,
  actionLabel,
  className = ''
}) => {
  const { darkMode } = useContext(ThemeContext);
  const Icon = icons[icon] || icons.default;
  const mutedText = darkMode ? 'text-gray-400' : 'text-gray-500';

  return (
    <div className={`flex flex-col items-center justify-center py-16 px-4 ${className}`}>
      <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 ${
        darkMode ? 'bg-gray-700' : 'bg-gray-100'
      }`}>
        <Icon className={`w-12 h-12 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
      </div>
      <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
        {title}
      </h3>
      <p className={`text-sm text-center max-w-sm ${mutedText}`}>
        {description}
      </p>
      {action && (
        <button
          onClick={action}
          className="mt-6 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm"
        >
          {actionLabel || 'Add New'}
        </button>
      )}
    </div>
  );
};

export default EmptyState;