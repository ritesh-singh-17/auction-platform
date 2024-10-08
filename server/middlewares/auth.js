import { User } from "../models/userSchema.js";
import jwt from "jsonwebtoken";
import ErrorHandler from "./error.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";

export const isAuthenticated = catchAsyncErrors(async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new ErrorHandler("User not authenticated.", 401));
    }

    const token = authHeader.split(' ')[1];
    if (!token || token === "undefined") {
      return next(new ErrorHandler("User not authenticated.", 401));
    }
    const decode = await jwt.verify(token, process.env.JWT_SECRET_KEY);
    if (!decode) {
      return next(new ErrorHandler("Invalid token", 401));
    };
    req.user = await User.findById(decode.id);
    next();
  } catch (error) {
    console.log(error);
  }
})

export const isAuthorized = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(
          `${req.user.role} not allowed to access this resouce.`,
          403
        )
      );
    }
    next();
  };
};
