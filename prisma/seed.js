// prisma/seed.js - Complete fixed version
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data (in correct order)
  await prisma.$transaction([
    prisma.inventoryMovement.deleteMany(),
    prisma.inventoryItem.deleteMany(),
    prisma.orderStatusHistory.deleteMany(),
    prisma.orderItem.deleteMany(),
    prisma.order.deleteMany(),
    prisma.payment.deleteMany(),
    prisma.walletTransaction.deleteMany(),
    prisma.wallet.deleteMany(),
    prisma.reviewResponse.deleteMany(),
    prisma.review.deleteMany(),
    prisma.promotion.deleteMany(),
    prisma.product.deleteMany(),
    prisma.productCategory.deleteMany(),
    prisma.merchant.deleteMany(),
    prisma.riderProfile.deleteMany(),
    prisma.address.deleteMany(),
    prisma.notification.deleteMany(),
    prisma.notificationToken.deleteMany(),
    prisma.activityLog.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  console.log('✅ Cleared existing data');

  // ============================================
  // CREATE USERS
  // ============================================

  // Create Admin User
  const admin = await prisma.user.create({
    data: {
      email: 'admin@qine.com',
      phone: '+251911111111',
      password: await bcrypt.hash('Admin@123', 10),
      firstName: 'Super',
      lastName: 'Admin',
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      emailVerified: true,
      phoneVerified: true,
      verifiedAt: new Date(),
    }
  });
  console.log('✅ Created admin user');

  // Create Merchant Users
  const honeyOwner = await prisma.user.create({
    data: {
      email: 'owner@purehoney.et',
      phone: '+251922334455',
      password: await bcrypt.hash('Merchant@123', 10),
      firstName: 'Tigist',
      lastName: 'Tesfaye',
      role: 'MERCHANT',
      status: 'ACTIVE',
      emailVerified: true,
      phoneVerified: true,
      verifiedAt: new Date(),
    }
  });

  const restaurantOwner = await prisma.user.create({
    data: {
      email: 'owner@tasteofethiopia.com',
      phone: '+251933445566',
      password: await bcrypt.hash('Merchant@123', 10),
      firstName: 'Girma',
      lastName: 'Wondimu',
      role: 'MERCHANT',
      status: 'ACTIVE',
      emailVerified: true,
      phoneVerified: true,
      verifiedAt: new Date(),
    }
  });

  const schoolOwner = await prisma.user.create({
    data: {
      email: 'director@abcschool.edu.et',
      phone: '+251944556677',
      password: await bcrypt.hash('Merchant@123', 10),
      firstName: 'Meron',
      lastName: 'Assefa',
      role: 'MERCHANT',
      status: 'ACTIVE',
      emailVerified: true,
      phoneVerified: true,
      verifiedAt: new Date(),
    }
  });

  console.log('✅ Created merchant users');

  // Create Customer Users
  const customer1 = await prisma.user.create({
    data: {
      email: 'abebe.kebede@gmail.com',
      phone: '+251911223344',
      password: await bcrypt.hash('Customer@123', 10),
      firstName: 'Abebe',
      lastName: 'Kebede',
      role: 'CUSTOMER',
      status: 'ACTIVE',
      emailVerified: true,
      phoneVerified: true,
      verifiedAt: new Date(),
    }
  });

  const customer2 = await prisma.user.create({
    data: {
      email: 'sara.hailu@gmail.com',
      phone: '+251922334456',
      password: await bcrypt.hash('Customer@123', 10),
      firstName: 'Sara',
      lastName: 'Hailu',
      role: 'CUSTOMER',
      status: 'ACTIVE',
      emailVerified: true,
      phoneVerified: true,
      verifiedAt: new Date(),
    }
  });

  console.log('✅ Created customers');

  // Create Rider User
  const rider = await prisma.user.create({
    data: {
      email: 'getachew.tesfaye@gmail.com',
      phone: '+251955667788',
      password: await bcrypt.hash('Rider@123', 10),
      firstName: 'Getachew',
      lastName: 'Tesfaye',
      role: 'RIDER',
      status: 'ACTIVE',
      emailVerified: true,
      phoneVerified: true,
      verifiedAt: new Date(),
    }
  });

  console.log('✅ Created rider');

  // ============================================
  // CREATE MERCHANTS
  // ============================================

  const honeyShop = await prisma.merchant.create({
    data: {
      ownerId: honeyOwner.id,
      businessName: 'Pure Honey Ethiopia',
      businessType: 'PRODUCT',
      category: 'Food & Beverages',
      subCategory: 'Honey Products',
      description: '100% natural honey from the highlands of Ethiopia',
      businessPhone: '+251922334455',
      businessEmail: 'info@purehoney.et',
      address: 'Merkato, Addis Ababa',
      city: 'Addis Ababa',
      subCity: 'Addis Ketema',
      latitude: 9.0389,
      longitude: 38.7545,
      serviceRadius: 15,
      licenseNumber: 'LIC-HNY-2024-001',
      tinNumber: 'TIN-HNY-001',
      yearEstablished: 2018,
      status: 'ACTIVE',
      approvedAt: new Date(),
      rating: 4.8,
      totalReviews: 156,
      configuration: JSON.stringify({
        hasProducts: true,
        hasInventory: true,
        hasDelivery: true,
        hasPickup: true,
        hasDiscounts: true
      }),
      modules: JSON.stringify(['products', 'inventory', 'orders', 'reports', 'promotions']),
      deliveryConfig: JSON.stringify({
        freeDeliveryThreshold: 500,
        baseFee: 30,
        perKmFee: 5,
        maxDistance: 15,
        estimatedMinutes: 45
      })
    }
  });

  const restaurant = await prisma.merchant.create({
    data: {
      ownerId: restaurantOwner.id,
      businessName: 'Taste of Ethiopia',
      businessType: 'RESTAURANT',
      category: 'Restaurant',
      subCategory: 'Ethiopian Cuisine',
      description: 'Authentic Ethiopian cuisine in the heart of Addis',
      businessPhone: '+251933445566',
      businessEmail: 'info@tasteofethiopia.com',
      address: 'Bole Atlas, Addis Ababa',
      city: 'Addis Ababa',
      subCity: 'Bole',
      latitude: 9.0089,
      longitude: 38.7945,
      serviceRadius: 10,
      licenseNumber: 'LIC-REST-2024-002',
      tinNumber: 'TIN-REST-002',
      yearEstablished: 2015,
      status: 'ACTIVE',
      approvedAt: new Date(),
      rating: 4.9,
      totalReviews: 234,
      configuration: JSON.stringify({
        hasMenu: true,
        hasBooking: true,
        hasDelivery: true,
        hasTakeaway: true,
        hasDineIn: true
      }),
      modules: JSON.stringify(['menu', 'bookings', 'orders', 'reports', 'staff']),
      deliveryConfig: JSON.stringify({
        freeDeliveryThreshold: 300,
        baseFee: 40,
        perKmFee: 8,
        maxDistance: 8,
        estimatedMinutes: 30
      })
    }
  });

  const school = await prisma.merchant.create({
    data: {
      ownerId: schoolOwner.id,
      businessName: 'ABC International School',
      businessType: 'SERVICE',
      category: 'Education',
      subCategory: 'K-12 School',
      description: 'Providing quality education since 1995',
      businessPhone: '+251944556677',
      businessEmail: 'info@abcschool.edu.et',
      address: 'Bole Sub-city, Addis Ababa',
      city: 'Addis Ababa',
      subCity: 'Bole',
      latitude: 9.0289,
      longitude: 38.7845,
      licenseNumber: 'LIC-SCH-2024-003',
      tinNumber: 'TIN-SCH-003',
      yearEstablished: 1995,
      status: 'ACTIVE',
      approvedAt: new Date(),
      rating: 4.5,
      totalReviews: 89,
      configuration: JSON.stringify({
        hasBooking: true,
        hasGallery: true,
        hasReviews: true,
        hasEvents: true,
        hasNewsletter: true
      }),
      modules: JSON.stringify(['services', 'gallery', 'events', 'contact', 'booking']),
    }
  });

  console.log('✅ Created merchants');

  // ============================================
  // CREATE PRODUCT CATEGORIES
  // ============================================

  const honeyCategory = await prisma.productCategory.create({
    data: {
      merchantId: honeyShop.id,
      name: 'Honey',
      description: 'Pure natural honey varieties',
      sortOrder: 1,
      isActive: true
    }
  });

  const waxCategory = await prisma.productCategory.create({
    data: {
      merchantId: honeyShop.id,
      name: 'Bee Products',
      description: 'Beeswax and other bee products',
      sortOrder: 2,
      isActive: true
    }
  });

  console.log('✅ Created product categories');

  // ============================================
  // CREATE PRODUCTS
  // ============================================

  await prisma.product.create({
    data: {
      merchantId: honeyShop.id,
      categoryId: honeyCategory.id,
      name: 'White Honey - 500g',
      description: 'Pure white honey from Tigray highlands. Known for its unique flavor and medicinal properties.',
      shortDesc: 'Premium white honey',
      price: 350,
      cost: 250,
      sku: 'HNY-WHT-500',
      stock: 45,
      lowStock: 10,
      images: JSON.stringify(['/products/honey-white-1.jpg', '/products/honey-white-2.jpg']),
      isActive: true,
      isFeatured: true,
      metaTitle: 'White Honey 500g - Pure Honey Ethiopia',
      metaDesc: 'Buy premium white honey from Tigray highlands. 100% natural.',
      slug: 'white-honey-500g',
      weight: 0.5,
      dimensions: JSON.stringify({ length: 8, width: 8, height: 12 })
    }
  });

  await prisma.product.create({
    data: {
      merchantId: honeyShop.id,
      categoryId: honeyCategory.id,
      name: 'Forest Honey - 1kg',
      description: 'Rich forest honey from Oromia. Harvested from wild bees in natural forests.',
      shortDesc: 'Wild forest honey',
      price: 600,
      cost: 400,
      sku: 'HNY-FRS-1KG',
      stock: 30,
      lowStock: 10,
      images: JSON.stringify(['/products/honey-forest-1.jpg']),
      isActive: true,
      isFeatured: true,
      metaTitle: 'Forest Honey 1kg - Pure Honey Ethiopia',
      metaDesc: 'Rich forest honey from Oromia. 100% natural and unprocessed.',
      slug: 'forest-honey-1kg',
      weight: 1.0,
      dimensions: JSON.stringify({ length: 10, width: 10, height: 15 })
    }
  });

  await prisma.product.create({
    data: {
      merchantId: honeyShop.id,
      categoryId: waxCategory.id,
      name: 'Bee Wax - 250g',
      description: 'Natural beeswax for various uses. Perfect for skincare, candles, and crafts.',
      shortDesc: 'Pure beeswax',
      price: 200,
      cost: 120,
      sku: 'WAX-250',
      stock: 60,
      lowStock: 15,
      images: JSON.stringify(['/products/wax-1.jpg']),
      isActive: true,
      slug: 'bee-wax-250g',
      weight: 0.25
    }
  });

  console.log('✅ Created products');

  // ============================================
  // CREATE ADDRESSES
  // ============================================

  await prisma.address.create({
    data: {
      userId: customer1.id,
      addressType: 'HOME',
      isDefault: true,
      recipientName: 'Abebe Kebede',
      recipientPhone: '+251911223344',
      addressLine1: 'Bole Medhanialem',
      city: 'Addis Ababa',
      subCity: 'Bole',
      woreda: '03',
      houseNumber: '123',
      latitude: 9.0089,
      longitude: 38.7945,
      instructions: 'Near the church, gate number 5'
    }
  });

  await prisma.address.create({
    data: {
      userId: customer2.id,
      addressType: 'WORK',
      isDefault: true,
      recipientName: 'Sara Hailu',
      recipientPhone: '+251922334456',
      addressLine1: 'Mexico Square',
      city: 'Addis Ababa',
      subCity: 'Kirkos',
      latitude: 9.0189,
      longitude: 38.7745
    }
  });

  console.log('✅ Created addresses');

  // ============================================
  // CREATE RIDER PROFILE
  // ============================================

  await prisma.riderProfile.create({
    data: {
      userId: rider.id,
      fullName: 'Getachew Tesfaye',
      phone: '+251955667788',
      vehicleType: 'MOTORCYCLE',
      vehicleModel: 'Honda CB150',
      vehiclePlate: 'AA 12345',
      licenseNumber: 'LIC-RID-2024-001',
      verified: true,
      verifiedAt: new Date(),
      status: 'ONLINE',
      currentLat: 9.0289,
      currentLng: 38.7745,
      totalDeliveries: 156,
      rating: 4.9,
      completedRate: 98.5,
      onTimeRate: 95.2
    }
  });

  console.log('✅ Created rider profile');

  // ============================================
  // CREATE ORDER
  // ============================================

  const order1 = await prisma.order.create({
    data: {
      orderNumber: 'ORD-2024-0001',
      customerId: customer1.id,
      merchantId: honeyShop.id,
      status: 'DELIVERED',
      items: JSON.stringify([
        { name: 'White Honey - 500g', quantity: 2, price: 350 },
        { name: 'Bee Wax - 250g', quantity: 1, price: 200 }
      ]),
      subtotal: 900,
      deliveryFee: 50,
      total: 950,
      paymentMethod: 'CARD',
      paymentStatus: 'PAID',
      deliveryAddress: JSON.stringify({
        recipientName: 'Abebe Kebede',
        phone: '+251911223344',
        address: 'Bole Medhanialem, Addis Ababa'
      }),
      estimatedDelivery: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      deliveredAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      customerRating: 5,
      customerReview: 'Excellent product! Fast delivery.',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    }
  });

  // Create Order Items
  await prisma.orderItem.createMany({
    data: [
      {
        orderId: order1.id,
        name: 'White Honey - 500g',
        price: 350,
        quantity: 2,
        subtotal: 700,
        total: 700
      },
      {
        orderId: order1.id,
        name: 'Bee Wax - 250g',
        price: 200,
        quantity: 1,
        subtotal: 200,
        total: 200
      }
    ]
  });

  // Create Order Status History
  await prisma.orderStatusHistory.createMany({
    data: [
      {
        orderId: order1.id,
        status: 'PENDING',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      },
      {
        orderId: order1.id,
        status: 'CONFIRMED',
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
      },
      {
        orderId: order1.id,
        status: 'PREPARING',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      },
      {
        orderId: order1.id,
        status: 'DELIVERED',
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
      }
    ]
  });

  console.log('✅ Created sample order');

  // ============================================
  // CREATE WALLETS
  // ============================================

  await prisma.wallet.create({
    data: {
      userId: customer1.id,
      balance: 5000,
      currency: 'ETB'
    }
  });

  await prisma.wallet.create({
    data: {
      userId: customer2.id,
      balance: 3500,
      currency: 'ETB'
    }
  });

  await prisma.wallet.create({
    data: {
      userId: honeyOwner.id,
      balance: 15000,
      currency: 'ETB'
    }
  });

  await prisma.wallet.create({
    data: {
      userId: restaurantOwner.id,
      balance: 25000,
      currency: 'ETB'
    }
  });

  await prisma.wallet.create({
    data: {
      userId: schoolOwner.id,
      balance: 8000,
      currency: 'ETB'
    }
  });

  await prisma.wallet.create({
    data: {
      userId: rider.id,
      balance: 3200,
      currency: 'ETB'
    }
  });

  console.log('✅ Created wallets');

  // ============================================
  // CREATE NOTIFICATIONS
  // ============================================

  await prisma.notification.create({
    data: {
      userId: customer1.id,
      type: 'ORDER',
      priority: 'MEDIUM',
      title: 'Order Delivered',
      body: 'Your order #ORD-2024-0001 has been delivered',
      data: JSON.stringify({ orderId: order1.id }),
      isRead: true,
      readAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    }
  });

  await prisma.notification.create({
    data: {
      userId: honeyOwner.id,
      type: 'ORDER',
      priority: 'HIGH',
      title: 'New Order Received',
      body: 'You have a new order #ORD-2024-0002',
      data: JSON.stringify({ orderId: 'ORD-2024-0002' }),
      isRead: false,
      actionUrl: '/merchant/orders'
    }
  });

  await prisma.notification.create({
    data: {
      userId: rider.id,
      type: 'DELIVERY',
      priority: 'HIGH',
      title: 'New Delivery Assignment',
      body: 'You have been assigned to deliver order #ORD-2024-0001',
      data: JSON.stringify({ orderId: order1.id }),
      isRead: false
    }
  });

  console.log('✅ Created notifications');

  // ============================================
  // CREATE SYSTEM SETTINGS (FIXED: Using upsert to avoid duplicates)
  // ============================================

  const systemSettings = [
    {
      key: 'platform_name',
      value: '"QINE Super App"',
      type: 'STRING',
      description: 'Platform name displayed across the app',
      category: 'GENERAL',
      isPublic: true
    },
    {
      key: 'default_commission',
      value: '10',
      type: 'NUMBER',
      description: 'Default commission rate for merchants',
      category: 'COMMISSION',
      isEditable: true
    },
    {
      key: 'delivery_base_fee',
      value: '30',
      type: 'NUMBER',
      description: 'Base delivery fee',
      category: 'DELIVERY',
      isEditable: true
    },
    {
      key: 'free_delivery_threshold',
      value: '500',
      type: 'NUMBER',
      description: 'Minimum order for free delivery',
      category: 'DELIVERY',
      isEditable: true
    },
    {
      key: 'maintenance_mode',
      value: 'false',
      type: 'BOOLEAN',
      description: 'Enable maintenance mode',
      category: 'SYSTEM',
      isPublic: true
    },
    {
      key: 'max_riders_per_order',
      value: '1',
      type: 'NUMBER',
      description: 'Maximum number of riders per order',
      category: 'DELIVERY'
    },
    {
      key: 'order_timeout_minutes',
      value: '30',
      type: 'NUMBER',
      description: 'Order cancellation timeout',
      category: 'ORDERS'
    }
  ];

  // Upsert each setting to avoid duplicate key errors
  for (const setting of systemSettings) {
    await prisma.systemSetting.upsert({
      where: { key: setting.key },
      update: setting,
      create: setting
    });
  }
  console.log('✅ Created/Updated system settings');

  // ============================================
  // FINAL COUNTS
  // ============================================

  const userCount = await prisma.user.count();
  const merchantCount = await prisma.merchant.count();
  const productCount = await prisma.product.count();
  const orderCount = await prisma.order.count();
  const walletCount = await prisma.wallet.count();
  const notificationCount = await prisma.notification.count();

  console.log(`
  🌱 Seeding completed successfully!
  
  📊 Summary:
  - Users: ${userCount}
  - Merchants: ${merchantCount}
  - Products: ${productCount}
  - Orders: ${orderCount}
  - Wallets: ${walletCount}
  - Notifications: ${notificationCount}
  `);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });