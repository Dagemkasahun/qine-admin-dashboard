import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { Server } from 'socket.io';
import http from 'http';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 5002;

// CORS middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://qine-admin.vercel.app',
    'https://qine-admin-dashboard.vercel.app',
    'https://qine-backend.onrender.com',
    'https://qine-admin-dashboard.onrender.com'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

app.use(express.json({ limit: '50mb' }));

// Create HTTP server
const server = http.createServer(app);

// Initialize WebSocket server
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://localhost:8081",
      "https://qine-admin-dashboard.onrender.com",
      "https://qine-admin-dashboard.vercel.app"
    ],
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


// ============================================
// REQUEST QUEUE - Prevent overload from multiple simultaneous requests
// ============================================
const requestQueue = new Map();
const QUEUE_DELAY = 100; // 100ms between similar requests

app.use((req, res, next) => {
  const key = `${req.method}:${req.path}`;
  const now = Date.now();
  const lastRequest = requestQueue.get(key);
  
  if (lastRequest && (now - lastRequest) < QUEUE_DELAY) {
    // Delay this request slightly to prevent DB overload
    const delay = QUEUE_DELAY - (now - lastRequest);
    setTimeout(() => {
      requestQueue.set(key, Date.now());
      next();
    }, delay);
  } else {
    requestQueue.set(key, now);
    next();
  }
});


