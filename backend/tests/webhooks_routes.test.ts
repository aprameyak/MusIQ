
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

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

jest.mock('../src/middleware/discord-auth.middleware', () => ({
    discordAuthMiddleware: (_req: any, _res: any, next: any) => next()
}));

jest.mock('../src/middleware/auth.middleware', () => ({
    authMiddleware: (_req: any, _res: any, next: any) => next()
}));

import request from 'supertest';
import app from '../src/index';

describe('Webhooks Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        process.env.GITHUB_OWNER = 'owner';
        process.env.GITHUB_REPO = 'repo';
        process.env.GITHUB_TOKEN = 'token';
    });

    it('should handle PONG (type 1)', async () => {
        const res = await request(app).post('/api/webhooks').send({ type: 1 });
        expect(res.status).toBe(200);
        expect(res.body.type).toBe(1);
    });

    it('should handle missing metadata in create-issue', async () => {
        const res = await request(app)
            .post('/api/webhooks')
            .send({ type: 2, data: { name: 'create-issue' } });
        expect(res.status).toBe(400);
    });

    it('should handle invalid metadata in create-issue', async () => {
        const res = await request(app)
            .post('/api/webhooks')
            .send({ type: 2, data: { name: 'create-issue' }, application_id: 'short', token: 'short' });
        expect(res.status).toBe(400);
    });

    it('should handle create-issue successfully', async () => {
        const validId = '123456789012345678';
        const validToken = 'a'.repeat(60);

        mockedAxios.post.mockResolvedValueOnce({ status: 201, data: { html_url: 'http://github.com' } });
        mockedAxios.post.mockResolvedValueOnce({ status: 200 });

        const res = await request(app)
            .post('/api/webhooks')
            .send({
                type: 2,
                application_id: validId,
                token: validToken,
                data: {
                    name: 'create-issue',
                    options: [{ name: 'title', value: 'Title' }, { name: 'body', value: 'Body' }]
                }
            });

        expect(res.status).toBe(200);
        expect(res.body.type).toBe(5);


        await new Promise(resolve => setTimeout(resolve, 100));
        expect(mockedAxios.post).toHaveBeenCalledTimes(2);
    });

    it('should handle create-issue failure', async () => {
        const validId = '123456789012345678';
        const validToken = 'a'.repeat(60);

        mockedAxios.post.mockRejectedValueOnce(new Error('GitHub error'));
        mockedAxios.post.mockResolvedValueOnce({ status: 200 });

        const res = await request(app)
            .post('/api/webhooks')
            .send({
                type: 2,
                application_id: validId,
                token: validToken,
                data: {
                    name: 'create-issue',
                    options: [{ name: 'title', value: 'Title' }]
                }
            });

        expect(res.status).toBe(200);
        await new Promise(resolve => setTimeout(resolve, 100));
        expect(mockedAxios.post).toHaveBeenCalledTimes(2);
    });

    it('should handle other interaction type', async () => {
        const res = await request(app).post('/api/webhooks').send({ type: 3 });
        expect(res.status).toBe(200);
        expect(res.body.type).toBe(4);
    });
});
