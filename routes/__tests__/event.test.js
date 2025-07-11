import { jest } from '@jest/globals';
import request from 'supertest';

// 1. Define mock object
const mockEvent = {
  find: jest.fn(),
  prototype: {
    save: jest.fn(),
  },
};

// 2. Mock the module
await jest.unstable_mockModule('../../src/model/event.js', () => ({
  Event: mockEvent,
}));

// 3. Dynamically import after mocking
const { Event } = await import('../../src/model/event.js');
const imported = await import('../event.js');
const app = imported.default || imported;

describe('Event API routes', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should get all events', async () => {
    Event.find.mockResolvedValue([{ title: 'Test Event' }]);
    const res = await request(app).get('/events?email=test@example.com');
    expect(res.statusCode).toBe(200);
  });

  it('should create an event successfully', async () => {
    Event.prototype.save.mockResolvedValue({ title: 'Test Event' });
    const res = await request(app)
      .post('/event')
      .send({ title: 'Test Event', createdBy: 'user@example.com' });
    expect(res.statusCode).toBe(200);
  });

  it('should handle server error on create', async () => {
    Event.prototype.save.mockRejectedValue(new Error('DB error'));
    const res = await request(app)
      .post('/event')
      .send({ title: 'Test Event', createdBy: 'user@example.com' });
    expect(res.statusCode).toBe(500);
  });
});
