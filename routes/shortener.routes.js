import { Router } from "express";
import {
  getShortenerPage,
  postShortCode,
  redirectToShortLink,
  deleteShortCode,
  getUpdateShortCodePageById,
  updateShortCode,
} from "../controllers/shortener.controller.js";

export const shortenerRouter = Router();

shortenerRouter.get("/", getShortenerPage);
shortenerRouter.post("/addShortCode", postShortCode);
shortenerRouter.get("/urls/:shortCode", redirectToShortLink);
shortenerRouter.get("/deleteShortCode/:id", deleteShortCode);
shortenerRouter.get(
  "/getUpdateShortCodePageById/:id",
  getUpdateShortCodePageById
);
shortenerRouter.post("/updateShortCode", updateShortCode);
