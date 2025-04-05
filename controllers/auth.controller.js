import { ACCESS_TOKEN_EXPIRY } from "../config/constants.js";
import {
  createUser,
  hashUserPassword,
  getUserByEmail,
  createAccessToken,
} from "../services/auth.services.js";

export const getRegisterPage = async (req, res) => {
  res.render("auth/register");
};

export const postRegister = async (req, res) => {
  let { name, email, password } = req.body;

  let [userExists] = await getUserByEmail(email);

  if (userExists) {
    console.log("Chosse Another Email Please");
    return res.redirect("/register");
  }

  let hashedPassword = await hashUserPassword(password);
  await createUser({ name, email, password: hashedPassword });
  let token = createAccessToken({ name, email });
  const baseConfig = { httpOnly: true, secure: true };

  res.cookie("token", token, {
    ...baseConfig,
    maxAge: ACCESS_TOKEN_EXPIRY,
  });
  return res.redirect("/");
};
