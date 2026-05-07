import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import * as dbHandler from './setup.js';
import jwt from 'jsonwebtoken';
import { User } from '../src/models/User.js';
import { Company } from '../src/models/Company.js';

let token;
let clientId;
let companyId;

beforeAll(async () => {
    await dbHandler.connectDB();
    const company = await Company.create({ name: 'Proyectos SA', cif: 'B88888888', owner: new mongoose.Types.ObjectId() });
    companyId = company._id;
    const user = await User.create({ email: `p${Date.now()}@test.com`, password: 'Password1234', company: companyId, status: 'verified' });
    token = jwt.sign({ id: user._id.toString() }, process.env.JWT_SECRET || 'secret');

    const client = await mongoose.model('Client').create({
        name: 'Cliente SA', cif: 'A99999999', email: 'cli@cli.com',
        company: companyId,
        address: { street: 'Calle', city: 'Madrid', postalCode: '28001', province: 'Madrid' }
    });
    clientId = client._id;
});

afterAll(async () => await dbHandler.closeDB());

describe('API Proyectos', () => {
    it('Debe listar proyectos', async () => {
        const res = await request(app)
            .get('/api/project')
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('data');
    });

    it('Debe crear un proyecto', async () => {
        const res = await request(app)
            .post('/api/project')
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'Proyecto Test', projectCode: 'PT-001', client: clientId });
        expect(res.statusCode).toBe(201);
    });

    it('No debe crear proyecto con código duplicado', async () => {
        await request(app)
            .post('/api/project')
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'Proyecto A', projectCode: 'DUP-001', client: clientId });

        const res = await request(app)
            .post('/api/project')
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'Proyecto B', projectCode: 'DUP-001', client: clientId });
        expect(res.statusCode).toBe(409);
    });

    it('Debe obtener un proyecto por ID', async () => {
        const created = await request(app)
            .post('/api/project')
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'Proyecto Get', projectCode: 'GET-001', client: clientId });

        const res = await request(app)
            .get(`/api/project/${created.body._id}`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toBe(200);
    });

    it('Debe archivar un proyecto (soft delete)', async () => {
        const created = await request(app)
            .post('/api/project')
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'Proyecto Soft', projectCode: 'SOFT-001', client: clientId });

        const res = await request(app)
            .delete(`/api/project/${created.body._id}?soft=true`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toBe(200);
    });
});