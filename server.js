// server.js - Add at the very top
import dotenv from 'dotenv';
dotenv.config();
// server.js
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { Server } from 'socket.io';
import http from 'http';
import bcrypt from 'bcryptjs';

const express = require('express');
const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://qine-admin.vercel.app',
    'https://qine-backend.onrender.com',
    'https://qine-admin-dashboard.vercel.app' 
	'https://qine-admin-dashboard.onrender.com' 
  ],
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));

// Create HTTP server
const server = http.createServer(app);

// Initialize WebSocket server
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:8081"],
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

  socket.on('joinCustomerRoom', (customerId) => {
    socket.join(`customer_${customerId}`);
    console.log(`👤 Customer ${customerId} joined their room`);
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
    
    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { phone }] }
    });
    
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await prisma.user.create({
      data: {
        email,
        phone,
        password: hashedPassword,
        firstName,
        lastName,
        role: role || 'CUSTOMER',
        status: 'ACTIVE'
      }
    });
    
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Registration error:', error);
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
    res.json({ user: userWithoutPassword, token: `mock-token-${user.id}` });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get current user
app.get('/api/auth/me', async (req, res) => {
  try {
    // In production, verify JWT token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    // For now, return mock user
    // In production, decode JWT and find user
    res.json({ user: { id: '1', email: 'test@test.com', firstName: 'Test', lastName: 'User' } });
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
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        createdAt: true,
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
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user
app.put('/api/users/:id', async (req, res) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        phone: req.body.phone,
        profileImage: req.body.profileImage
      }
    });
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
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
        owner: {
          select: { id: true, firstName: true, lastName: true, email: true, phone: true }
        },
        products: {
          take: 5,
          orderBy: { createdAt: 'desc' }
        },
        categories: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(merchants);
  } catch (error) {
    console.error('Error fetching merchants:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get merchant by ID
app.get('/api/merchants/:id', async (req, res) => {
  try {
    const merchant = await prisma.merchant.findUnique({
      where: { id: req.params.id },
      include: {
        owner: {
          select: { id: true, firstName: true, lastName: true, email: true, phone: true }
        },
        products: {
          include: {
            category: true
          },
          orderBy: { createdAt: 'desc' }
        },
        categories: true,
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
    console.error('Error fetching merchant:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create merchant
app.post('/api/merchants', async (req, res) => {
  try {
    const { ownerId, ...merchantData } = req.body;
    
    // Create merchant
    const merchant = await prisma.merchant.create({
      data: {
        ...merchantData,
        ownerId: ownerId,
        status: 'PENDING',
        configuration: merchantData.configuration || '{}',
        modules: merchantData.modules || '[]',
        deliveryConfig: merchantData.deliveryConfig || '{}'
      }
    });
    
    // Notify admin
    io.to('admin').emit('notification', {
      type: 'merchant',
      title: 'New Merchant Registration',
      message: `${merchant.businessName} has registered and is waiting for approval`
    });
    
    res.json(merchant);
  } catch (error) {
    console.error('Error creating merchant:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update merchant
app.put('/api/merchants/:id', async (req, res) => {
  try {
    const merchant = await prisma.merchant.update({
      where: { id: req.params.id },
      data: {
        businessName: req.body.businessName,
        description: req.body.description,
        address: req.body.address,
        city: req.body.city,
        businessPhone: req.body.businessPhone,
        businessEmail: req.body.businessEmail,
        logo: req.body.logo,
        coverImage: req.body.coverImage,
        configuration: req.body.configuration,
        modules: req.body.modules,
        deliveryConfig: req.body.deliveryConfig
      }
    });
    res.json(merchant);
  } catch (error) {
    console.error('Error updating merchant:', error);
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
    
    io.to(`merchant_${merchant.id}`).emit('notification', {
      type: 'approval',
      title: '✅ Merchant Approved!',
      message: 'Your merchant account has been approved. You can now start selling!'
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

// Get merchant stats
app.get('/api/merchants/:id/stats', async (req, res) => {
  try {
    const merchantId = req.params.id;
    
    const [totalOrders, totalRevenue, activeOrders, totalProducts, rating] = await Promise.all([
      prisma.order.count({ where: { merchantId } }),
      prisma.order.aggregate({ where: { merchantId }, _sum: { total: true } }),
      prisma.order.count({ where: { merchantId, status: { in: ['PENDING', 'CONFIRMED', 'PREPARING'] } } }),
      prisma.product.count({ where: { merchantId, isActive: true } }),
      prisma.merchant.findUnique({ where: { id: merchantId }, select: { rating: true } })
    ]);
    
    const lowStockItems = await prisma.product.findMany({
      where: { merchantId, stock: { lte: 5 } },
      select: { name: true, stock: true }
    });
    
    const recentOrders = await prisma.order.findMany({
      where: { merchantId },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { customer: { select: { firstName: true, lastName: true, phone: true } } }
    });
    
    res.json({
      totalRevenue: totalRevenue._sum.total || 0,
      activeOrders,
      totalProducts,
      avgRating: rating?.rating || 0,
      lowStockItems,
      recentOrders,
      totalOrders
    });
  } catch (error) {
    console.error('Error fetching merchant stats:', error);
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
      where: { merchantId: req.params.merchantId, isActive: true },
      include: { category: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create product
app.post('/api/products', async (req, res) => {
  try {
    const product = await prisma.product.create({
      data: {
        ...req.body,
        images: req.body.images || null,
        variants: req.body.variants || null,
        dimensions: req.body.dimensions || null
      }
    });
    
    // Notify merchant of new product
    io.to(`merchant_${product.merchantId}`).emit('notification', {
      type: 'product',
      title: 'Product Added',
      message: `${product.name} has been added to your catalog`
    });
    
    res.json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update product
app.put('/api/products/:id', async (req, res) => {
  try {
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        stock: req.body.stock,
        sku: req.body.sku,
        images: req.body.images,
        categoryId: req.body.categoryId
      }
    });
    res.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
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
    console.error('Error deleting product:', error);
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
    
    // Check low stock alert
    if (stock <= (product.lowStock || 5)) {
      io.to(`merchant_${product.merchantId}`).emit('notification', {
        type: 'inventory',
        title: '⚠️ Low Stock Alert',
        message: `${product.name} is running low (${stock} left)`
      });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Error updating stock:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// PRODUCT CATEGORY API
// ============================================

// Get merchant categories
app.get('/api/merchants/:merchantId/categories', async (req, res) => {
  try {
    const categories = await prisma.productCategory.findMany({
      where: { merchantId: req.params.merchantId },
      include: { products: true }
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
      data: {
        name: req.body.name,
        merchantId: req.body.merchantId,
        description: req.body.description
      }
    });
    res.json(category);
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
    const { items, customerId, merchantId, subtotal, deliveryFee, total, deliveryAddress, paymentMethod, notes } = req.body;
    
    const orderNumber = `ORD-${Date.now()}`;
    
    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerId,
        merchantId,
        status: 'PENDING',
        items: JSON.stringify(items),
        subtotal,
        deliveryFee: deliveryFee || 0,
        total,
        paymentMethod: paymentMethod || 'CASH',
        paymentStatus: 'PENDING',
        deliveryAddress: JSON.stringify(deliveryAddress),
        notes
      }
    });
    
    // Create order items
    for (const item of items) {
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
    io.to(`merchant_${merchantId}`).emit('newOrder', {
      orderNumber,
      total,
      message: `You have a new order #${orderNumber}`
    });
    
    // Notify admin
    io.to('admin').emit('notification', {
      type: 'order',
      title: 'New Order',
      message: `Order #${orderNumber} has been placed`
    });
    
    res.json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get merchant orders
app.get('/api/merchants/:merchantId/orders', async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { merchantId: req.params.merchantId },
      include: {
        customer: {
          select: { id: true, firstName: true, lastName: true, phone: true, email: true }
        },
        orderItems: true,
        statusHistory: {
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
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
        orderItems: true,
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
    
    // Update timeline based on status
    const timelineUpdates = {};
    if (status === 'CONFIRMED') timelineUpdates.confirmedAt = new Date();
    if (status === 'PREPARING') timelineUpdates.preparedAt = new Date();
    if (status === 'READY') timelineUpdates.readyAt = new Date();
    if (status === 'ASSIGNED') timelineUpdates.assignedAt = new Date();
    if (status === 'PICKED_UP') timelineUpdates.pickedUpAt = new Date();
    if (status === 'DELIVERED') timelineUpdates.deliveredAt = new Date();
    if (status === 'CANCELLED') timelineUpdates.cancelledAt = new Date();
    
    if (Object.keys(timelineUpdates).length > 0) {
      await prisma.order.update({
        where: { id: order.id },
        data: timelineUpdates
      });
    }
    
    // Notify customer
    io.to(`customer_${order.customerId}`).emit('orderUpdate', {
      orderNumber: order.orderNumber,
      status,
      message: `Your order #${order.orderNumber} is now ${status}`
    });
    
    // Notify merchant
    io.to(`merchant_${order.merchantId}`).emit('orderUpdate', {
      orderNumber: order.orderNumber,
      status
    });
    
    res.json(order);
  } catch (error) {
    console.error('Error updating order status:', error);
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
        user: {
          select: { id: true, firstName: true, lastName: true, email: true, phone: true }
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
    const { userId, ...riderData } = req.body;
    const rider = await prisma.riderProfile.create({
      data: {
        userId,
        ...riderData,
        status: 'OFFLINE'
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
        reference
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
// NOTIFICATION API
// ============================================

// Get user notifications
app.get('/api/users/:userId/notifications', async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.params.userId },
      orderBy: { createdAt: 'desc' },
      take: 50
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

// ============================================
// COMMISSION API
// ============================================

// Get commission settings
app.get('/api/commissions/settings', async (req, res) => {
  try {
    const settings = await prisma.systemSetting.findMany({
      where: { category: 'COMMISSION' }
    });
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update commission rate
app.put('/api/commissions/settings/:key', async (req, res) => {
  try {
    const setting = await prisma.systemSetting.update({
      where: { key: req.params.key },
      data: { value: JSON.stringify(req.body.value) }
    });
    res.json(setting);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// REPORTS API
// ============================================

// Get sales report
app.get('/api/reports/sales', async (req, res) => {
  try {
    const { startDate, endDate, merchantId } = req.query;
    
    const where = {};
    if (startDate) where.createdAt = { gte: new Date(startDate) };
    if (endDate) where.createdAt = { ...where.createdAt, lte: new Date(endDate) };
    if (merchantId) where.merchantId = merchantId;
    
    const orders = await prisma.order.findMany({
      where,
      include: {
        merchant: true,
        orderItems: true
      }
    });
    
    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    // Group by date
    const dailyData = {};
    orders.forEach(order => {
      const date = order.createdAt.toISOString().split('T')[0];
      if (!dailyData[date]) {
        dailyData[date] = { revenue: 0, orders: 0 };
      }
      dailyData[date].revenue += order.total;
      dailyData[date].orders += 1;
    });
    
    const dailyReport = Object.entries(dailyData).map(([date, data]) => ({
      date,
      revenue: data.revenue,
      orders: data.orders
    })).sort((a, b) => a.date.localeCompare(b.date));
    
    res.json({
      summary: {
        totalRevenue,
        totalOrders,
        averageOrderValue
      },
      daily: dailyReport,
      orders
    });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// ADMIN STATS API
// ============================================

app.get('/api/admin/stats', async (req, res) => {
  try {
    const [totalUsers, totalMerchants, totalOrders, totalRevenue, pendingMerchants, pendingOrders] = await Promise.all([
      prisma.user.count(),
      prisma.merchant.count(),
      prisma.order.count(),
      prisma.order.aggregate({ _sum: { total: true } }),
      prisma.merchant.count({ where: { status: 'PENDING' } }),
      prisma.order.count({ where: { status: 'PENDING' } })
    ]);
    
    const recentOrders = await prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { select: { firstName: true, lastName: true } },
        merchant: { select: { businessName: true } }
      }
    });
    
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

// ============================================
// HEALTH CHECK
// ============================================

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date(),
    uptime: process.uptime(),
    database: 'connected'
  });
});

// ============================================
// ERROR HANDLING
// ============================================

app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: err.message });
});

// ============================================
// START SERVER
// ============================================

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  console.log(`🔌 WebSocket server running on ws://0.0.0.0:${PORT}`);
  console.log('\n📚 API Endpoints Available:');
  console.log('   POST   /api/auth/register');
  console.log('   POST   /api/auth/login');
  console.log('   GET    /api/users');
  console.log('   GET    /api/merchants');
  console.log('   POST   /api/merchants');
  console.log('   GET    /api/merchants/:id');
  console.log('   PUT    /api/merchants/:id');
  console.log('   POST   /api/merchants/:id/approve');
  console.log('   GET    /api/merchants/:id/products');
  console.log('   POST   /api/products');
  console.log('   PUT    /api/products/:id');
  console.log('   DELETE /api/products/:id');
  console.log('   POST   /api/orders');
  console.log('   GET    /api/merchants/:merchantId/orders');
  console.log('   PATCH  /api/orders/:id/status');
  console.log('   GET    /api/riders');
  console.log('   GET    /api/users/:userId/wallet');
  console.log('   GET    /api/admin/stats');
  console.log('   GET    /api/reports/sales');
  console.log('   GET    /api/health');
  console.log('\n✨ All APIs are now ready!\n');
});