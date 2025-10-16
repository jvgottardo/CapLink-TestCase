import express from 'express';
import { authenticate } from '../middlewares/auth.js';
import { cartController } from '../controllers/cartController.js';

const router = express.Router();

// Rotas autenticadas
router.get('/getCart', authenticate, cartController.getCart);
router.post('/addProductCart', authenticate,cartController.addProductCart);
router.delete('/removeProductCart', authenticate, cartController.removeProductCart);
router.delete('/removeQuantityProductCart', authenticate, cartController.removeQuantityProductCart);


export default router;