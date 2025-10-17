import express from 'express';
import { authenticate } from '../middlewares/auth.js';
import { dashboardController } from '../controllers/dashboardController.js';

const router = express.Router();

// Rotas autenticadas
router.get('/vendor/vendor_id', authenticate, dashboardController.getVendorDashboard);


export default router;