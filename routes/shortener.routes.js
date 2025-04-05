import { Router } from "express";
import { getShortenerPage } from "../controllers/shortener.controller.js";

export const shortenerRouter = Router()

shortenerRouter.get("/", getShortenerPage)