import { jest, describe, it, expect, beforeEach } from '@jest/globals';

const mockAuditService = {
    log: (jest.fn() as any).mockResolvedValue({})
};

jest.mock('../src/security/audit.service', () => ({
    AuditService: jest.fn(() => mockAuditService)
}));

import { auditMiddleware } from '../src/middleware/audit.middleware';

describe('Audit Middleware', () => {
    let req: any;
    let res: any;
    let next: any;

    beforeEach(() => {
        jest.clearAllMocks();
        req = {
            userId: 'test-user',
            ip: '127.0.0.1',
            headers: { 'user-agent': 'test-agent' },
            method: 'GET',
            path: '/test',
            params: {},
            body: {},
            route: { path: '/test-route' }
        };
        res = {
            statusCode: 200,
            send: (jest.fn() as any).mockReturnThis()
        };
        next = jest.fn();
    });

    it('should intercept res.send and log audit', async () => {
        const middleware = auditMiddleware('test-action', 'test-resource');
        await middleware(req, res, next);

        expect(next).toHaveBeenCalled();

        res.send('data');

        expect(mockAuditService.log).toHaveBeenCalledWith(expect.objectContaining({
            userId: 'test-user',
            action: 'test-action',
            resourceType: 'test-resource'
        }));
    });

    it('should use route path if resourceType not provided', async () => {
        const middleware = auditMiddleware('test-action');
        await middleware(req, res, next);
        res.send('data');

        expect(mockAuditService.log).toHaveBeenCalledWith(expect.objectContaining({
            resourceType: '/test-route'
        }));
    });

    it('should handle missing route path', async () => {
        delete req.route;
        const middleware = auditMiddleware('test-action');
        await middleware(req, res, next);
        res.send('data');

        expect(mockAuditService.log).toHaveBeenCalledWith(expect.objectContaining({
            resourceType: undefined
        }));
    });

    it('should handle various resourceId positions', async () => {
        req.params.id = 'param-id';
        const middleware = auditMiddleware('test-action');
        await middleware(req, res, next);
        res.send('data');
        expect(mockAuditService.log).toHaveBeenCalledWith(expect.objectContaining({ resourceId: 'param-id' }));

        req.params.id = undefined;
        req.body.id = 'body-id';
        await middleware(req, res, next);
        res.send('data');
        expect(mockAuditService.log).toHaveBeenCalledWith(expect.objectContaining({ resourceId: 'body-id' }));

        req.body.id = undefined;
        req.body.musicItemId = 'music-id';
        await middleware(req, res, next);
        res.send('data');
        expect(mockAuditService.log).toHaveBeenCalledWith(expect.objectContaining({ resourceId: 'music-id' }));
    });

    it('should handle missing IP or user agent', async () => {
        delete req.ip;
        req.socket = { remoteAddress: 'socket-ip' };
        req.headers = {};
        const middleware = auditMiddleware('test-action');
        await middleware(req, res, next);
        res.send('data');
        expect(mockAuditService.log).toHaveBeenCalledWith(expect.objectContaining({
            ipAddress: 'socket-ip',
            userAgent: undefined
        }));
    });

    it('should handle missing IP entirely', async () => {
        delete req.ip;
        req.socket = {};
        const middleware = auditMiddleware('test-action');
        await middleware(req, res, next);
        res.send('data');
        expect(mockAuditService.log).toHaveBeenCalledWith(expect.objectContaining({
            ipAddress: undefined
        }));
    });

    it('should handle audit service error gracefully', async () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
        (mockAuditService.log as any).mockRejectedValueOnce(new Error('fail'));

        const middleware = auditMiddleware('test-action');
        await middleware(req, res, next);
        res.send('data');

        await new Promise(resolve => setTimeout(resolve, 10)); // wait for catch
        expect(consoleSpy).toHaveBeenCalledWith('Audit logging error:', expect.anything());
        consoleSpy.mockRestore();
    });
});
