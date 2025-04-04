import express from "express";

const app = express();
app.use(express.json());
app.use(express.static("public"))
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("index");
});

app.listen(3000);
