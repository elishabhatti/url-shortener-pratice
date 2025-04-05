import {
  insertShortLink,
  getAllShortLinks,
  getShortLinkByShortCode,
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

export const redirectToShortLink = async (req, res) => {
  try {
    let shortCode = req.params.shortCode;
    let shortLink = await getShortLinkByShortCode(shortCode);
    if (!shortLink) {
      res.status(400).send("Short Link not Found");
    }
    res.redirect(shortLink.url);
  } catch (error) {
    console.error(error);
  }
};
