import express from "express";
import * as instructorController from "../controllers/instructorController.js";
const router = express.Router();

router.route('/my-courses').get(instructorController.getMyCourses);

export default router;