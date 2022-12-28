import express from 'express';
import * as coursesController from '../controllers/coursesController.js';
const router = express.Router();

router.get('/', coursesController.coursesPage);
router.get('/:category/:subcategory?', coursesController.categoryCoursePage);

export default router;