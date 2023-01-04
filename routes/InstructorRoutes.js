import express from "express";
import * as instructorController from "../controllers/instructorController.js";
const router = express.Router();

router.route('/dashboard').get(instructorController.getDashboard);
router.route('/enrolled-courses').get(instructorController.getEnrolledCourses);
router.route('/watch-history').get(instructorController.getWatchHistory);
router.route('/sales').get(instructorController.getSales);
router.route('/preview').get(instructorController.getPreview);
router.route('/my-profile').get(instructorController.getInstructorProfile).post(instructorController.updateInstructorProfile);
router.route('/my-courses').get(instructorController.getMyCourses);
router.route('/add-course-description').get(instructorController.getCourseDescription).post(instructorController.editCourseDescription);
router.route('/add-course-content').get(instructorController.getCourseContent).post(instructorController.editCourseContent);

export default router;