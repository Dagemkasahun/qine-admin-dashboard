// src/scripts/syncDatabase.js
import sequelize from '../config/database.js';
import '../models/index.js'; // Import all models

const syncDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    // Sync all models
    // force: true will drop tables and recreate them (use only in development)
    await sequelize.sync({ force: true });
    console.log('✅ All models synchronized successfully.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    process.exit(1);
  }
};

syncDatabase();