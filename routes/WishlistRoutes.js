import express from 'express';
import * as wishlistController from '../controllers/wishlistController.js';
const router = express.Router();

router.get('/', wishlistController.wishlistPage);

export default router;