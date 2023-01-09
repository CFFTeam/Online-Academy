import express from "express";
import * as adminController from "../controllers/adminController.js";
import { validateAdmin } from "../middlewares/validate_role.mdw.js";
const router = express.Router();

router.use(validateAdmin);

// Categories
router.get("/categories", adminController.renderCategories)
router.post("/categories", adminController.addCategories);
router.get("/categories/category", adminController.renderCategoriesByCategories);
router.post("/categories/edit/:id/:idsub", adminController.editCategories);
router.post("/categories/editsub/:id/:idsub", adminController.editSubCategories);
router.post("/categories/delete/:id/:idsub",adminController.deleteCategories);

// Courses
router.get("/courses", adminController.renderCourses)
router.post("/courses", adminController.renderCoursesByCategories);
router.get("/courses/category", adminController.renderCoursesByCategories);
router.get("/courses/instructor/:id", adminController.renderCoursesByInstructors);
router.post("/courses/delete/:id", adminController.deleteCourses);
router.get("/courses/viewmore/:id", adminController.viewMoreCourse);
router.post("/courses/edit/:id", adminController.editCourses);
router.post("/courses/ban/:id", adminController.banCourses);

//Teachers
router.get("/teachers", adminController.renderTeachers)
router.post("/teachers", adminController.addTeachers);
router.get("/teachers/not-exist", adminController.notExistTeachers);
router.post("/teachers/edit/:id", adminController.editTeachers);
router.post("/teachers/ban/:id", adminController.banTeachers);
router.post("/teachers/delete/:id",adminController.deleteTeachers);

//Students
router.get("/students", adminController.renderStudents)
router.post("/students/edit/:id", adminController.editStudents);
router.post("/students/ban/:id", adminController.banStudents);
router.post("/students/delete/:id",adminController.deleteStudents);

export default router;

