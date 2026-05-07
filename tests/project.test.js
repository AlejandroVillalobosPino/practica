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
    const company = await Company.create({ name: 'Proyectos', cif: 'B88888888', owner: new mongoose.Types.ObjectId() });
    const user = await User.create({ email: `p${Date.now()}@test.com`, password: 'Password1234', company: company._id, status: 'verified' });
    token = jwt.sign({ id: user._id.toString() }, process.env.JWT_SECRET || 'secret');
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
});