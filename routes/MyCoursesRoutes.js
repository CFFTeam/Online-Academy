import express from 'express';
import * as myCoursesController from '../controllers/myCoursesController.js';
const router = express.Router();

router.get('/', myCoursesController.myCoursesPage);

export default router;