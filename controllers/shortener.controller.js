import {
  insertShortLink,
  getAllShortLinks,
  getShortLinkByShortCode,
  deleteShortCodeById,
} from "../services/shortener.services.js";
import { jwtVerifyToken } from "../services/auth.services.js";
import { db } from "../config/db.config.js";
import { shortLink } from "../drizzle/schema.js";

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
    let userId = jwtVerifyToken(req.cookies.token);
    await insertShortLink({ url, shortCode, userId: userId.id });
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

export const deleteShortCode = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await deleteShortCodeById(id);

    if (result.rowCount === 0) {
      // No rows were deleted (shortcode didn't exist)
      console.log("E");
    } else {
      console.log("S");
      // req.flash('success', 'Short code deleted successfully');
    }

    res.redirect("/");
  } catch (error) {
    console.error("Error deleting short code:", error);
    res.redirect("/");
  }
};
