import { Router } from "express";
import {
  getRegisterPage,
  postRegister,
  getLoginPage,
  postLogin,
  logoutUser,
  getMePage,
  getProfilePage,
  getVerifyEmailPage,
  verifyEmailToken,
  resendVerificationLink,
} from "../controllers/auth.controller.js";

export const authRouter = Router();

authRouter.route("/register").get(getRegisterPage).post(postRegister);
authRouter.route("/login").get(getLoginPage).post(postLogin);
authRouter.route("/profile").get(getProfilePage)
authRouter.route("/verify-email").get(getVerifyEmailPage)
authRouter.route("/resend-verification-link").post(resendVerificationLink)
authRouter.route("/resend-email-token").get(verifyEmailToken)
authRouter.route("/me").get(getMePage);
authRouter.route("/logout").get(logoutUser);
