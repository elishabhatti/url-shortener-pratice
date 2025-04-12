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
} from "../controllers/auth.controller.js";

export const authRouter = Router();

authRouter.route("/register").get(getRegisterPage).post(postRegister);
authRouter.route("/login").get(getLoginPage).post(postLogin);
authRouter.route("/profile").get(getProfilePage)
authRouter.route("/verify-email").get(getVerifyEmailPage)
// .post(postLogin);
authRouter.route("/me").get(getMePage);
authRouter.route("/logout").get(logoutUser);
