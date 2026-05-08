import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import * as dbHandler from './setup.js';
import jwt from 'jsonwebtoken';
import { User } from '../src/models/User.js';
import { Company } from '../src/models/Company.js';

let token;
let clientId;

beforeAll(async () => {
    await dbHandler.connectDB();
    const company = await Company.create({ name: 'UTAD', cif: 'B12345678', owner: new mongoose.Types.ObjectId() });
    const user = await User.create({ email: 'test@u-tad.com', password: 'Password123', company: company._id, status: 'verified' });
    token = jwt.sign({ id: user._id.toString() }, process.env.JWT_SECRET || 'secret');
});

afterAll(async () => await dbHandler.closeDB());

describe('API Clientes', () => {
    it('Debe crear un cliente', async () => {
        const res = await request(app)
            .post('/api/client')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'Cliente Test', cif: 'A12345678', email: 'test@test.com',
                address: { street: 'Calle 1', city: 'Madrid', postalCode: '28001', province: 'Madrid' }
            });
        expect(res.statusCode).toBe(201);
        clientId = res.body._id;
    });

    it('No debe crear cliente con CIF duplicado', async () => {
        const res = await request(app)
            .post('/api/client')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'Cliente Dup', cif: 'A12345678', email: 'dup@test.com',
                address: { street: 'Calle 1', city: 'Madrid', postalCode: '28001', province: 'Madrid' }
            });
        expect(res.statusCode).toBe(409);
    });

    it('Debe listar clientes con paginacion', async () => {
        const res = await request(app)
            .get('/api/client?page=1&limit=10')
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('data');
        expect(res.body).toHaveProperty('totalItems');
    });

    it('Debe obtener un cliente por ID', async () => {
        const res = await request(app)
            .get(`/api/client/${clientId}`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toBe(200);
    });

    it('Debe actualizar un cliente', async () => {
        const res = await request(app)
            .put(`/api/client/${clientId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'Cliente Actualizado', cif: 'A12345678', email: 'updated@test.com',
                address: { street: 'Calle 2', city: 'Barcelona', postalCode: '08001', province: 'Barcelona' }
            });
        expect(res.statusCode).toBe(200);
        expect(res.body.name).toBe('Cliente Actualizado');
    });

    it('Debe archivar un cliente (soft delete)', async () => {
        const res = await request(app)
            .delete(`/api/client/${clientId}?soft=true`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toBe(200);
    });

    it('Debe listar clientes archivados', async () => {
        const res = await request(app)
            .get('/api/client/archived')
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toBe(200);
    });

    it('Debe devolver 404 para cliente inexistente', async () => {
        const fakeId = new mongoose.Types.ObjectId();
        const res = await request(app)
            .get(`/api/client/${fakeId}`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toBe(404);
    });

    it('Debe borrar un cliente (hard delete)', async () => {
        const created = await request(app)
            .post('/api/client')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'Para Borrar', cif: 'Z99999999', email: 'del@test.com',
                address: { street: 'Calle 3', city: 'Sevilla', postalCode: '41001', province: 'Sevilla' }
            });
        const res = await request(app)
            .delete(`/api/client/${created.body._id}`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toBe(204);
    });

    it('Ciclo completo: crear, archivar, verificar, restaurar', async () => {
        // Crear cliente
        const created = await request(app)
            .post('/api/client')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'Cliente Ciclo', cif: 'C11111111', email: 'ciclo@test.com',
                address: { street: 'Calle Ciclo', city: 'Madrid', postalCode: '28001', province: 'Madrid' }
            });
        expect(created.statusCode).toBe(201);
        const id = created.body._id;

        // Archivar
        const archived = await request(app)
            .delete(`/api/client/${id}?soft=true`)
            .set('Authorization', `Bearer ${token}`);
        expect(archived.statusCode).toBe(200);

        // No aparece en listado normal
        const list = await request(app)
            .get('/api/client')
            .set('Authorization', `Bearer ${token}`);
        expect(list.body.data.find(c => c._id === id)).toBeUndefined();

        // Si aparece en archivados
        const archivedList = await request(app)
            .get('/api/client/archived')
            .set('Authorization', `Bearer ${token}`);
        expect(archivedList.body.find(c => c._id === id)).toBeDefined();

        // Restaurar
        const restored = await request(app)
            .patch(`/api/client/${id}/restore`)
            .set('Authorization', `Bearer ${token}`);
        expect(restored.statusCode).toBe(200);

        // Vuelve a aparecer en listado normal
        const listAfter = await request(app)
            .get('/api/client')
            .set('Authorization', `Bearer ${token}`);
        expect(listAfter.body.data.find(c => c._id === id)).toBeDefined();
    });
});