// src/services/db.js
import { PrismaClient } from '@prisma/client';

// Create a single Prisma instance to reuse across the app
const prisma = new PrismaClient();

export default prisma;