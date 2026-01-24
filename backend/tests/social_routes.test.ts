
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

describe('Social Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/social/friends', () => {
        it('should return friends with detailed info', async () => {
            mockPool.query
                .mockResolvedValueOnce({ rows: [{ id: 'f1', username: 'u1', status: 'accepted', shared_artists: '5' }] })
                .mockResolvedValueOnce({ rows: [{ shared_ratings: '2', avg_rating_diff: '1.5' }] })
                .mockResolvedValueOnce({ rows: [{ genres: '["Rock", "Pop"]', count: '5' }] });

            const res = await request(app).get('/api/social/friends');
            expect(res.status).toBe(200);
            expect(res.body.data[0].topGenre).toBe('Rock');
        });

        it('should handle unknown top genre', async () => {
            mockPool.query
                .mockResolvedValueOnce({ rows: [{ id: 'f1', username: 'u1' }] })
                .mockResolvedValueOnce({ rows: [{}] })
                .mockResolvedValueOnce({ rows: [] });
            const res = await request(app).get('/api/social/friends');
            expect(res.status).toBe(200);
            expect(res.body.data[0].topGenre).toBe('Unknown');
        });

        it('should handle error', async () => {
            mockPool.query.mockRejectedValue(new Error('err'));
            const res = await request(app).get('/api/social/friends');
            expect(res.status).toBe(500);
        });
    });

    describe('POST /api/social/follow/:userId', () => {
        it('should follow new user', async () => {
            mockPool.query
                .mockResolvedValueOnce({ rows: [{ id: 'other' }] })
                .mockResolvedValueOnce({ rows: [] })
                .mockResolvedValueOnce({});
            const res = await request(app).post('/api/social/follow/other');
            expect(res.status).toBe(200);
            expect(res.body.message).toBe('Follow request sent');
        });

        it('should throw if following self', async () => {
            const res = await request(app).post('/api/social/follow/test-id');
            expect(res.status).toBe(400);
        });

        it('should return 404 if user not found', async () => {
            mockPool.query.mockResolvedValueOnce({ rows: [] });
            const res = await request(app).post('/api/social/follow/other');
            expect(res.status).toBe(404);
        });

        it('should handle already accepted', async () => {
            mockPool.query
                .mockResolvedValueOnce({ rows: [{ id: 'other' }] })
                .mockResolvedValueOnce({ rows: [{ status: 'accepted' }] });
            const res = await request(app).post('/api/social/follow/other');
            expect(res.status).toBe(200);
            expect(res.body.message).toContain('Already following');
        });

        it('should update pending status', async () => {
            mockPool.query
                .mockResolvedValueOnce({ rows: [{ id: 'other' }] })
                .mockResolvedValueOnce({ rows: [{ id: 'fid', status: 'pending' }] })
                .mockResolvedValueOnce({});
            const res = await request(app).post('/api/social/follow/other');
            expect(res.status).toBe(200);
            expect(mockPool.query).toHaveBeenCalledWith(expect.stringContaining('UPDATE friendships'), expect.anything());
        });
    });

    describe('DELETE /api/social/unfollow/:userId', () => {
        it('should unfollow successfully', async () => {
            mockPool.query.mockResolvedValue({ rows: [{ id: 'fid' }] });
            const res = await request(app).delete('/api/social/unfollow/other');
            expect(res.status).toBe(200);
        });

        it('should return 404 if not found', async () => {
            mockPool.query.mockResolvedValue({ rows: [] });
            const res = await request(app).delete('/api/social/unfollow/other');
            expect(res.status).toBe(404);
        });
    });

    describe('GET /api/social/compatibility/:userId', () => {
        it('should return compatibility', async () => {
            mockPool.query.mockResolvedValue({ rows: [{ shared_ratings: '5', avg_rating_diff: '1' }] });
            const res = await request(app).get('/api/social/compatibility/other');
            expect(res.status).toBe(200);
            expect(res.body.data.compatibility).toBeDefined();
        });
    });

    describe('GET /api/social/compare/:userId', () => {
        it('should return comparison', async () => {
            mockPool.query
                .mockResolvedValueOnce({ rows: [{ shared_count: '1' }] })
                .mockResolvedValueOnce({ rows: [{ shared_ratings: '1' }] })
                .mockResolvedValueOnce({ rows: [{ genres: '["Rock"]' }, { genres: '["Jazz"]' }] });

            const res = await request(app).get('/api/social/compare/other');
            expect(res.status).toBe(200);
            expect(res.body.data.sharedGenres).toContain('Rock');
        });
    });

    describe('GET /api/social/following', () => {
        it('should return following list', async () => {
            mockPool.query.mockResolvedValue({ rows: [{ id: 'f1' }] });
            const res = await request(app).get('/api/social/following');
            expect(res.status).toBe(200);
        });
    });

    describe('GET /api/social/followers', () => {
        it('should return followers list', async () => {
            mockPool.query.mockResolvedValue({ rows: [{ id: 'f1' }] });
            const res = await request(app).get('/api/social/followers');
            expect(res.status).toBe(200);
        });
    });

    it('should return 401 if unauthorized in a route', async () => {
        const { authMiddleware } = require('../src/middleware/auth.middleware');
        authMiddleware.mockImplementationOnce((req: any, _res: any, next: any) => {
            req.userId = undefined;
            next();
        });
        const res = await request(app).get('/api/social/friends');
        expect(res.status).toBe(401);
    });
});
