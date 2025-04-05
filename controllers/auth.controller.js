import {
  createUser,
  hashUserPassword,
  getUserByEmail,
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

  return res.redirect("/login");
};

export const getLoginPage = (req, res) => {
  res.render("auth/login");
};

export const postLogin = async (req, res) => {
  let { email, password } = req.body;

  let [userExists] = await getUserByEmail(email);

  if (!userExists) {
    console.log("Internal Error");
    return res.redirect("/register");
  }
  res.cookies("isLoggedIn", true)
};
