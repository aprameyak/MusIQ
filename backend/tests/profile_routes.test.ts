
const mockPool = {
    query: jest.fn()
};
const mockAuthService = {
    updateProfile: jest.fn()
};

jest.mock('../src/database/connection', () => ({
    getDatabasePool: jest.fn(() => mockPool)
}));

jest.mock('../src/services/auth.service', () => ({
    AuthService: jest.fn(() => mockAuthService)
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
        next();
    })
}));

import request from 'supertest';
import app from '../src/index';

describe('Profile Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/profile', () => {
        it('should return user info', async () => {
            mockPool.query.mockResolvedValue({ rows: [{ id: 'test-id', username: 'u' }] });
            const res = await request(app).get('/api/profile');
            expect(res.status).toBe(200);
            expect(res.body.data.username).toBe('u');
        });

        it('should return 404 if user not found', async () => {
            mockPool.query.mockResolvedValue({ rows: [] });
            const res = await request(app).get('/api/profile');
            expect(res.status).toBe(404);
        });
    });

    describe('GET /api/profile/taste', () => {
        it('should calculate taste profile', async () => {
            mockPool.query
                .mockResolvedValueOnce({ rows: [{ total_ratings: '20', avg_rating: '8.5', unique_items_rated: '15' }] })
                .mockResolvedValueOnce({ rows: [{ genre: 'Rock', count: '5' }, { genre: 'Pop', count: '2' }] })
                .mockResolvedValueOnce({ rows: [{ release_date: '1995-01-01', count: '3' }] })
                .mockResolvedValueOnce({ rows: [{ tag: 'Classic', count: '4' }] })
                .mockResolvedValueOnce({ rows: [{ rating_stddev: '1.2' }] });

            const res = await request(app).get('/api/profile/taste');
            expect(res.status).toBe(200);
            expect(res.body.data.tasteScore).toBeDefined();
            expect(res.body.data.genreAffinity.Rock).toBe(100);
            expect(res.body.data.decadePreference['1990s']).toBe(100);
        });

        it('should handle zero ratings gracefully', async () => {
            mockPool.query
                .mockResolvedValueOnce({ rows: [{ total_ratings: '0', avg_rating: null }] })
                .mockResolvedValueOnce({ rows: [] })
                .mockResolvedValueOnce({ rows: [] })
                .mockResolvedValueOnce({ rows: [] })
                .mockResolvedValueOnce({ rows: [{ rating_stddev: null }] });
            const res = await request(app).get('/api/profile/taste');
            expect(res.status).toBe(200);
            expect(res.body.data.tasteScore).toBe(0);
        });

        it('should handle invalid release dates', async () => {
            mockPool.query
                .mockResolvedValueOnce({ rows: [{ total_ratings: '1', avg_rating: '5' }] })
                .mockResolvedValueOnce({ rows: [] })
                .mockResolvedValueOnce({ rows: [{ release_date: 'invalid', count: '1' }] })
                .mockResolvedValueOnce({ rows: [] })
                .mockResolvedValueOnce({ rows: [{}] });
            const res = await request(app).get('/api/profile/taste');
            expect(res.status).toBe(200);
            expect(res.body.data.decadePreference).toEqual({});
        });
    });

    describe('PUT /api/profile', () => {
        it('should update profile including username', async () => {
            mockAuthService.updateProfile.mockResolvedValue({});
            mockPool.query
                .mockResolvedValueOnce({ rows: [] })
                .mockResolvedValueOnce({})
                .mockResolvedValueOnce({ rows: [{ id: 'test-id', username: 'new-u' }] });

            const res = await request(app).put('/api/profile').send({ username: 'new-u', firstName: 'f' });
            expect(res.status).toBe(200);
            expect(res.body.data.username).toBe('new-u');
        });

        it('should throw if username taken', async () => {
            mockAuthService.updateProfile.mockResolvedValue({});
            mockPool.query.mockResolvedValueOnce({ rows: [{ id: 'other' }] });
            const res = await request(app).put('/api/profile').send({ username: 'taken' });
            expect(res.status).toBe(409);
        });

        it('should throw if no fields provided', async () => {
            const res = await request(app).put('/api/profile').send({});
            expect(res.status).toBe(400);
        });
    });

    describe('GET /api/profile/search', () => {
        it('should search successfully', async () => {
            mockPool.query.mockResolvedValue({ rows: [{ id: '1', username: 'found' }] });
            const res = await request(app).get('/api/profile/search?q=query');
            expect(res.status).toBe(200);
            expect(res.body.data[0].username).toBe('found');
        });

        it('should throw if query too short', async () => {
            const res = await request(app).get('/api/profile/search?q=a');
            expect(res.status).toBe(400);
        });
    });
});
