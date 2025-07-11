import { jest } from '@jest/globals';
import request from 'supertest';

const mockFriend = {
  findOne: jest.fn(),
};

await jest.unstable_mockModule('../../src/model/Friend.js', () => ({
  Friend: mockFriend,
}));

const { Friend } = await import('../../src/model/Friend.js');
const imported = await import('../friend.js');
const app = imported.default || imported;

describe('Friend API routes', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /add-friend', () => {
    it('should add a friend successfully', async () => {
      const mockUser = {
        friends: [],
        save: jest.fn().mockResolvedValue(true),
      };
      Friend.findOne.mockResolvedValue(mockUser);
      const res = await request(app)
        .post('/add-friend')
        .send({ userEmail: 'user@example.com', friendEmail: 'friend@example.com' });
      expect(res.statusCode).toBe(200);
      expect(mockUser.save).toHaveBeenCalled();
    });

    it('should handle server error', async () => {
      Friend.findOne.mockRejectedValue(new Error('DB error'));
      const res = await request(app)
        .post('/add-friend')
        .send({ userEmail: 'user@example.com', friendEmail: 'friend@example.com' });
      expect(res.statusCode).toBe(500);
    });
  });

  describe('GET /friends/:email', () => {
    it('should get friends by email', async () => {
      Friend.findOne.mockResolvedValue({ friends: ['friend@example.com'] });
      const res = await request(app).get('/friends/user@example.com');
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(['friend@example.com']);
    });
  });
});
