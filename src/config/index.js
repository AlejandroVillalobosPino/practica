import { z } from 'zod';

const envSchema = z.object({
    PORT: z.coerce.number().default(3000),
    MONGO_URI: z.string().url(),
    JWT_SECRET: z.string().min(32),
    JWT_REFRESH_SECRET: z.string().min(32),
    EMAIL_USER: z.string().email().optional(),
    EMAIL_PASS: z.string().optional(),
    SLACK_WEBHOOK_URL: z.string().url().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    console.error('Error en las variables de entorno:', parsed.error.format());
    process.exit(1);
}

export const config = parsed.data;