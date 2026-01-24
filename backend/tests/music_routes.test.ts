
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
    validate: () => (_req: any, _res: any, next: any) => next(),
    signupValidation: [],
    loginValidation: [],
    ratingValidation: [],
    postValidation: [],
    createPostWithMusicItemValidation: []
}));

jest.mock('../src/middleware/auth.middleware', () => ({
    authMiddleware: jest.fn((req: any, _res: any, next: any) => {
        req.userId = 'test-user-id';
        next();
    })
}));

import request from 'supertest';
import app from '../src/index';

describe('Music Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/music/feed', () => {
        it('should return trending items', async () => {
            mockPool.query.mockResolvedValueOnce({ rows: [{ id: '1', recent_ratings: '5' }] });
            const res = await request(app).get('/api/music/feed?filter=trending');
            expect(res.status).toBe(200);
            expect(res.body.data[0].id).toBe('1');
        });

        it('should return forYou items', async () => {
            mockPool.query.mockResolvedValueOnce({ rows: [{ id: '1', recent_ratings: '0' }] });
            const res = await request(app).get('/api/music/feed?filter=forYou');
            expect(res.status).toBe(200);
        });

        it('should handle forYou without userId', async () => {
            const { authMiddleware } = require('../src/middleware/auth.middleware');
            authMiddleware.mockImplementationOnce((req: any, _res: any, next: any) => {
                req.userId = undefined;
                next();
            });
            mockPool.query.mockResolvedValueOnce({ rows: [{ id: '1' }] });
            const res = await request(app).get('/api/music/feed?filter=forYou');
            expect(res.status).toBe(200);
        });

        it('should handle trending change logic', async () => {
            mockPool.query
                .mockResolvedValueOnce({ rows: [{ id: '1', recent_ratings: '15' }] })
                .mockResolvedValueOnce({ rows: [{ count: '5' }] });
            const res = await request(app).get('/api/music/feed?filter=trending');
            expect(res.status).toBe(200);
            expect(res.body.data[0].trendingChange).toBe(10);
        });

        it('should handle other filter', async () => {
            mockPool.query.mockResolvedValueOnce({ rows: [] });
            const res = await request(app).get('/api/music/feed?filter=other');
            expect(res.status).toBe(200);
        });

        it('should handle error', async () => {
            mockPool.query.mockRejectedValue(new Error('err'));
            const res = await request(app).get('/api/music/feed');
            expect(res.status).toBe(500);
        });
    });

    describe('GET /api/music/:id', () => {
        it('should return item info', async () => {
            mockPool.query.mockResolvedValue({ rows: [{ id: '1', title: 'Song' }] });
            const res = await request(app).get('/api/music/1');
            expect(res.status).toBe(200);
            expect(res.body.data.title).toBe('Song');
        });

        it('should return 404 if item not found', async () => {
            mockPool.query.mockResolvedValue({ rows: [] });
            const res = await request(app).get('/api/music/1');
            expect(res.status).toBe(404);
        });

        it('should handle error', async () => {
            mockPool.query.mockRejectedValue(new Error('err'));
            const res = await request(app).get('/api/music/1');
            expect(res.status).toBe(500);
        });
    });

    describe('GET /api/music/search', () => {
        it('should search successfully', async () => {
            mockPool.query.mockResolvedValue({ rows: [{ id: '1', title: 'Result' }] });
            const res = await request(app).get('/api/music/search?q=query');
            expect(res.status).toBe(200);
            expect(res.body.data[0].title).toBe('Result');
        });

        it('should handle short query', async () => {
            const res = await request(app).get('/api/music/search?q=a');
            expect(res.status).toBe(200);
            expect(res.body.data).toEqual([]);
        });

        it('should handle missing query', async () => {
            const res = await request(app).get('/api/music/search?q=');
            expect(res.status).toBe(200);
        });

        it('should handle array query', async () => {
            mockPool.query.mockResolvedValue({ rows: [] });
            const res = await request(app).get('/api/music/search?q=query1&q=query2');
            expect(res.status).toBe(200);
        });

        it('should handle error', async () => {
            mockPool.query.mockRejectedValue(new Error('err'));
            const res = await request(app).get('/api/music/search?q=query');
            expect(res.status).toBe(500);
        });
    });
});
