import express from "express";
import { shortenerRouter } from "./routes/shortener.routes.js";
import cookieParser from "cookie-parser";
import { authRouter } from "./routes/auth.routes.js";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())
app.use(authRouter);
app.use(shortenerRouter);

app.listen(PORT);
