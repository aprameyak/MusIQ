
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
        req.userId = 'test-user-id';
        next();
    })
}));

import request from 'supertest';
import app from '../src/index';

describe('Posts Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /api/posts', () => {
        const body = { musicItemId: 'uuid', rating: 8, text: 'cool' };

        it('should create post and update existing rating', async () => {
            mockPool.query
                .mockResolvedValueOnce({ rows: [{ id: 'uuid' }] })
                .mockResolvedValueOnce({ rows: [{ id: 'rid' }] })
                .mockResolvedValueOnce({ rows: [{ id: 'rid' }] })
                .mockResolvedValueOnce({ rows: [{ id: 'pid', text: 'cool', rating: 8 }] })
                .mockResolvedValueOnce({ rows: [{ username: 'u' }] })
                .mockResolvedValueOnce({ rows: [{ id: 'uuid', title: 'T' }] });

            const res = await request(app).post('/api/posts').send(body);
            expect(res.status).toBe(200);
            expect(mockPool.query).toHaveBeenCalledWith(expect.stringContaining('UPDATE ratings'), expect.anything());
        });

        it('should create post and insert new rating', async () => {
            mockPool.query
                .mockResolvedValueOnce({ rows: [{ id: 'uuid' }] })
                .mockResolvedValueOnce({ rows: [] })
                .mockResolvedValueOnce({ rows: [{ id: 'rid' }] })
                .mockResolvedValueOnce({ rows: [{ id: 'pid', text: 'cool', rating: 8 }] })
                .mockResolvedValueOnce({ rows: [{ username: 'u' }] })
                .mockResolvedValueOnce({ rows: [{ id: 'uuid' }] });

            const res = await request(app).post('/api/posts').send(body);
            expect(res.status).toBe(200);
            expect(mockPool.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO ratings'), expect.anything());
        });

        it('should return 404 if music item missing', async () => {
            mockPool.query.mockResolvedValueOnce({ rows: [] });
            const res = await request(app).post('/api/posts').send(body);
            expect(res.status).toBe(404);
        });

        it('should return 401 if unauthorized', async () => {
            const { authMiddleware } = require('../src/middleware/auth.middleware');
            authMiddleware.mockImplementationOnce((req: any, _res: any, next: any) => {
                req.userId = undefined;
                next();
            });
            const res = await request(app).post('/api/posts').send(body);
            expect(res.status).toBe(401);
        });

        it('should handle error', async () => {
            mockPool.query.mockRejectedValue(new Error('err'));
            const res = await request(app).post('/api/posts').send(body);
            expect(res.status).toBe(500);
        });
    });

    describe('POST /api/posts/create', () => {
        const body = { name: 'New Item', category: 'song', rating: 9, text: 'wow' };

        it('should use existing music item', async () => {
            mockPool.query
                .mockResolvedValueOnce({ rows: [{ id: 'uuid' }] })
                .mockResolvedValueOnce({ rows: [] })
                .mockResolvedValueOnce({ rows: [] })
                .mockResolvedValueOnce({ rows: [{ id: 'pid' }] })
                .mockResolvedValueOnce({ rows: [{ username: 'u' }] })
                .mockResolvedValueOnce({ rows: [{ id: 'uuid' }] });

            const res = await request(app).post('/api/posts/create').send(body);
            expect(res.status).toBe(200);
        });

        it('should create new music item if not found', async () => {
            mockPool.query
                .mockResolvedValueOnce({ rows: [] })
                .mockResolvedValueOnce({ rows: [{ id: 'new-uuid' }] })
                .mockResolvedValueOnce({ rows: [] })
                .mockResolvedValueOnce({ rows: [] })
                .mockResolvedValueOnce({ rows: [{ id: 'pid' }] })
                .mockResolvedValueOnce({ rows: [{ username: 'u' }] })
                .mockResolvedValueOnce({ rows: [{ id: 'new-uuid' }] });

            const res = await request(app).post('/api/posts/create').send(body);
            expect(res.status).toBe(200);
        });

        it('should handle artist category', async () => {
            mockPool.query
                .mockResolvedValueOnce({ rows: [] })
                .mockResolvedValueOnce({ rows: [{ id: 'new-uuid' }] })
                .mockResolvedValueOnce({ rows: [] })
                .mockResolvedValueOnce({ rows: [] })
                .mockResolvedValueOnce({ rows: [{ id: 'pid' }] })
                .mockResolvedValueOnce({ rows: [{ username: 'u' }] })
                .mockResolvedValueOnce({ rows: [{ id: 'new-uuid' }] });

            await request(app).post('/api/posts/create').send({ ...body, category: 'artist' });
            expect(mockPool.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO music_items'), expect.arrayContaining(['artist', 'New Item', 'New Item']));
        });

        it('should update existing rating if found in create', async () => {
            mockPool.query
                .mockResolvedValueOnce({ rows: [{ id: 'uuid' }] })
                .mockResolvedValueOnce({ rows: [{ id: 'rid' }] })
                .mockResolvedValueOnce({ rows: [] })
                .mockResolvedValueOnce({ rows: [{ id: 'pid' }] })
                .mockResolvedValueOnce({ rows: [{ username: 'u' }] })
                .mockResolvedValueOnce({ rows: [{ id: 'uuid' }] });

            const res = await request(app).post('/api/posts/create').send(body);
            expect(res.status).toBe(200);
            expect(mockPool.query).toHaveBeenCalledWith(expect.stringContaining('UPDATE ratings'), expect.anything());
        });
    });

    describe('GET /api/posts/feed', () => {
        it('should return feed with pagination', async () => {
            mockPool.query
                .mockResolvedValueOnce({ rows: [{ id: 'pid' }] })
                .mockResolvedValueOnce({ rows: [{ total: '21' }] });
            const res = await request(app).get('/api/posts/feed?page=1&limit=20');
            expect(res.status).toBe(200);
            expect(res.body.data.pagination.hasMore).toBe(true);
            expect(res.body.data.pagination.nextPage).toBe(2);
        });

        it('should handle no more pages', async () => {
            mockPool.query
                .mockResolvedValueOnce({ rows: [{ id: 'pid' }] })
                .mockResolvedValueOnce({ rows: [{ total: '1' }] });
            const res = await request(app).get('/api/posts/feed');
            expect(res.status).toBe(200);
            expect(res.body.data.pagination.hasMore).toBe(false);
        });
    });

    describe('POST /api/posts/:id/like', () => {
        it('should like other user post and notify', async () => {
            mockPool.query
                .mockResolvedValueOnce({ rows: [{ user_id: 'other-id' }] })
                .mockResolvedValueOnce({})
                .mockResolvedValueOnce({ rows: [{ username: 'me' }] })
                .mockResolvedValueOnce({});

            const res = await request(app).post('/api/posts/1/like');
            expect(res.status).toBe(200);
            expect(mockPool.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO notifications'), expect.anything());
        });

        it('should like own post and NOT notify', async () => {
            mockPool.query
                .mockResolvedValueOnce({ rows: [{ user_id: 'test-user-id' }] })
                .mockResolvedValueOnce({});
            const res = await request(app).post('/api/posts/1/like');
            expect(res.status).toBe(200);
            expect(mockPool.query).not.toHaveBeenCalledWith(expect.stringContaining('INSERT INTO notifications'), expect.anything());
        });

        it('should return 404 if post not found in like', async () => {
            mockPool.query.mockResolvedValueOnce({ rows: [] });
            const res = await request(app).post('/api/posts/1/like');
            expect(res.status).toBe(404);
        });

        it('should handle duplicate like gracefully', async () => {
            mockPool.query
                .mockResolvedValueOnce({ rows: [{ user_id: 'other' }] })
                .mockRejectedValueOnce({ code: '23505' });
            const res = await request(app).post('/api/posts/1/like');
            expect(res.status).toBe(200);
            expect(res.body.message).toContain('already liked');
        });

        it('should throw other db errors during like', async () => {
            mockPool.query
                .mockResolvedValueOnce({ rows: [{ user_id: 'other' }] })
                .mockRejectedValueOnce(new Error('db fail'));
            const res = await request(app).post('/api/posts/1/like');
            expect(res.status).toBe(500);
        });
    });

    describe('DELETE /api/posts/:id/like', () => {
        it('should unlike successfully', async () => {
            mockPool.query.mockResolvedValue({ rows: [{ id: '1' }] });
            const res = await request(app).delete('/api/posts/1/like');
            expect(res.status).toBe(200);
        });

        it('should return 404 if not liked', async () => {
            mockPool.query.mockResolvedValue({ rows: [] });
            const res = await request(app).delete('/api/posts/1/like');
            expect(res.status).toBe(404);
        });
    });

    describe('GET /api/posts/:id/comments', () => {
        it('should return comments', async () => {
            mockPool.query.mockResolvedValue({ rows: [{ id: 'cid', username: 'u', text: 'hi' }] });
            const res = await request(app).get('/api/posts/1/comments');
            expect(res.status).toBe(200);
            expect(res.body.data[0].text).toBe('hi');
        });
    });

    describe('POST /api/posts/:id/comment', () => {
        it('should add comment and notify', async () => {
            mockPool.query
                .mockResolvedValueOnce({ rows: [{ user_id: 'other-id' }] })
                .mockResolvedValueOnce({ rows: [{ id: 'cid' }] })
                .mockResolvedValueOnce({ rows: [{ username: 'me' }] })
                .mockResolvedValueOnce({});

            const res = await request(app).post('/api/posts/1/comment').send({ text: 'nice' });
            expect(res.status).toBe(200);
            expect(mockPool.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO notifications'), expect.anything());
        });

        it('should return 400 for empty comment', async () => {
            const res = await request(app).post('/api/posts/1/comment').send({ text: ' ' });
            expect(res.status).toBe(400);
        });

        it('should return 404 if post not found in comment', async () => {
            mockPool.query.mockResolvedValueOnce({ rows: [] });
            const res = await request(app).post('/api/posts/1/comment').send({ text: 'hi' });
            expect(res.status).toBe(404);
        });
    });

    describe('POST /api/posts/:id/share', () => {
        it('should share post and notify', async () => {
            mockPool.query
                .mockResolvedValueOnce({ rows: [{ user_id: 'other-id' }] })
                .mockResolvedValueOnce({ rows: [{ id: 'rid' }] })
                .mockResolvedValueOnce({ rows: [{ username: 'me' }] })
                .mockResolvedValueOnce({});

            const res = await request(app).post('/api/posts/1/share').send({ text: 'spread' });
            expect(res.status).toBe(200);
            expect(mockPool.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO notifications'), expect.anything());
        });

        it('should return 404 if post not found in share', async () => {
            mockPool.query.mockResolvedValueOnce({ rows: [] });
            const res = await request(app).post('/api/posts/1/share').send({ text: 'hi' });
            expect(res.status).toBe(404);
        });
    });
});
