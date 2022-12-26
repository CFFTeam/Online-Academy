import express from 'express';
import * as userProfileController from '../controllers/userProfileController.js';
const router = express.Router();

router.get('/', userProfileController.userProfilePage);
router.post('/', userProfileController.updateProfilePage);
// router.post('/', userProfileController.updatePasswordPage);


export default router;