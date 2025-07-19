import jwt from "jsonwebtoken";
import crypto from "crypto";
import { prisma } from "../utils/prisma";

interface User {
  id: string;
  image?: string | null;
  name: string;
  email: string;
  password: string;
}

export const generateToken = async (user: User) => {

  if (!process.env.JWT_SECRETE) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  const accessToken = jwt.sign(
    {
      userId: user.id,
      username: user.name,
    },
    process.env.JWT_SECRETE,
    { expiresIn: "30m" }
  );

  const refreshToken = crypto.randomBytes(40).toString("hex");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // expires in 7 days

  await prisma.refresh_token.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt,
    },
  });

  return { accessToken, refreshToken };
};
