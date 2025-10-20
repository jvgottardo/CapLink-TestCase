import express from 'express';
import { productController } from '../controllers/productController.js';
import { authenticate } from '../middlewares/auth.js';
import { upload } from '../middlewares/upload.js';
import { uploadCSV } from '../middlewares/importCSV.js';

const router = express.Router();

// Rotas públicas
router.get('/getProducts', productController.getProducts);
router.get('/getProductsActive', productController.getProductsActive);
router.get('/getProductById/:product_id', productController.getProductById);

// Rotas protegidas
router.get('/getProductsByUser', authenticate, productController.getProductsByUser);
router.post('/importProducts', authenticate, uploadCSV.single("file"), productController.addProductsViaCSV);
router.post('/addProduct', authenticate, upload.single("image"), productController.addProduct);
router.put('/editProduct/:product_id', authenticate, upload.single("image_url"), productController.editProduct);
router.put('/deactivateProduct/', authenticate, productController.deactivateProduct);
router.put('/activateProduct/', authenticate, productController.activateProduct);
router.delete('/deleteProduct', authenticate, productController.deleteProduct);



export default router;