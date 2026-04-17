import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "Email обязателен").email("Некорректный email"),
  password: z.string().min(6, "Пароль должен содержать минимум 6 символов"),
});

export const registerSchema = z.object({
  email: z.string().min(1, "Email обязателен").email("Некорректный email"),
  password: z
    .string()
    .min(6, "Пароль должен содержать минимум 6 символов")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Пароль должен содержать минимум одну заглавную букву, одну строчную букву и одну цифру",
    ),
  fullName: z
    .string()
    .refine(
      (value) => value.trim() === "" || value.trim().length >= 2,
      "Имя должно содержать минимум 2 символа",
    ),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
