import { createUser, hashedPassword } from "../services/auth.services.js";

export const getRegisterPage = async (req, res) => {
  res.render("auth/register");
};

export const postRegister = async (req, res) => {
  let { name, email, password } = req.body;
  console.log(name, email, password);
  await hashedPassword(password)
  let user = await createUser({ name, email, password });
  console.log(user);

  res.redirect("/");
};
