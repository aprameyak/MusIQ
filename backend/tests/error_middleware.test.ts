import { errorMiddleware, CustomError } from '../src/middleware/error.middleware';

describe('Error Middleware', () => {
    const originalEnv = process.env.NODE_ENV;
    const req: any = { path: '/test', method: 'GET' };
    let res: any;

    beforeEach(() => {
        res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    });

    afterEach(() => {
        process.env.NODE_ENV = originalEnv;
    });

    it('should return the custom error status and message', () => {
        errorMiddleware(new CustomError('Not found', 404), req, res, jest.fn());
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json.mock.calls[0][0].error.message).toBe('Not found');
    });

    it('should return 503 for database connection errors', () => {
        const err: any = new Error('db down');
        err.code = 'ECONNRESET';
        errorMiddleware(err, req, res, jest.fn());
        expect(res.status).toHaveBeenCalledWith(503);
        expect(res.json.mock.calls[0][0].error.code).toBe('503');
    });

    it('should return 503 when the connection is terminated', () => {
        errorMiddleware(new Error('Connection terminated unexpectedly'), req, res, jest.fn());
        expect(res.status).toHaveBeenCalledWith(503);
    });

    it('should hide internal error details in production', () => {
        process.env.NODE_ENV = 'production';
        errorMiddleware(new Error('secret detail'), req, res, jest.fn());
        expect(res.status).toHaveBeenCalledWith(500);
        const body = res.json.mock.calls[0][0];
        expect(body.error.message).toBe('Internal Server Error');
        expect(body.error.stack).toBeUndefined();
    });

    it('should default to a generic message when none is given', () => {
        const err: any = { statusCode: 400 };
        errorMiddleware(err, req, res, jest.fn());
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json.mock.calls[0][0].error.message).toBe('Internal Server Error');
    });
});
