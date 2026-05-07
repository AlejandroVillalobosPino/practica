import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import * as dbHandler from './setup.js';
import jwt from 'jsonwebtoken';
import { User } from '../src/models/User.js';
import { Company } from '../src/models/Company.js';

let token;

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
                name: "Cliente Test",
                cif: "A12345678",
                email: "test@test.com",
                address: {
                    street: "Calle 1",
                    city: "Madrid",
                    postalCode: "28001",
                    province: "Madrid"
                }
            });

        expect(res.statusCode).toBe(201);
    });
});