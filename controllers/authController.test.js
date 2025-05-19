import { register, login } from './authController.js';
import bcrypt from 'bcryptjs';
import { AUTH_MESSAGES } from '../constants/auth.js';

vi.mock('../models/user.js', () => ({
  User: {
    exists: vi.fn(),
    create: vi.fn(),
    findOne: vi.fn(),
  },
}));

vi.mock('../util/authUtil.js', () => ({
  generateToken: vi.fn(),
}));

import * as user from '../models/user.js';
import * as authUtil from '../util/authUtil.js';

describe('Auth Controller', () => {
  const mockResponse = {
    status: vi.fn(() => mockResponse),
    json: vi.fn(() => mockResponse),
  };

  let hashSpy;
  let compareSpy;
  const bcryptHashPattern = /^\$2[aby]\$\d+\$/;

  beforeEach(() => {
    vi.clearAllMocks();
    hashSpy = vi.spyOn(bcrypt, 'hash');
    compareSpy = vi.spyOn(bcrypt, 'compare');
  });

  describe('Register test', () => {
    let sut = register;
    const sampleReq = {
      body: {
        username: 'testuser',
        email: 'testuser@example.com',
        password: 'Password123',
      },
    };

    describe('Error cases', () => {
      it('should return 400 "User already exists" when user already exists', async () => {
        user.User.exists.mockResolvedValue(true);
        user.User.create.mockResolvedValue();

        await sut(sampleReq, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
          message: AUTH_MESSAGES.USER_EXISTS,
        });
        expect(user.User.exists).toHaveBeenCalledWith({
          email: sampleReq.body.email.trim().toLowerCase(),
        });
        expect(hashSpy).not.toHaveBeenCalled();
        expect(user.User.create).not.toHaveBeenCalled();
      });

      it('should return 500 "Server error occurred" when server error occurs in User.exists', async () => {
        user.User.exists.mockRejectedValue(new Error('Server error'));

        await sut(sampleReq, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({
          message: AUTH_MESSAGES.SERVER_ERROR,
        });
        expect(user.User.exists).toHaveBeenCalledWith({
          email: sampleReq.body.email.trim().toLowerCase(),
        });
        expect(hashSpy).not.toHaveBeenCalled();
        expect(user.User.create).not.toHaveBeenCalled();
      });

      it('should return 500 "Server error occurred" when server error occurs in User.create', async () => {
        user.User.exists.mockResolvedValue(false);
        user.User.create.mockRejectedValue(new Error('Server error'));

        await sut(sampleReq, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({
          message: AUTH_MESSAGES.SERVER_ERROR,
        });
        expect(user.User.exists).toHaveBeenCalledWith({
          email: sampleReq.body.email.trim().toLowerCase(),
        });
        expect(hashSpy).toHaveBeenCalledWith(sampleReq.body.password, 10);
        expect(user.User.create).toHaveBeenCalledWith({
          username: sampleReq.body.username.trim(),
          email: sampleReq.body.email.trim().toLowerCase(),
          password: expect.stringMatching(bcryptHashPattern),
        });
      });
    });

    describe('Success cases', () => {
      it('should return 201 with user details and token when user is created', async () => {
        user.User.exists.mockResolvedValue(false);
        user.User.create.mockResolvedValue({
          _id: '123',
          username: sampleReq.body.username.trim(),
          email: sampleReq.body.email.trim().toLowerCase(),
        });
        authUtil.generateToken.mockReturnValue('JWT_TOKEN');

        await sut(sampleReq, mockResponse);

        expect(authUtil.generateToken).toHaveBeenCalledWith(
          expect.objectContaining({
            _id: '123',
            username: sampleReq.body.username.trim(),
            email: sampleReq.body.email.trim().toLowerCase(),
          })
        );
        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledWith({
          userDetails: {
            email: sampleReq.body.email.trim().toLowerCase(),
            username: sampleReq.body.username.trim(),
            token: 'JWT_TOKEN',
          },
        });
        expect(user.User.exists).toHaveBeenCalledWith({
          email: sampleReq.body.email.trim().toLowerCase(),
        });
        expect(bcrypt.hash).toHaveBeenCalledWith(sampleReq.body.password, 10);
        expect(user.User.create).toHaveBeenCalledWith({
          username: sampleReq.body.username.trim(),
          email: sampleReq.body.email.trim().toLowerCase(),
          password: expect.stringMatching(bcryptHashPattern),
        });
      });
    });
  });

  describe('Login test', () => {
    let sut = login;
    const sampleReq = {
      body: {
        email: 'testuser@example.com',
        password: 'Password123',
      },
    };

    describe('Error cases', () => {
      it('should return 400 "Email or password is incorrect" when user does not exist', async () => {
        user.User.findOne.mockResolvedValue(undefined);

        await sut(sampleReq, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
          message: AUTH_MESSAGES.EMAIL_OR_PASSWORD_INCORRECT,
        });
        expect(compareSpy).not.toHaveBeenCalled();
      });

      it('should return 500 "Server error occurred" when server error occurs in User.findOne', async () => {
        user.User.findOne.mockRejectedValue(new Error('Server error'));

        await sut(sampleReq, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({
          message: AUTH_MESSAGES.SERVER_ERROR,
        });
        expect(compareSpy).not.toHaveBeenCalled();
      });

      it('should return 400 "Email or password is incorrect" when password is incorrect', async () => {
        let incorrectPassword = bcrypt.hashSync('IncorrectPassword', 10);
        user.User.findOne.mockResolvedValue({
          password: incorrectPassword,
        });

        await sut(sampleReq, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
          message: AUTH_MESSAGES.EMAIL_OR_PASSWORD_INCORRECT,
        });
        expect(compareSpy).toHaveBeenCalledWith(
          sampleReq.body.password,
          incorrectPassword
        );
      });
    });

    describe('Success cases', () => {
      it('should return 200 with user details and token when login is successful', async () => {
        let testUsername = 'testuser';
        let correctPassword = bcrypt.hashSync(sampleReq.body.password, 10);
        user.User.findOne.mockResolvedValue({
          _id: '123',
          username: testUsername,
          email: sampleReq.body.email.trim().toLowerCase(),
          password: correctPassword,
        });
        authUtil.generateToken.mockReturnValue('JWT_TOKEN');

        await sut(sampleReq, mockResponse);

        expect(authUtil.generateToken).toHaveBeenCalledWith(
          expect.objectContaining({
            _id: '123',
            username: testUsername,
            email: sampleReq.body.email.trim().toLowerCase(),
          })
        );
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith({
          userDetails: {
            email: sampleReq.body.email.trim().toLowerCase(),
            username: testUsername,
            token: 'JWT_TOKEN',
          },
        });
        expect(compareSpy).toHaveBeenCalledWith(
          sampleReq.body.password,
          correctPassword
        );
      });
    });
  });
});
