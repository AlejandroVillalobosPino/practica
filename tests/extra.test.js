import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import * as dbHandler from './setup.js';
import { User } from '../src/models/User.js';
import { Company } from '../src/models/Company.js';
import bcrypt from 'bcryptjs';

let token;
let clientId;
let projectId;

beforeAll(async () => {
    await dbHandler.connectDB();
    const company = await Company.create({ name: 'Extra Corp', cif: 'B999', owner: new mongoose.Types.ObjectId() });

    const hashedPassword = await bcrypt.hash('Password123', 10); // <-- hashear antes de crear
    await User.create({ email: 'extra@test.com', password: hashedPassword, company: company._id, status: 'verified' });

    const loginRes = await request(app)
        .post('/api/user/login')
        .send({ email: 'extra@test.com', password: 'Password123' });

    token = loginRes.body.accessToken;

    const client = await mongoose.model('Client').create({
        name: 'C1', cif: '1', email: 'c@c.com', company: company._id,
        address: { street: 's', city: 'c', postalCode: '1', province: 'p' }
    });
    clientId = client._id;

    const project = await mongoose.model('Project').create({
        name: 'P1', projectCode: 'PC1', client: clientId, company: company._id
    });
    projectId = project._id;
});

afterAll(async () => await dbHandler.closeDB());

describe('Tests de Cobertura Extra', () => {
    it('Debe fallar el login con contraseña incorrecta (Prueba error 401)', async () => {
        const res = await request(app)
            .post('/api/user/login')
            .send({ email: 'extra@test.com', password: 'wrongPassword123' });
        expect(res.statusCode).toBe(401);
    });

    it('Debe crear un Albarán (Prueba DeliveryNote)', async () => {
        const res = await request(app)
            .post('/api/deliverynote')
            .set('Authorization', `Bearer ${token}`)
            .send({
                client: clientId,
                project: projectId,
                items: [{ concept: 'Test', quantity: 1 }]
            });
        expect(res.statusCode).toBe(201);
    });
});