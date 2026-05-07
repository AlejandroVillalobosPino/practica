import { z } from 'zod';

export const registerSchema = z.object({
    email: z.string().email().transform(val => val.toLowerCase()),
    password: z.string().min(8)
});

export const loginSchema = z.object({
    email: z.string().email().transform(val => val.toLowerCase()),
    password: z.string().min(8)
});

export const onboardingSchema = z.object({
    name: z.string().min(2),
    lastName: z.string().min(2),
    nif: z.string().min(9)
});

export const passwordSchema = z.object({
    currentPassword: z.string(),
    newPassword: z.string().min(8)
}).refine(data => data.currentPassword !== data.newPassword, {
    message: "La nueva contraseña debe ser diferente a la actual",
    path: ["newPassword"]
});