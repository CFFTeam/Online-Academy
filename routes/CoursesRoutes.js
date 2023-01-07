import express from 'express';
import * as coursesController from '../controllers/coursesController.js';
const router = express.Router();

router.get('/:category?/:subcategory?', coursesController.load_my_courses, coursesController.loadMyWishCourse, coursesController.loadCategory, coursesController.loadSearch, coursesController.coursesPage);

export default router;