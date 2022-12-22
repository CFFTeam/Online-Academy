import express from 'express';
import * as paymentController from '../controllers/paymentController.js';
const router = express.Router();

router.get('/shopping-cart', paymentController.shoppingCartPage);

export default router;