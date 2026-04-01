// src/config/merchantConfig.js
export const merchantConfig = {
  // School - Service only
  school_1: {
    id: 'school_1',
    name: 'ABC International School',
    type: 'SERVICE',
    category: 'school',
    features: {
      hasProducts: false,
      hasInventory: false,
      hasBooking: true,
      hasPromotion: true,
      hasPayment: true,
      hasDelivery: false
    },
    theme: {
      primaryColor: '#2563eb',
      logo: '/logos/school1.png',
      layout: 'service'
    },
    modules: ['info', 'gallery', 'contact', 'booking']
  },

  // Honey Shop - Products only
  honey_shop_1: {
    id: 'honey_shop_1',
    name: 'Pure Honey Ethiopia',
    type: 'PRODUCT',
    category: 'honey_shop',
    features: {
      hasProducts: true,
      hasInventory: true,
      hasBooking: false,
      hasPromotion: true,
      hasPayment: true,
      hasDelivery: true
    },
    theme: {
      primaryColor: '#d97706',
      logo: '/logos/honey1.png',
      layout: 'ecommerce'
    },
    modules: ['products', 'cart', 'checkout', 'reviews']
  },

  // Restaurant - Hybrid
  restaurant_1: {
    id: 'restaurant_1',
    name: 'Taste of Ethiopia',
    type: 'HYBRID',
    category: 'restaurant',
    features: {
      hasProducts: true,
      hasInventory: true,
      hasBooking: true,
      hasPromotion: true,
      hasPayment: true,
      hasDelivery: true
    },
    theme: {
      primaryColor: '#dc2626',
      logo: '/logos/rest1.png',
      layout: 'restaurant'
    },
    modules: ['menu', 'booking', 'delivery', 'reviews']
  },

  // Consultancy - Service with booking
  consultancy_1: {
    id: 'consultancy_1',
    name: 'BizConsult Ethiopia',
    type: 'SERVICE',
    category: 'consultancy',
    features: {
      hasProducts: false,
      hasInventory: false,
      hasBooking: true,
      hasPromotion: true,
      hasPayment: true,
      hasDelivery: false
    },
    theme: {
      primaryColor: '#059669',
      logo: '/logos/consult1.png',
      layout: 'service'
    },
    modules: ['services', 'team', 'booking', 'contact']
  }
};