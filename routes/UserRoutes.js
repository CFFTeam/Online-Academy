import express from "express";
import * as authController from "../controllers/authController.js";
const router = express.Router();

// handle for singup
router.route("/verify-otp").get(authController.renderOTPForm).post(authController.handleOTPForm);
router.route('/signup').get(authController.renderSignupForm).post(authController.handleSignupForm);
router.route("/login")
.get(authController.renderLoginForm)
.post(authController.handleLoginForm);

router.get("/forgot-password", authController.renderForgotPasswordForm);

router.route("/forgot-password").get(authController.renderForgotPasswordForm)
.post(authController.handleForgotPasswordForm);

router.route("/new-password").get(authController.renderNewPasswordForm)
.post(authController.handleNewPasswordForm);


router.get('/logout', authController.logout);

// router.post("/forgotPassword", authController.forgotPassword);
// router.patch("/resetPassword", authController.resetPassword);
// router.patch("/updatePassword", authController.updatePassword);

export default router;
