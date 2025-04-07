import {
  insertShortLink,
  getAllShortLinks,
  getShortLinkByShortCode,
} from "../services/shortener.services.js";
import { jwtVerifyToken } from "../services/auth.services.js";

export const getShortenerPage = async (req, res) => {
  try {
    const decodedToken = jwtVerifyToken(req.cookies.token);
    const userId = decodedToken.id;
    let links = await getAllShortLinks(userId);
    let host = req.headers.host;
    res.render("index", { shortCodes: links, host });
  } catch (error) {
    console.error(error);
  }
};

export const postShortCode = async (req, res) => {
  let { url, shortCode } = req.body;
  try {
    let userId = req.cookies.token;
    if (url.length >= 255) {
      return res.redirect("/");
    }
    await insertShortLink({ url, shortCode, userId });
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
      return res.status(400).send("Short Link not Found");
    }
    res.redirect(shortLink.url);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};
