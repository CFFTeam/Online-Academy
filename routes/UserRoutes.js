import express from "express";
import * as authController from "../controllers/authController.js";
const router = express.Router();

// handle for singup
router.get("/signup", authController.renderSignupForm);
router.post("/signup", authController.handleSignupForm);

router.get("/login", authController.login);
// router.post("/forgotPassword", authController.forgotPassword);
// router.patch("/resetPassword", authController.resetPassword);
// router.patch("/updatePassword", authController.updatePassword);

export default router;
