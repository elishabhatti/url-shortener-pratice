import { Router } from "express";
import { getRegisterPage, postRegister, getLoginPage, postLogin, logoutUser } from "../controllers/auth.controller.js";

export const authRouter = Router()

authRouter.route("/register").get(getRegisterPage).post(postRegister)
authRouter.route("/login").get(getLoginPage).post(postLogin)
authRouter.route("/logout").get(logoutUser)