import express from "express";
import * as courseDetailController from "../controllers/courseDetailController.js";
const router = express.Router();

router.get("/:slug",courseDetailController.renderCourseDetail);

export default router;

