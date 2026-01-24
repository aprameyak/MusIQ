
const mockPool = {
    query: jest.fn()
};
jest.mock('../src/database/connection', () => ({
    getDatabasePool: jest.fn(() => mockPool)
}));

jest.mock('../src/middleware/rate-limit.middleware', () => ({
    authLimiter: (_req: any, _res: any, next: any) => next(),
    apiLimiter: (_req: any, _res: any, next: any) => next(),
    ratingLimiter: (_req: any, _res: any, next: any) => next(),
    searchLimiter: (_req: any, _res: any, next: any) => next(),
    webhookLimiter: (_req: any, _res: any, next: any) => next(),
    rateLimitMiddleware: (_req: any, _res: any, next: any) => next()
}));

jest.mock('../src/middleware/auth.middleware', () => ({
    authMiddleware: jest.fn((req: any, _res: any, next: any) => {
        req.userId = 'test-id';
        next();
    })
}));

import request from 'supertest';
import app from '../src/index';

describe('Notifications Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/notifications', () => {
        it('should return notifications list', async () => {
            mockPool.query.mockResolvedValue({ rows: [{ id: '1', title: 'T' }] });
            const res = await request(app).get('/api/notifications');
            expect(res.status).toBe(200);
            expect(res.body.data[0].title).toBe('T');
        });
    });

    describe('PUT /api/notifications/:id/read', () => {
        it('should mark as read', async () => {
            mockPool.query.mockResolvedValue({ rows: [{ id: '1' }] });
            const res = await request(app).put('/api/notifications/1/read');
            expect(res.status).toBe(200);
        });

        it('should return 404 if not found', async () => {
            mockPool.query.mockResolvedValue({ rows: [] });
            const res = await request(app).put('/api/notifications/1/read');
            expect(res.status).toBe(404);
        });
    });

    describe('PUT /api/notifications/read-all', () => {
        it('should mark all as read', async () => {
            mockPool.query.mockResolvedValue({});
            const res = await request(app).put('/api/notifications/read-all');
            expect(res.status).toBe(200);
        });
    });

    it('should return 401 if unauthorized', async () => {
        const { authMiddleware } = require('../src/middleware/auth.middleware');
        authMiddleware.mockImplementationOnce((req: any, _res: any, next: any) => {
            req.userId = undefined;
            next();
        });
        const res = await request(app).get('/api/notifications');
        expect(res.status).toBe(401);
    });
});
