import express from 'express';
import * as googleAuthController from '../controllers/googleAuthController.js';

const router = express.Router();

router.post('/google-login', googleAuthController.googleLogin);

export default router;