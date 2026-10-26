import nacl from 'tweetnacl';
import { discordAuthMiddleware } from '../src/middleware/discord-auth.middleware';

describe('Discord Auth Middleware', () => {
    const keyPair = nacl.sign.keyPair();
    const originalKey = process.env.DISCORD_PUBLIC_KEY;
    let res: any;
    let next: jest.Mock;

    const sign = (timestamp: string, body: string) =>
        Buffer.from(
            nacl.sign.detached(Buffer.from(timestamp + body), keyPair.secretKey)
        ).toString('hex');

    const buildReq = (headers: Record<string, string>, rawBody?: any) => ({
        get: (name: string) => headers[name],
        rawBody
    });

    beforeEach(() => {
        process.env.DISCORD_PUBLIC_KEY = Buffer.from(keyPair.publicKey).toString('hex');
        res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        next = jest.fn();
    });

    afterAll(() => {
        process.env.DISCORD_PUBLIC_KEY = originalKey;
    });

    it('should call next for a valid signature', () => {
        const timestamp = Math.floor(Date.now() / 1000).toString();
        const body = '{"type":1}';
        const req = buildReq(
            { 'X-Signature-Ed25519': sign(timestamp, body), 'X-Signature-Timestamp': timestamp },
            Buffer.from(body)
        );
        discordAuthMiddleware(req as any, res, next);
        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
    });

    it('should return 500 if public key is not configured', () => {
        delete process.env.DISCORD_PUBLIC_KEY;
        discordAuthMiddleware(buildReq({}) as any, res, next);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 if signature headers are missing', () => {
        discordAuthMiddleware(buildReq({ 'X-Signature-Timestamp': '1' }) as any, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
    });

    it('should return 400 if raw body is missing', () => {
        const req = buildReq({ 'X-Signature-Ed25519': 'aa', 'X-Signature-Timestamp': '1' }, '{}');
        discordAuthMiddleware(req as any, res, next);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 for an invalid signature', () => {
        const timestamp = Math.floor(Date.now() / 1000).toString();
        const req = buildReq(
            { 'X-Signature-Ed25519': sign(timestamp, 'other'), 'X-Signature-Timestamp': timestamp },
            Buffer.from('{"type":1}')
        );
        discordAuthMiddleware(req as any, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: 'Invalid signature' });
        expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 for a stale timestamp', () => {
        const timestamp = (Math.floor(Date.now() / 1000) - 600).toString();
        const body = '{"type":1}';
        const req = buildReq(
            { 'X-Signature-Ed25519': sign(timestamp, body), 'X-Signature-Timestamp': timestamp },
            Buffer.from(body)
        );
        discordAuthMiddleware(req as any, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: 'Request timestamp too old' });
        expect(next).not.toHaveBeenCalled();
    });

    it('should return 500 for a malformed signature', () => {
        const req = buildReq(
            { 'X-Signature-Ed25519': 'abcd', 'X-Signature-Timestamp': '1' },
            Buffer.from('{}')
        );
        discordAuthMiddleware(req as any, res, next);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(next).not.toHaveBeenCalled();
    });
});
