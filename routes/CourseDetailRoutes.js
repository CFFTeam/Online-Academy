import express from "express";
import * as courseDetailController from "../controllers/courseDetailController.js";
import * as learningController from "../controllers/learningController.js";
const router = express.Router();

router.get("/:slug", courseDetailController.renderCourseDetail);
router.get("/:slug_course_name/learn/lecture/:slug_lesson_name", learningController.watchingCourse);

export default router;

