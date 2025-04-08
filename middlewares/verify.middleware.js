import { jwtVerifyToken } from "../services/auth.services.js";

export const verifyAuthentication = async (req, res, next) => {
  const token = req.cookies.access_token;
  if (!token) {
    req.user = null;
    return next();
  }
  try {
    const decodedToken = jwtVerifyToken(token);
    req.user = decodedToken;
    console.log("Req User:", req.user);
  } catch (error) {
    console.log("error", error);
  }
  return next();
};