// Register new user
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, phone, password, firstName, lastName, role } = req.body;
    
    if (!username || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'Username, password, first name and last name are required' });
    }
    
    const existingUsername = await prisma.user.findUnique({ where: { username } });
    if (existingUsername) {
      return res.status(400).json({ error: 'Username already taken' });
    }
    
    if (email) {
      const existingEmail = await prisma.user.findUnique({ where: { email } });
      if (existingEmail) {
        return res.status(400).json({ error: 'Email already registered' });
      }
    }
    
    if (phone) {
      const existingPhone = await prisma.user.findUnique({ where: { phone } });
      if (existingPhone) {
        return res.status(400).json({ error: 'Phone number already registered' });
      }
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await prisma.user.create({
      data: {
        username,
        email: email || null,
        phone: phone || null,
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
    const { email, username, password } = req.body;
    
    let user;
    if (email) {
      user = await prisma.user.findUnique({ where: { email } });
    } else if (username) {
      user = await prisma.user.findUnique({ where: { username } });
    }
    
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
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
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
        id: true, username: true, email: true, phone: true,
        firstName: true, lastName: true, profileImage: true,
        role: true, status: true, emailVerified: true,
        phoneVerified: true, lastLogin: true, createdAt: true,
        updatedAt: true, addresses: true, merchant: true,
        riderProfile: true, wallet: true,
      },
      orderBy: { createdAt: 'desc' }
    });
    console.log(`📋 Fetched ${users.length} users`);
    res.json(users);
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get user by ID
app.get('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        addresses: true, merchant: true, riderProfile: true,
        wallet: { include: { transactions: { orderBy: { createdAt: 'desc' }, take: 10 } } },
        customerOrders: { take: 5, orderBy: { createdAt: 'desc' } },
        reviews: { take: 5, orderBy: { createdAt: 'desc' } }
      }
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('❌ Error fetching user:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get user statistics
app.get('/api/users/:userId/stats', async (req, res) => {
  try {
    const { userId } = req.params;
    const [orders, reviews, wallet] = await Promise.all([
      prisma.order.findMany({ where: { customerId: userId } }),
      prisma.review.findMany({ where: { userId } }),
      prisma.wallet.findUnique({ where: { userId } })
    ]);
    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
    const completedOrders = orders.filter(o => o.status === 'DELIVERED').length;
    const cancelledOrders = orders.filter(o => o.status === 'CANCELLED').length;
    res.json({ 
      totalOrders, totalSpent, completedOrders, cancelledOrders,
      averageOrderValue: totalOrders > 0 ? totalSpent / totalOrders : 0,
      totalReviews: reviews.length,
      averageRating: reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0,
      walletBalance: wallet?.balance || 0
    });
  } catch (error) {
    console.error('❌ Error fetching user stats:', error);
    res.json({ totalOrders: 0, totalSpent: 0, completedOrders: 0, cancelledOrders: 0, averageOrderValue: 0, totalReviews: 0, averageRating: 0, walletBalance: 0 });
  }
});

// Create user
app.post('/api/users', async (req, res) => {
  try {
    const { username, email, phone, password, firstName, lastName, role, status } = req.body;
    if (!username || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'Username, password, first name, and last name are required' });
    }
    const existingUsername = await prisma.user.findUnique({ where: { username } });
    if (existingUsername) return res.status(400).json({ error: 'Username already taken' });
    if (email) {
      const existingEmail = await prisma.user.findUnique({ where: { email } });
      if (existingEmail) return res.status(400).json({ error: 'Email already registered' });
    }
    if (phone) {
      const existingPhone = await prisma.user.findUnique({ where: { phone } });
      if (existingPhone) return res.status(400).json({ error: 'Phone number already registered' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        username, email: email || null, phone: phone || null,
        password: hashedPassword, firstName, lastName,
        role: role || 'CUSTOMER', status: status || 'ACTIVE',
        emailVerified: false, phoneVerified: false,
      }
    });
    await prisma.wallet.create({ data: { userId: user.id, balance: 0, currency: 'ETB' } });
    const { password: _, ...userWithoutPassword } = user;
    console.log(`✅ User created: ${user.id}`);
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('❌ Error creating user:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update user (PUT)
app.put('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, phone, profileImage, email } = req.body;
    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) return res.status(404).json({ error: 'User not found' });
    if (existingUser.role === 'SUPER_ADMIN' && req.body.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Cannot modify Super Admin account' });
    }
    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(firstName && { firstName }), ...(lastName && { lastName }),
        ...(phone && { phone }), ...(profileImage && { profileImage }),
        ...(email && { email }),
      }
    });
    const { password, ...userWithoutPassword } = user;
    console.log(`✅ User ${id} updated successfully`);
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('❌ Error updating user:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update user (PATCH)
app.patch('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, role, firstName, lastName, email, phone, profileImage } = req.body;
    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) return res.status(404).json({ error: 'User not found' });
    if (existingUser.role === 'SUPER_ADMIN' && role && role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Cannot change Super Admin role' });
    }
    if (existingUser.role === 'SUPER_ADMIN' && status === 'SUSPENDED') {
      return res.status(403).json({ error: 'Cannot suspend Super Admin account' });
    }
    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(status && { status }), ...(role && { role }),
        ...(firstName && { firstName }), ...(lastName && { lastName }),
        ...(email && { email }), ...(phone && { phone }),
        ...(profileImage && { profileImage }),
      }
    });
    const { password, ...userWithoutPassword } = user;
    console.log(`✅ User ${id} updated successfully`);
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('❌ Error updating user:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete user
app.delete('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id }, include: { merchant: true, riderProfile: true } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.role === 'SUPER_ADMIN') return res.status(403).json({ error: 'Cannot delete Super Admin account' });
    await prisma.$transaction(async (tx) => {
      await tx.notification.deleteMany({ where: { userId: id } });
      await tx.notificationToken.deleteMany({ where: { userId: id } });
      await tx.activityLog.deleteMany({ where: { userId: id } });
      await tx.address.deleteMany({ where: { userId: id } });
      const wallet = await tx.wallet.findUnique({ where: { userId: id } });
      if (wallet) {
        await tx.walletTransaction.deleteMany({ where: { walletId: wallet.id } });
        await tx.wallet.delete({ where: { userId: id } });
      }
      await tx.reviewResponse.deleteMany({ where: { userId: id } });
      await tx.review.deleteMany({ where: { userId: id } });
      if (user.riderProfile) await tx.riderProfile.delete({ where: { userId: id } });
      if (user.merchant) {
        await tx.product.deleteMany({ where: { merchantId: user.merchant.id } });
        await tx.productCategory.deleteMany({ where: { merchantId: user.merchant.id } });
        await tx.order.deleteMany({ where: { merchantId: user.merchant.id } });
        await tx.promotion.deleteMany({ where: { merchantId: user.merchant.id } });
        await tx.inventoryItem.deleteMany({ where: { merchantId: user.merchant.id } });
        await tx.merchant.delete({ where: { ownerId: id } });
      }
      await tx.orderItem.deleteMany({ where: { order: { customerId: id } } });
      await tx.orderStatusHistory.deleteMany({ where: { order: { customerId: id } } });
      await tx.payment.deleteMany({ where: { order: { customerId: id } } });
      await tx.order.deleteMany({ where: { customerId: id } });
      await tx.user.delete({ where: { id } });
    });
    console.log(`✅ User ${id} deleted successfully from database`);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting user:', error);
    if (error.code === 'P2003') return res.status(400).json({ error: 'Cannot delete user due to existing references.' });
    res.status(500).json({ error: error.message });
  }
});

