// src/models/index.js
import User from './User.js';
import Merchant from './Merchant.js';
import Product from './Product.js';
import Order from './Order.js';

// Define relationships

// User - Merchant (one-to-many)
User.hasMany(Merchant, { foreignKey: 'ownerId' });
Merchant.belongsTo(User, { foreignKey: 'ownerId' });

// Merchant - Product (one-to-many)
Merchant.hasMany(Product, { foreignKey: 'merchantId' });
Product.belongsTo(Merchant, { foreignKey: 'merchantId' });

// User (customer) - Order (one-to-many)
User.hasMany(Order, { as: 'customerOrders', foreignKey: 'customerId' });
Order.belongsTo(User, { as: 'customer', foreignKey: 'customerId' });

// Merchant - Order (one-to-many)
Merchant.hasMany(Order, { foreignKey: 'merchantId' });
Order.belongsTo(Merchant, { foreignKey: 'merchantId' });

// User (rider) - Order (one-to-many)
User.hasMany(Order, { as: 'riderOrders', foreignKey: 'riderId' });
Order.belongsTo(User, { as: 'rider', foreignKey: 'riderId' });

export {
  User,
  Merchant,
  Product,
  Order
};