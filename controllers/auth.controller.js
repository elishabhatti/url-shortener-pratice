import {
  createUser,
  hashPassword,
  getUserByEmail,
  comparePassword,
} from "../services/auth.services.js";

export const getRegisterPage = async (req, res) => {
  // if (req.cookies.isLoggedIn) return res.redirect("/");
  res.render("auth/register");
};

export const postRegister = async (req, res) => {
  let { name, email, password } = req.body;

  let [userExists] = await getUserByEmail(email);

  if (userExists) {
    console.log("Choose Another Email Please");
    return res.redirect("/register");
  }

  let hashedPassword = await hashPassword(password);
  const user = await createUser({ name, email, password: hashedPassword });
  console.log(user);

  return res.redirect("/login");
};

export const getLoginPage = (req, res) => {
  // if (req.cookies.isLoggedIn) return res.redirect("/");
  res.render("auth/login");
};

export const postLogin = async (req, res) => {
  let { email, password } = req.body;

  let [user] = await getUserByEmail(email);
  if (!user) {
    console.log("Email is Invalid");
    return res.redirect("/register");
  }

  const isPasswordValid = await comparePassword(user.password, password);
  if (!isPasswordValid) return res.redirect("/login");

  res.cookie("isLoggedIn", true);
  return res.redirect("/");
};
