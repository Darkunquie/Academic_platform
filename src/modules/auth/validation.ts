import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().min(2, "Name is too short").max(120),
  email: z.string().email("Invalid email").toLowerCase(),
  phone: z.string().min(6, "Invalid phone").max(20),
  country: z.string().min(2).max(80),
  state: z.string().min(2).max(80),
  password: z.string().min(8, "Password must be at least 8 characters").max(100),
  sectionId: z.string().uuid("Pick a section"),
  providerId: z.string().uuid("Pick a board/university"),
  gradeId: z.string().uuid("Pick a class/year"),
});

export type SignupInput = z.infer<typeof signupSchema>;
