import { User } from './user.js';

describe('User Model', () => {
  describe('Error User Schema validation', () => {
    describe('Username Error validation', () => {
      it('should return error when username is not provided', async () => {
        const user = new User({
          username: '',
          email: 'test@example.com',
          password: 'Password123',
        });

        try {
          await user.validate();
        } catch (error) {
          expect(error.errors.username).toBeDefined();
        }
      });

      it('should return error when username less than 3 characters', async () => {
        const user = new User({
          username: 'ab',
          email: 'test@example.com',
          password: 'Password123',
        });

        try {
          await user.validate();
        } catch (error) {
          expect(error.errors.username).toBeDefined();
        }
      });

      it('should return error when username more than 30 characters', async () => {
        const user = new User({
          username: 'a'.repeat(31),
          email: 'test@example.com',
          password: 'Password123',
        });

        try {
          await user.validate();
        } catch (error) {
          expect(error.errors.username).toBeDefined();
        }
      });
    });

    describe('Email Error validation', () => {
      it('should return error when email is not provided', async () => {
        const user = new User({
          username: 'testuser',
          email: '',
          password: 'Password123',
        });

        try {
          await user.validate();
        } catch (error) {
          expect(error.errors.email).toBeDefined();
        }
      });

      it('should return error when email is not a valid email', async () => {
        const user = new User({
          username: 'testuser',
          email: 'invalid-email',
          password: 'Password123',
        });

        try {
          await user.validate();
        } catch (error) {
          expect(error.errors.email).toBeDefined();
        }
      });
    });

    describe('Password Error validation', () => {
      it('should return error when password is not provided', async () => {
        const user = new User({
          username: 'testuser',
          email: 'test@example.com',
          password: '',
        });

        try {
          await user.validate();
        } catch (error) {
          expect(error.errors.password).toBeDefined();
        }
      });
    });
  });

  describe('Success User Schema validation', () => {
    it('should not return error when username is provided', async () => {
      const user = new User({
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123',
      });

      const result = await user.validate();
      expect(result).toBeUndefined();
    });
  });
});
