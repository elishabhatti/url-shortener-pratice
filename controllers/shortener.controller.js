import {
  insertShortLink,
  getAllShortLinks,
  getShortLinkByShortCode,
  deleteShortCodeById,
  findShortLinkById,
  updatedShortCode,
  createRandomShortCode,
  findShortCode,
} from "../services/shortener.services.js";
import { jwtVerifyToken } from "../services/auth.services.js";
import { shortenerSchema } from "../validators/shortener.validator.js";

export const getShortenerPage = async (req, res) => {
  if (!req.cookies.access_token) return res.redirect("/login");
  try {
    const decodedToken = jwtVerifyToken(req.cookies.access_token);
    const userId = decodedToken.id;
    let links = await getAllShortLinks(userId);
    let host = req.headers.host;
    res.render("index", {
      shortCodes: links,
      host,
      userId,
      errors: req.flash("errors"),
    });
  } catch (error) {
    console.error(error);
  }
};

export const postShortCode = async (req, res) => {
  const parsed = shortenerSchema.safeParse(req.body);
  console.log(parsed);
  

  if (!parsed.success) {
    const errorMessage = parsed.error.errors[0].message;
    req.flash("errors", errorMessage);
    return res.redirect("/");
  }

  try {
    const { url, shortCode } = parsed.data;
    const userId = jwtVerifyToken(req.cookies.access_token);

    const shortCodeExists = await findShortCode(shortCode);
    const randomShortCode = createRandomShortCode();

    let finalShortCode = shortCode || randomShortCode;

    if (shortCodeExists) {
      req.flash("errors", "Short code already exists. Try a different one.");
      return res.redirect("/");
    }

    await insertShortLink({ url, shortCode: finalShortCode, userId: userId.id });
    res.redirect("/");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
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
    await deleteShortCodeById(id);
    res.redirect("/");
  } catch (error) {
    console.error("Error deleting short code:", error);
    res.redirect("/");
  }
};

export const getUpdateShortCodePageById = async (req, res) => {
  const id = req.params.id;
  const shortLink = await findShortLinkById(id);

  if (!shortLink) {
    return res.status(404).send("Short link not found");
  }

  res.render("edit", {
    id: shortLink.id,
    url: shortLink.url,
    shortCode: shortLink.shortCode,
  });
};

export const updateShortCode = async (req, res) => {
  const { id, url, shortCode } = req.body;

  await updatedShortCode({ id, url, shortCode });
  res.redirect("/");
};
