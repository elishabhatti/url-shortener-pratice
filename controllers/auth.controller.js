import { decodeIdToken, generateCodeVerifier, generateState } from "arctic";
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
  getUserWithOauthId,
  createUserWithOauth,
  linkUserWithOauth,
} from "../services/auth.services.js";
import { getAllShortLinks } from "../services/shortener.services.js";
import { verifyEmailSchema } from "../validators/auth.validator.js";
import { google } from "../lib/oauth/google.js";
import { OAUTH_EXCHANGE_EXPIRAY } from "../config/constants.js";
import { sendEmails } from "../lib/resend-email.js";

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

  await authenticateUser({ req, res, user });
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
  await authenticateUser({ req, res, user });

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

    sendEmails({
      to: req.user.email,
      subject: "VERIFY YOUR EMAIL",
      html: `
        <h1>Click the link below to verify your email</h1>
        <p>You can use this token: <code>${randomToken}</code></p>
        <a href="${verifyEmailLink}">Verify Email</a>
       `,
    }).catch((error) => console.error(error));

    res.redirect("/profile");
  } catch (error) {
    console.error(error);
  }
};

export const verifyEmailToken = async (req, res) => {
  const { data, error } = verifyEmailSchema.safeParse(req.query);

  if (error) return res.send("Verification link invalid or expired");

  const [token] = await findVerificationEmailToken(data);
  if (!token) return res.send("Verification link invalid or expired");

  await verifyUserEmailAndUpdate(token.email);
  res.redirect("/profile");
};

export const getGoogleLoginPage = (req, res) => {
  if (req.user) return res.redirect("/");

  try {
    const state = generateState();
    const codeVerifier = generateCodeVerifier();
    const url = google.createAuthorizationURL(state, codeVerifier, [
      "openid",
      "profile",
      "email",
    ]);

    const cookieConfig = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: OAUTH_EXCHANGE_EXPIRAY,
      sameSite: "lax",
    };

    res.cookie("google_oauth_state", state, cookieConfig);
    res.cookie("google_oauth_verifier", codeVerifier, cookieConfig);

    res.redirect(url.toString());
  } catch (error) {
    console.error(`Error from get login with google page ${error}`);
  }
};

export const getGoogleLoginCallback = async (req, res) => {
  const { code, state } = req.query;
  const {
    google_oauth_state: storeState,
    google_oauth_verifier: codeVerifier,
  } = req.cookies;

  console.log("Received from Google:", { code, state });
  console.log("Stored cookies:", { storeState, codeVerifier });

  // Validate state and verifier
  if (!code || !state || !storeState || !codeVerifier || state !== storeState) {
    req.flash(
      "errors",
      "Couldn't login with Google due to an invalid login attempt. Please try again."
    );
    return res.redirect("/login");
  }

  // Exchange code for tokens
  let tokens;
  try {
    tokens = await google.validateAuthorizationCode(code, codeVerifier);
  } catch (error) {
    console.error("Google token exchange failed:", error);
    req.flash(
      "errors",
      "Couldn't login with Google due to an invalid login attempt. Please try again."
    );
    return res.redirect("/login");
  }

  console.log("Google tokens:", tokens);

  const claims = decodeIdToken(tokens.idToken());
  console.log("Google ID token claims:", claims);

  const { sub: googleUserId, name, email, picture } = claims;

  // Check if user already exists by OAuth link
  let user = await getUserWithOauthId({
    provider: "google",
    email,
  });

  // If user exists but not linked, link it
  if (user && !user.provideAccountId) {
    await linkUserWithOauth({
      userId: user.id,
      provider: "google",
      providerAccountId: googleUserId,
    });
  }

  // If user doesn't exist at all, create a new one via OAuth
  if (!user) {
    user = await createUserWithOauth({
      name,
      email,
      provider: "google",
      providerAccountId: googleUserId,
    });
  }

  // Check (again) by email
  let userByEmail = await getUserByEmail(email);

  // 🛠 Fix: make sure it's not an array
  if (Array.isArray(userByEmail)) {
    userByEmail = userByEmail[0];
  }

  // If still not found by email, create a regular user
  if (!userByEmail) {
    userByEmail = await createUser({
      name,
      email,
      profilePicture: picture,
    });
  }

  // Authenticate and login
  await authenticateUser({
    req,
    res,
    user: userByEmail,
    name,
    email,
  });

  res.redirect("/");
};
