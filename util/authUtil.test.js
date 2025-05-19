vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn(),
    verify: vi.fn(),
  },
}));

import jwt from 'jsonwebtoken';
import { AUTH_MESSAGES } from '../constants/auth.js';
import * as authUtil from './authUtil.js';

describe('Auth Util', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateToken', () => {
    let sut = authUtil.generateToken;

    it('should generate a token', () => {
      jwt.sign.mockReturnValue('JWT_TOKEN');
      const token = sut({
        _id: '123',
        username: 'testuser',
        email: 'test@example.com',
      });

      expect(jwt.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          _id: '123',
          username: 'testuser',
          email: 'test@example.com',
        }),
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      expect(token).toBe('JWT_TOKEN');
    });
  });

  describe('authenticateToken', () => {
    let sut = authUtil.authenticateToken;

    it('should authenticate a token', () => {
      jwt.verify.mockReturnValue({
        _id: '123',
        username: 'testuser',
        email: 'test@example.com',
      });
      const req = { headers: { authorization: 'Bearer JWT_TOKEN' } };
      const res = { status: vi.fn(() => res), json: vi.fn() };
      const next = vi.fn();

      sut(req, res, next);

      expect(jwt.verify).toHaveBeenCalledWith(
        'JWT_TOKEN',
        process.env.JWT_SECRET
      );
      expect(req.user).toEqual({
        _id: '123',
        username: 'testuser',
        email: 'test@example.com',
      });
      expect(next).toHaveBeenCalled();
    });

    it('should return 401 Unauthorized if the token is not provided', () => {
      const req = { headers: {} };
      const res = { status: vi.fn(() => res), json: vi.fn() };
      const next = vi.fn();

      sut(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
      expect(next).not.toHaveBeenCalled();
      expect(jwt.verify).not.toHaveBeenCalled();
    });

    it('should return 401 Unauthorized if the token is invalid', () => {
      const req = { headers: { authorization: 'INVALID_TOKEN' } };
      const res = { status: vi.fn(() => res), json: vi.fn() };
      const next = vi.fn();

      sut(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
      expect(next).not.toHaveBeenCalled();
      expect(jwt.verify).not.toHaveBeenCalled();
    });

    it("should return 401 'Invalid or expired token' if the token is expired", () => {
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });
      const req = { headers: { authorization: 'Bearer JWT_TOKEN' } };
      const res = { status: vi.fn(() => res), json: vi.fn() };
      const next = vi.fn();

      sut(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: AUTH_MESSAGES.INVALID_TOKEN,
      });
      expect(next).not.toHaveBeenCalled();
      expect(jwt.verify).toHaveBeenCalledWith(
        'JWT_TOKEN',
        process.env.JWT_SECRET
      );
    });
  });
});
