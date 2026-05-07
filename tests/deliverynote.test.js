import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import * as dbHandler from './setup.js';
import jwt from 'jsonwebtoken';
import { User } from '../src/models/User.js';
import { Company } from '../src/models/Company.js';

let token;
let clientId;
let projectId;

beforeAll(async () => {
    await dbHandler.connectDB();
    const company = await Company.create({ name: 'DN Corp', cif: 'B77777777', owner: new mongoose.Types.ObjectId() });
    const user = await User.create({ email: 'dn@test.com', password: 'Password123', company: company._id, status: 'verified' });
    token = jwt.sign({ id: user._id.toString() }, process.env.JWT_SECRET || 'secret');

    const client = await mongoose.model('Client').create({
        name: 'Cliente DN', cif: 'DN123', email: 'dn@cli.com', company: company._id,
        address: { street: 'C1', city: 'Madrid', postalCode: '28001', province: 'Madrid' }
    });
    clientId = client._id;

    const project = await mongoose.model('Project').create({
        name: 'Proyecto DN', projectCode: 'DN-001', client: clientId, company: company._id
    });
    projectId = project._id;
}, 30000);

afterAll(async () => await dbHandler.closeDB(), 30000);

describe('API Albaranes', () => {
    it('Debe crear un albaran', async () => {
        const res = await request(app)
            .post('/api/deliverynote')
            .set('Authorization', `Bearer ${token}`)
            .send({
                client: clientId,
                project: projectId,
                items: [{ concept: 'Trabajo', quantity: 2 }]
            });
        expect(res.statusCode).toBe(201);
    });

    it('Debe listar albaranes', async () => {
        const res = await request(app)
            .get('/api/deliverynote')
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('data');
    });

    it('Debe obtener un albaran por ID', async () => {
        const created = await request(app)
            .post('/api/deliverynote')
            .set('Authorization', `Bearer ${token}`)
            .send({
                client: clientId,
                project: projectId,
                items: [{ concept: 'Consulta', quantity: 1 }]
            });
        const res = await request(app)
            .get(`/api/deliverynote/${created.body._id}`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toBe(200);
    });

    it('Debe devolver 404 para albaran inexistente', async () => {
        const fakeId = new mongoose.Types.ObjectId();
        const res = await request(app)
            .get(`/api/deliverynote/${fakeId}`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toBe(404);
    });

    it('Debe borrar un albaran no firmado', async () => {
        const created = await request(app)
            .post('/api/deliverynote')
            .set('Authorization', `Bearer ${token}`)
            .send({
                client: clientId,
                project: projectId,
                items: [{ concept: 'Extra', quantity: 1 }]
            });
        const res = await request(app)
            .delete(`/api/deliverynote/${created.body._id}`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toBe(204);
    });

    it('No debe crear albaran con proyecto invalido', async () => {
        const fakeProject = new mongoose.Types.ObjectId();
        const res = await request(app)
            .post('/api/deliverynote')
            .set('Authorization', `Bearer ${token}`)
            .send({
                client: clientId,
                project: fakeProject,
                items: [{ concept: 'Test', quantity: 1 }]
            });
        expect(res.statusCode).toBe(400);
    });
});