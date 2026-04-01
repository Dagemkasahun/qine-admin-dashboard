// src/utils/imageUtils.js
export const getImageUrl = (path, fallback = 'https://via.placeholder.com/400x200?text=Image+Not+Found') => {
  // In development, you might want to use placeholders
  if (!path || path.includes('undefined')) {
    return fallback;
  }
  return path;
};

export const handleImageError = (e) => {
  e.target.onerror = null;
  e.target.src = 'https://via.placeholder.com/400x200?text=No+Image';
};