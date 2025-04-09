import {
  ACCESS_TOKEN_EXPIRY,
  REFRESH_TOKEN_EXPIRY,
} from "../config/constants.js";
import {
  createUser,
  hashPassword,
  getUserByEmail,
  comparePassword,
  createSession,
  createAccessToken,
  createRefreshToken,
  clearSession,
} from "../services/auth.services.js";

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
  return res.redirect("/login");
};

export const getLoginPage = (req, res) => {
  if(req.user) return res.redirect("/")
  res.render("auth/login");
};

export const postLogin = async (req, res) => {
  if(req.user) return res.redirect("/")
  let { email, password } = req.body;
  
  let [user] = await getUserByEmail(email);

  if (!user) {
    console.log("Email is Invalid");
    return res.redirect("/register");
  }
  const isPasswordValid = await comparePassword(user.password, password);
  if (!isPasswordValid) return res.redirect("/login");

  const session = await createSession(user.id, {
    ip: req.clientIp,
    userAgent: req.headers["user_agent"],
  });

  const accessToken = createAccessToken({
    id: user.id,
    name: user.name,
    email: user.email,
    sessionId: session.id,
  });

  const refreshToken = createRefreshToken(session.id);
  const baseConfig = { httpOnly: true, secure: true };

  res.cookie("access_token", accessToken, {
    ...baseConfig,
    maxAge: ACCESS_TOKEN_EXPIRY,
  });

  res.cookie("refresh_token", refreshToken, {
    ...baseConfig,
    maxAge: REFRESH_TOKEN_EXPIRY,
  });

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
