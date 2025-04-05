import express from "express";
import { shortenerRouter } from "./routes/shortener.routes.js";

const app = express();

app.use(express.json());
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(shortenerRouter);

app.listen(process.env.PORT);
