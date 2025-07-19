import { Request, Response } from "express";
import { prisma } from "../utils/prisma";
import logger from "../utils/logger";
import { validateLogin, validateRegistration } from "../utils/validation";
import { comparePassword, createUser } from "../model/User";
import { generateToken } from "../utils/generateToken";

//user register
export const registerUser = async (
  req: Request,
  res: Response
): Promise<any> => {
  logger.info("Registration endpoint hit with body: %o", req.body.name);
  try {
    //validate schema
    const { error } = validateRegistration(req.body);

    if (error) {
      logger.warn("validation error", error.errors[0].message);
      return res
        .status(400)
        .json({ success: false, message: error.errors[0].message });
    }

    const { image, name, email, password } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      logger.warn("User already exists");
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    const user = await createUser(req.body);
    logger.info("User registered successfully", user.id);

    const { accessToken, refreshToken } = await generateToken(user);

    res.status(201).json({
      success: true,
      message: "User registered successfully!",
      accessToken,
      refreshToken,
    });
  } catch (error) {
    logger.error("Registration failed", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

//user login
export const loginUser = async (req: Request, res: Response): Promise<any> => {
  logger.info("Login endpoint hit...");
  try {
    const { error } = validateLogin(req.body);

    if (error) {
      logger.warn("validation error", error.errors[0].message);
      return res
        .status(400)
        .json({ success: false, message: error.errors[0].message });
    }

    const { email, password } = req.body;

    //User exist or not
    const user = await prisma.user.findUnique({
      where: { email: req.body.email },
    });

    if (!user) {
      logger.warn("Invalid user");
      return res
        .status(400)
        .json({ success: false, message: "Invalide credentials" });
    }

    //Valid password or not
    const isValidPassword = comparePassword(user.password, password);
    if (!isValidPassword) {
      logger.warn("Invalid password");
      return res
        .status(400)
        .json({ success: false, message: "Invalide password" });
    }

    const { accessToken, refreshToken } = await generateToken(user);

    res.json({
      userId: user.id,
      userName: user.name,
      email: user.email,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    logger.error("Login failed", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

//refresh token
export const refreshToken = async (
  req: Request,
  res: Response
): Promise<any> => {
  logger.info(`Refresh token endpoint hit...`);
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      logger.warn(`Refresh token missing....`);
      return res
        .status(400)
        .json({ success: false, message: "Refresh token missing" });
    }

    const storedToken = await prisma.refresh_token.findUnique({
      where: { token: refreshToken },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      logger.warn(`Invalid or expired refresh token`);
      return res.status(401).json({
        success: false,
        message: "Invalid or expired refresh token",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: storedToken.userId },
    });

    if (!user) {
      logger.warn(`User not found`);
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      await generateToken(user);

    //delete old token

    await prisma.refresh_token.delete({
      where: { token: refreshToken },
    });

    return res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    logger.error("Refresh tokenerror occures ", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

//logout

export const logoutUser = async (req: Request, res: Response): Promise<any> => {
  logger.info(`Logout endpoint hit...`);
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      logger.warn(`Refresh token missing....`);
      return res
        .status(400)
        .json({ success: false, message: "Refresh token missing" });
    }

    await prisma.refresh_token.delete({
      where: { token: refreshToken },
    });

    logger.info(`Refresh token deleted for logout`);
    res.json({
      success: true,
      message: "Logger out sucessfully",
    });
  } catch (error) {
    logger.error("Logging out error  ", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
