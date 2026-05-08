import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { Server } from 'socket.io';
import http from 'http';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ============================================
// SEED DEFAULT ADMIN USER
// ============================================
async function seedAdmin() {
  try {
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'SUPER_ADMIN' }
    });
    
    if (existingAdmin) {
      console.log('✅ Admin already exists:', existingAdmin.email);
      return; // Don't delete/recreate if admin exists
    }
    
    // Only create if no admin exists
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.create({
      data: {
        username: 'admin',
        email: 'admin@qine.com',
        phone: '+251900000000',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'SUPER_ADMIN',
        status: 'ACTIVE',
      }
    });
    console.log('✅ Admin created:', admin.email, '/ admin123');
  } catch (error) {
    console.log('Seed admin note:', error.message);
  }
}

seedAdmin();

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

// POST /api/auth/google
app.post('/api/auth/google', async (req, res) => {
  try {
    const { googleToken, email, firstName, lastName, profileImage } = req.body;
    
    const { OAuth2Client } = require('google-auth-library');
    const client = new OAuth2Client('880024548995-31d3o35fg4f5036ke1jvkdlhi4v3qkkn.apps.googleusercontent.com');
    
    const ticket = await client.verifyIdToken({
      idToken: googleToken,
      audience: [
        '880024548995-5dimsmpj256no6c40du0gpckpqaliu7c.apps.googleusercontent.com',  // Android
        '880024548995-31d3o35fg4f5036ke1jvkdlhi4v3qkkn.apps.googleusercontent.com',  // Web
		'880024548995-l2fqgdnsdt8v87fl53qia21dgp13jkkm.apps.googleusercontent.com',  // iOS client
		'880024548995-31d3o35fg4f5036ke1jvkdlhi4v3qkkn.apps.googleusercontent.com',      // Same as web
      ],
    });
    
    const payload = ticket.getPayload();
    
    if (!payload || payload.email !== email) {
      return res.status(400).json({ error: 'Invalid Google token' });
    }
    
    let user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          firstName: firstName || payload.given_name || '',
          lastName: lastName || payload.family_name || '',
          username: `user_${Date.now().toString(36)}`,
          profileImage: profileImage || payload.picture,
          role: 'CUSTOMER',
          status: 'ACTIVE',
          emailVerified: true,
        }
      });
    }
    
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '30d' }
    );
    
    res.json({ user, token });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ error: 'Google authentication failed' });
  }
});

// ============================================
// REQUEST QUEUE - Prevent overload
// ============================================
const requestQueue = new Map();
const QUEUE_DELAY = 100;

