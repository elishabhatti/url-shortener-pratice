import { Router } from "express";
import { getShortenerPage, postShortCode, redirectToShortLink } from "../controllers/shortener.controller.js";

export const shortenerRouter = Router()

shortenerRouter.get("/", getShortenerPage)
shortenerRouter.post("/addShortCode", postShortCode)
shortenerRouter.get("/:shortCode", redirectToShortLink)