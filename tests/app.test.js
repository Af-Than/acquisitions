import request from 'supertest';

process.env.DATABASE_URL ??= 'postgres://user:pass@localhost:5432/acquisitions_test';

const { default: app } = await import('../src/app.js');

describe('API endpoints', () => {
  test('GET /health should return 200', async () => {
    const response = await request(app)
      .get('/health')
      .set('User-Agent', 'Jest Test Agent');

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      status: 'ok',
      message: 'acquisitions microservice is healthy',
    });
  });

  test('GET / should return the app welcome message', async () => {
    const response = await request(app)
      .get('/')
      .set('User-Agent', 'Jest Test Agent');

    expect(response.status).toBe(200);
    expect(response.text).toContain('hello from the acquisitions microservice');
  });
});