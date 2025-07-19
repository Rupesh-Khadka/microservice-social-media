import { z } from "zod";

interface PostInput {
  title?: string | null;
  content: string;
  mediaIds: string[];
}

const validatePost = (data: PostInput) => {
  const postSchemaValidation = z.object({
    title: z
      .string()
      .max(255, "Title must be less than 255 characters")
      .optional(),
    content: z.string().min(3, "Content must be more then 3 chanracters"),
    mediaIds: z.array(z.string()),
  });
  return postSchemaValidation.safeParse(data);
};

export { validatePost };
