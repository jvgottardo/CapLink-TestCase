import express from 'express';
import userRoutes from './userRoutes.js';
import ProductRoutes from './productRoutes.js';
import favoriteRoutes from './favoriteRoutes.js';
import cartRoutes from './cartRoutes.js';
import orderRoutes from './orderRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';

const router = express.Router();

router.use('/auth', userRoutes); 
router.use('/product', ProductRoutes); 
router.use('/favorite', favoriteRoutes);
router.use('/cart', cartRoutes);
router.use('/order', orderRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;
