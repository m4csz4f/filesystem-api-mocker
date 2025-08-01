import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { configureMockRoutes } from '../src/mocker.js';
import { TEST_MOCKS_PATH } from './setup.js';

describe('Mocker Routes', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/', configureMockRoutes(TEST_MOCKS_PATH));
  });

  describe('JSON file responses', () => {
    it('should serve JSON files for GET requests', async () => {
      const response = await request(app).get('/users').expect(200);

      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body.users).toBeDefined();
      expect(Array.isArray(response.body.users)).toBe(true);
    });

    it('should serve product JSON data', async () => {
      const response = await request(app).get('/products').expect(200);

      expect(response.body.products).toBeDefined();
      expect(Array.isArray(response.body.products)).toBe(true);
      expect(response.body.products.length).toBeGreaterThan(0);
    });
  });

  describe('JavaScript handler responses', () => {
    it('should execute JS handlers for POST requests', async () => {
      const testData = { name: 'John Doe', email: 'john@example.com' };

      const response = await request(app)
        .post('/users')
        .send(testData)
        .expect(201);

      expect(response.body.message).toBe('User created successfully');
      expect(response.body.user).toBeDefined();
      expect(response.body.user.name).toBe(testData.name);
      expect(response.body.user.email).toBe(testData.email);
    });

    it('should handle parameterized routes with JS handlers', async () => {
      const response = await request(app).get('/users/123').expect(200);

      expect(response.body.id).toBe('123');
      expect(response.body.name).toContain('Test User 123');
      expect(response.body.email).toContain('user123@example.com');
    });
  });

  describe('Wildcard handlers', () => {
    it('should use ANY.js for direct wild route', async () => {
      const response = await request(app).put('/wild').expect(200);

      expect(response.body.message).toContain('Updated resource');
      expect(response.body.method).toBe('PUT');
    });

    it('should use parameterized __static__ directory for sub-paths', async () => {
      const response = await request(app).get('/wild/some-path').expect(200);

      expect(response.body.message).toBe('Static JSON response');
      expect(response.body.type).toBe('wildcard_static');
    });

    it('should return 404 for deep paths beyond parameter directories', async () => {
      // /wild/something should work (uses __static__ parameter)
      // but /wild/something/else should be 404 (no further nesting)
      const response = await request(app)
        .get('/wild/something/else')
        .expect(404);

      expect(response.body.error).toBe('Not Found');
    });
  });

  describe('Error handling', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/non-existent-route')
        .expect(404);

      expect(response.body.error).toBe('Not Found');
    });

    it('should handle missing directories gracefully', async () => {
      const response = await request(app).get('/missing/deep/path').expect(404);

      expect(response.body.error).toBe('Not Found');
    });
  });
});
