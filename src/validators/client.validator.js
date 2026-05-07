import { z } from 'zod';

export const clientSchema = z.object({
    name: z.string().min(1, "El nombre es obligatorio"),
    cif: z.string().min(1, "El CIF es obligatorio"),
    email: z.string().email("Email inválido"),
    address: z.object({
        street: z.string().min(1),
        city: z.string().min(1),
        postalCode: z.string().min(1),
        province: z.string().min(1)
    })
});