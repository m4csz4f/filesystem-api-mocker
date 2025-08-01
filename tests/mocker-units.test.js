import { describe, it, expect, vi } from 'vitest';
import path from 'path';
import { findMatchingDir, useDynamicHandler } from '../src/mocker.js';
import { TEST_MOCKS_PATH } from './setup.js';

describe('Mocker Utility Functions', () => {
  describe('findMatchingDir', () => {
    it('should find exact directory matches', () => {
      const result = findMatchingDir(TEST_MOCKS_PATH, 'users');

      expect(result).toBeTruthy();
      expect(result.path).toBe(path.join(TEST_MOCKS_PATH, 'users'));
      expect(result.paramName).toBeNull();
      expect(result.paramValue).toBeNull();
    });

    it('should find parameterized directory matches', () => {
      const usersPath = path.join(TEST_MOCKS_PATH, 'users');
      const result = findMatchingDir(usersPath, '123');

      expect(result).toBeTruthy();
      expect(result.path).toBe(path.join(usersPath, '__id__'));
      expect(result.paramName).toBe('id');
      expect(result.paramValue).toBe('123');
    });

    it('should return null for non-existent directories', () => {
      const result = findMatchingDir('./non-existent-path', 'anything');

      expect(result).toBeNull();
    });

    it('should return null when no matching directories exist', () => {
      const result = findMatchingDir(TEST_MOCKS_PATH, 'non-existent-dir');

      expect(result).toBeNull();
    });
  });

  describe('useDynamicHandler', () => {
    it('should create a handler function', () => {
      const handlerPath = path.join(TEST_MOCKS_PATH, 'users', 'POST.js');
      const handler = useDynamicHandler(handlerPath);

      expect(typeof handler).toBe('function');
    });

    it('should handle missing files gracefully', async () => {
      const handler = useDynamicHandler('./non-existent-file.js');
      const mockReq = {};
      const mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      await handler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Handler execution error',
      });
    });
  });
});