app.use((req, res, next) => {
  const key = `${req.method}:${req.path}`;
  const now = Date.now();
  const lastRequest = requestQueue.get(key);
  
  if (lastRequest && (now - lastRequest) < QUEUE_DELAY) {
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
    
    // Allow updating profile info for all users including SUPER_ADMIN
    // Only block role changes for SUPER_ADMIN (which isn't in PUT anyway)
    
    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(firstName !== undefined && { firstName }), 
        ...(lastName !== undefined && { lastName }),
        ...(phone !== undefined && { phone }), 
        ...(profileImage !== undefined && { profileImage }),
        ...(email !== undefined && { email }),
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
    
    // SUPER_ADMIN protection - only prevent role change and suspension
    if (existingUser.role === 'SUPER_ADMIN') {
      if (role && role !== 'SUPER_ADMIN') {
        return res.status(403).json({ error: 'Cannot change Super Admin role' });
      }
      if (status === 'SUSPENDED') {
        return res.status(403).json({ error: 'Cannot suspend Super Admin account' });
      }
      // But allow updating profile info (name, phone, email, image)
    }
    
    // Check phone uniqueness if changing
    if (phone && phone !== existingUser.phone) {
      const phoneExists = await prisma.user.findFirst({ 
        where: { phone, id: { not: id } } 
      });
      if (phoneExists) {
        return res.status(400).json({ error: 'Phone number already in use by another user' });
      }
    }
    
    // Check email uniqueness if changing
    if (email && email !== existingUser.email) {
      const emailExists = await prisma.user.findFirst({ 
        where: { email, id: { not: id } } 
      });
      if (emailExists) {
        return res.status(400).json({ error: 'Email already in use by another user' });
      }
    }
    
    // Build update data (only include fields that are provided)
    const updateData = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (profileImage !== undefined) updateData.profileImage = profileImage;
    
    // Only allow role/status changes for non-SUPER_ADMIN
    if (existingUser.role !== 'SUPER_ADMIN') {
      if (status !== undefined) updateData.status = status;
      if (role !== undefined) updateData.role = role;
    }
    
    const user = await prisma.user.update({
      where: { id },
      data: updateData
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
// Get all merchants - OPTIMIZED
app.get('/api/merchants', async (req, res) => {
  try {
    const { include = 'basic' } = req.query;
    
    // Basic query - fast, no nested relations
    if (include === 'basic' || !include) {
      const merchants = await prisma.merchant.findMany({
        select: {
          id: true,
          ownerId: true,
          businessName: true,
          businessType: true,
          category: true,
          subCategory: true,
          description: true,
          logo: true,
          coverImage: true,
          businessPhone: true,
          businessEmail: true,
          website: true,
          address: true,
          city: true,
          status: true,
          rating: true,
          totalReviews: true,
          totalOrders: true,
          totalRevenue: true,
          licenseNumber: true,
          tinNumber: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' }
      });
      console.log(`📋 Fetched ${merchants.length} merchants (basic)`);
      return res.json(merchants);
    }
    
    // Full query - with relations (only when specifically requested)
    const merchants = await prisma.merchant.findMany({
      include: { 
        owner: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } }, 
        products: { take: 5, orderBy: { createdAt: 'desc' } }, 
        categories: true 
      },
      orderBy: { createdAt: 'desc' }
    });
    console.log(`📋 Fetched ${merchants.length} merchants (full)`);
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

// Get all orders
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
// ENHANCED ADMIN DASHBOARD API
// ============================================
// ============================================
// ENHANCED ADMIN DASHBOARD API
// ============================================

app.get('/api/admin/dashboard', async (req, res) => {
  try {
    const { range = '7d' } = req.query;
    
    const endDate = new Date();
    const startDate = new Date();
    
    switch (range) {
      case 'today': startDate.setHours(0, 0, 0, 0); break;
      case '7d': startDate.setDate(startDate.getDate() - 7); break;
      case '30d': startDate.setDate(startDate.getDate() - 30); break;
      case '90d': startDate.setDate(startDate.getDate() - 90); break;
      case 'year': startDate.setFullYear(startDate.getFullYear() - 1); break;
      default: startDate.setDate(startDate.getDate() - 7);
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);

    console.log('📊 Dashboard query range:', { startDate: startDate.toISOString(), endDate: endDate.toISOString(), range });

    // Step 1: Get basic counts
    const totalUsers = await prisma.user.count().catch(() => 0);
    const totalMerchants = await prisma.merchant.count({ where: { status: 'ACTIVE' } }).catch(() => 0);
    const totalRiders = await prisma.riderProfile.count().catch(() => 0);
    const newUsersToday = await prisma.user.count({ where: { createdAt: { gte: todayStart } } }).catch(() => 0);
    const activeUsers = await prisma.user.count({ where: { status: 'ACTIVE' } }).catch(() => 0);

    // Step 2: Get order counts
    const totalOrders = await prisma.order.count({ where: { createdAt: { gte: startDate, lte: endDate } } }).catch(() => 0);
    const pendingOrders = await prisma.order.count({ where: { status: 'PENDING', createdAt: { gte: startDate, lte: endDate } } }).catch(() => 0);
    const deliveringOrders = await prisma.order.count({ 
      where: { status: { in: ['CONFIRMED', 'PREPARING', 'READY', 'ASSIGNED', 'PICKED_UP', 'IN_TRANSIT'] }, createdAt: { gte: startDate, lte: endDate } } 
    }).catch(() => 0);
    const deliveredOrdersCount = await prisma.order.count({ where: { status: 'DELIVERED', createdAt: { gte: startDate, lte: endDate } } }).catch(() => 0);
    const cancelledOrders = await prisma.order.count({ where: { status: 'CANCELLED', createdAt: { gte: startDate, lte: endDate } } }).catch(() => 0);

    // Step 3: Get revenue
    const monthRevenueResult = await prisma.order.aggregate({ 
      where: { status: 'DELIVERED', createdAt: { gte: startDate, lte: endDate } }, 
      _sum: { total: true } 
    }).catch(() => ({ _sum: { total: 0 } }));
    
    const todayRevenueResult = await prisma.order.aggregate({ 
      where: { status: 'DELIVERED', createdAt: { gte: todayStart } }, 
      _sum: { total: true } 
    }).catch(() => ({ _sum: { total: 0 } }));
    
    const weekRevenueResult = await prisma.order.aggregate({ 
      where: { status: 'DELIVERED', createdAt: { gte: weekStart } }, 
      _sum: { total: true } 
    }).catch(() => ({ _sum: { total: 0 } }));

    const currentRevenue = monthRevenueResult._sum.total || 0;
    const todayRevenue = todayRevenueResult._sum.total || 0;
    const weekRevenue = weekRevenueResult._sum.total || 0;

    // Step 4: Calculate revenue growth
    const previousStartDate = new Date(startDate.getTime() - (endDate.getTime() - startDate.getTime()));
    const previousRevenueResult = await prisma.order.aggregate({
      where: { status: 'DELIVERED', createdAt: { gte: previousStartDate, lte: startDate } },
      _sum: { total: true },
    }).catch(() => ({ _sum: { total: 0 } }));
    
    const prevRevenue = previousRevenueResult._sum.total || 0;
    const revenueGrowth = prevRevenue > 0 ? parseFloat(((currentRevenue - prevRevenue) / prevRevenue * 100).toFixed(1)) : 0;

    // Step 5: Get recent orders
    const recentOrdersRaw = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        orderNumber: true,
        status: true,
        total: true,
        createdAt: true,
        customer: { select: { firstName: true, lastName: true } },
      },
    }).catch(() => []);

    const recentOrders = recentOrdersRaw.map(o => ({
      id: o.orderNumber || `ORD-${Date.now()}`,
      customer: `${o.customer?.firstName || ''} ${o.customer?.lastName || ''}`.trim() || 'Unknown',
      amount: o.total || 0,
      status: (o.status || 'pending').toLowerCase().replace(/_/g, ''),
      time: getTimeAgo(o.createdAt),
    }));

    // Step 6: Get delivered orders (with createdAt for charts)
    const deliveredOrders = await prisma.order.findMany({
      where: { status: 'DELIVERED', createdAt: { gte: startDate, lte: endDate } },
      select: {
        merchantId: true,
        total: true,
        createdAt: true,
        merchant: { select: { id: true, businessName: true, rating: true, category: true } },
      },
    }).catch(() => []);

    // Calculate merchant revenue
    const merchantMap = {};
    deliveredOrders.forEach(order => {
      const mid = order.merchantId;
      if (!merchantMap[mid]) {
        merchantMap[mid] = {
          id: mid,
          name: order.merchant?.businessName || 'Unknown',
          rating: order.merchant?.rating || 0,
          revenue: 0,
          orders: 0,
        };
      }
      merchantMap[mid].revenue += order.total || 0;
      merchantMap[mid].orders += 1;
    });

    // Get previous period for growth
    const prevDeliveredOrders = await prisma.order.findMany({
      where: { status: 'DELIVERED', createdAt: { gte: previousStartDate, lte: startDate } },
      select: { merchantId: true, total: true },
    }).catch(() => []);

    const prevMerchantMap = {};
    prevDeliveredOrders.forEach(o => {
      prevMerchantMap[o.merchantId] = (prevMerchantMap[o.merchantId] || 0) + (o.total || 0);
    });

    const topMerchants = Object.values(merchantMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
      .map(m => {
        const prev = prevMerchantMap[m.id] || 0;
        return {
          ...m,
          growth: prev > 0 ? Math.round((m.revenue - prev) / prev * 100) : 0,
        };
      });

    // Step 7: Build revenue chart data
    const revenueByDate = {};
    deliveredOrders.forEach(o => {
      try {
        const d = o.createdAt ? new Date(o.createdAt).toISOString().split('T')[0] : null;
        if (d) revenueByDate[d] = (revenueByDate[d] || 0) + (o.total || 0);
      } catch (e) { /* skip invalid dates */ }
    });
    
    let revenueChart = Object.entries(revenueByDate)
      .map(([name, revenue]) => ({ name: name.slice(5), revenue }))
      .sort((a, b) => a.name.localeCompare(b.name));

    // Fallback if no revenue data
    if (revenueChart.length === 0) {
      revenueChart = [
        { name: 'Mon', revenue: 0 }, { name: 'Tue', revenue: 0 }, { name: 'Wed', revenue: 0 },
        { name: 'Thu', revenue: 0 }, { name: 'Fri', revenue: 0 }, { name: 'Sat', revenue: 0 }, { name: 'Sun', revenue: 0 }
      ];
    }

    // Step 8: Build order status chart
    const allOrders = await prisma.order.findMany({
      where: { createdAt: { gte: startDate, lte: endDate } },
      select: { status: true, createdAt: true },
    }).catch(() => []);

    const statusByDate = {};
    allOrders.forEach(o => {
      try {
        const d = new Date(o.createdAt).toISOString().split('T')[0];
        if (!statusByDate[d]) statusByDate[d] = { name: d.slice(5), pending: 0, processing: 0, delivered: 0 };
        if (o.status === 'PENDING') statusByDate[d].pending++;
        else if (['CONFIRMED', 'PREPARING', 'READY', 'ASSIGNED', 'PICKED_UP', 'IN_TRANSIT'].includes(o.status)) statusByDate[d].processing++;
        else if (o.status === 'DELIVERED') statusByDate[d].delivered++;
      } catch (e) { /* skip */ }
    });

    let orderStatusChart = Object.values(statusByDate).sort((a, b) => a.name.localeCompare(b.name));
    if (orderStatusChart.length === 0) {
      orderStatusChart = [{ name: 'N/A', pending: 0, processing: 0, delivered: 0 }];
    }

    // Step 9: Build user growth chart
    const users = await prisma.user.findMany({
      where: { createdAt: { gte: startDate, lte: endDate } },
      select: { role: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    }).catch(() => []);

    const userGrowthMap = {};
    users.forEach(user => {
      try {
        const d = new Date(user.createdAt).toISOString().split('T')[0];
        if (!userGrowthMap[d]) userGrowthMap[d] = { name: d.slice(5), customers: 0, merchants: 0, riders: 0 };
        if (user.role === 'CUSTOMER') userGrowthMap[d].customers++;
        else if (user.role === 'MERCHANT') userGrowthMap[d].merchants++;
        else if (user.role === 'RIDER') userGrowthMap[d].riders++;
      } catch (e) { /* skip */ }
    });

    let userGrowthChart = Object.values(userGrowthMap).sort((a, b) => a.name.localeCompare(b.name));
    if (userGrowthChart.length === 0) {
      userGrowthChart = [{ name: 'W1', customers: 0, merchants: 0, riders: 0 }];
    }

    // Step 10: Build dynamic category chart from real data
    let categoryChart = [
      { name: 'Restaurant', value: 35 },
      { name: 'Retail', value: 25 },
      { name: 'Services', value: 20 },
      { name: 'Groceries', value: 15 },
      { name: 'Other', value: 5 },
    ];

    try {
      const categoryOrders = await prisma.order.findMany({
        where: { status: 'DELIVERED', createdAt: { gte: startDate, lte: endDate } },
        select: { total: true, merchant: { select: { category: true } } },
      });
      
      if (categoryOrders.length > 0) {
        const catMap = {};
        categoryOrders.forEach(o => {
          const cat = o.merchant?.category || 'Other';
          catMap[cat] = (catMap[cat] || 0) + (o.total || 0);
        });
        
        const totalCatRevenue = Object.values(catMap).reduce((sum, v) => sum + v, 0);
        const catChart = Object.entries(catMap)
          .map(([name, revenue]) => ({ 
            name, 
            value: totalCatRevenue > 0 ? Math.round((revenue / totalCatRevenue) * 100) : 0 
          }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 5);
        
        if (catChart.length > 0) categoryChart = catChart;
      }
    } catch (e) { /* use defaults */ }

    // Step 11: Calculate average delivery time
    let avgDeliveryTime = 30;
    try {
      const deliveredWithTimes = await prisma.order.findMany({
        where: { status: 'DELIVERED', deliveredAt: { not: null } },
        select: { createdAt: true, deliveredAt: true },
        take: 100,
        orderBy: { createdAt: 'desc' },
      });

      if (deliveredWithTimes.length > 0) {
        const deliveryTimes = deliveredWithTimes
          .map(o => {
            try {
              const created = new Date(o.createdAt).getTime();
              const delivered = new Date(o.deliveredAt).getTime();
              return delivered - created;
            } catch { return null; }
          })
          .filter(t => t !== null && t > 0 && t < 86400000);

        if (deliveryTimes.length > 0) {
          avgDeliveryTime = Math.round(deliveryTimes.reduce((a, b) => a + b, 0) / deliveryTimes.length / 60000);
        }
      }
    } catch (e) { /* use default */ }

    // Step 12: Get pending approvals count
    let pendingApprovals = 0;
    try {
      pendingApprovals = await prisma.merchant.count({ where: { status: { in: ['PENDING', 'PENDING_APPROVAL'] } } }).catch(() => 0);
    } catch (e) { /* use default */ }

    // Step 13: Get low stock products count
    let lowStockCount = 0;
    try {
      lowStockCount = await prisma.product.count({ where: { stock: { lte: 5 }, isActive: true } }).catch(() => 0);
    } catch (e) { /* use default */ }

    // Step 14: Build activities
    const activities = [];
    recentOrders.slice(0, 3).forEach((o, i) => {
      activities.push({
        id: `order-${i}`,
        type: 'order',
        action: `Order ${o.id} received`,
        user: o.customer || 'Unknown',
        time: o.time,
      });
    });
    topMerchants.slice(0, 3).forEach((m, i) => {
      activities.push({
        id: `merchant-${i}`,
        type: 'merchant',
        action: `${m.name} generating revenue`,
        user: `ETB ${m.revenue.toLocaleString()}`,
        time: 'Recent',
      });
    });

    if (activities.length === 0) {
      activities.push({
        id: 'system-1',
        type: 'system',
        action: 'Dashboard loaded',
        user: 'System',
        time: 'Just now',
      });
    }

    // Step 15: Build complete response
    const response = {
      revenue: {
        today: todayRevenue,
        week: weekRevenue,
        month: currentRevenue,
        growth: revenueGrowth,
      },
      orders: {
        total: totalOrders,
        pending: pendingOrders,
        processing: deliveringOrders,
        delivered: deliveredOrdersCount,
        cancelled: cancelledOrders,
      },
      users: {
        total: totalUsers,
        active: activeUsers,
        new: newUsersToday,
        merchants: totalMerchants,
        riders: totalRiders,
      },
      performance: {
        avgDeliveryTime: avgDeliveryTime,
        onTimeRate: 94.2,
        satisfaction: 4.6,
        conversionRate: 3.2,
      },
      revenueChart,
      orderStatusChart,
      userGrowthChart,
      categoryChart,
      recentOrders,
      topMerchants,
      recentActivities: activities,
      // Extra stats for quick cards
      pendingApprovals,
      lowStockCount,
      systemHealth: '98.5%',
      activeOrdersNow: pendingOrders + deliveringOrders,
      todayOrders: await prisma.order.count({ where: { createdAt: { gte: todayStart } } }).catch(() => 0),
    };

    console.log('✅ Dashboard data fetched successfully');
    res.json(response);
  } catch (error) {
    console.error('❌ Dashboard error:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ 
      error: 'Failed to fetch dashboard data',
      message: error.message 
    });
  }
});

// Helper function
function getTimeAgo(date) {
  if (!date) return 'Unknown';
  try {
    const now = new Date();
    const targetDate = new Date(date);
    const diff = Math.floor((now.getTime() - targetDate.getTime()) / 1000);
    if (diff < 0) return 'Just now';
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return targetDate.toLocaleDateString();
  } catch (e) {
    return 'Unknown';
  }
}


// ============================================
// AUDIT LOG API
// ============================================

// Get all activity logs with filtering and pagination
app.get('/api/audit-logs', async (req, res) => {
  try {
    const { 
      page = '1', 
      limit = '50', 
      action, 
      entity, 
      userId, 
      startDate, 
      endDate,
      search,
      status 
    } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);
    
    // Build where clause
    const where = {};
    
    if (action) where.action = { contains: action, mode: 'insensitive' };
    if (entity) where.entity = entity;
    if (userId) where.userId = userId;
    if (status) where.status = status;
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }
    
    if (search) {
      where.OR = [
        { action: { contains: search, mode: 'insensitive' } },
        { entity: { contains: search, mode: 'insensitive' } },
        { entityId: { contains: search, mode: 'insensitive' } },
        { details: { contains: search, mode: 'insensitive' } },
        { ipAddress: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    // Get total count for pagination
    const total = await prisma.activityLog.count({ where });
    
    // Get logs
    const logs = await prisma.activityLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    });
    
    // Get unique actions, entities, and statuses for filters
    const [uniqueActions, uniqueEntities, uniqueStatuses] = await Promise.all([
      prisma.activityLog.findMany({
        select: { action: true },
        distinct: ['action'],
        orderBy: { action: 'asc' },
      }),
      prisma.activityLog.findMany({
        select: { entity: true },
        distinct: ['entity'],
        where: { entity: { not: null } },
        orderBy: { entity: 'asc' },
      }),
      prisma.activityLog.findMany({
        select: { status: true },
        distinct: ['status'],
        where: { status: { not: null } },
        orderBy: { status: 'asc' },
      }),
    ]);
    
    // Get stats
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    const [todayCount, weekCount, totalActions] = await Promise.all([
      prisma.activityLog.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.activityLog.count({ 
        where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } 
      }),
      prisma.activityLog.count(),
    ]);
    
    // Get top users by activity
    const topUsers = await prisma.activityLog.groupBy({
      by: ['userId'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    });
    
    const userIds = topUsers.map(u => u.userId).filter(Boolean);
    const users = userIds.length > 0 ? await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, username: true, firstName: true, lastName: true },
    }) : [];
    
    const topUsersData = topUsers.map(u => {
      const user = users.find(us => us.id === u.userId);
      return {
        userId: u.userId,
        username: user?.username || 'System',
        name: user ? `${user.firstName} ${user.lastName}` : 'System',
        count: u._count.id,
      };
    });
    
    // Get hourly activity for today
    const hourlyActivity = [];
    for (let i = 0; i < 24; i++) {
      const hourStart = new Date(todayStart);
      hourStart.setHours(i, 0, 0, 0);
      const hourEnd = new Date(todayStart);
      hourEnd.setHours(i + 1, 0, 0, 0);
      
      const count = await prisma.activityLog.count({
        where: { createdAt: { gte: hourStart, lt: hourEnd } },
      });
      
      hourlyActivity.push({
        hour: `${i.toString().padStart(2, '0')}:00`,
        count,
      });
    }
    
    res.json({
      logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
      filters: {
        actions: uniqueActions.map(a => a.action),
        entities: uniqueEntities.map(e => e.entity).filter(Boolean),
        statuses: uniqueStatuses.map(s => s.status).filter(Boolean),
      },
      stats: {
        today: todayCount,
        week: weekCount,
        total: totalActions,
      },
      topUsers: topUsersData,
      hourlyActivity,
    });
  } catch (error) {
    console.error('❌ Error fetching audit logs:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single log entry
app.get('/api/audit-logs/:id', async (req, res) => {
  try {
    const log = await prisma.activityLog.findUnique({
      where: { id: req.params.id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          }
        }
      }
    });
    
    if (!log) return res.status(404).json({ error: 'Log entry not found' });
    res.json(log);
  } catch (error) {
    console.error('❌ Error fetching log:', error);
    res.status(500).json({ error: error.message });
  }
});

// Export audit logs
app.get('/api/audit-logs/export', async (req, res) => {
  try {
    const { startDate, endDate, format = 'json' } = req.query;
    
    const where = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }
    
    const logs = await prisma.activityLog.findMany({
      where,
      include: {
        user: {
          select: { username: true, firstName: true, lastName: true, email: true },
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10000, // Limit export to 10000 records
    });
    
    if (format === 'csv') {
      let csv = 'ID,Action,Entity,Entity ID,User,Details,IP Address,Status,Date\n';
      logs.forEach(log => {
        const username = log.user?.username || 'System';
        const details = log.details ? log.details.replace(/"/g, '""') : '';
        csv += `${log.id},"${log.action}","${log.entity || ''}","${log.entityId || ''}","${username}","${details}","${log.ipAddress || ''}","${log.status || ''}","${new Date(log.createdAt).toISOString()}"\n`;
      });
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=audit-logs-${new Date().toISOString().split('T')[0]}.csv`);
      return res.send(csv);
    }
    
    res.json({ logs, exportedAt: new Date().toISOString(), count: logs.length });
  } catch (error) {
    console.error('❌ Error exporting logs:', error);
    res.status(500).json({ error: error.message });
  }
});

// Clear old logs
app.delete('/api/audit-logs/clear', async (req, res) => {
  try {
    const { before } = req.query; // Date string - delete logs before this date
    
    if (!before) {
      return res.status(400).json({ error: 'Please provide a "before" date parameter' });
    }
    
    const result = await prisma.activityLog.deleteMany({
      where: { createdAt: { lt: new Date(before) } },
    });
    
    console.log(`✅ Deleted ${result.count} old audit logs`);
    res.json({ success: true, deleted: result.count });
  } catch (error) {
    console.error('❌ Error clearing logs:', error);
    res.status(500).json({ error: error.message });
  }
});

// Change password
app.post('/api/auth/change-password', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });
    
    // Extract user ID from token (simplified - in production use proper JWT verification)
    const userId = token.replace('mock-token-', '');
    
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password are required' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }
    
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const validPassword = await bcrypt.compare(currentPassword, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
    
    console.log(`✅ Password changed for user ${userId}`);
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('❌ Error changing password:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// PROMOTION API
// ============================================

// Get all promotions
app.get('/api/promotions', async (req, res) => {
  try {
    const { status, type } = req.query;
    const where = {};
    if (type) where.type = type;
    
    const promotions = await prisma.promotion.findMany({
      where,
      include: {
        merchant: { select: { id: true, businessName: true, logo: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(promotions);
  } catch (error) {
    console.error('Error fetching promotions:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get active promotions for customer app
app.get('/api/promotions/active', async (req, res) => {
  try {
    const now = new Date();
    const promotions = await prisma.promotion.findMany({
      where: {
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      include: {
        merchant: { select: { id: true, businessName: true, logo: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(promotions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create promotion
app.post('/api/promotions', async (req, res) => {
  try {
    const { name, description, type, value, minOrder, maxDiscount, applicableTo, code, image, terms, startDate, endDate, usageLimit, perUserLimit, merchantId, isActive } = req.body;
    
    if (!name || !type || !value || !startDate || !endDate) {
      return res.status(400).json({ error: 'Name, type, value, start date and end date are required' });
    }
    
    const promotion = await prisma.promotion.create({
      data: {
        name, description, type,
        value: parseFloat(value),
        minOrder: minOrder ? parseFloat(minOrder) : null,
        maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
        applicableTo: applicableTo || 'ALL',
        code: code || null,
        image: image || null,
        terms: terms || null,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        usageLimit: usageLimit ? parseInt(usageLimit) : null,
        perUserLimit: perUserLimit ? parseInt(perUserLimit) : 1,
        merchantId: merchantId || null,
        isActive: isActive !== undefined ? isActive : true,
      }
    });
    
    io.emit('notification', { type: 'promotion', title: '🎉 New Promotion!', message: `${name} - Check it out!` });
    console.log('✅ Promotion created:', promotion.id);
    res.json(promotion);
  } catch (error) {
    console.error('Error creating promotion:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update promotion
app.put('/api/promotions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    delete updateData.id;
    delete updateData.createdAt;
    delete updateData.updatedAt;
    delete updateData.merchant;
    
    if (updateData.startDate) updateData.startDate = new Date(updateData.startDate);
    if (updateData.endDate) updateData.endDate = new Date(updateData.endDate);
    if (updateData.value) updateData.value = parseFloat(updateData.value);
    
    const promotion = await prisma.promotion.update({ where: { id }, data: updateData });
    console.log('✅ Promotion updated:', id);
    res.json(promotion);
  } catch (error) {
    console.error('Error updating promotion:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete promotion
app.delete('/api/promotions/:id', async (req, res) => {
  try {
    await prisma.promotion.delete({ where: { id: req.params.id } });
    console.log('✅ Promotion deleted:', req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting promotion:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// LOCATION & MAP API
// ============================================

// Get all active rider locations for live map
app.get('/api/locations/riders', async (req, res) => {
  try {
    const riders = await prisma.riderProfile.findMany({
      where: {
        status: { in: ['ONLINE', 'BUSY', 'ON_DELIVERY'] },
        currentLat: { not: null },
        currentLng: { not: null },
      },
      select: {
        id: true,
        userId: true,
        fullName: true,
        phone: true,
        vehicleType: true,
        vehiclePlate: true,
        status: true,
        currentLat: true,
        currentLng: true,
        lastLocationUpdate: true,
        rating: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
            phone: true,
          }
        }
      },
      orderBy: { lastLocationUpdate: 'desc' },
    });
    
    console.log(`📍 Fetched ${riders.length} active rider locations`);
    res.json(riders);
  } catch (error) {
    console.error('Error fetching rider locations:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update rider location (called by rider app)
app.patch('/api/riders/:id/location', async (req, res) => {
  try {
    const { id } = req.params;
    const { lat, lng } = req.body;
    
    if (lat === undefined || lng === undefined) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }
    
    const rider = await prisma.riderProfile.update({
      where: { id },
      data: {
        currentLat: parseFloat(lat),
        currentLng: parseFloat(lng),
        lastLocationUpdate: new Date(),
      }
    });
    
    res.json(rider);
  } catch (error) {
    console.error('Error updating location:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get order tracking info (for customer app)
app.get('/api/orders/:id/tracking', async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        deliveryAddress: true,
        deliveryLat: true,
        deliveryLng: true,
        estimatedDelivery: true,
        rider: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            riderProfile: {
              select: {
                id: true,
                currentLat: true,
                currentLng: true,
                lastLocationUpdate: true,
                vehicleType: true,
                vehiclePlate: true,
                status: true,
              }
            }
          }
        },
        merchant: {
          select: {
            id: true,
            businessName: true,
            address: true,
            latitude: true,
            longitude: true,
            businessPhone: true,
          }
        }
      }
    });
    
    if (!order) return res.status(404).json({ error: 'Order not found' });
    
    res.json({
      ...order,
      riderLocation: order.rider?.riderProfile ? {
        lat: order.rider.riderProfile.currentLat,
        lng: order.rider.riderProfile.currentLng,
        updatedAt: order.rider.riderProfile.lastLocationUpdate,
      } : null,
      merchantLocation: {
        lat: order.merchant?.latitude || 9.0320,
        lng: order.merchant?.longitude || 38.7469,
        address: order.merchant?.address || 'Addis Ababa',
      },
      customerLocation: {
        lat: order.deliveryLat || 9.0320,
        lng: order.deliveryLng || 38.7469,
        address: typeof order.deliveryAddress === 'string' ? 
          JSON.parse(order.deliveryAddress)?.address : 'Customer Location',
      }
    });
  } catch (error) {
    console.error('Error fetching order tracking:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// REPORTS API (ENHANCED)
// ============================================

// Get sales report
app.get('/api/reports/sales', async (req, res) => {
  try {
    const { startDate, endDate, merchantId } = req.query;
    const where = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }
    if (merchantId) where.merchantId = merchantId;

    const orders = await prisma.order.findMany({
      where,
      include: {
        merchant: { select: { id: true, businessName: true, category: true } },
        customer: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalRevenue = orders.reduce((sum, o) => sum + (o.status === 'DELIVERED' ? o.total : 0), 0);
    const totalOrders = orders.length;
    const deliveredOrders = orders.filter(o => o.status === 'DELIVERED').length;
    const cancelledOrders = orders.filter(o => o.status === 'CANCELLED').length;
    const pendingOrders = orders.filter(o => o.status === 'PENDING').length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / deliveredOrders : 0;

    // Daily breakdown
    const dailyData = {};
    orders.forEach(order => {
      const date = new Date(order.createdAt).toISOString().split('T')[0];
      if (!dailyData[date]) dailyData[date] = { date, orders: 0, revenue: 0, delivered: 0, cancelled: 0 };
      dailyData[date].orders++;
      if (order.status === 'DELIVERED') {
        dailyData[date].revenue += order.total;
        dailyData[date].delivered++;
      }
      if (order.status === 'CANCELLED') dailyData[date].cancelled++;
    });

    // Payment method breakdown
    const paymentMethods = {};
    orders.forEach(order => {
      const method = order.paymentMethod || 'CASH';
      paymentMethods[method] = (paymentMethods[method] || 0) + 1;
    });

    // Merchant breakdown
    const merchantBreakdown = {};
    orders.forEach(order => {
      const mid = order.merchantId;
      if (!merchantBreakdown[mid]) {
        merchantBreakdown[mid] = {
          merchantId: mid,
          merchantName: order.merchant?.businessName || 'Unknown',
          category: order.merchant?.category || 'N/A',
          orders: 0,
          revenue: 0,
          delivered: 0,
          cancelled: 0,
        };
      }
      merchantBreakdown[mid].orders++;
      if (order.status === 'DELIVERED') {
        merchantBreakdown[mid].revenue += order.total;
        merchantBreakdown[mid].delivered++;
      }
      if (order.status === 'CANCELLED') merchantBreakdown[mid].cancelled++;
    });

    res.json({
      summary: {
        totalRevenue,
        totalOrders,
        deliveredOrders,
        cancelledOrders,
        pendingOrders,
        averageOrderValue,
        period: { startDate, endDate },
      },
      daily: Object.values(dailyData).sort((a, b) => a.date.localeCompare(b.date)),
      paymentMethods: Object.entries(paymentMethods).map(([method, count]) => ({ method, count })),
      merchants: Object.values(merchantBreakdown).sort((a, b) => b.revenue - a.revenue),
      orders: orders.slice(0, 50),
    });
  } catch (error) {
    console.error('Error generating sales report:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get merchant activity report
app.get('/api/reports/merchant-activity', async (req, res) => {
  try {
    const { startDate, endDate, merchantId } = req.query;
    const where = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }
    if (merchantId) where.merchantId = merchantId;

    const merchants = await prisma.merchant.findMany({
      where: merchantId ? { id: merchantId } : {},
      select: {
        id: true,
        businessName: true,
        category: true,
        status: true,
        rating: true,
        totalOrders: true,
        totalRevenue: true,
        createdAt: true,
        products: { select: { id: true, name: true, price: true, stock: true, totalSold: true } },
        orders: {
          where,
          select: { id: true, orderNumber: true, status: true, total: true, createdAt: true, paymentMethod: true },
          orderBy: { createdAt: 'desc' },
          take: 100,
        },
      },
    });

    const report = merchants.map(m => {
      const monthlyOrders = m.orders.filter(o => {
        const d = new Date(o.createdAt);
        return d >= (startDate ? new Date(startDate) : new Date(0));
      });
      return {
        id: m.id,
        businessName: m.businessName,
        category: m.category,
        status: m.status,
        rating: m.rating,
        totalProducts: m.products.length,
        totalStock: m.products.reduce((s, p) => s + p.stock, 0),
        periodOrders: monthlyOrders.length,
        periodRevenue: monthlyOrders.filter(o => o.status === 'DELIVERED').reduce((s, o) => s + o.total, 0),
        topProducts: m.products.sort((a, b) => (b.totalSold || 0) - (a.totalSold || 0)).slice(0, 5),
        recentOrders: m.orders.slice(0, 10),
      };
    });

    res.json(report);
  } catch (error) {
    console.error('Error generating merchant report:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get rider performance report
app.get('/api/reports/rider-performance', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const where = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const riders = await prisma.riderProfile.findMany({
      include: {
        user: { select: { firstName: true, lastName: true, phone: true } },
      },
    });

    const report = await Promise.all(riders.map(async (rider) => {
      const completedOrders = await prisma.order.count({
        where: { ...where, riderId: rider.userId, status: 'DELIVERED' },
      });
      const earnings = await prisma.order.aggregate({
        where: { ...where, riderId: rider.userId, status: 'DELIVERED' },
        _sum: { deliveryFee: true },
      });
      const totalOrders = await prisma.order.count({
        where: { ...where, riderId: rider.userId },
      });

      return {
        id: rider.id,
        name: `${rider.user?.firstName || ''} ${rider.user?.lastName || ''}`,
        phone: rider.phone || rider.user?.phone,
        vehicleType: rider.vehicleType,
        status: rider.status,
        rating: rider.rating,
        completedOrders,
        totalOrders,
        completionRate: totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0,
        totalEarnings: earnings._sum.deliveryFee || 0,
      };
    }));

    res.json(report.sort((a, b) => b.completedOrders - a.completedOrders));
  } catch (error) {
    console.error('Error generating rider report:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get payment summary report
app.get('/api/reports/payments', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const where = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const orders = await prisma.order.findMany({
      where,
      select: { total: true, paymentMethod: true, paymentStatus: true, deliveryFee: true, subtotal: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });

    const totalRevenue = orders.filter(o => o.paymentStatus === 'PAID').reduce((s, o) => s + o.total, 0);
    const totalPending = orders.filter(o => o.paymentStatus === 'PENDING').reduce((s, o) => s + o.total, 0);
    const totalFailed = orders.filter(o => o.paymentStatus === 'FAILED').reduce((s, o) => s + o.total, 0);

    const methodBreakdown = {};
    orders.forEach(o => {
      const m = o.paymentMethod || 'CASH';
      if (!methodBreakdown[m]) methodBreakdown[m] = { count: 0, revenue: 0 };
      methodBreakdown[m].count++;
      if (o.paymentStatus === 'PAID') methodBreakdown[m].revenue += o.total;
    });

    const dailyRevenue = {};
    orders.filter(o => o.paymentStatus === 'PAID').forEach(o => {
      const d = new Date(o.createdAt).toISOString().split('T')[0];
      dailyRevenue[d] = (dailyRevenue[d] || 0) + o.total;
    });

    res.json({
      summary: { totalRevenue, totalPending, totalFailed, totalOrders: orders.length },
      paymentMethods: Object.entries(methodBreakdown).map(([method, data]) => ({ method, ...data })),
      dailyRevenue: Object.entries(dailyRevenue).map(([date, revenue]) => ({ date, revenue })).sort((a, b) => a.date.localeCompare(b.date)),
    });
  } catch (error) {
    console.error('Error generating payment report:', error);
    res.status(500).json({ error: error.message });
  }
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
  console.log('   POST   /api/auth/google');
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
  console.log('   GET    /api/admin/dashboard');
  console.log('   GET    /api/reports/sales');
  console.log('   GET    /api/settings');
  console.log('   POST   /api/settings');
  console.log('   GET    /api/health');
  console.log('\n✨ All APIs are now ready!\n');
});