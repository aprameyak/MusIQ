
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
    authMiddleware: (_req: any, _res: any, next: any) => next()
}));

import request from 'supertest';
import app from '../src/index';

describe('Rankings Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/rankings/albums', () => {
        it('should return album rankings for week', async () => {
            mockPool.query
                .mockResolvedValueOnce({ rows: [{ id: '1', title: 'A', rating: '9' }] })
                .mockResolvedValueOnce({ rows: [{ id: '1', rank: '2' }] })
                .mockResolvedValueOnce({ rows: [{ id: '1' }] });

            const res = await request(app).get('/api/rankings/albums?timeframe=week');
            expect(res.status).toBe(200);
            expect(res.body.data[0].change).toBe(1);
            expect(res.body.data[0].isNew).toBe(true);
        });

        it('should handle month timeframe', async () => {
            mockPool.query
                .mockResolvedValueOnce({ rows: [{ id: '1' }] })
                .mockResolvedValueOnce({ rows: [] })
                .mockResolvedValueOnce({ rows: [] });
            const res = await request(app).get('/api/rankings/albums?timeframe=month');
            expect(res.status).toBe(200);
        });

        it('should handle year timeframe', async () => {
            mockPool.query
                .mockResolvedValueOnce({ rows: [{ id: '1' }] })
                .mockResolvedValueOnce({ rows: [] })
                .mockResolvedValueOnce({ rows: [] });
            const res = await request(app).get('/api/rankings/albums?timeframe=year');
            expect(res.status).toBe(200);
        });

        it('should handle all_time timeframe', async () => {
            mockPool.query
                .mockResolvedValueOnce({ rows: [{ id: '1' }] })
                .mockResolvedValueOnce({ rows: [] });
            const res = await request(app).get('/api/rankings/albums?timeframe=all_time');
            expect(res.status).toBe(200);
        });

        it('should handle error', async () => {
            mockPool.query.mockRejectedValue(new Error('err'));
            const res = await request(app).get('/api/rankings/albums');
            expect(res.status).toBe(500);
        });
    });

    describe('GET /api/rankings/songs', () => {
        it('should return song rankings', async () => {
            mockPool.query
                .mockResolvedValueOnce({ rows: [{ id: '1' }] })
                .mockResolvedValueOnce({ rows: [] })
                .mockResolvedValueOnce({ rows: [] });
            const res = await request(app).get('/api/rankings/songs?timeframe=week');
            expect(res.status).toBe(200);
        });

        it('should handle month and year for songs', async () => {
            mockPool.query.mockResolvedValue({ rows: [] });
            await request(app).get('/api/rankings/songs?timeframe=month');
            await request(app).get('/api/rankings/songs?timeframe=year');
        });
    });

    describe('GET /api/rankings/artists', () => {
        it('should return artist rankings', async () => {
            mockPool.query
                .mockResolvedValueOnce({ rows: [{ id: '1' }] })
                .mockResolvedValueOnce({ rows: [] })
                .mockResolvedValueOnce({ rows: [] });
            const res = await request(app).get('/api/rankings/artists?timeframe=week');
            expect(res.status).toBe(200);
        });

        it('should handle month and year for artists', async () => {
            mockPool.query.mockResolvedValue({ rows: [] });
            await request(app).get('/api/rankings/artists?timeframe=month');
            await request(app).get('/api/rankings/artists?timeframe=year');
        });
    });
});
