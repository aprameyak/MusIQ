import { CustomError } from '../src/middleware/error.middleware';

const mockSupabase = {
    auth: {
        admin: {
            listUsers: jest.fn(),
            createUser: jest.fn(),
            updateUserById: jest.fn(),
            getUserById: jest.fn(),
            signOut: jest.fn()
        },
        signInWithPassword: jest.fn(),
        resetPasswordForEmail: jest.fn(),
        getUser: jest.fn(),
        verifyOtp: jest.fn(),
        updateUser: jest.fn()
    }
};

jest.mock('@supabase/supabase-js', () => ({
    createClient: jest.fn(() => mockSupabase)
}));

import { supabaseService } from '../src/services/supabase.service';

describe('SupabaseService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Constructor', () => {
        it('should throw error if env vars missing', () => {
            const originalUrl = process.env.SUPABASE_URL;
            process.env.SUPABASE_URL = '';
            expect(() => new (supabaseService.constructor as any)()).toThrow();
            process.env.SUPABASE_URL = originalUrl;
        });
    });

    describe('getUserByEmail', () => {
        it('should return user info when found', async () => {
            mockSupabase.auth.admin.listUsers.mockResolvedValue({
                data: { users: [{ id: '1', email: 'test@example.com' }] },
                error: null
            });
            const result = await supabaseService.getUserByEmail('test@example.com');
            expect(result).toEqual({ id: '1', email: 'test@example.com' });
        });

        it('should handle pagination', async () => {
            mockSupabase.auth.admin.listUsers
                .mockResolvedValueOnce({
                    data: { users: Array(1000).fill({ id: '0', email: 'other@example.com' }) },
                    error: null
                })
                .mockResolvedValueOnce({
                    data: { users: [{ id: '1', email: 'test@example.com' }] },
                    error: null
                });
            const result = await supabaseService.getUserByEmail('test@example.com');
            expect(result).toEqual({ id: '1', email: 'test@example.com' });
        });

        it('should return null when not found after pagination', async () => {
            mockSupabase.auth.admin.listUsers.mockResolvedValue({
                data: { users: Array(10).fill({ id: '0', email: 'other@example.com' }) },
                error: null
            });
            const result = await supabaseService.getUserByEmail('test@example.com');
            expect(result).toBeNull();
        });

        it('should return null on error', async () => {
            mockSupabase.auth.admin.listUsers.mockResolvedValue({
                data: null,
                error: { message: 'error' }
            });
            const result = await supabaseService.getUserByEmail('test@example.com');
            expect(result).toBeNull();
        });

        it('should return null on unexpected error', async () => {
            mockSupabase.auth.admin.listUsers.mockRejectedValue(new Error('unexpected'));
            const result = await supabaseService.getUserByEmail('test@example.com');
            expect(result).toBeNull();
        });
    });

    describe('createAuthUser', () => {
        it('should create user successfully', async () => {
            mockSupabase.auth.admin.createUser.mockResolvedValue({
                data: { user: { id: '1' } },
                error: null
            });
            const result = await supabaseService.createAuthUser('test@example.com', 'pass', { first_name: 'f', last_name: 'l' });
            expect(result).toBe('1');
        });

        it('should handle conflict (already exists) and user found', async () => {
            mockSupabase.auth.admin.createUser.mockResolvedValue({
                data: null,
                error: { message: 'already registered', status: 422 }
            });
            mockSupabase.auth.admin.listUsers.mockResolvedValue({
                data: { users: [{ id: '1', email: 'test@example.com' }] },
                error: null
            });
            await expect(supabaseService.createAuthUser('test@example.com', 'pass', {}))
                .rejects.toThrow(CustomError);
        });

        it('should handle conflict but user not found', async () => {
            mockSupabase.auth.admin.createUser.mockResolvedValue({
                data: null,
                error: { message: 'already registered', status: 422 }
            });
            mockSupabase.auth.admin.listUsers.mockResolvedValue({
                data: { users: [] },
                error: null
            });
            await expect(supabaseService.createAuthUser('test@example.com', 'pass', {}))
                .rejects.toThrow('already registered');
        });

        it('should handle weak password', async () => {
            mockSupabase.auth.admin.createUser.mockResolvedValue({
                data: null,
                error: { message: 'Password too weak' }
            });
            await expect(supabaseService.createAuthUser('test@example.com', 'pass', {}))
                .rejects.toThrow('Password');
        });

        it('should handle generic error', async () => {
            mockSupabase.auth.admin.createUser.mockResolvedValue({
                data: null,
                error: { message: 'err' }
            });
            await expect(supabaseService.createAuthUser('test@example.com', 'pass', {}))
                .rejects.toThrow('Failed to create user: err');
        });

        it('should handle conflict (branch coverage)', async () => {
            mockSupabase.auth.admin.createUser.mockResolvedValue({
                data: null,
                error: { message: 'User already registered' }
            });
            mockSupabase.auth.admin.listUsers.mockResolvedValue({ data: { users: [] }, error: null });
            await expect(supabaseService.createAuthUser('test@example.com', 'pass', {}))
                .rejects.toThrow('already registered');
        });

        it('should handle missing data user', async () => {
            mockSupabase.auth.admin.createUser.mockResolvedValue({
                data: { user: null },
                error: null
            });
            await expect(supabaseService.createAuthUser('test@example.com', 'pass', {}))
                .rejects.toThrow('No user data');
        });

        it('should handle unexpected error', async () => {
            mockSupabase.auth.admin.createUser.mockRejectedValue(new Error('un'));
            await expect(supabaseService.createAuthUser('test@example.com', 'pass', {}))
                .rejects.toThrow('Failed to create user account');
        });
    });

    describe('signInWithPassword', () => {
        it('should sign in successfully', async () => {
            mockSupabase.auth.signInWithPassword.mockResolvedValue({
                data: {
                    session: { access_token: 'at', refresh_token: 'rt', expires_in: 3600, token_type: 'bearer' },
                    user: { id: '1', email: 'test@example.com', email_confirmed_at: 'now', user_metadata: {} }
                },
                error: null
            });
            const result = await supabaseService.signInWithPassword('test@example.com', 'pass');
            expect(result.access_token).toBe('at');
        });

        it('should handle invalid credentials', async () => {
            mockSupabase.auth.signInWithPassword.mockResolvedValue({
                data: null,
                error: { message: 'Invalid credentials' }
            });
            await expect(supabaseService.signInWithPassword('test@example.com', 'pass'))
                .rejects.toThrow('Invalid email or password');
        });

        it('should handle other error', async () => {
            mockSupabase.auth.signInWithPassword.mockResolvedValue({
                data: null,
                error: { message: 'other' }
            });
            await expect(supabaseService.signInWithPassword('test@example.com', 'pass'))
                .rejects.toThrow('other');
        });

        it('should handle missing session/user', async () => {
            mockSupabase.auth.signInWithPassword.mockResolvedValue({
                data: { session: null, user: null },
                error: null
            });
            await expect(supabaseService.signInWithPassword('test@example.com', 'pass'))
                .rejects.toThrow('No session data');
        });

        it('should handle invalid credentials (branch coverage)', async () => {
            mockSupabase.auth.signInWithPassword.mockResolvedValue({
                data: null,
                error: { message: 'Invalid' }
            });
            await expect(supabaseService.signInWithPassword('t@e.com', 'p')).rejects.toThrow('Invalid email or password');
        });

        it('should handle generic login fail (branch coverage)', async () => {
            mockSupabase.auth.signInWithPassword.mockResolvedValue({
                data: null,
                error: { message: 'Some other error' }
            });
            await expect(supabaseService.signInWithPassword('t@e.com', 'p')).rejects.toThrow('Login failed');
        });

        it('should handle unexpected error', async () => {
            mockSupabase.auth.signInWithPassword.mockRejectedValue(new Error('un'));
            await expect(supabaseService.signInWithPassword('test@example.com', 'pass'))
                .rejects.toThrow('Login failed');
        });
    });

    describe('sendPasswordResetEmail', () => {
        it('should send email successfully', async () => {
            mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({ error: null });
            await supabaseService.sendPasswordResetEmail('test@example.com');
            expect(mockSupabase.auth.resetPasswordForEmail).toHaveBeenCalledWith('test@example.com');
        });

        it('should handle error', async () => {
            mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({ error: { message: 'err' } });
            await expect(supabaseService.sendPasswordResetEmail('test@example.com'))
                .rejects.toThrow('err');
        });

        it('should handle unexpected error', async () => {
            mockSupabase.auth.resetPasswordForEmail.mockRejectedValue(new Error('un'));
            await expect(supabaseService.sendPasswordResetEmail('test@example.com'))
                .rejects.toThrow('Failed to send password reset email');
        });
    });

    describe('updateUserMetadata', () => {
        it('should update successfully', async () => {
            mockSupabase.auth.admin.updateUserById.mockResolvedValue({ error: null });
            await supabaseService.updateUserMetadata('1', { first_name: 'f' });
            expect(mockSupabase.auth.admin.updateUserById).toHaveBeenCalledWith('1', { user_metadata: { first_name: 'f' } });
        });

        it('should handle error', async () => {
            mockSupabase.auth.admin.updateUserById.mockResolvedValue({ error: { message: 'err' } });
            await expect(supabaseService.updateUserMetadata('1', {}))
                .rejects.toThrow('err');
        });

        it('should handle unexpected error', async () => {
            mockSupabase.auth.admin.updateUserById.mockRejectedValue(new Error('un'));
            await expect(supabaseService.updateUserMetadata('1', {}))
                .rejects.toThrow('Failed to update user metadata');
        });
    });

    describe('updateUserEmail', () => {
        it('should update successfully', async () => {
            mockSupabase.auth.admin.updateUserById.mockResolvedValue({ error: null });
            await supabaseService.updateUserEmail('1', 'n@e.com');
            expect(mockSupabase.auth.admin.updateUserById).toHaveBeenCalled();
        });

        it('should handle conflict', async () => {
            mockSupabase.auth.admin.updateUserById.mockResolvedValue({ error: { message: 'already registered' } });
            await expect(supabaseService.updateUserEmail('1', 'n@e.com'))
                .rejects.toThrow('already registered');
        });

        it('should handle generic error', async () => {
            mockSupabase.auth.admin.updateUserById.mockResolvedValue({ error: { message: 'err' } });
            await expect(supabaseService.updateUserEmail('1', 'n@e.com'))
                .rejects.toThrow('Failed to update email: err');
        });

        it('should handle conflict (exists)', async () => {
            mockSupabase.auth.admin.updateUserById.mockResolvedValue({ error: { message: 'already exists' } });
            await expect(supabaseService.updateUserEmail('1', 'n@e.com'))
                .rejects.toThrow('already registered');
        });

        it('should handle unexpected error', async () => {
            mockSupabase.auth.admin.updateUserById.mockRejectedValue(new Error('un'));
            await expect(supabaseService.updateUserEmail('1', 'n@e.com'))
                .rejects.toThrow('Failed to update email');
        });
    });

    describe('getUserByAuthId', () => {
        it('should return user info when found', async () => {
            mockSupabase.auth.admin.getUserById.mockResolvedValue({
                data: { user: { id: '1', email: 't@e.com', email_confirmed_at: 'now', user_metadata: {} } },
                error: null
            });
            const result = await supabaseService.getUserByAuthId('1');
            expect(result?.id).toBe('1');
        });

        it('should return null when user missing', async () => {
            mockSupabase.auth.admin.getUserById.mockResolvedValue({ data: { user: null }, error: null });
            const result = await supabaseService.getUserByAuthId('1');
            expect(result).toBeNull();
        });

        it('should return null on error', async () => {
            mockSupabase.auth.admin.getUserById.mockResolvedValue({ error: { message: 'err' } });
            const result = await supabaseService.getUserByAuthId('1');
            expect(result).toBeNull();
        });

        it('should return null on unexpected error', async () => {
            mockSupabase.auth.admin.getUserById.mockRejectedValue(new Error('un'));
            const result = await supabaseService.getUserByAuthId('1');
            expect(result).toBeNull();
        });
    });

    describe('revokeSession', () => {
        it('should revoke successfully', async () => {
            mockSupabase.auth.admin.signOut.mockResolvedValue({ error: null });
            await supabaseService.revokeSession('at');
            expect(mockSupabase.auth.admin.signOut).toHaveBeenCalledWith('at');
        });

        it('should handle error silently', async () => {
            mockSupabase.auth.admin.signOut.mockResolvedValue({ error: { message: 'err' } });
            await supabaseService.revokeSession('at');
        });

        it('should handle unexpected error silently', async () => {
            mockSupabase.auth.admin.signOut.mockRejectedValue(new Error('un'));
            await supabaseService.revokeSession('at');
        });
    });

    describe('verifyAccessToken', () => {
        it('should verify successfully', async () => {
            mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: { id: '1', email: 't@e.com', email_confirmed_at: 'now' } },
                error: null
            });
            const result = await supabaseService.verifyAccessToken('at');
            expect(result?.userId).toBe('1');
        });

        it('should return null on error/user missing', async () => {
            mockSupabase.auth.getUser.mockResolvedValue({ error: { message: 'err' } });
            const result = await supabaseService.verifyAccessToken('at');
            expect(result).toBeNull();
        });

        it('should return null on unexpected error', async () => {
            mockSupabase.auth.getUser.mockRejectedValue(new Error('un'));
            const result = await supabaseService.verifyAccessToken('at');
            expect(result).toBeNull();
        });
    });

    describe('verifyOtp', () => {
        it('should verify successfully', async () => {
            mockSupabase.auth.verifyOtp.mockResolvedValue({
                data: { user: { id: '1' }, session: {} },
                error: null
            });
            const result = await supabaseService.verifyOtp('hash', 'signup');
            expect(result.user.id).toBe('1');
        });

        it('should handle error', async () => {
            mockSupabase.auth.verifyOtp.mockResolvedValue({ error: { message: 'err' } });
            await expect(supabaseService.verifyOtp('hash', 'signup'))
                .rejects.toThrow('err');
        });

        it('should handle unexpected error', async () => {
            mockSupabase.auth.verifyOtp.mockRejectedValue(new Error('un'));
            await expect(supabaseService.verifyOtp('hash', 'signup'))
                .rejects.toThrow('Failed to verify OTP');
        });
    });

    describe('updatePassword', () => {
        it('should update successfully', async () => {
            mockSupabase.auth.updateUser.mockResolvedValue({ error: null });
            await supabaseService.updatePassword('at', 'pass');
            expect(mockSupabase.auth.updateUser).toHaveBeenCalledWith({ password: 'pass' });
        });

        it('should handle error', async () => {
            mockSupabase.auth.updateUser.mockResolvedValue({ error: { message: 'err' } });
            await expect(supabaseService.updatePassword('at', 'pass'))
                .rejects.toThrow('err');
        });

        it('should handle unexpected error', async () => {
            mockSupabase.auth.updateUser.mockRejectedValue(new Error('un'));
            await expect(supabaseService.updatePassword('at', 'pass'))
                .rejects.toThrow('Failed to update password');
        });
    });

    describe('updateUserPassword', () => {
        it('should update successfully', async () => {
            mockSupabase.auth.admin.updateUserById.mockResolvedValue({ error: null });
            await supabaseService.updateUserPassword('1', 'pass');
            expect(mockSupabase.auth.admin.updateUserById).toHaveBeenCalledWith('1', { password: 'pass' });
        });

        it('should handle error', async () => {
            mockSupabase.auth.admin.updateUserById.mockResolvedValue({ error: { message: 'err' } });
            await expect(supabaseService.updateUserPassword('1', 'pass'))
                .rejects.toThrow('err');
        });

        it('should handle unexpected error', async () => {
            mockSupabase.auth.admin.updateUserById.mockRejectedValue(new Error('un'));
            await expect(supabaseService.updateUserPassword('1', 'pass'))
                .rejects.toThrow('Failed to update password');
        });
        describe('Error branch coverage (non-CustomError)', () => {
            it('should handle non-CustomError in updatePassword', async () => {
                mockSupabase.auth.updateUser.mockRejectedValue('string error');
                await expect(supabaseService.updatePassword('at', 'p')).rejects.toThrow('Failed to update password');
            });

            it('should handle non-CustomError in createAuthUser', async () => {
                mockSupabase.auth.admin.createUser.mockRejectedValue('string error');
                await expect(supabaseService.createAuthUser('e', 'p', {})).rejects.toThrow('Failed to create user account');
            });

            it('should handle non-CustomError in verifyOtp', async () => {
                mockSupabase.auth.verifyOtp.mockRejectedValue('string error');
                await expect(supabaseService.verifyOtp('h', 'signup')).rejects.toThrow('Failed to verify OTP');
            });

            it('should handle non-CustomError in updateUserPassword', async () => {
                mockSupabase.auth.admin.updateUserById.mockRejectedValue('string error');
                await expect(supabaseService.updateUserPassword('1', 'p')).rejects.toThrow('Failed to update password');
            });
        });
    });
});
