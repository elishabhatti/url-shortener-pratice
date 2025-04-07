import { Router } from "express";
import { getShortenerPage, postShortCode, redirectToShortLink, deleteShortCode } from "../controllers/shortener.controller.js";

export const shortenerRouter = Router()

shortenerRouter.get("/", getShortenerPage)
shortenerRouter.post("/addShortCode", postShortCode)
shortenerRouter.get("/urls/:shortCode", redirectToShortLink)
shortenerRouter.get("/deleteshortCode/:id", deleteShortCode)
