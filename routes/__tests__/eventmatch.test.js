import { jest } from '@jest/globals';
import request from 'supertest';

const mockEventMatch = {
  find: jest.fn(),
};

await jest.unstable_mockModule('../../src/model/eventmatch.js', () => ({
  EventMatch: mockEventMatch,
}));

const { EventMatch } = await import('../../src/model/eventmatch.js');
const imported = await import('../eventmatch.js');
const app = imported.default || imported;

describe('Event Match API routes', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should get all event matches', async () => {
    EventMatch.find.mockResolvedValue([{ title: 'Test Event' }]);
    const res = await request(app).get('/events-match');
    expect(res.statusCode).toBe(200);
  });
});
