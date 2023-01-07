import express from "express";
import * as courseDetailController from "../controllers/courseDetailController.js";
import * as learningController from "../controllers/learningController.js";


const router = express.Router();

router.get("/:slug", courseDetailController.renderCourseDetail);
router.post("/:slug/buynow", courseDetailController.handleBuyNow);
router.post("/:slug/cmt", courseDetailController.handleCmt);
router.get("/:slug_course_name/learn/lecture/:slug_lesson_name?", learningController.loadCourse, learningController.watchingCourse);
router.post("/:slug_course_name/learn/lecture/finish", learningController.finishCourse);
router.post("/learn/lecture/progress", learningController.progressCourse);

export default router;

