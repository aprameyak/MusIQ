
const mockPool = {
    query: jest.fn()
};
jest.mock('../src/database/connection', () => ({
    getDatabasePool: jest.fn(() => mockPool)
}));

jest.mock('../src/services/supabase.service', () => ({
    supabaseService: {
        createAuthUser: jest.fn(),
        getUserByEmail: jest.fn(),
        signInWithPassword: jest.fn(),
        sendPasswordResetEmail: jest.fn(),
        updateUserEmail: jest.fn(),
        updateUserMetadata: jest.fn()
    }
}));

import { AuthService } from '../src/services/auth.service';
import { supabaseService } from '../src/services/supabase.service';

describe('AuthService', () => {
    let authService: AuthService;

    beforeEach(() => {
        jest.clearAllMocks();
        authService = new AuthService();
    });

    describe('signup', () => {
        it('should signup successfully', async () => {
            mockPool.query.mockResolvedValueOnce({ rows: [] });
            (supabaseService.createAuthUser as jest.Mock).mockResolvedValue('sub-id');
            mockPool.query.mockResolvedValueOnce({ rows: [{ id: '1' }] });

            await authService.signup('t@e.com', 'u', 'p', 'f', 'l');
            expect(mockPool.query).toHaveBeenCalledTimes(2);
        });

        it('should throw error if email exists', async () => {
            mockPool.query
                .mockResolvedValueOnce({ rows: [{ id: '1' }] })
                .mockResolvedValueOnce({ rows: [{ email: 't@e.com' }] });

            await expect(authService.signup('t@e.com', 'u', 'p', 'f', 'l'))
                .rejects.toThrow('registered');
        });

        it('should throw error if username exists', async () => {
            mockPool.query
                .mockResolvedValueOnce({ rows: [{ id: '1' }] })
                .mockResolvedValueOnce({ rows: [{ email: 'other@e.com' }] });

            await expect(authService.signup('t@e.com', 'u', 'p', 'f', 'l'))
                .rejects.toThrow('Username already exists');
        });

        it('should handle supabase conflict (user exists in supabase but not local)', async () => {
            mockPool.query.mockResolvedValueOnce({ rows: [] });
            (supabaseService.createAuthUser as jest.Mock).mockRejectedValue({ message: 'already registered' });
            (supabaseService.getUserByEmail as jest.Mock).mockResolvedValue({ id: 'sub-id' });

            await expect(authService.signup('t@e.com', 'u', 'p', 'f', 'l'))
                .rejects.toThrow('try logging in instead');
        });

        it('should throw supabase error if not conflict', async () => {
            mockPool.query.mockResolvedValueOnce({ rows: [] });
            (supabaseService.createAuthUser as jest.Mock).mockRejectedValue(new Error('other supabase error'));

            await expect(authService.signup('t@e.com', 'u', 'p', 'f', 'l'))
                .rejects.toThrow('Failed to create user account');
        });

        it('should handle unexpected error', async () => {
            mockPool.query.mockRejectedValue(new Error('db error'));
            await expect(authService.signup('t@e.com', 'u', 'p', 'f', 'l'))
                .rejects.toThrow('Failed to create user account');
        });

        it('should handle non-Error catch', async () => {
            mockPool.query.mockRejectedValue('string error');
            await expect(authService.signup('t@e.com', 'u', 'p', 'f', 'l'))
                .rejects.toThrow('Failed to create user account');
        });
    });

    describe('login', () => {
        it('should login successfully', async () => {
            mockPool.query.mockResolvedValueOnce({
                rows: [{ id: '1', email: 't@e.com', supabase_auth_id: 'sub-id' }]
            });
            (supabaseService.signInWithPassword as jest.Mock).mockResolvedValue({
                access_token: 'at',
                refresh_token: 'rt',
                expires_in: 3600,
                token_type: 'bearer',
                user: { email_confirmed_at: 'now' }
            });
            mockPool.query.mockResolvedValueOnce({ rows: [] });

            const result = await authService.login('t@e.com', 'p');
            expect(result.accessToken).toBe('at');
        });

        it('should throw on invalid user', async () => {
            mockPool.query.mockResolvedValueOnce({ rows: [] });
            await expect(authService.login('t@e.com', 'p'))
                .rejects.toThrow('Invalid email or password');
        });

        it('should throw on legacy user', async () => {
            mockPool.query.mockResolvedValueOnce({
                rows: [{ id: '1', email: 't@e.com', supabase_auth_id: null }]
            });
            await expect(authService.login('t@e.com', 'p'))
                .rejects.toThrow('Legacy user');
        });

        it('should handle unexpected error', async () => {
            mockPool.query.mockRejectedValue(new Error('un'));
            await expect(authService.login('t@e.com', 'p'))
                .rejects.toThrow('Login failed');
        });
    });

    describe('forgotPassword', () => {
        it('should call supabaseService', async () => {
            await authService.forgotPassword('t@e.com');
            expect(supabaseService.sendPasswordResetEmail).toHaveBeenCalledWith('t@e.com');
        });

        it('should handle error', async () => {
            (supabaseService.sendPasswordResetEmail as jest.Mock).mockRejectedValue(new Error('err'));
            await expect(authService.forgotPassword('t@e.com'))
                .rejects.toThrow('Failed to send password reset email');
        });
    });

    describe('refreshToken', () => {
        it('should throw as it is handled by client', async () => {
            await expect(authService.refreshToken('rt'))
                .rejects.toThrow('Refresh token handled by Supabase client');
        });

        it('should handle unexpected error', async () => {
            await expect(authService.refreshToken('rt')).rejects.toThrow('Refresh token handled by Supabase client');
        });
    });

    describe('logout', () => {
        it('should run without error', async () => {
            await authService.logout();
        });
    });

    describe('getUserById', () => {
        it('should return user', async () => {
            mockPool.query.mockResolvedValue({ rows: [{ id: '1' }] });
            const user = await authService.getUserById('1');
            expect(user?.id).toBe('1');
        });

        it('should return null if not found', async () => {
            mockPool.query.mockResolvedValue({ rows: [] });
            const user = await authService.getUserById('1');
            expect(user).toBeNull();
        });
    });

    describe('getUserByEmail', () => {
        it('should return user', async () => {
            mockPool.query.mockResolvedValue({ rows: [{ id: '1' }] });
            const user = await authService.getUserByEmail('t@e.com');
            expect(user?.id).toBe('1');
        });

        it('should return null if not found', async () => {
            mockPool.query.mockResolvedValue({ rows: [] });
            const user = await authService.getUserByEmail('t@e.com');
            expect(user).toBeNull();
        });
    });

    describe('verifyUserEmail', () => {
        it('should verify successfully', async () => {
            await authService.verifyUserEmail('sub-id');
            expect(mockPool.query).toHaveBeenCalled();
        });

        it('should handle error', async () => {
            mockPool.query.mockRejectedValue(new Error('un'));
            await expect(authService.verifyUserEmail('sub-id'))
                .rejects.toThrow('Failed to verify email');
        });
    });

    describe('updateProfile', () => {
        it('should update profile successfully including email', async () => {
            mockPool.query
                .mockResolvedValueOnce({ rows: [{ id: '1', email: 'old@e.com', supabase_auth_id: 'sub-id' }] })
                .mockResolvedValueOnce({ rows: [] })
                .mockResolvedValueOnce({ rows: [{ id: '1', email: 'new@e.com' }] });

            const result = await authService.updateProfile('1', 'new@e.com', 'f', 'l');
            expect(result.email).toBe('new@e.com');
            expect(supabaseService.updateUserEmail).toHaveBeenCalled();
            expect(supabaseService.updateUserMetadata).toHaveBeenCalled();
        });

        it('should return user if no changes', async () => {
            mockPool.query.mockResolvedValueOnce({ rows: [{ id: '1', email: 't@e.com', first_name: 'f', last_name: 'l' }] });
            const result = await authService.updateProfile('1', 't@e.com', 'f', 'l');
            expect(result.id).toBe('1');
        });

        it('should throw if user not found', async () => {
            mockPool.query.mockResolvedValueOnce({ rows: [] });
            await expect(authService.updateProfile('1', 'n@e.com'))
                .rejects.toThrow('User not found');
        });

        it('should throw if legacy user updates email', async () => {
            mockPool.query.mockResolvedValueOnce({ rows: [{ id: '1', email: 'o@e.com', supabase_auth_id: null }] });
            await expect(authService.updateProfile('1', 'n@e.com'))
                .rejects.toThrow('legacy user');
        });

        it('should throw if email already taken', async () => {
            mockPool.query
                .mockResolvedValueOnce({ rows: [{ id: '1', email: 'o@e.com', supabase_auth_id: 'sub-id' }] })
                .mockResolvedValueOnce({ rows: [{ id: '2', email: 'n@e.com' }] });
            await expect(authService.updateProfile('1', 'n@e.com'))
                .rejects.toThrow('already registered');
        });

        it('should handle partial metadata update', async () => {
            mockPool.query
                .mockResolvedValueOnce({ rows: [{ id: '1', email: 't@e.com', first_name: 'old-f', supabase_auth_id: 'sub-id' }] })
                .mockResolvedValueOnce({ rows: [{ id: '1' }] });
            await authService.updateProfile('1', undefined, 'new-f', undefined);
            expect(supabaseService.updateUserMetadata).toHaveBeenCalledWith('sub-id', { first_name: 'new-f' });
        });

        it('should handle unexpected error', async () => {
            mockPool.query.mockRejectedValue(new Error('un'));
            await expect(authService.updateProfile('1', 'n@e.com'))
                .rejects.toThrow('Failed to update profile');
        });
    });
});
