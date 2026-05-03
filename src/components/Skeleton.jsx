// src/components/Skeleton.jsx
import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';

const Skeleton = ({ className = '', variant = 'text', width, height }) => {
  const { darkMode } = useContext(ThemeContext);
  
  const baseClass = `animate-pulse rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`;
  
  const variants = {
    text: 'h-4 w-full',
    title: 'h-6 w-3/4',
    subtitle: 'h-4 w-1/2',
    avatar: 'rounded-full',
    card: 'rounded-lg',
    button: 'rounded-lg h-10',
    chart: 'rounded-lg h-64',
    table: 'rounded-lg h-48',
  };

  return (
    <div
      className={`${baseClass} ${variants[variant] || ''} ${className}`}
      style={{ width, height }}
    />
  );
};

// Pre-built skeleton layouts
export const CardSkeleton = () => {
  const { darkMode } = useContext(ThemeContext);
  const cardClass = darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200';
  
  return (
    <div className={`${cardClass} rounded-lg shadow p-6 space-y-4`}>
      <Skeleton variant="title" width="60%" />
      <Skeleton variant="text" />
      <Skeleton variant="text" width="80%" />
    </div>
  );
};

export const TableSkeleton = ({ rows = 5, columns = 4 }) => {
  const { darkMode } = useContext(ThemeContext);
  const cardClass = darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200';
  
  return (
    <div className={`${cardClass} rounded-lg shadow overflow-hidden`}>
      <div className="p-4 border-b dark:border-gray-700">
        <Skeleton variant="title" width="30%" />
      </div>
      <div className="divide-y dark:divide-gray-700">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-4 flex gap-4">
            {Array.from({ length: columns }).map((_, j) => (
              <Skeleton key={j} variant="text" className="flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export const ChartSkeleton = () => {
  const { darkMode } = useContext(ThemeContext);
  const cardClass = darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200';
  
  return (
    <div className={`${cardClass} rounded-lg shadow p-6`}>
      <Skeleton variant="title" width="40%" className="mb-6" />
      <Skeleton variant="chart" />
    </div>
  );
};

export const DashboardSkeleton = () => {
  return (
    <div className="p-6 space-y-6">
      <Skeleton variant="title" width="25%" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => <CardSkeleton key={i} />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
      <TableSkeleton rows={5} columns={5} />
    </div>
  );
};

export default Skeleton;