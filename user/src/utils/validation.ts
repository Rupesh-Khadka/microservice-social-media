// validation.ts
import { z } from "zod";

interface UserInput {
  name: string;
  email: string;
  password: string;
  image?: string | null;
}

interface LoginInput {
  email: String;
  password: String;
}

const validateRegistration = (data: UserInput) => {
  const userSchemaValidation = z.object({
    image: z.string().url("Image must be a valid URL").optional().nullable(),

    name: z
      .string()
      .min(3, "Name must be at least 3 characters")
      .max(50, "Name must be at most 50 characters")
      .transform((val) => val.trim()),

    email: z
      .string()
      .email("Invalid email address")
      .transform((val) => val.trim()),

    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/\d/, "Password must contain at least one number")
      .regex(
        /[^A-Za-z0-9]/,
        "Password must contain at least one special character"
      ),
  });

  return userSchemaValidation.safeParse(data);
};

const validateLogin = (data: LoginInput) => {
  const userLoginValidation = z.object({
    email: z
      .string()
      .email("Invalid email address")
      .transform((val) => val.trim()),

    password: z.string().min(6, "Password must be at least 6 characters"),
  });

  return userLoginValidation.safeParse(data);
};

export { validateRegistration, validateLogin };
