
import { ACCESS_TOKEN_EXPIRY, REFRESH_TOKEN_EXPIRY } from "../config/constants.js";
import { jwtVerifyToken, refreshTokens } from "../services/auth.services.js";

// export const verifyAuthentication = async (req, res, next) => {
//   const accessToken = req.cookies.access_token;
//   const refreshToken = req.cookies.refresh_token;

//   req.user = null;

//   if (!accessToken && !refreshToken) {
//     return next();
//   }

//   if (accessToken) {
//     const decodedToken = jwtVerifyToken(accessToken);
//     req.user = decodedToken;
//     return next();
//   }

//   if (refreshToken) {
//     try {
//       const { newAccessToken, newRefreshToken, user } = await refreshTokens(
//         refreshToken
//       );
//       req.user = user;

//       const baseConfig = { httpOnly: true, secure: true };

//       res.cookie("access_token", newAccessToken, {
//         ...baseConfig,
//         maxAge: ACCESS_TOKEN_EXPIRY,
//       });

//       res.cookie("refresh_token", newRefreshToken, {
//         ...baseConfig,
//         maxAge: REFRESH_TOKEN_EXPIRY,
//       });

//       return next();
//     } catch (error) {
//       console.log(error);
//     }
//   }

//   return next();
// };

export const verifyAuthentication = async (req, res, next) => {
  const accessToken = req.cookies.access_token;
  const refreshToken = req.cookies.refresh_token;

  req.user = null;

  if (!accessToken && !refreshToken) {
    return next();
  }

  if (accessToken) {
    const decodedToken = jwtVerifyToken(accessToken);
    req.user = decodedToken;
  }

  if (refreshToken) {
    try {
      const { newAccessToken, newRefreshToken, user } = await refreshTokens(
        refreshToken
      );
      req.user = user;

      const baseConfig = { httpOnly: true, secure: true };

      res.cookie("access_token", newAccessToken, {
        ...baseConfig,
        maxAge: ACCESS_TOKEN_EXPIRY,
      });

      res.cookie("refresh_token", newRefreshToken, {
        ...baseConfig,
        maxAge: REFRESH_TOKEN_EXPIRY,
      });

      return next()
    } catch (error) {
      console.log(error);
    }
  }
  return next()
};
