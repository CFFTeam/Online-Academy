import express from 'express';
import * as homeController from '../controllers/homeController.js';
const router = express.Router();

router.get('/', homeController.load_my_courses, homeController.loadMyWishCourse, homeController.homePage);

export default router;