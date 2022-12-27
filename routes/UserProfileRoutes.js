import express from 'express';
import * as userProfileController from '../controllers/userProfileController.js';
const router = express.Router();

router.get('/', userProfileController.userProfilePage);
router.post('/', userProfileController.updateProfilePage);


export default router;