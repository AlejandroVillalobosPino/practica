import { z } from 'zod';

export const projectSchema = z.object({
    name: z.string().min(3, 'El nombre del proyecto es obligatorio y debe ser descriptivo'),
    projectCode: z.string().min(3, 'Código de proyecto inválido'),
    client: z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID de Cliente inválido (formato MongoDB)'),
    description: z.string().optional(),
    status: z.enum(['PLANNING', 'ACTIVE', 'COMPLETED', 'ARCHIVED']).optional(),
    budget: z.number().min(0).optional(),
});