// Bulk delete users
app.post('/api/users/bulk-delete', async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) return res.status(400).json({ error: 'No user IDs provided' });
    const results = { success: [], failed: [] };
    for (const id of ids) {
      try {
        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) { results.failed.push({ id, reason: 'User not found' }); continue; }
        if (user.role === 'SUPER_ADMIN') { results.failed.push({ id, reason: 'Cannot delete Super Admin' }); continue; }
        await prisma.$transaction(async (tx) => {
          await tx.notification.deleteMany({ where: { userId: id } });
          await tx.notificationToken.deleteMany({ where: { userId: id } });
          await tx.activityLog.deleteMany({ where: { userId: id } });
          await tx.address.deleteMany({ where: { userId: id } });
          const wallet = await tx.wallet.findUnique({ where: { userId: id } });
          if (wallet) {
            await tx.walletTransaction.deleteMany({ where: { walletId: wallet.id } });
            await tx.wallet.delete({ where: { userId: id } });
          }
          await tx.reviewResponse.deleteMany({ where: { userId: id } });
          await tx.review.deleteMany({ where: { userId: id } });
          await tx.riderProfile.deleteMany({ where: { userId: id } });
          await tx.merchant.deleteMany({ where: { ownerId: id } });
          await tx.order.deleteMany({ where: { customerId: id } });
          await tx.user.delete({ where: { id } });
        });
        results.success.push(id);
      } catch (error) { results.failed.push({ id, reason: error.message }); }
    }
    console.log(`✅ Bulk delete completed: ${results.success.length} success, ${results.failed.length} failed`);
    res.json(results);
  } catch (error) {
    console.error('❌ Error in bulk delete:', error);
    res.status(500).json({ error: error.message });
  }
});

