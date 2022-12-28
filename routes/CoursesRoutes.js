import express from 'express';
import * as coursesController from '../controllers/coursesController.js';
const router = express.Router();

router.get('/:category?/:subcategory?', coursesController.loadCategory, coursesController.coursesPage);

export default router;