import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { configureMockRoutes } from '../src/mocker.js';
import { TEST_MOCKS_PATH } from './setup.js';

describe('Integration Tests', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api', configureMockRoutes(TEST_MOCKS_PATH));
  });

  describe('Full request lifecycle', () => {
    it('should handle complex nested routes with parameters', async () => {
      const response = await request(app).get('/api/users/456').expect(200);

      expect(response.body.id).toBe('456');
      expect(response.body.name).toContain('Test User 456');
    });

    it('should handle multiple HTTP methods on same route', async () => {
      const getResponse = await request(app).get('/api/users').expect(200);
      expect(getResponse.body.users).toBeDefined();

      const postResponse = await request(app)
        .post('/api/users')
        .send({ name: 'Test User', email: 'test@example.com' })
        .expect(201);
      expect(postResponse.body.message).toBe('User created successfully');
    });

    it('should prioritize specific methods over wildcards', async () => {
      const response = await request(app).get('/api/users').expect(200);

      expect(response.body.users).toBeDefined();
      expect(Array.isArray(response.body.users)).toBe(true);
    });
  });
  describe('Error scenarios', () => {
    it('should handle missing handler files', async () => {
      await request(app).get('/api/nonexistent').expect(404);
    });
  });
});
