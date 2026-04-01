// server.js
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { Server } from 'socket.io';
import http from 'http';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Create HTTP server
const server = http.createServer(app);

// Initialize WebSocket server
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// ============================================
// WEB SOCKET CONNECTION HANDLING
// ============================================
io.on('connection', (socket) => {
  console.log('🔌 New client connected:', socket.id);

  socket.on('joinMerchantRoom', (merchantId) => {
    socket.join(`merchant_${merchantId}`);
    console.log(`👥 Merchant ${merchantId} joined their room`);
  });

  socket.on('joinAdminRoom', () => {
    socket.join('admin');
    console.log('👤 Admin joined admin room');
  });

  socket.on('joinRiderRoom', (riderId) => {
    socket.join(`rider_${riderId}`);
    console.log(`🛵 Rider ${riderId} joined their room`);
  });

  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.id);
  });
});

// ============================================
// AUTHENTICATION API
// ============================================

// Register new user
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, phone, password, firstName, lastName, role } = req.body;
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await prisma.user.create({
      data: {
        email,
        phone,
        password: hashedPassword,
        firstName,
        lastName,
        role: role || 'CUSTOMER',
      }
    });
    
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// USER API
// ============================================

// Get all users
app.get('/api/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        addresses: true,
        merchant: true,
        riderProfile: true
      }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user by ID
