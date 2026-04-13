import { z } from 'zod';

// Definimos el esquema de validación para nuestras variables de entorno
const envSchema = z.object({
    PORT: z.coerce.number().default(3000),
    MONGO_URI: z.string().url(),
    JWT_SECRET: z.string().min(32),
    JWT_REFRESH_SECRET: z.string().min(32),
});

// Validamos process.env y exportamos la configuración limpia
const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    console.error('Error en las variables de entorno:', parsed.error.format());
    process.exit(1); // Detenemos la app si faltan datos críticos
}

export const config = parsed.data;