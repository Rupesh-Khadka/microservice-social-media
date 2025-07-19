import { PrismaClient } from "@prisma/client";
import * as argon2 from "argon2";
import * as dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();
const PEPPER = process.env.JWT_SECRETE || "";

interface UserCreateInput {
  image?: string;
  name: string;
  email: string;
  password: string;
}

export const createUser = async ({
  image,
  name,
  email,
  password,
}: UserCreateInput) => {
  const hashedPassword = await argon2.hash(PEPPER + password);
  return prisma.user.create({
    data: {
      image,
      name,
      email,
      password: hashedPassword,
    },
  });
};

export function comparePassword(
  hashedPassword: string,
  inputPassword: string
): Promise<boolean> {
  return argon2.verify(hashedPassword, inputPassword);
}
