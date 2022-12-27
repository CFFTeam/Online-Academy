import express from 'express';
import * as homeController from '../controllers/homeController.js';
const router = express.Router();

router.get('/', homeController.homePage);
// router.get('/:category/:subcategory', homeController.aboutPage);
router.get('/courses', homeController.coursesPage);

export default router;