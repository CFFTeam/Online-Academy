import express from "express";
import * as instructorController from "../controllers/instructorController.js";
import { validateInstructor } from "../middlewares/validate_role.mdw.js";
const router = express.Router();

router.route('/dashboard').get(validateInstructor, instructorController.getDashboard);
router.route('/enrolled-courses').get(validateInstructor, instructorController.getEnrolledCourses);
router.route('/watch-history').get(validateInstructor, instructorController.getWatchHistory);
router.route('/sales').get(validateInstructor, instructorController.getSales);
router.route('/preview').get(validateInstructor, instructorController.getPreview);
router.route('/my-profile').get(validateInstructor, instructorController.getInstructorProfile).post(validateInstructor, instructorController.updateInstructorProfile);
router.route('/my-courses').get(validateInstructor, instructorController.getMyCourses);
router.route('/add-course-description').get(validateInstructor, instructorController.getCourseDescription).post(validateInstructor, instructorController.editCourseDescription);
router.route('/add-course-content').get(validateInstructor, instructorController.getCourseContent).post(validateInstructor, instructorController.editCourseContent);

export default router;