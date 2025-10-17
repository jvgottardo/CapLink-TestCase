import express from 'express';
import { dashboardController } from '../controllers/dashboardController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

// Rotas autenticadas
router.get('/vendor/:vendor_id', authenticate, dashboardController.getVendorDashboard);


export default router;