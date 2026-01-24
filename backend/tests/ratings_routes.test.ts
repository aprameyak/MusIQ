
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

jest.mock('../src/middleware/validation.middleware', () => ({
    validate: () => (_req: any, _res: any, next: any) => next()
}));

jest.mock('../src/middleware/auth.middleware', () => ({
    authMiddleware: jest.fn((req: any, _res: any, next: any) => {
        req.userId = 'test-id';
        req.userRole = 'user';
        next();
    })
}));

import request from 'supertest';
import app from '../src/index';

describe('Ratings Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /api/ratings', () => {
        const body = { musicItemId: 'mid', rating: 10, tags: ['cool'] };

        it('should update existing rating', async () => {
            mockPool.query
                .mockResolvedValueOnce({ rows: [{ id: 'mid' }] })
                .mockResolvedValueOnce({ rows: [{ id: 'rid' }] })
                .mockResolvedValueOnce({ rows: [{ id: 'rid', tags: [] }] })
                .mockResolvedValueOnce({});

            const res = await request(app).post('/api/ratings').send(body);
            expect(res.status).toBe(200);
            expect(mockPool.query).toHaveBeenCalledWith(expect.stringContaining('UPDATE ratings'), expect.anything());
        });

        it('should insert new rating', async () => {
            mockPool.query
                .mockResolvedValueOnce({ rows: [{ id: 'mid' }] })
                .mockResolvedValueOnce({ rows: [] })
                .mockResolvedValueOnce({ rows: [{ id: 'rid', tags: [] }] })
                .mockResolvedValueOnce({});

            const res = await request(app).post('/api/ratings').send(body);
            expect(res.status).toBe(200);
            expect(mockPool.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO ratings'), expect.anything());
        });

        it('should return 404 if item missing', async () => {
            mockPool.query.mockResolvedValueOnce({ rows: [] });
            const res = await request(app).post('/api/ratings').send(body);
            expect(res.status).toBe(404);
        });
    });

    describe('GET /api/ratings/:musicItemId', () => {
        it('should return ratings list', async () => {
            mockPool.query.mockResolvedValue({ rows: [{ id: 'rid', username: 'u' }] });
            const res = await request(app).get('/api/ratings/mid');
            expect(res.status).toBe(200);
            expect(res.body.data[0].id).toBe('rid');
        });
    });

    describe('GET /api/ratings/user/:userId', () => {
        it('should return ratings for self', async () => {
            mockPool.query.mockResolvedValue({ rows: [{ id: 'rid', title: 'Song' }] });
            const res = await request(app).get('/api/ratings/user/test-id');
            expect(res.status).toBe(200);
        });

        it('should return 403 for other user', async () => {
            const res = await request(app).get('/api/ratings/user/other');
            expect(res.status).toBe(403);
        });

        it('should allow admin to see other user ratings', async () => {
            const { authMiddleware } = require('../src/middleware/auth.middleware');
            authMiddleware.mockImplementationOnce((req: any, _res: any, next: any) => {
                req.userId = 'admin-id';
                req.userRole = 'admin';
                next();
            });
            mockPool.query.mockResolvedValue({ rows: [] });
            const res = await request(app).get('/api/ratings/user/other');
            expect(res.status).toBe(200);
        });
    });
});
