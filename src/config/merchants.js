// ============================================
// FILE: src/config/merchants.js
// PURPOSE: Central configuration for all 41+ merchants
// This file defines merchant types, individual merchants,
// and helper functions to access merchant data
// ============================================

/**
 * MERCHANT_TYPES - Enumeration of possible merchant types
 * This helps categorize merchants for different layouts and features
 */
export const MERCHANT_TYPES = {
  SERVICE: 'service',      // Schools, consultants, professionals (no products, just services)
  PRODUCT: 'product',      // Honey shop, stationary, retail (sell physical products)
  RESTAURANT: 'restaurant', // Food services (have menus, tables, delivery)
  PROMOTION: 'promotion'    // Simple info page with contact details
};

/**
 * merchants - Array containing all merchant configurations
 * Each merchant object defines:
 * - Basic info (name, type, category)
 * - Contact details
 * - Features enabled for this merchant
 * - Modules to display
 * - Type-specific data (products, menu, services)
 */
export const merchants = [
  // ========================================
  // SCHOOL - Service Type Example
  // No products, just information and booking
  // ========================================
  {
    id: 'school_1',                    // Unique identifier for the merchant
    name: 'ABC International School',    // Display name
    type: MERCHANT_TYPES.SERVICE,       // Type from enum above
    category: 'Education',               // Industry category
    logo: '/logos/school1.png',          // Path to logo image
    coverImage: '/covers/school1.jpg',   // Cover photo for header
    description: 'Providing quality education since 1995', // Short description
    
    // Contact information object
    contact: {
      phone: '+251911223344',
      email: 'info@abcschool.edu.et',
      address: 'Bole Sub-city, Addis Ababa'
    },  
    // Features - boolean flags to enable/disable functionality
    features: {
      hasBooking: true,      // Allow online appointment booking
      hasContact: true,       // Show contact form
      hasGallery: true,       // Display image gallery
      hasReviews: true        // Show customer reviews
    },
    
    // Modules - which UI components to render on their page
    modules: ['about', 'programs', 'gallery', 'contact', 'booking']
  },

  // ========================================
  // HONEY SHOP - Product Type Example
  // Sells physical products with inventory
  // ========================================
  {
    id: 'honey_1',
    name: 'Pure Honey Ethiopia',
    type: MERCHANT_TYPES.PRODUCT,
    category: 'Food & Beverages',
    logo: '/logos/honey1.png',
    coverImage: '/covers/honey1.jpg',
    description: '100% natural honey from the highlands',
    contact: {
      phone: '+251922334455',
      email: 'order@purehoney.et',
      address: 'Merkato, Addis Ababa'
    },
    
    // Product merchants need e-commerce features
    features: {
      hasProducts: true,      // Show product catalog
      hasInventory: true,     // Track stock levels
      hasDelivery: true,      // Enable delivery options
      hasPayment: true        // Process payments online
    },
    
    modules: ['products', 'cart', 'checkout', 'reviews'],
    
    // Products array - specific to product-type merchants
    products: [
      { 
        id: 'p1', 
        name: 'White Honey - 500g', 
        price: 350, 
        stock: 45,            // Current inventory count
        image: '/products/honey1.jpg',
        description: 'Pure white honey from Tigray highlands'
      },
      { 
        id: 'p2', 
        name: 'Forest Honey - 1kg', 
        price: 600, 
        stock: 30,
        image: '/products/honey2.jpg' 
      },
      { 
        id: 'p3', 
        name: 'Bee Wax - 250g', 
        price: 200, 
        stock: 60,
        image: '/products/wax1.jpg' 
      }
    ]
  },

  // ========================================
  // RESTAURANT - Hybrid Type Example
  // Has menu, table booking, and delivery
  // ========================================
  {
    id: 'restaurant_1',
    name: 'Taste of Ethiopia',
    type: MERCHANT_TYPES.RESTAURANT,
    category: 'Restaurant',
    logo: '/logos/rest1.png',
    coverImage: '/covers/rest1.jpg',
    description: 'Authentic Ethiopian cuisine in the heart of Addis',
    contact: {
      phone: '+251933445566',
      email: 'info@tasteofethiopia.com',
      address: 'Bole Atlas, Addis Ababa'
    },
    
    // Restaurant-specific features
    features: {
      hasMenu: true,          // Display food menu
      hasBooking: true,       // Table reservation system
      hasDelivery: true,      // Food delivery
      hasPayment: true,       // Online payment
      hasTakeaway: true       // Pickup orders
    },
    
    modules: ['menu', 'booking', 'delivery', 'reviews', 'gallery'],
    
    // Menu structure with categories and items
    menu: {
      categories: ['Breakfast', 'Lunch', 'Dinner', 'Drinks'],
      items: [
        { 
          id: 'm1', 
          name: 'Kitfo', 
          price: 450, 
          category: 'Dinner', 
          description: 'Traditional minced meat with spices',
          image: '/menu/kitfo.jpg',
          preparationTime: '20 min',
          isPopular: true
        },
        { 
          id: 'm2', 
          name: 'Doro Wat', 
          price: 380, 
          category: 'Lunch', 
          description: 'Spicy chicken stew with eggs',
          image: '/menu/doro.jpg',
          preparationTime: '25 min'
        }
      ]
    }
  },

  // ========================================
  // CONSULTANCY - Service with Booking
  // Professional services with appointment system
  // ========================================
  {
    id: 'consultancy_1',
    name: 'BizConsult Ethiopia',
    type: MERCHANT_TYPES.SERVICE,
    category: 'Business Services',
    logo: '/logos/consult1.png',
    coverImage: '/covers/consult1.jpg',
    description: 'Professional business consulting services',
    contact: {
      phone: '+251944556677',
      email: 'info@bizconsult.et',
      address: 'Mexico Square, Addis Ababa'
    },
    
    features: {
      hasBooking: true,       // Appointment booking
      hasContact: true,       // Contact form
      hasTeam: true,          // Team member profiles
      hasTestimonials: true   // Client testimonials
    },
    
    modules: ['services', 'team', 'booking', 'contact', 'testimonials'],
    
    // Services offered (for service-type merchants)
    services: [
      { 
        id: 's1', 
        name: 'Business Plan Consultation', 
        duration: '2 hours', 
        price: 2500,
        description: 'One-on-one session to develop your business plan'
      },
      { 
        id: 's2', 
        name: 'Market Research', 
        duration: '1 week', 
        price: 15000,
        description: 'Comprehensive market analysis report'
      }
    ],
    
    // Team members
    team: [
      {
        name: 'Abebe Kebede',
        title: 'Senior Consultant',
        bio: '15 years experience in business strategy',
        image: '/team/abebe.jpg'
      }
    ]
  },

  // ========================================
  // STATIONARY SHOP - Product Type
  // Office and school supplies
  // ========================================
  {
    id: 'stationary_1',
    name: 'Elite Stationary',
    type: MERCHANT_TYPES.PRODUCT,
    category: 'Stationary',
    logo: '/logos/stationary1.png',
    coverImage: '/covers/stationary1.jpg',
    description: 'All your office and school supplies in one place',
    contact: {
      phone: '+251955667788',
      email: 'info@elitestationary.et',
      address: 'Piassa, Addis Ababa'
    },
    
    features: {
      hasProducts: true,
      hasInventory: true,
      hasDelivery: true,
      hasBulkOrder: true      // Special feature for bulk purchases
    },
    
    modules: ['products', 'cart', 'checkout', 'bulk-order'],
    
    products: [
      { 
        id: 'sp1', 
        name: 'Notebook A4', 
        price: 85, 
        stock: 200,
        category: 'Notebooks',
        sku: 'NB-A4-001'
      },
      { 
        id: 'sp2', 
        name: 'Pen Pack (10 pcs)', 
        price: 120, 
        stock: 150,
        category: 'Writing',
        sku: 'PN-10-002'
      },
      { 
        id: 'sp3', 
        name: 'Printer Paper (500 sheets)', 
        price: 450, 
        stock: 80,
        category: 'Paper',
        sku: 'PP-500-003'
      }
    ]
  }
];

// ============================================
// HELPER FUNCTIONS
// These make it easy to access merchant data
// ============================================

/**
 * Get all merchants of a specific type
 * @param {string} type - MERCHANT_TYPES value
 * @returns {Array} Filtered array of merchants
 */
export const getMerchantsByType = (type) => {
  return merchants.filter(m => m.type === type);
};

/**
 * Get a single merchant by ID
 * @param {string} id - Merchant unique identifier
 * @returns {object} Merchant object or undefined
 */
export const getMerchantById = (id) => {
  return merchants.find(m => m.id === id);
};

/**
 * Get all merchant categories
 * @returns {Array} Unique categories
 */
export const getAllCategories = () => {
  const categories = merchants.map(m => m.category);
  return [...new Set(categories)]; // Remove duplicates
};

/**
 * Search merchants by name or description
 * @param {string} searchTerm - Text to search for
 * @returns {Array} Matching merchants
 */
export const searchMerchants = (searchTerm) => {
  const term = searchTerm.toLowerCase();
  return merchants.filter(m => 
    m.name.toLowerCase().includes(term) ||
    m.description.toLowerCase().includes(term) ||
    m.category.toLowerCase().includes(term)
  );
};