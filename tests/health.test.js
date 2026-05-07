import request from 'supertest';
import app from '../src/app.js';
import * as dbHandler from './setup.js';

beforeAll(async () => await dbHandler.connectDB());
afterAll(async () => await dbHandler.closeDB());

describe('GET /health', () => {
    it('Debe devolver el estado ok del servidor', async () => {
        const res = await request(app).get('/health');

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('status', 'ok');
        expect(res.body).toHaveProperty('db');
    });
});