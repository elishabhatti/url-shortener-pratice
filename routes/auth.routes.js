import { Router } from "express";
import { getRegisterPage, postRegister } from "../controllers/auth.controller.js";

export const authRouter = Router()

authRouter.route("/register").get(getRegisterPage).post(postRegister)