// Bulk update user status
app.post('/api/users/bulk-status', async (req, res) => {
  try {
    const { ids, status } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) return res.status(400).json({ error: 'No user IDs provided' });
    if (!status) return res.status(400).json({ error: 'Status is required' });
    const users = await prisma.user.findMany({ where: { id: { in: ids } }, select: { id: true, role: true } });
    const validIds = users.filter(u => u.role !== 'SUPER_ADMIN').map(u => u.id);
    const result = await prisma.user.updateMany({ where: { id: { in: validIds } }, data: { status } });
    console.log(`✅ Updated ${result.count} users to ${status}`);
    res.json({ success: true, updated: result.count, skipped: ids.length - validIds.length });
  } catch (error) {
    console.error('❌ Error in bulk status update:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get users by role
app.get('/api/users/role/:role', async (req, res) => {
  try {
    const { role } = req.params;
    const users = await prisma.user.findMany({
      where: { role: role.toUpperCase() },
      select: { id: true, username: true, email: true, phone: true, firstName: true, lastName: true, role: true, status: true, createdAt: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(users);
  } catch (error) {
    console.error('❌ Error fetching users by role:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get users by status
app.get('/api/users/status/:status', async (req, res) => {
  try {
    const { status } = req.params;
    const users = await prisma.user.findMany({
      where: { status: status.toUpperCase() },
      select: { id: true, username: true, email: true, phone: true, firstName: true, lastName: true, role: true, status: true, createdAt: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(users);
  } catch (error) {
    console.error('❌ Error fetching users by status:', error);
    res.status(500).json({ error: error.message });
  }
});

// Search users
app.get('/api/users/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
          { phone: { contains: query, mode: 'insensitive' } },
        ]
      },
      select: { id: true, username: true, email: true, phone: true, firstName: true, lastName: true, role: true, status: true, createdAt: true },
      take: 50, orderBy: { createdAt: 'desc' }
    });
    res.json(users);
  } catch (error) {
    console.error('❌ Error searching users:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get user activity logs
app.get('/api/users/:userId/activity', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50 } = req.query;
    const logs = await prisma.activityLog.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: parseInt(limit) });
    res.json(logs);
  } catch (error) {
    console.error('❌ Error fetching user activity:', error);
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
      include: { owner: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } }, products: { take: 5, orderBy: { createdAt: 'desc' } }, categories: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(merchants);
  } catch (error) {
    console.error('Error fetching merchants:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get pending merchants
app.get('/api/merchants/pending', async (req, res) => {
  try {
    const merchants = await prisma.merchant.findMany({
      where: { status: { in: ['PENDING', 'PENDING_APPROVAL'] } },
      include: { owner: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(merchants);
  } catch (error) {
    console.error('Error fetching pending merchants:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get merchant by ID
app.get('/api/merchants/:id', async (req, res) => {
  try {
    const merchant = await prisma.merchant.findUnique({
      where: { id: req.params.id },
      include: {
        owner: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
        products: { include: { category: true }, orderBy: { createdAt: 'desc' } },
        categories: true, orders: { take: 10, orderBy: { createdAt: 'desc' } }
      }
    });
    if (!merchant) return res.status(404).json({ error: 'Merchant not found' });
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
    const merchant = await prisma.merchant.create({
      data: { ...merchantData, ownerId: ownerId, status: 'PENDING', configuration: merchantData.configuration || '{}', modules: merchantData.modules || '[]', deliveryConfig: merchantData.deliveryConfig || '{}' }
    });
    io.to('admin').emit('notification', { type: 'merchant', title: 'New Merchant Registration', message: `${merchant.businessName} has registered and is waiting for approval` });
    res.json(merchant);
  } catch (error) {
    console.error('Error creating merchant:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update merchant (PUT)
app.put('/api/merchants/:id', async (req, res) => {
  try {
    const merchant = await prisma.merchant.update({
      where: { id: req.params.id },
      data: { businessName: req.body.businessName, description: req.body.description, address: req.body.address, city: req.body.city, businessPhone: req.body.businessPhone, businessEmail: req.body.businessEmail, logo: req.body.logo, coverImage: req.body.coverImage, configuration: req.body.configuration, modules: req.body.modules, deliveryConfig: req.body.deliveryConfig }
    });
    res.json(merchant);
  } catch (error) {
    console.error('Error updating merchant:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update merchant (PATCH)
app.patch('/api/merchants/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, approvedAt, rejectionReason, businessName, description, address, city, businessPhone, businessEmail } = req.body;
    const existingMerchant = await prisma.merchant.findUnique({ where: { id } });
    if (!existingMerchant) return res.status(404).json({ error: 'Merchant not found' });
    const merchant = await prisma.merchant.update({
      where: { id },
      data: { ...(status && { status }), ...(approvedAt && { approvedAt: new Date(approvedAt) }), ...(rejectionReason && { rejectionReason }), ...(businessName && { businessName }), ...(description && { description }), ...(address && { address }), ...(city && { city }), ...(businessPhone && { businessPhone }), ...(businessEmail && { businessEmail }) }
    });
    console.log(`✅ Merchant ${id} updated successfully`);
    res.json(merchant);
  } catch (error) {
    console.error('❌ Error updating merchant:', error);
    res.status(500).json({ error: error.message });
  }
});

// Approve merchant
app.post('/api/merchants/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const merchant = await prisma.merchant.update({
      where: { id },
      data: { status: 'ACTIVE', approvedAt: new Date(), approvedBy: req.body.adminId }
    });
    io.to(`merchant_${merchant.id}`).emit('notification', { type: 'approval', title: '✅ Merchant Approved!', message: 'Your merchant account has been approved. You can now start selling!' });
    console.log(`✅ Merchant ${id} approved successfully`);
    res.json(merchant);
  } catch (error) {
    console.error('❌ Error approving merchant:', error);
    res.status(500).json({ error: error.message });
  }
});

// Reject merchant
app.post('/api/merchants/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const merchant = await prisma.merchant.update({ where: { id }, data: { status: 'REJECTED', rejectionReason: reason } });
    io.to(`merchant_${merchant.id}`).emit('notification', { type: 'approval', title: '❌ Application Rejected', message: `Your application was rejected: ${reason}` });
    console.log(`✅ Merchant ${id} rejected`);
    res.json(merchant);
  } catch (error) {
    console.error('❌ Error rejecting merchant:', error);
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
    const lowStockItems = await prisma.product.findMany({ where: { merchantId, stock: { lte: 5 } }, select: { name: true, stock: true } });
    const recentOrders = await prisma.order.findMany({
      where: { merchantId }, take: 5, orderBy: { createdAt: 'desc' },
      include: { customer: { select: { firstName: true, lastName: true, phone: true } } }
    });
    res.json({ totalRevenue: totalRevenue._sum.total || 0, activeOrders, totalProducts, avgRating: rating?.rating || 0, lowStockItems, recentOrders, totalOrders });
  } catch (error) {
    console.error('Error fetching merchant stats:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get merchant categories
app.get('/api/merchants/:merchantId/categories', async (req, res) => {
  try {
    const categories = await prisma.productCategory.findMany({ where: { merchantId: req.params.merchantId }, include: { products: true } });
    res.json(categories);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// ============================================
// PRODUCT API
// ============================================

// Get merchant products
app.get('/api/merchants/:merchantId/products', async (req, res) => {
  try {
    const products = await prisma.product.findMany({ where: { merchantId: req.params.merchantId, isActive: true }, include: { category: true }, orderBy: { createdAt: 'desc' } });
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
      data: { merchantId: req.body.merchantId, name: req.body.name, description: req.body.description, price: req.body.price, stock: req.body.stock, sku: req.body.sku, images: req.body.images, categoryId: req.body.categoryId, isActive: true }
    });
    io.to(`merchant_${product.merchantId}`).emit('notification', { type: 'product', title: 'Product Added', message: `${product.name} has been added to your catalog` });
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
      data: { name: req.body.name, description: req.body.description, price: req.body.price, stock: req.body.stock, sku: req.body.sku, images: req.body.images, categoryId: req.body.categoryId }
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
    await prisma.product.delete({ where: { id: req.params.id } });
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
    const product = await prisma.product.update({ where: { id: req.params.id }, data: { stock } });
    if (stock <= (product.lowStock || 5)) {
      io.to(`merchant_${product.merchantId}`).emit('notification', { type: 'inventory', title: '⚠️ Low Stock Alert', message: `${product.name} is running low (${stock} left)` });
    }
    res.json(product);
  } catch (error) {
    console.error('Error updating stock:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create category
app.post('/api/categories', async (req, res) => {
  try {
    const category = await prisma.productCategory.create({ data: { name: req.body.name, merchantId: req.body.merchantId, description: req.body.description } });
    res.json(category);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// ============================================
// ORDER API
// ============================================

// Get all orders (with filters for rider)
app.get('/api/orders', async (req, res) => {
  try {
    const { riderId, status } = req.query;
    const where = {};
    if (riderId) where.riderId = riderId;
    if (status) where.status = status;
    const orders = await prisma.order.findMany({
      where,
      include: {
        customer: { select: { id: true, firstName: true, lastName: true, phone: true } },
        merchant: { select: { id: true, businessName: true, address: true, businessPhone: true, latitude: true, longitude: true } },
        orderItems: true, statusHistory: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create order
app.post('/api/orders', async (req, res) => {
  try {
    const { customerId, merchantId, items, subtotal, deliveryFee, total, deliveryAddress, paymentMethod } = req.body;
    console.log('📦 Creating order:', { customerId, merchantId, items: items?.length, total });
    if (!customerId || !merchantId || !items || items.length === 0) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const orderNumber = `ORD-${Date.now()}`;
    const order = await prisma.order.create({
      data: {
        orderNumber, customerId, merchantId, status: 'PENDING',
        items: JSON.stringify(items), subtotal: subtotal || 0,
        deliveryFee: deliveryFee || 0, total: total || (subtotal + deliveryFee),
        paymentMethod: paymentMethod || 'CASH', paymentStatus: 'PENDING',
        deliveryAddress: deliveryAddress ? JSON.stringify(deliveryAddress) : '{}',
      }
    });
    for (const item of items) {
      await prisma.orderItem.create({ data: { orderId: order.id, productId: item.productId, name: item.name, price: item.price, quantity: item.quantity, subtotal: item.price * item.quantity, total: item.price * item.quantity } });
      try { await prisma.product.update({ where: { id: item.productId }, data: { stock: { decrement: item.quantity } } }); } catch (err) {}
    }
    await prisma.orderStatusHistory.create({ data: { orderId: order.id, status: 'PENDING' } });
    io.to(`merchant_${merchantId}`).emit('newOrder', { id: order.id, orderNumber, total, message: `You have a new order #${orderNumber}` });
    io.to('admin').emit('notification', { type: 'order', title: 'New Order', message: `Order #${orderNumber} has been placed` });
    console.log('✅ Order created:', order.id);
    res.json({ ...order, orderNumber });
  } catch (error) {
    console.error('❌ Error creating order:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get merchant orders
app.get('/api/merchants/:merchantId/orders', async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { merchantId: req.params.merchantId },
      include: { customer: { select: { id: true, firstName: true, lastName: true, phone: true, email: true } }, orderItems: true, statusHistory: { orderBy: { createdAt: 'desc' } } },
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
      include: { customer: true, merchant: true, orderItems: true, statusHistory: true, payments: true }
    });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Update order status
app.patch('/api/orders/:id/status', async (req, res) => {
  try {
    const { status, notes, changedBy } = req.body;
    const order = await prisma.order.update({ where: { id: req.params.id }, data: { status } });
    await prisma.orderStatusHistory.create({ data: { orderId: order.id, status, notes, changedBy } });
    const timelineUpdates = {};
    if (status === 'CONFIRMED') timelineUpdates.confirmedAt = new Date();
    if (status === 'PREPARING') timelineUpdates.preparedAt = new Date();
    if (status === 'READY') timelineUpdates.readyAt = new Date();
    if (status === 'ASSIGNED') timelineUpdates.assignedAt = new Date();
    if (status === 'PICKED_UP') timelineUpdates.pickedUpAt = new Date();
    if (status === 'DELIVERED') timelineUpdates.deliveredAt = new Date();
    if (status === 'CANCELLED') timelineUpdates.cancelledAt = new Date();
    if (Object.keys(timelineUpdates).length > 0) {
      await prisma.order.update({ where: { id: order.id }, data: timelineUpdates });
    }
    io.to(`customer_${order.customerId}`).emit('orderUpdate', { orderNumber: order.orderNumber, status, message: `Your order #${order.orderNumber} is now ${status}` });
    io.to(`merchant_${order.merchantId}`).emit('orderUpdate', { orderNumber: order.orderNumber, status });
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
      include: { user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } } }
    });
    res.json(riders);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Get single rider by ID
app.get('/api/riders/:id', async (req, res) => {
  try {
    const rider = await prisma.riderProfile.findUnique({
      where: { id: req.params.id },
      include: { user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } } }
    });
    if (!rider) return res.status(404).json({ error: 'Rider not found' });
    const completedOrders = await prisma.order.count({ where: { riderId: rider.userId, status: 'DELIVERED' } });
    const earningsResult = await prisma.order.aggregate({ where: { riderId: rider.userId, status: 'DELIVERED' }, _sum: { deliveryFee: true } });
    res.json({ ...rider, totalDeliveries: completedOrders, totalEarnings: earningsResult._sum.deliveryFee || 0 });
  } catch (error) {
    console.error('Error fetching rider:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create rider profile
app.post('/api/riders', async (req, res) => {
  try {
    const { userId, ...riderData } = req.body;
    const rider = await prisma.riderProfile.create({ data: { userId, ...riderData, status: 'OFFLINE' } });
    res.json(rider);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Update rider location
app.patch('/api/riders/:id/location', async (req, res) => {
  try {
    const { lat, lng } = req.body;
    const rider = await prisma.riderProfile.update({ where: { id: req.params.id }, data: { currentLat: lat, currentLng: lng, lastLocationUpdate: new Date() } });
    res.json(rider);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Update rider status
app.patch('/api/riders/:id/status', async (req, res) => {
  try {
    const rider = await prisma.riderProfile.update({ where: { id: req.params.id }, data: { status: req.body.status } });
    res.json(rider);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// ============================================
// WALLET API
// ============================================

// Get user wallet
app.get('/api/users/:userId/wallet', async (req, res) => {
  try {
    let wallet = await prisma.wallet.findUnique({ where: { userId: req.params.userId }, include: { transactions: { orderBy: { createdAt: 'desc' }, take: 20 } } });
    if (!wallet) wallet = await prisma.wallet.create({ data: { userId: req.params.userId } });
    res.json(wallet);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Add funds to wallet
app.post('/api/wallets/:walletId/deposit', async (req, res) => {
  try {
    const { amount, description, reference } = req.body;
    const wallet = await prisma.wallet.findUnique({ where: { id: req.params.walletId } });
    const transaction = await prisma.walletTransaction.create({ data: { walletId: wallet.id, type: 'DEPOSIT', amount, balance: wallet.balance + amount, description, reference } });
    await prisma.wallet.update({ where: { id: wallet.id }, data: { balance: wallet.balance + amount } });
    res.json(transaction);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// ============================================
// NOTIFICATION API
// ============================================

// Get user notifications
app.get('/api/users/:userId/notifications', async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({ where: { userId: req.params.userId }, orderBy: { createdAt: 'desc' }, take: 50 });
    res.json(notifications);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Mark notification as read
app.patch('/api/notifications/:id/read', async (req, res) => {
  try {
    const notification = await prisma.notification.update({ where: { id: req.params.id }, data: { isRead: true, readAt: new Date() } });
    res.json(notification);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// ============================================
// COMMISSION API
// ============================================

app.get('/api/commissions/settings', async (req, res) => {
  try {
    const settings = await prisma.systemSetting.findMany({ where: { category: 'COMMISSION' } });
    res.json(settings);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.put('/api/commissions/settings/:key', async (req, res) => {
  try {
    const setting = await prisma.systemSetting.update({ where: { key: req.params.key }, data: { value: JSON.stringify(req.body.value) } });
    res.json(setting);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// ============================================
// REPORTS API
// ============================================

app.get('/api/reports/sales', async (req, res) => {
  try {
    const { startDate, endDate, merchantId } = req.query;
    const where = {};
    if (startDate) where.createdAt = { gte: new Date(startDate) };
    if (endDate) where.createdAt = { ...where.createdAt, lte: new Date(endDate) };
    if (merchantId) where.merchantId = merchantId;
    const orders = await prisma.order.findMany({ where, include: { merchant: true, orderItems: true } });
    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const dailyData = {};
    orders.forEach(order => {
      const date = order.createdAt.toISOString().split('T')[0];
      if (!dailyData[date]) dailyData[date] = { revenue: 0, orders: 0 };
      dailyData[date].revenue += order.total;
      dailyData[date].orders += 1;
    });
    const dailyReport = Object.entries(dailyData).map(([date, data]) => ({ date, revenue: data.revenue, orders: data.orders })).sort((a, b) => a.date.localeCompare(b.date));
    res.json({ summary: { totalRevenue, totalOrders, averageOrderValue }, daily: dailyReport, orders });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// SETTINGS API
// ============================================

app.get('/api/settings', async (req, res) => {
  try {
    const settings = await prisma.systemSetting.findMany({ orderBy: { category: 'asc' } });
    const settingsObject = { general: {}, appearance: {}, notifications: {}, api: {}, database: {}, security: {}, payment: {}, email: {}, sms: {}, backup: {}, system: {} };
    settings.forEach(setting => {
      let value;
      try { value = JSON.parse(setting.value); } catch { value = setting.value; }
      if (settingsObject[setting.category.toLowerCase()]) settingsObject[setting.category.toLowerCase()][setting.key] = value;
    });
    res.json(settingsObject);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/settings', async (req, res) => {
  try {
    const settings = req.body;
    const operations = [];
    for (const [category, categorySettings] of Object.entries(settings)) {
      if (typeof categorySettings === 'object') {
        for (const [key, value] of Object.entries(categorySettings)) {
          operations.push(prisma.systemSetting.upsert({
            where: { key },
            update: { value: JSON.stringify(value), category: category.toUpperCase() },
            create: { key, value: JSON.stringify(value), type: typeof value === 'number' ? 'NUMBER' : typeof value === 'boolean' ? 'BOOLEAN' : 'STRING', category: category.toUpperCase() }
          }));
        }
      }
    }
    await prisma.$transaction(operations);
    res.json({ success: true, message: 'Settings saved successfully' });
  } catch (error) {
    console.error('Error saving settings:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/settings/:key', async (req, res) => {
  try {
    const setting = await prisma.systemSetting.findUnique({ where: { key: req.params.key } });
    if (!setting) return res.status(404).json({ error: 'Setting not found' });
    res.json(setting);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.put('/api/settings/:key', async (req, res) => {
  try {
    const setting = await prisma.systemSetting.update({ where: { key: req.params.key }, data: { value: JSON.stringify(req.body.value) } });
    res.json(setting);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// ============================================
// ADMIN STATS API
// ============================================

app.get('/api/admin/stats', async (req, res) => {
  try {
    const [totalUsers, totalMerchants, totalOrders, totalRevenue, pendingMerchants, pendingOrders] = await Promise.all([
      prisma.user.count(), prisma.merchant.count(), prisma.order.count(),
      prisma.order.aggregate({ _sum: { total: true } }),
      prisma.merchant.count({ where: { status: 'PENDING' } }),
      prisma.order.count({ where: { status: 'PENDING' } })
    ]);
    const recentOrders = await prisma.order.findMany({
      take: 10, orderBy: { createdAt: 'desc' },
      include: { customer: { select: { firstName: true, lastName: true } }, merchant: { select: { businessName: true } } }
    });
    res.json({ totalUsers, totalMerchants, totalOrders, totalRevenue: totalRevenue._sum.total || 0, pendingMerchants, pendingOrders, recentOrders });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// ============================================
// HEALTH CHECK
// ============================================

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date(), uptime: process.uptime(), database: 'connected' });
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
  console.log('   PATCH  /api/merchants/:id');
  console.log('   POST   /api/merchants/:id/approve');
  console.log('   POST   /api/merchants/:id/reject');
  console.log('   GET    /api/merchants/pending');
  console.log('   GET    /api/merchants/:id/stats');
  console.log('   GET    /api/merchants/:merchantId/products');
  console.log('   GET    /api/merchants/:merchantId/categories');
  console.log('   POST   /api/products');
  console.log('   PUT    /api/products/:id');
  console.log('   DELETE /api/products/:id');
  console.log('   PATCH  /api/products/:id/stock');
  console.log('   POST   /api/categories');
  console.log('   GET    /api/orders');
  console.log('   POST   /api/orders');
  console.log('   GET    /api/orders/:id');
  console.log('   GET    /api/merchants/:merchantId/orders');
  console.log('   PATCH  /api/orders/:id/status');
  console.log('   GET    /api/riders');
  console.log('   GET    /api/riders/:id');
  console.log('   POST   /api/riders');
  console.log('   PATCH  /api/riders/:id/location');
  console.log('   PATCH  /api/riders/:id/status');
  console.log('   GET    /api/users/:userId/wallet');
  console.log('   GET    /api/admin/stats');
  console.log('   GET    /api/reports/sales');
  console.log('   GET    /api/settings');
  console.log('   POST   /api/settings');
  console.log('   GET    /api/health');
  console.log('\n✨ All APIs are now ready!\n');
});