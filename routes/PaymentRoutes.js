import express from 'express';
import * as paymentController from '../controllers/paymentController.js';
const router = express.Router();

router.get('/', paymentController.shoppingCartPage);
router.post('/', paymentController.updateShoppingCart);

export default router;