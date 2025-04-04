import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.send("HI");
});

app.listen(3000);