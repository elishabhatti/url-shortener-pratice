import express from "express";
import { shortenerRouter } from "./routes/shortener.routes.js";
import cookieParser from "cookie-parser";
import { authRouter } from "./routes/auth.routes.js";
import { verifyAuthentication } from "./middlewares/verify.middleware.js";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(verifyAuthentication)
app.use(shortenerRouter);
app.use(authRouter);

app.listen(PORT);
