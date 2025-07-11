import { jest } from '@jest/globals';
import request from 'supertest';

const mockRoom = {
  find: jest.fn(),
  prototype: {
    save: jest.fn(),
  },
};

await jest.unstable_mockModule('../../src/model/room.js', () => ({
  Room: mockRoom,
}));

const { Room } = await import('../../src/model/room.js');
const imported = await import('../room.js');
const app = imported.default || imported;

describe('Room API routes', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should get all rooms', async () => {
    Room.find.mockResolvedValue([{ name: 'Test Room' }]);
    const res = await request(app).get('/rooms');
    expect(res.statusCode).toBe(200);
  });

  it('should handle server error on create', async () => {
    Room.prototype.save.mockRejectedValue(new Error('DB error'));
    const res = await request(app)
      .post('/room')
      .send({ name: 'Test Room', createdBy: 'user@example.com' });
    expect(res.statusCode).toBe(500);
  });
});
