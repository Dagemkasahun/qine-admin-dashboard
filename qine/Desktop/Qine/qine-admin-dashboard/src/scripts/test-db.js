// src/scripts/test-db.js
import prisma from '../services/db.js';

async function main() {
  console.log('🌱 Seeding database...');

  // Create a test merchant
  const merchant = await prisma.merchant.create({
    data: {
      name: 'ABC International School',
      type: 'service',
      category: 'Education',
      description: 'Providing quality education since 1995',
      phone: '+251911223344',
      email: 'info@abcschool.edu.et',
      address: 'Bole Sub-city, Addis Ababa',
      status: 'active',
      configuration: {
        hasBooking: true,
        hasGallery: true,
        hasReviews: true
      }
    }
  });
  
  console.log('✅ Created merchant:', merchant);

  // Create a product merchant
  const honeyShop = await prisma.merchant.create({
    data: {
      name: 'Pure Honey Ethiopia',
      type: 'product',
      category: 'Food & Beverages',
      description: '100% natural honey from the highlands',
      phone: '+251922334455',
      email: 'order@purehoney.et',
      address: 'Merkato, Addis Ababa',
      status: 'active',
      configuration: {
        hasProducts: true,
        hasDelivery: true,
        hasPayment: true
      },
      products: {
        create: [
          {
            name: 'White Honey - 500g',
            price: 350,
            stock: 45,
            description: 'Pure white honey from Tigray highlands'
          },
          {
            name: 'Forest Honey - 1kg',
            price: 600,
            stock: 30
          },
          {
            name: 'Bee Wax - 250g',
            price: 200,
            stock: 60
          }
        ]
      }
    }
  });
  
  console.log('✅ Created honey shop with products');

  // Read all merchants
  const allMerchants = await prisma.merchant.findMany({
    include: {
      products: true
    }
  });
  
  console.log('\n📋 All merchants in database:');
  console.log(JSON.stringify(allMerchants, null, 2));
}

main()
  .catch(e => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });