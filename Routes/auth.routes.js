import express from "express"
import { createNewPassword, getUser, login, logOut, refreshAccessToken, register, resendOtp, resetPassword, verifyOtp, verifyResetPasswordOtp } from "../Controllers/user.controller.js";
import userAuth from "../Middlewares/userAuth.middleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", userAuth, logOut)
router.get("/refreshAccessToken", refreshAccessToken)
router.get("/get-user", getUser)
router.post("/verify-otp", userAuth, verifyOtp)
router.post("/resend-otp", userAuth, resendOtp)
router.post("/reset-password", resetPassword)
router.post("/verify-reset-password-otp", verifyResetPasswordOtp)

router.post("/create-new-password", createNewPassword)



export default router;