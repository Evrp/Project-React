import { jest } from '@jest/globals';
import request from 'supertest';

const mockLike = {
  findOne: jest.fn(),
  deleteOne: jest.fn(),
  prototype: {
    save: jest.fn(),
  },
};

await jest.unstable_mockModule('../../src/model/like.js', () => ({
  Like: mockLike,
}));

const { Like } = await import('../../src/model/like.js');
const imported = await import('../like.js');
const app = imported.default || imported;

describe('Like API routes', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /like', () => {
    it('should like an event if not already liked', async () => {
      Like.findOne.mockResolvedValue(null);
      Like.prototype.save.mockResolvedValue({});
      
      const res = await request(app)
        .post('/like')
        .send({ userEmail: 'test@example.com', eventId: '123', eventTitle: 'Test Event' });
      
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Liked!');
    });

    it('should not like if already liked', async () => {
      Like.findOne.mockResolvedValue({ userEmail: 'test@example.com', eventId: '123' });
      
      const res = await request(app)
        .post('/like')
        .send({ userEmail: 'test@example.com', eventId: '123', eventTitle: 'Test Event' });
      
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Already liked.');
    });

    it('should handle server error', async () => {
      Like.findOne.mockRejectedValue(new Error('DB error'));
      
      const res = await request(app)
        .post('/like')
        .send({ userEmail: 'test@example.com', eventId: '123', eventTitle: 'Test Event' });
      
      expect(res.statusCode).toBe(500);
      expect(res.body.message).toBe('Error');
    });
  });

  describe('GET /likes/:userEmail', () => {
    it('should get all likes by user', async () => {
      Like.find = jest.fn().mockResolvedValue([{ eventId: '123' }]);
      
      const res = await request(app).get('/likes/test@example.com');
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual([{ eventId: '123' }]);
    });

    it('should handle server error', async () => {
      Like.find = jest.fn().mockRejectedValue(new Error('DB error'));
      
      const res = await request(app).get('/likes/test@example.com');
      
      expect(res.statusCode).toBe(500);
      expect(res.body.message).toBe('Error fetching likes');
    });
  });

  describe('DELETE /like/:userEmail/:eventId', () => {
    it('should unlike an event', async () => {
      Like.deleteOne.mockResolvedValue({ deletedCount: 1 });
      
      const res = await request(app).delete('/like/test@example.com/123');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Unliked!');
    });

    it('should return 404 if like not found', async () => {
      Like.deleteOne.mockResolvedValue({ deletedCount: 0 });
      
      const res = await request(app).delete('/like/test@example.com/999');
      
      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('Like not found');
    });

    it('should handle server error', async () => {
      Like.deleteOne.mockRejectedValue(new Error('DB error'));
      
      const res = await request(app).delete('/like/test@example.com/123');
      
      expect(res.statusCode).toBe(500);
      expect(res.body.message).toBe('Error');
    });
  });

  it('should handle server error on like', async () => {
    Like.findOne.mockRejectedValue(new Error('DB error'));
    const res = await request(app)
      .post('/like')
      .send({ userEmail: 'test@example.com', eventId: '123' });
    expect(res.statusCode).toBe(500);
  });
});
