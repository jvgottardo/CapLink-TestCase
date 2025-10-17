import express from 'express';
import { userController } from '../controllers/userController.js';
import { authenticate } from '../middlewares/auth.js';


const router = express.Router();

// Rotas públicas
router.post('/signup', userController.signup);
router.post('/login', userController.login);

// Rotas protegidas
router.get('/profile', authenticate, userController.getProfile);
router.put('/editProfileUser', authenticate, userController.editProfile);
router.delete('/deleteProfileUser', authenticate, userController.deleteProfile);
router.put('/reactiveUser', authenticate, userController.reactiveUser);


export default router;
