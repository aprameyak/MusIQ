
const mockPool = {
    query: jest.fn()
};
jest.mock('../src/database/connection', () => ({
    getDatabasePool: jest.fn(() => mockPool)
}));

import { requireRole, requirePermission, requireOwnership } from '../src/middleware/rbac.middleware';
import { CustomError } from '../src/middleware/error.middleware';

describe('RBAC Middleware', () => {
    let req: any;
    let res: any;
    let next: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
        req = {
            userId: 'user-id',
            userRole: 'user',
            params: {},
            body: {}
        };
        res = {};
        next = jest.fn();
    });

    describe('requireRole', () => {
        it('should allow if role matches', async () => {
            const middleware = requireRole('user', 'admin');
            await middleware(req, res, next);
            expect(next).toHaveBeenCalledWith();
        });

        it('should throw 401 if no userRole', async () => {
            delete req.userRole;
            const middleware = requireRole('admin');
            await middleware(req, res, next);
            expect(next).toHaveBeenCalledWith(expect.any(CustomError));
            expect(next.mock.calls[0][0].statusCode).toBe(401);
        });

        it('should throw 403 if role mismatch', async () => {
            const middleware = requireRole('admin');
            await middleware(req, res, next);
            expect(next).toHaveBeenCalledWith(expect.any(CustomError));
            expect(next.mock.calls[0][0].statusCode).toBe(403);
        });
    });

    describe('requirePermission', () => {
        it('should allow if permission exists', async () => {
            mockPool.query.mockResolvedValueOnce({ rows: [{ count: '1' }] });
            const middleware = requirePermission('music', 'read');
            await middleware(req, res, next);
            expect(next).toHaveBeenCalledWith();
        });

        it('should throw 401 if no userId', async () => {
            delete req.userId;
            const middleware = requirePermission('music', 'read');
            await middleware(req, res, next);
            expect(next).toHaveBeenCalledWith(expect.any(CustomError));
            expect(next.mock.calls[0][0].statusCode).toBe(401);
        });

        it('should throw 403 if permission missing', async () => {
            mockPool.query.mockResolvedValueOnce({ rows: [{ count: '0' }] });
            const middleware = requirePermission('music', 'write');
            await middleware(req, res, next);
            expect(next).toHaveBeenCalledWith(expect.any(CustomError));
            expect(next.mock.calls[0][0].statusCode).toBe(403);
        });

        it('should handle db error', async () => {
            mockPool.query.mockRejectedValueOnce(new Error('fail'));
            const middleware = requirePermission('music', 'read');
            await middleware(req, res, next);
            expect(next).toHaveBeenCalledWith(expect.any(Error));
        });
    });

    describe('requireOwnership', () => {
        it('should allow if userId and resourceId present', async () => {
            req.params.id = 'res-id';
            const middleware = requireOwnership();
            await middleware(req, res, next);
            expect(next).toHaveBeenCalledWith();
        });

        it('should throw 401 if no userId', async () => {
            delete req.userId;
            const middleware = requireOwnership();
            await middleware(req, res, next);
            expect(next).toHaveBeenCalledWith(expect.any(CustomError));
            expect(next.mock.calls[0][0].statusCode).toBe(401);
        });

        it('should throw 400 if no resourceId', async () => {
            const middleware = requireOwnership();
            await middleware(req, res, next);
            expect(next).toHaveBeenCalledWith(expect.any(CustomError));
            expect(next.mock.calls[0][0].statusCode).toBe(400);
        });

    });
});
