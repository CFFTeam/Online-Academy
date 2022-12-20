import express from 'express';
import * as homeController from '../controllers/homeController.js';
const router = express.Router();

router.get('/', homeController.homePage);

export default router;