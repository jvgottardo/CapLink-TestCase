import express from 'express';
import { authenticate } from '../middlewares/auth.js';
import { orderController } from '../controllers/orderController.js';


const router = express.Router();

// Rotas autenticadas
router.post('/checkout', authenticate, orderController.checkout);
router.get('/getOrders', authenticate, orderController.getOrders);
router.get('/getOrderDetails/:orderId', authenticate, orderController.getOrderDetails);


export default router;