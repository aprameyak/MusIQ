import request from 'supertest';
import app from '../src/index';

const mockPool = {
  query: jest.fn(),
};

const mockBlobService = {
  uploadProfilePicture: jest.fn(),
  deleteProfilePicture: jest.fn(),
};

jest.mock('../src/database/connection', () => ({
  getDatabasePool: () => ({
    query: jest.fn().mockImplementation((...args) => (global as any).mockPool.query(...args)),
  }),
}));

(global as any).mockPool = mockPool;

jest.mock('../src/services/blob.service', () => ({
  blobService: {
    uploadProfilePicture: jest
      .fn()
      .mockImplementation((...args) =>
        (global as any).mockBlobService.uploadProfilePicture(...args)
      ),
    deleteProfilePicture: jest
      .fn()
      .mockImplementation((...args) =>
        (global as any).mockBlobService.deleteProfilePicture(...args)
      ),
  },
}));
(global as any).mockBlobService = mockBlobService;

jest.mock('../src/middleware/auth.middleware', () => ({
  authMiddleware: jest.fn((req: any, _res: any, next: any) => {
    req.userId = 'test-id';
    next();
  }),
}));

describe('Profile Picture Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/profile/picture', () => {
    it('should upload a picture successfully', async () => {
      mockBlobService.uploadProfilePicture.mockResolvedValue('http://mock-url.com/pic.jpg');
      mockPool.query.mockResolvedValueOnce({ rows: [{ id: 'test-id' }] });
      mockPool.query.mockResolvedValueOnce({
        rows: [{ profile_picture_url: 'http://mock-url.com/pic.jpg' }],
      });
      mockPool.query.mockResolvedValueOnce({
        rows: [{ profile_picture_url: 'http://mock-url.com/pic.jpg' }],
      });

      const res = await request(app)
        .post('/api/profile/picture')
        .attach('picture', Buffer.from('fake-image'), 'test.jpg');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.profile_picture_url).toBe('http://mock-url.com/pic.jpg');
      expect(mockBlobService.uploadProfilePicture).toHaveBeenCalled();
    });

    it('should return 400 if no file is provided', async () => {
      const res = await request(app).post('/api/profile/picture');
      expect(res.status).toBe(400);
    });
  });

  describe('DELETE /api/profile/picture', () => {
    it('should remove a picture successfully', async () => {
      mockPool.query.mockResolvedValueOnce({
        rows: [{ id: 'test-id', profile_picture_url: 'http://old-url.com' }],
      });
      mockPool.query.mockResolvedValueOnce({ rows: [] });

      const res = await request(app).delete('/api/profile/picture');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(mockBlobService.deleteProfilePicture).toHaveBeenCalled();
    });
  });
});
