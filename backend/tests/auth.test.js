/**
 * Basic integration test - auth health
 * Run: npm test
 */
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');

describe('Auth API', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/saas_pm_test');
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('GET /health returns 200', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('POST /api/v1/auth/register with invalid data returns 400', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({ email: 'invalid' });
    expect(res.status).toBe(400);
  });
});
