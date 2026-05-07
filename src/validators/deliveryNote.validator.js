import { z } from 'zod';

// Esquema para validar un ítem individual
const itemSchema = z.object({
    concept: z.string().min(1, 'El concepto es obligatorio'),
    description: z.string().optional(),
    quantity: z.number().min(1, 'La cantidad debe ser al menos 1'),
    hours: z.number().min(0).optional(),
});

// Esquema para crear albarán (sin firma ni PDFs de entrada)
export const deliveryNoteSchema = z.object({
    client: z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID de Cliente inválido'),
    project: z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID de Proyecto inválido'),
    date: z.string().optional().transform(str => str ? new Date(str) : new Date()), // Convierte string a fecha
    items: z.array(itemSchema).min(1, 'El albarán debe contener al menos un ítem'),
});

// Esquema específico para cuando se firma el albarán (Fase 3)
export const signDeliveryNoteSchema = z.object({
    signature: z.string().min(1, 'La firma (base64 o archivo) es obligatoria'),
});