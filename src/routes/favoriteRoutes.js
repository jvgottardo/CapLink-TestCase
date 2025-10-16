import express from 'express';
import { favoriteController } from '../controllers/favoriteController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

// Rotas autenticadas
router.get('/getFavorites', authenticate, favoriteController.getFavorites);
router.post('/addFavorite', authenticate, favoriteController.addFavorite);
router.delete('/removeFavorite', authenticate, favoriteController.removeFavorite);


export default router;