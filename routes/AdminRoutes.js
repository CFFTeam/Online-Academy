import express from "express";
import * as adminController from "../controllers/adminController.js";
const router = express.Router();

// Categories
router.route("/categories").get(adminController.renderCategories).post(adminController.addCategories);
router.post("/categories/edit/:id", adminController.editCategories);
router.get("/categories/delete/:id",adminController.deleteCategories);

// Courses
router.route("/courses").get(adminController.renderCourses).post(adminController.renderCoursesByCategories);
router.route("/courses/category").get(adminController.renderCoursesByCategories);
router.route("/courses/delete/:id").post(adminController.deleteCourses);
router.route("/courses/viewmore/:id").get(adminController.viewMoreCourse);
router.post("/courses/edit/:id", adminController.editCourses);

//Teachers
router.route("/teachers").get(adminController.renderTeachers).post(adminController.addTeachers);
router.post("/teachers/edit/:id", adminController.editTeachers);
router.post("/teachers/ban/:id", adminController.banTeachers);
router.post("/teachers/delete/:id",adminController.deleteTeachers);

//Students
router.route("/students").get(adminController.renderStudents).post(adminController.addStudents);
router.post("/students/edit/:id", adminController.editStudents);
router.get("/students/ban/:id", adminController.banStudents);
router.post("/students/delete/:id",adminController.deleteStudents);

export default router;

