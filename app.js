import express from "express";
import { shortenerRouter } from "./routes/shortener.routes.js";
import cookieParser from "cookie-parser";
import { authRouter } from "./routes/auth.routes.js";
import { verifyAuthentication } from "./middlewares/verify.middleware.js";
import requestIp from "request-ip";
import flash from "connect-flash";
import session from "express-session";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(requestIp.mw());
app.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: true,
    saveUninitialized: false,
  })
);
app.use(flash());
app.use(verifyAuthentication);

app.use((req, res, next) => {
  res.locals.user = req.user;
  return next();
});

app.use(shortenerRouter);
app.use(authRouter);

app.listen(PORT);
