// server.js
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();
const PORT = 5001; // Make sure this matches your running server

app.use(cors());
app.use(express.json());

// ============================================
// MERCHANT API ROUTES
// ============================================

// Get all merchants
app.get('/api/merchants', async (req, res) => {
  try {
    const merchants = await prisma.merchant.findMany({
      include: {
        products: true // Only include products since they exist in schema
      }
    });
    res.json(merchants);
  } catch (error) {
    console.error('Error fetching merchants:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single merchant by ID - REMOVE the problematic includes
app.get('/api/merchants/:id', async (req, res) => {
  try {
    const merchant = await prisma.merchant.findUnique({
      where: { id: req.params.id },
      include: { 
        products: true // Only include products since they exist
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

// Create new merchant
app.post('/api/merchants', async (req, res) => {
  try {
    const merchant = await prisma.merchant.create({
      data: {
        id: req.body.id || undefined,
        name: req.body.name,
        type: req.body.type,
        category: req.body.category,
        description: req.body.description,
        phone: req.body.phone,
        email: req.body.email,
        address: req.body.address,
        logo: req.body.logo,
        coverImage: req.body.coverImage,
        status: req.body.status || 'pending',
        rating: req.body.rating || 0,
        totalOrders: req.body.totalOrders || 0,
        totalRevenue: req.body.totalRevenue || 0,
        configuration: req.body.configuration ? JSON.stringify(req.body.configuration) : '{}'
      }
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
        ...req.body,
        configuration: req.body.configuration ? JSON.stringify(req.body.configuration) : undefined
      }
    });
    res.json(merchant);
  } catch (error) {
    console.error('Error updating merchant:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete merchant
app.delete('/api/merchants/:id', async (req, res) => {
  try {
    await prisma.merchant.delete({
      where: { id: req.params.id }
    });
    res.json({ message: 'Merchant deleted successfully' });
  } catch (error) {
    console.error('Error deleting merchant:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// PRODUCT API ROUTES
// ============================================

// Get all products for a merchant
app.get('/api/merchants/:merchantId/products', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { merchantId: req.params.merchantId }
    });
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create product
app.post('/api/merchants/:merchantId/products', async (req, res) => {
  try {
    const product = await prisma.product.create({
      data: {
        ...req.body,
        merchantId: req.params.merchantId
      }
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
      data: req.body
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

// ============================================
// SEED DATABASE WITH SAMPLE DATA
// ============================================
app.post('/api/seed', async (req, res) => {
  try {
    // Clear existing data
    await prisma.product.deleteMany({});
    await prisma.merchant.deleteMany({});

    // Create sample merchants
    const honeyShop = await prisma.merchant.create({
      data: {
        id: 'honey_1',
        name: 'Pure Honey Ethiopia',
        type: 'product',
        category: 'Food & Beverages',
        description: '100% natural honey from the highlands',
        phone: '+251922334455',
        email: 'order@purehoney.et',
        address: 'Merkato, Addis Ababa',
        status: 'active',
        rating: 4.5,
        configuration: JSON.stringify({
          hasProducts: true,
          hasInventory: true,
          hasDelivery: true
        })
      }
    });

    // Add products for honey shop
    await prisma.product.createMany({
      data: [
        {
          id: 'p1',
          merchantId: 'honey_1',
          name: 'White Honey - 500g',
          price: 350,
          stock: 45,
          description: 'Pure white honey from Tigray highlands',
          sku: 'HNY-001'
        },
        {
          id: 'p2',
          merchantId: 'honey_1',
          name: 'Forest Honey - 1kg',
          price: 600,
          stock: 30,
          description: 'Rich forest honey from Oromia',
          sku: 'HNY-002'
        },
        {
          id: 'p3',
          merchantId: 'honey_1',
          name: 'Bee Wax - 250g',
          price: 200,
          stock: 60,
          description: 'Natural beeswax for various uses',
          sku: 'WAX-001'
        }
      ]
    });

    const restaurant = await prisma.merchant.create({
      data: {
        id: 'restaurant_1',
        name: 'Taste of Ethiopia',
        type: 'restaurant',
        category: 'Restaurant',
        description: 'Authentic Ethiopian cuisine',
        phone: '+251933445566',
        email: 'info@tasteofethiopia.com',
        address: 'Bole Atlas, Addis Ababa',
        status: 'active',
        rating: 4.8,
        configuration: JSON.stringify({
          hasMenu: true,
          hasBooking: true,
          hasDelivery: true
        })
      }
    });

    const school = await prisma.merchant.create({
      data: {
        id: 'school_1',
        name: 'ABC International School',
        type: 'service',
        category: 'Education',
        description: 'Providing quality education since 1995',
        phone: '+251911223344',
        email: 'info@abcschool.edu.et',
        address: 'Bole Sub-city, Addis Ababa',
        status: 'active',
        rating: 4.2,
        configuration: JSON.stringify({
          hasBooking: true,
          hasGallery: true,
          hasReviews: true
        })
      }
    });

    res.json({ 
      message: 'Database seeded successfully',
      merchants: [honeyShop, restaurant, school]
    });
  } catch (error) {
    console.error('Error seeding database:', error);
    res.status(500).json({ error: error.message });
  }
});

// List all endpoints
app.get('/', (req, res) => {
  res.json({
    message: 'QINE API Server',
    endpoints: {
      merchants: {
        getAll: 'GET /api/merchants',
        getOne: 'GET /api/merchants/:id',
        create: 'POST /api/merchants',
        update: 'PUT /api/merchants/:id',
        delete: 'DELETE /api/merchants/:id'
      },
      products: {
        getAll: 'GET /api/merchants/:merchantId/products',
        create: 'POST /api/merchants/:merchantId/products',
        update: 'PUT /api/products/:id',
        delete: 'DELETE /api/products/:id'
      },
      seed: 'POST /api/seed'
    },
    server: `Running on port ${PORT}`
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log('📝 API endpoints:');
  console.log(`   GET    http://localhost:${PORT}/api/merchants`);
  console.log(`   POST   http://localhost:${PORT}/api/merchants`);
  console.log(`   GET    http://localhost:${PORT}/api/merchants/:id`);
  console.log(`   POST   http://localhost:${PORT}/api/seed`);
});