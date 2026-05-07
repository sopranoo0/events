import { z } from 'zod';

/** Zod 4: вместо устаревшего z.string().email() используем z.email() через pipe */
const emailField = z
    .string()
    .trim()
    .pipe(z.email({ message: 'Некорректный email' }))
    .transform((value) => value.toLowerCase());

export const registerSchema = z.object({
    email: emailField,
    password: z.string().min(8, { message: 'Пароль минимум 8 символов' }),
    name: z.string().trim().min(2, { message: 'Имя минимум 2 символа' }).max(100),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
    email: emailField,
    password: z.string().min(1, { message: 'Пароль обязателен' }),
});

export type LoginInput = z.infer<typeof loginSchema>;