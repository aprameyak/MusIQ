
const mockAuthService = {
    signup: jest.fn(),
    login: jest.fn(),
    forgotPassword: jest.fn(),
    refreshToken: jest.fn(),
    logout: jest.fn(),
    getUserById: jest.fn()
};

const mockSupabaseService = {
    verifyOtp: jest.fn(),
    updatePassword: jest.fn(),
    updateUserPassword: jest.fn(),
    verifyAccessToken: jest.fn()
};

jest.mock('../src/services/auth.service', () => ({
    AuthService: jest.fn(() => mockAuthService)
}));

jest.mock('../src/services/supabase.service', () => ({
    supabaseService: mockSupabaseService
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
import { authMiddleware } from '../src/middleware/auth.middleware';

describe('Auth Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /api/auth/signup', () => {
        it('should signup successfully', async () => {
            mockAuthService.signup.mockResolvedValue(undefined);
            const res = await request(app)
                .post('/api/auth/signup')
                .send({ email: 't@e.com', username: 'u', password: 'p', firstName: 'f', lastName: 'l' });
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });

        it('should handle error', async () => {
            mockAuthService.signup.mockRejectedValue(new Error('err'));
            const res = await request(app)
                .post('/api/auth/signup')
                .send({ email: 't@e.com', username: 'u', password: 'p', firstName: 'f', lastName: 'l' });
            expect(res.status).toBe(500);
        });
    });

    describe('POST /api/auth/login', () => {
        it('should login successfully', async () => {
            mockAuthService.login.mockResolvedValue({ accessToken: 'at' });
            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: 't@e.com', password: 'p' });
            expect(res.status).toBe(200);
            expect(res.body.data.accessToken).toBe('at');
        });
    });

    describe('POST /api/auth/forgot-password', () => {
        it('should send reset link', async () => {
            mockAuthService.forgotPassword.mockResolvedValue(undefined);
            const res = await request(app)
                .post('/api/auth/forgot-password')
                .send({ email: 't@e.com' });
            expect(res.status).toBe(200);
        });
    });

    describe('POST /api/auth/refresh', () => {
        it('should refresh token', async () => {
            mockAuthService.refreshToken.mockResolvedValue({ accessToken: 'at' });
            const res = await request(app)
                .post('/api/auth/refresh')
                .send({ refreshToken: 'rt' });
            expect(res.status).toBe(200);
        });

        it('should return 400 if no token', async () => {
            const res = await request(app)
                .post('/api/auth/refresh')
                .send({});
            expect(res.status).toBe(400);
        });
    });

    describe('POST /api/auth/logout', () => {
        it('should logout successfully', async () => {
            mockAuthService.logout.mockResolvedValue(undefined);
            const res = await request(app)
                .post('/api/auth/logout')
                .set('Authorization', 'Bearer token');
            expect(res.status).toBe(200);
        });
    });

    describe('GET /api/auth/me', () => {
        it('should return user info', async () => {
            mockAuthService.getUserById.mockResolvedValue({ id: '1', username: 'u' });
            const res = await request(app)
                .get('/api/auth/me')
                .set('Authorization', 'Bearer token');
            expect(res.status).toBe(200);
            expect(res.body.data.username).toBe('u');
        });

        it('should return 404 if user not found', async () => {
            mockAuthService.getUserById.mockResolvedValue(null);
            const res = await request(app)
                .get('/api/auth/me')
                .set('Authorization', 'Bearer token');
            expect(res.status).toBe(404);
        });

        it('should return 401 if no userId', async () => {
            (authMiddleware as jest.Mock).mockImplementationOnce((req: any, _res: any, next: any) => {
                req.userId = undefined;
                next();
            });
            const res = await request(app).get('/api/auth/me');
            expect(res.status).toBe(401);
        });
    });

    describe('POST /api/auth/reset-password', () => {
        it('should reset password successfully', async () => {
            mockSupabaseService.verifyOtp.mockResolvedValue({ session: { access_token: 'at' } });
            mockSupabaseService.updatePassword.mockResolvedValue(undefined);
            const res = await request(app)
                .post('/api/auth/reset-password')
                .send({ code: 'c', newPassword: 'p' });
            expect(res.status).toBe(200);
        });

        it('should return 400 if missing body', async () => {
            const res = await request(app).post('/api/auth/reset-password').send({});
            expect(res.status).toBe(400);
        });

        it('should return 400 if invalid session', async () => {
            mockSupabaseService.verifyOtp.mockResolvedValue({ session: null });
            const res = await request(app)
                .post('/api/auth/reset-password')
                .send({ code: 'c', newPassword: 'p' });
            expect(res.status).toBe(400);
        });
    });

    describe('POST /api/auth/verify-email', () => {
        it('should process code', async () => {
            const res = await request(app)
                .post('/api/auth/verify-email')
                .send({ code: 'c' });
            expect(res.status).toBe(200);
        });

        it('should return 400 if no code', async () => {
            const res = await request(app).post('/api/auth/verify-email').send({});
            expect(res.status).toBe(400);
        });
    });

    describe('POST /api/auth/update-password', () => {
        it('should update password successfully', async () => {
            mockAuthService.getUserById.mockResolvedValue({ supabase_auth_id: 'sub' });
            mockSupabaseService.updateUserPassword.mockResolvedValue(undefined);
            const res = await request(app)
                .post('/api/auth/update-password')
                .send({ newPassword: 'p' })
                .set('Authorization', 'Bearer token');
            expect(res.status).toBe(200);
        });

        it('should return 400 if no password', async () => {
            const res = await request(app)
                .post('/api/auth/update-password')
                .send({})
                .set('Authorization', 'Bearer token');
            expect(res.status).toBe(400);
        });

        it('should return 404 if user not found', async () => {
            mockAuthService.getUserById.mockResolvedValue(null);
            const res = await request(app)
                .post('/api/auth/update-password')
                .send({ newPassword: 'p' })
                .set('Authorization', 'Bearer token');
            expect(res.status).toBe(404);
        });

        it('should return 401 if unauthorized', async () => {
            (authMiddleware as jest.Mock).mockImplementationOnce((req: any, _res: any, next: any) => {
                req.userId = undefined;
                next();
            });
            const res = await request(app)
                .post('/api/auth/update-password')
                .send({ newPassword: 'p' });
            expect(res.status).toBe(401);
        });
    });
});
