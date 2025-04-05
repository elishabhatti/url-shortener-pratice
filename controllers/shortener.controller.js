import {
  insertShortLink,
  getAllShortLinks,
} from "../services/shortener.services.js";

export const getShortenerPage = async (req, res) => {
  try {
    let links = await getAllShortLinks();
    let host = req.headers.host;
    res.render("index", { shortCodes: links, host });
  } catch (error) {
    console.error(error);
  }
};

export const postShortCode = async (req, res) => {
  let { url, shortCode } = req.body;
  try {
    await insertShortLink({ url, shortCode });
    res.redirect("/");
  } catch (error) {
    console.error(error);
  }
};
