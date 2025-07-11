import { jest } from '@jest/globals';
import request from 'supertest';

const mockInfo = {
    findOne: jest.fn(),
    prototype: {
        save: jest.fn(),
    },
};

await jest.unstable_mockModule('../../src/model/info.js', () => ({
    Info: mockInfo,
}));

const { Info } = await import('../../src/model/info.js');
const imported = await import('../info.js');
const app = imported.default || imported;

describe('Info API routes', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /user-info/:email', () => {
        it('should get user info by email', async () => {
            Info.findOne.mockResolvedValue({ email: 'pure09401@gmail.com', name: 'Test User' });
            const res = await request(app).get('/user-info/test@example.com');
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('email');
        });

        it('should handle server error', async () => {
            Info.findOne.mockRejectedValue(new Error('DB error'));
            const res = await request(app).get('/user-info/pure09401@gmail.com');
            expect(res.statusCode).toBe(500);
        });
    });

    describe('POST /save-user-info', () => {
        it('should save user info successfully', async () => {
            Info.findOne.mockResolvedValue(null);
            Info.prototype.save.mockResolvedValue({});
            const res = await request(app)
                .post('/save-user-info')
                .set('Content-Type', 'application/json')
                .send({ email: 'pure09401@gmail.com', userInfo: { name: 'Test User' } });
            expect(res.statusCode).toBe(200);
        });

        it('should handle server error', async () => {
            Info.findOne.mockRejectedValue(new Error('DB error'));
            const res = await request(app)
                .post('/save-user-info')
                .set('Content-Type', 'application/json')
                .send({ email: 'pure09401@gmail.com', userInfo: { name: 'Test User' } });
            expect(res.statusCode).toBe(500);
        });
    });
});