app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: {
        addresses: true,
        merchant: true,
        riderProfile: true,
        wallet: true
      }
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user
app.put('/api/users/:id', async (req, res) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete user
app.delete('/api/users/:id', async (req, res) => {
  try {
    await prisma.user.delete({
      where: { id: req.params.id }
    });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// ADDRESS API
// ============================================

// Get user addresses
app.get('/api/users/:userId/addresses', async (req, res) => {
  try {
    const addresses = await prisma.address.findMany({
      where: { userId: req.params.userId }
    });
    res.json(addresses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create address
app.post('/api/addresses', async (req, res) => {
  try {
    const address = await prisma.address.create({
      data: req.body
    });
    res.json(address);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update address
app.put('/api/addresses/:id', async (req, res) => {
  try {
    const address = await prisma.address.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(address);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete address
app.delete('/api/addresses/:id', async (req, res) => {
  try {
    await prisma.address.delete({
      where: { id: req.params.id }
    });
    res.json({ message: 'Address deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// MERCHANT API
// ============================================

// Get all merchants
app.get('/api/merchants', async (req, res) => {
  try {
    const merchants = await prisma.merchant.findMany({
      include: {
        products: true,
        categories: true,
        reviews: true
      }
    });
    res.json(merchants);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get merchant by ID
app.get('/api/merchants/:id', async (req, res) => {
  try {
    const merchant = await prisma.merchant.findUnique({
      where: { id: req.params.id },
      include: {
        products: {
          include: {
            category: true,
            reviews: true
          }
        },
        categories: true,
        reviews: {
          include: {
            user: true
          }
        },
        orders: {
          take: 10,
          orderBy: { createdAt: 'desc' }
        }
      }
    });
    
    if (!merchant) {
      return res.status(404).json({ error: 'Merchant not found' });
    }
    
    res.json(merchant);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create merchant
app.post('/api/merchants', async (req, res) => {
  try {
    const merchant = await prisma.merchant.create({
      data: {
        ...req.body,
        configuration: req.body.configuration ? JSON.stringify(req.body.configuration) : null,
        modules: req.body.modules ? JSON.stringify(req.body.modules) : null,
        deliveryConfig: req.body.deliveryConfig ? JSON.stringify(req.body.deliveryConfig) : null,
        businessHours: req.body.businessHours ? JSON.stringify(req.body.businessHours) : null,
        gallery: req.body.gallery ? JSON.stringify(req.body.gallery) : null,
        socialMedia: req.body.socialMedia ? JSON.stringify(req.body.socialMedia) : null,
        bankAccount: req.body.bankAccount ? JSON.stringify(req.body.bankAccount) : null
      }
    });

    // Notify admin
    io.to('admin').emit('notification', {
      type: 'merchant',
      title: 'New Merchant Registration',
      message: `${merchant.businessName} has registered`,
      data: merchant
    });

    res.json(merchant);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update merchant
app.put('/api/merchants/:id', async (req, res) => {
  try {
    const merchant = await prisma.merchant.update({
      where: { id: req.params.id },
      data: {
        ...req.body,
        configuration: req.body.configuration ? JSON.stringify(req.body.configuration) : undefined,
        modules: req.body.modules ? JSON.stringify(req.body.modules) : undefined,
        deliveryConfig: req.body.deliveryConfig ? JSON.stringify(req.body.deliveryConfig) : undefined
      }
    });
    res.json(merchant);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Approve merchant
app.post('/api/merchants/:id/approve', async (req, res) => {
  try {
    const merchant = await prisma.merchant.update({
      where: { id: req.params.id },
      data: {
        status: 'ACTIVE',
        approvedAt: new Date(),
        approvedBy: req.body.adminId
      }
    });

    // Notify merchant
    io.to(`merchant_${merchant.id}`).emit('notification', {
      type: 'approval',
      title: '✅ Application Approved',
      message: 'Your merchant account has been approved! You can now start selling.'
    });

    res.json(merchant);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reject merchant
app.post('/api/merchants/:id/reject', async (req, res) => {
  try {
    const merchant = await prisma.merchant.update({
      where: { id: req.params.id },
      data: {
        status: 'REJECTED',
        rejectionReason: req.body.reason
      }
    });

    // Notify merchant
    io.to(`merchant_${merchant.id}`).emit('notification', {
      type: 'approval',
      title: '❌ Application Rejected',
      message: `Your application was rejected: ${req.body.reason}`
    });

    res.json(merchant);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// PRODUCT API
// ============================================

// Get merchant products
app.get('/api/merchants/:merchantId/products', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { merchantId: req.params.merchantId },
      include: {
        category: true,
        reviews: true
      }
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create product
app.post('/api/products', async (req, res) => {
  try {
    const product = await prisma.product.create({
      data: {
        ...req.body,
        images: req.body.images ? JSON.stringify(req.body.images) : null,
        variants: req.body.variants ? JSON.stringify(req.body.variants) : null,
        dimensions: req.body.dimensions ? JSON.stringify(req.body.dimensions) : null
      }
    });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update product
app.put('/api/products/:id', async (req, res) => {
  try {
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        ...req.body,
        images: req.body.images ? JSON.stringify(req.body.images) : undefined,
        variants: req.body.variants ? JSON.stringify(req.body.variants) : undefined
      }
    });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete product
app.delete('/api/products/:id', async (req, res) => {
  try {
    await prisma.product.delete({
      where: { id: req.params.id }
    });
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update product stock
app.patch('/api/products/:id/stock', async (req, res) => {
  try {
    const { stock } = req.body;
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: { stock }
    });

    // Check low stock
    if (stock <= product.lowStock) {
      io.to(`merchant_${product.merchantId}`).emit('notification', {
        type: 'inventory',
        title: '⚠️ Low Stock Alert',
        message: `${product.name} is running low (${stock} left)`
      });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// PRODUCT CATEGORY API
// ============================================

// Get categories
app.get('/api/merchants/:merchantId/categories', async (req, res) => {
  try {
    const categories = await prisma.productCategory.findMany({
      where: { merchantId: req.params.merchantId },
      include: {
        products: true
      }
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create category
app.post('/api/categories', async (req, res) => {
  try {
    const category = await prisma.productCategory.create({
      data: req.body
    });
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update category
app.put('/api/categories/:id', async (req, res) => {
  try {
    const category = await prisma.productCategory.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete category
app.delete('/api/categories/:id', async (req, res) => {
  try {
    await prisma.productCategory.delete({
      where: { id: req.params.id }
    });
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// ORDER API
// ============================================

// Create order
app.post('/api/orders', async (req, res) => {
  try {
    const orderData = req.body;
    const orderNumber = `ORD-${Date.now()}`;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerId: orderData.customerId,
        merchantId: orderData.merchantId,
        status: 'PENDING',
        items: JSON.stringify(orderData.items),
        subtotal: orderData.subtotal,
        deliveryFee: orderData.deliveryFee || 0,
        total: orderData.total,
        paymentMethod: orderData.paymentMethod,
        deliveryAddress: JSON.stringify(orderData.deliveryAddress),
        deliveryLat: orderData.deliveryLat,
        deliveryLng: orderData.deliveryLng,
        customerNotes: orderData.notes
      }
    });

    // Create order items
    for (const item of orderData.items) {
      await prisma.orderItem.create({
        data: {
          orderId: order.id,
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          subtotal: item.price * item.quantity,
          total: item.price * item.quantity
        }
      });

      // Update product stock
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } }
      });
    }

    // Create status history
    await prisma.orderStatusHistory.create({
      data: {
        orderId: order.id,
        status: 'PENDING'
      }
    });

    // Notify merchant
    io.to(`merchant_${order.merchantId}`).emit('newOrder', {
      orderNumber,
      customerName: orderData.customerName,
      total: order.total
    });

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get merchant orders
app.get('/api/merchants/:merchantId/orders', async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { merchantId: req.params.merchantId },
      include: {
        customer: true,
        rider: true,
        orderItems: {
          include: {
            product: true
          }
        },
        statusHistory: {
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get customer orders
app.get('/api/customers/:customerId/orders', async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { customerId: req.params.customerId },
      include: {
        merchant: true,
        orderItems: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get order by ID
app.get('/api/orders/:id', async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        customer: true,
        merchant: true,
        rider: true,
        orderItems: {
          include: {
            product: true
          }
        },
        statusHistory: true,
        payments: true
      }
    });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update order status
app.patch('/api/orders/:id/status', async (req, res) => {
  try {
    const { status, notes, changedBy } = req.body;
    
    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { status }
    });

    // Create status history
    await prisma.orderStatusHistory.create({
      data: {
        orderId: order.id,
        status,
        notes,
        changedBy
      }
    });

    // Update timeline fields based on status
    const updates = {};
    if (status === 'CONFIRMED') updates.confirmedAt = new Date();
    if (status === 'PREPARING') updates.preparedAt = new Date();
    if (status === 'READY') updates.readyAt = new Date();
    if (status === 'ASSIGNED') updates.assignedAt = new Date();
    if (status === 'PICKED_UP') updates.pickedUpAt = new Date();
    if (status === 'DELIVERED') updates.deliveredAt = new Date();
    if (status === 'CANCELLED') updates.cancelledAt = new Date();

    if (Object.keys(updates).length > 0) {
      await prisma.order.update({
        where: { id: order.id },
        data: updates
      });
    }

    // Notify customer
    io.to(`customer_${order.customerId}`).emit('orderUpdate', {
      orderNumber: order.orderNumber,
      status,
      message: `Your order is now ${status}`
    });

    // Notify merchant
    io.to(`merchant_${order.merchantId}`).emit('orderUpdate', {
      orderNumber: order.orderNumber,
      status
    });

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Assign rider to order
app.patch('/api/orders/:id/assign-rider', async (req, res) => {
  try {
    const { riderId } = req.body;
    
    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { 
        riderId,
        status: 'ASSIGNED',
        assignedAt: new Date()
      }
    });

    // Notify rider
    io.to(`rider_${riderId}`).emit('newDelivery', {
      orderNumber: order.orderNumber,
      pickup: req.body.pickupAddress,
      delivery: order.deliveryAddress
    });

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// RIDER API
// ============================================

// Get all riders
app.get('/api/riders', async (req, res) => {
  try {
    const riders = await prisma.riderProfile.findMany({
      include: {
        user: true,
        deliveries: {
          where: { status: 'IN_TRANSIT' }
        }
      }
    });
    res.json(riders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create rider profile
app.post('/api/riders', async (req, res) => {
  try {
    const rider = await prisma.riderProfile.create({
      data: {
        ...req.body,
        availability: req.body.availability ? JSON.stringify(req.body.availability) : null
      }
    });
    res.json(rider);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update rider location
app.patch('/api/riders/:id/location', async (req, res) => {
  try {
    const { lat, lng } = req.body;
    const rider = await prisma.riderProfile.update({
      where: { id: req.params.id },
      data: {
        currentLat: lat,
        currentLng: lng,
        lastLocationUpdate: new Date()
      }
    });
    res.json(rider);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update rider status
app.patch('/api/riders/:id/status', async (req, res) => {
  try {
    const rider = await prisma.riderProfile.update({
      where: { id: req.params.id },
      data: { status: req.body.status }
    });
    res.json(rider);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// REVIEW API
// ============================================

// Create review
app.post('/api/reviews', async (req, res) => {
  try {
    const review = await prisma.review.create({
      data: {
        ...req.body,
        images: req.body.images ? JSON.stringify(req.body.images) : null
      }
    });

    // Update merchant rating
    if (review.merchantId) {
      const reviews = await prisma.review.aggregate({
        where: { merchantId: review.merchantId },
        _avg: { rating: true },
        _count: { rating: true }
      });
      
      await prisma.merchant.update({
        where: { id: review.merchantId },
        data: {
          rating: reviews._avg.rating || 0,
          totalReviews: reviews._count.rating
        }
      });
    }

    res.json(review);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get product reviews
app.get('/api/products/:productId/reviews', async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { productId: req.params.productId },
      include: {
        user: true,
        response: {
          include: { user: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// NOTIFICATION API
// ============================================

// Get user notifications
app.get('/api/users/:userId/notifications', async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.params.userId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark notification as read
app.patch('/api/notifications/:id/read', async (req, res) => {
  try {
    const notification = await prisma.notification.update({
      where: { id: req.params.id },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });
    res.json(notification);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark all notifications as read
app.patch('/api/users/:userId/notifications/read-all', async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { 
        userId: req.params.userId,
        isRead: false
      },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// WALLET API
// ============================================

// Get user wallet
app.get('/api/users/:userId/wallet', async (req, res) => {
  try {
    let wallet = await prisma.wallet.findUnique({
      where: { userId: req.params.userId },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 20
        }
      }
    });

    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: { userId: req.params.userId }
      });
    }

    res.json(wallet);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add funds to wallet
app.post('/api/wallets/:walletId/deposit', async (req, res) => {
  try {
    const { amount, description, reference } = req.body;
    
    const wallet = await prisma.wallet.findUnique({
      where: { id: req.params.walletId }
    });

    const transaction = await prisma.walletTransaction.create({
      data: {
        walletId: wallet.id,
        type: 'DEPOSIT',
        amount,
        balance: wallet.balance + amount,
        description,
        reference,
        metadata: req.body.metadata ? JSON.stringify(req.body.metadata) : null
      }
    });

    await prisma.wallet.update({
      where: { id: wallet.id },
      data: { balance: wallet.balance + amount }
    });

    res.json(transaction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// DASHBOARD STATS API
// ============================================

// Get admin dashboard stats
app.get('/api/admin/stats', async (req, res) => {
  try {
    const [
      totalUsers,
      totalMerchants,
      totalOrders,
      totalRevenue,
      pendingMerchants,
      pendingOrders,
      recentOrders
    ] = await Promise.all([
      prisma.user.count(),
      prisma.merchant.count(),
      prisma.order.count(),
      prisma.order.aggregate({ _sum: { total: true } }),
      prisma.merchant.count({ where: { status: 'PENDING' } }),
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: true,
          merchant: true
        }
      })
    ]);

    res.json({
      totalUsers,
      totalMerchants,
      totalOrders,
      totalRevenue: totalRevenue._sum.total || 0,
      pendingMerchants,
      pendingOrders,
      recentOrders
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get merchant dashboard stats
app.get('/api/merchants/:merchantId/stats', async (req, res) => {
  try {
    const merchantId = req.params.merchantId;
    
    const [
      totalOrders,
      totalRevenue,
      pendingOrders,
      lowStockProducts,
      recentOrders
    ] = await Promise.all([
      prisma.order.count({ where: { merchantId } }),
      prisma.order.aggregate({ 
        where: { merchantId },
        _sum: { total: true }
      }),
      prisma.order.count({ 
        where: { 
          merchantId,
          status: 'PENDING'
        }
      }),
      prisma.product.count({
        where: {
          merchantId,
          stock: { lte: prisma.product.fields.lowStock }
        }
      }),
      prisma.order.findMany({
        where: { merchantId },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: true
        }
      })
    ]);

    res.json({
      totalOrders,
      totalRevenue: totalRevenue._sum.total || 0,
      pendingOrders,
      lowStockProducts,
      recentOrders
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// SYSTEM SETTINGS API
// ============================================

// Get all settings
app.get('/api/settings', async (req, res) => {
  try {
    const settings = await prisma.systemSetting.findMany();
    const settingsMap = {};
    settings.forEach(s => {
      try {
        settingsMap[s.key] = JSON.parse(s.value);
      } catch {
        settingsMap[s.key] = s.value;
      }
    });
    res.json(settingsMap);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update setting
app.put('/api/settings/:key', async (req, res) => {
  try {
    const setting = await prisma.systemSetting.update({
      where: { key: req.params.key },
      data: {
        value: JSON.stringify(req.body.value)
      }
    });
    res.json(setting);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// SEED DATABASE
// ============================================
app.post('/api/seed', async (req, res) => {
  try {
    // This would contain your seed logic
    res.json({ message: 'Database seeded successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// HEALTH CHECK
// ============================================
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date(),
    uptime: process.uptime()
  });
});

// ============================================
// ROOT ENDPOINT
// ============================================
app.get('/', (req, res) => {
  res.json({
    name: 'QINE Super App API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login'
      },
      users: {
        getAll: 'GET /api/users',
        getOne: 'GET /api/users/:id',
        update: 'PUT /api/users/:id',
        delete: 'DELETE /api/users/:id'
      },
      merchants: {
        getAll: 'GET /api/merchants',
        getOne: 'GET /api/merchants/:id',
        create: 'POST /api/merchants',
        update: 'PUT /api/merchants/:id',
        approve: 'POST /api/merchants/:id/approve',
        reject: 'POST /api/merchants/:id/reject'
      },
      products: {
        getByMerchant: 'GET /api/merchants/:merchantId/products',
        create: 'POST /api/products',
        update: 'PUT /api/products/:id',
        delete: 'DELETE /api/products/:id',
        updateStock: 'PATCH /api/products/:id/stock'
      },
      orders: {
        create: 'POST /api/orders',
        getByMerchant: 'GET /api/merchants/:merchantId/orders',
        getByCustomer: 'GET /api/customers/:customerId/orders',
        getOne: 'GET /api/orders/:id',
        updateStatus: 'PATCH /api/orders/:id/status',
        assignRider: 'PATCH /api/orders/:id/assign-rider'
      },
      riders: {
        getAll: 'GET /api/riders',
        create: 'POST /api/riders',
        updateLocation: 'PATCH /api/riders/:id/location',
        updateStatus: 'PATCH /api/riders/:id/status'
      },
      reviews: {
        create: 'POST /api/reviews',
        getByProduct: 'GET /api/products/:productId/reviews'
      },
      wallet: {
        get: 'GET /api/users/:userId/wallet',
        deposit: 'POST /api/wallets/:walletId/deposit'
      },
      notifications: {
        getUser: 'GET /api/users/:userId/notifications',
        markRead: 'PATCH /api/notifications/:id/read',
        markAllRead: 'PATCH /api/users/:userId/notifications/read-all'
      },
      stats: {
        admin: 'GET /api/admin/stats',
        merchant: 'GET /api/merchants/:merchantId/stats'
      },
      settings: {
        getAll: 'GET /api/settings',
        update: 'PUT /api/settings/:key'
      },
      system: {
        health: 'GET /api/health',
        seed: 'POST /api/seed'
      }
    }
  });
});

// ============================================
// ERROR HANDLING MIDDLEWARE
// ============================================
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message 
  });
});

// ============================================
// START SERVER
// ============================================
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🔌 WebSocket server running on ws://localhost:${PORT}`);
  console.log('\n📚 API Documentation available at:');
  console.log(`   http://localhost:${PORT}`);
  console.log('\n✅ Available endpoints:');
  console.log(`   • Auth: /api/auth/*`);
  console.log(`   • Users: /api/users/*`);
  console.log(`   • Merchants: /api/merchants/*`);
  console.log(`   • Products: /api/products/*`);
  console.log(`   • Orders: /api/orders/*`);
  console.log(`   • Riders: /api/riders/*`);
  console.log(`   • Reviews: /api/reviews/*`);
  console.log(`   • Wallet: /api/wallets/*`);
  console.log(`   • Notifications: /api/notifications/*`);
  console.log(`   • Stats: /api/admin/stats, /api/merchants/:id/stats`);
  console.log(`   • Settings: /api/settings/*`);
  console.log(`   • Health: /api/health`);
});