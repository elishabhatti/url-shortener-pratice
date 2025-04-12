import z from "zod";

export const shortenerSchema = z.object({
  url: z
    .string({ required_error: "URL is required." })
    .trim()
    .url({ message: "Please enter a valid URL." })
    .max(1024, { message: "URL cannot be longer than 1024 characters." }),
});