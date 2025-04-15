import { sendEmail } from "../lib/nodemailer.js";
import {
  createUser,
  hashPassword,
  getUserByEmail,
  comparePassword,
  clearSession,
  authenticateUser,
  findUserById,
  generateRandomToken,
  insertVerificationEmailToken,
  createVerifyEmailLink,
  findVerificationEmailToken,
  verifyUserEmailAndUpdate,
} from "../services/auth.services.js";
import { getAllShortLinks } from "../services/shortener.services.js";
import { verifyEmailSchema } from "../validators/auth.validator.js";

export const getRegisterPage = async (req, res) => {
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

  await authenticateUser(req, res, user);
  return res.redirect("/");
};

export const getLoginPage = (req, res) => {
  if (req.user) return res.redirect("/");
  res.render("auth/login");
};

export const postLogin = async (req, res) => {
  if (req.user) return res.redirect("/");
  let { email, password } = req.body;

  let [user] = await getUserByEmail(email);

  if (!user) {
    console.log("Email is Invalid");
    return res.redirect("/register");
  }
  const isPasswordValid = await comparePassword(user.password, password);
  if (!isPasswordValid) return res.redirect("/login");
  await authenticateUser(req, res, user);

  return res.redirect("/");
};

export const logoutUser = async (req, res) => {
  await clearSession(req.user.sessionId);

  res.clearCookie("access_token");
  res.clearCookie("refresh_token");
  res.redirect("/login");
};

export const getMePage = (req, res) => {
  if (!req.user) return res.send("Not Logged In");
  return res.send(`${req.user.name} ${req.user.email}`);
};

export const getProfilePage = async (req, res) => {
  if (!req.user) return res.send("/login");

  const user = await findUserById(req.user.id);
  const allUserShortLink = await getAllShortLinks(user.id);
  res.render("auth/profile", {
    user: {
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      links: allUserShortLink,
      isEmailValid: user.isEmailValid,
    },
  });
};

export const getVerifyEmailPage = async (req, res) => {
  if (!req.user) return res.redirect("/login");

  const user = await findUserById(req.user.id);
  if (!user || user.isEmailValid) return res.redirect("/verify-email");
  res.render("auth/verify-email", {
    email: user.email,
  });
};

export const resendVerificationLink = async (req, res) => {
  try {
    if (!req.user) return res.redirect("/login");
    const randomToken = generateRandomToken();
    console.log(randomToken);
    await insertVerificationEmailToken({
      token: randomToken,
      userId: req.user.id,
    });

    const verifyEmailLink = await createVerifyEmailLink({
      email: req.user.email,
      token: randomToken,
    });

    sendEmail({
      to: req.user.email,
      subject: "VERIFY YOUR EMAIL",
      html: `
        <h1>Click the link below to verify your email</h1>
        <p>You can use this token: <code>${randomToken}</code></p>
        <a href="${verifyEmailLink}">Verify Email</a>
       `,
    }).catch((error) => console.error(error));
  } catch (error) {
    console.error(error);
  }
};

export const verifyEmailToken = async (req, res) => {
  const { data, error } = verifyEmailSchema.safeParse(req.query);

  if (error) return res.send("Verification link invalid or expired");

  const token = await findVerificationEmailToken(data);
  if (!token) return res.send("Verification link invalid or expired");

  await verifyUserEmailAndUpdate(token.email);
  console.log("Verify Email Token:", token);
  res.redirect("/profile");
};
