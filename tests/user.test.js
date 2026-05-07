import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import * as dbHandler from './setup.js';
import bcrypt from 'bcryptjs';
import { User } from '../src/models/User.js';
import { Company } from '../src/models/Company.js';

beforeAll(async () => {
    await dbHandler.connectDB();
}, 30000);

afterAll(async () => {
    await dbHandler.closeDB();
}, 30000);

describe('API Usuarios', () => {
    it('Debe registrar un usuario', async () => {
        const res = await request(app)
            .post('/api/user/register')
            .send({ email: 'nuevo@test.com', password: 'Password123' });
        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('accessToken');
    });

    it('No debe registrar con email duplicado verificado', async () => {
        const hashed = await bcrypt.hash('Password123', 10);
        await User.create({ email: 'dup@test.com', password: hashed, status: 'verified' });
        const res = await request(app)
            .post('/api/user/register')
            .send({ email: 'dup@test.com', password: 'Password123' });
        expect(res.statusCode).toBe(409);
    });

    it('Debe hacer login correctamente', async () => {
        const hashed = await bcrypt.hash('Password123', 10);
        await User.create({ email: 'login@test.com', password: hashed, status: 'verified' });
        const res = await request(app)
            .post('/api/user/login')
            .send({ email: 'login@test.com', password: 'Password123' });
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('accessToken');
    });

    it('Debe fallar login con credenciales incorrectas', async () => {
        const hashed = await bcrypt.hash('Password123', 10);
        await User.create({ email: 'fail@test.com', password: hashed, status: 'verified' });
        const res = await request(app)
            .post('/api/user/login')
            .send({ email: 'fail@test.com', password: 'WrongPassword1' });
        expect(res.statusCode).toBe(401);
    });

    it('Debe obtener el usuario autenticado', async () => {
        const hashed = await bcrypt.hash('Password123', 10);
        const company = await Company.create({ name: 'MiEmpresa', cif: 'B11111111', owner: new mongoose.Types.ObjectId() });
        await User.create({ email: 'me@test.com', password: hashed, status: 'verified', company: company._id });
        const loginRes = await request(app)
            .post('/api/user/login')
            .send({ email: 'me@test.com', password: 'Password123' });
        const token = loginRes.body.accessToken;
        const res = await request(app)
            .get('/api/user')
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('email', 'me@test.com');
    });

    it('Debe rechazar acceso sin token', async () => {
        const res = await request(app).get('/api/user');
        expect(res.statusCode).toBe(401);
    });

    it('Debe refrescar el token', async () => {
        const hashed = await bcrypt.hash('Password123', 10);
        await User.create({ email: 'refresh@test.com', password: hashed, status: 'verified' });
        const loginRes = await request(app)
            .post('/api/user/login')
            .send({ email: 'refresh@test.com', password: 'Password123' });
        const refreshToken = loginRes.body.refreshToken;
        const res = await request(app)
            .post('/api/user/refresh')
            .send({ refreshToken });
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('accessToken');
    });

    it('Debe actualizar datos personales', async () => {
        const hashed = await bcrypt.hash('Password123', 10);
        await User.create({ email: 'personal@test.com', password: hashed, status: 'verified' });
        const loginRes = await request(app)
            .post('/api/user/login')
            .send({ email: 'personal@test.com', password: 'Password123' });
        const token = loginRes.body.accessToken;
        const res = await request(app)
            .put('/api/user/register')
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'Alex', lastName: 'Garcia', nif: '12345678A' });
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('name', 'Alex');
    });

    it('Debe crear una compania', async () => {
        const hashed = await bcrypt.hash('Password123', 10);
        await User.create({ email: 'company@test.com', password: hashed, status: 'verified', name: 'Alex', lastName: 'G', nif: '12345678A' });
        const loginRes = await request(app)
            .post('/api/user/login')
            .send({ email: 'company@test.com', password: 'Password123' });
        const token = loginRes.body.accessToken;
        const res = await request(app)
            .patch('/api/user/company')
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'Mi Empresa SL', cif: 'B99999999', isFreelance: false });
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('company');
    });

    it('Debe cambiar la contrasena', async () => {
        const hashed = await bcrypt.hash('Password123', 10);
        await User.create({ email: 'pwd@test.com', password: hashed, status: 'verified' });
        const loginRes = await request(app)
            .post('/api/user/login')
            .send({ email: 'pwd@test.com', password: 'Password123' });
        const token = loginRes.body.accessToken;
        const res = await request(app)
            .put('/api/user/password')
            .set('Authorization', `Bearer ${token}`)
            .send({ currentPassword: 'Password123', newPassword: 'NewPassword456' });
        expect(res.statusCode).toBe(200);
    });

    it('Debe eliminar el usuario (soft delete)', async () => {
        const hashed = await bcrypt.hash('Password123', 10);
        await User.create({ email: 'softdelete@test.com', password: hashed, status: 'verified' });
        const loginRes = await request(app)
            .post('/api/user/login')
            .send({ email: 'softdelete@test.com', password: 'Password123' });
        const token = loginRes.body.accessToken;
        const res = await request(app)
            .delete('/api/user?soft=true')
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toBe(204);
    });

    it('Debe eliminar el usuario (hard delete)', async () => {
        const hashed = await bcrypt.hash('Password123', 10);
        await User.create({ email: 'harddelete@test.com', password: hashed, status: 'verified' });
        const loginRes = await request(app)
            .post('/api/user/login')
            .send({ email: 'harddelete@test.com', password: 'Password123' });
        const token = loginRes.body.accessToken;
        const res = await request(app)
            .delete('/api/user')
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toBe(204);
    });
});