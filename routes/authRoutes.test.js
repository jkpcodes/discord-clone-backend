// Mock setup must be at the top level, before any imports
vi.mock("../controllers/authController.js", () => ({
  register: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
}));

import request from "supertest";
import app from "../app.js";
import { register, login, logout } from '../controllers/authController.js';

describe("Auth Routes", async () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("/register Route", () => {
    const sut = "/api/auth/register";

    describe("Username Validation", () => {
      it("should return 400 when username is less than 3 characters", async () => {
        const res = await request(app)
          .post(sut).send({
            username: "ab",
            email: 'test@example.com',
            password: "testpassword",
          });

        expect(res.status).toBe(400);
        expect(res.error.text).toContain("Username must be at least 3 characters long");
        expect(register).not.toHaveBeenCalled();
      });

      it("should return 400 when username is more than 30 characters", async () => {
        const res = await request(app)
          .post(sut).send({
            username: "a".repeat(31),
            email: "test@example.com",
            password: "Password123"
          });

        expect(res.status).toBe(400);
        expect(res.error.text).toContain("Username cannot exceed 30 characters");
        expect(register).not.toHaveBeenCalled();
      });

      it("should return 400 when username is missing", async () => {
        const res = await request(app)
          .post(sut).send({
            email: "test@example.com",
            password: "Password123"
          });

        expect(res.status).toBe(400);
        expect(res.error.text).toContain("Username is required");
        expect(register).not.toHaveBeenCalled();
      });
    });

    describe("Email Validation", () => {
      it("should return 400 when email is invalid", async () => {
        const res = await request(app)
          .post(sut).send({
            username: "testuser",
            email: "invalid-email",
            password: "Password123",
          });

        expect(res.status).toBe(400);
        expect(res.error.text).toContain("Invalid email address");
        expect(register).not.toHaveBeenCalled();
      });

      it("should return 400 when email is missing", async () => {
        const res = await request(app)
          .post(sut).send({
            username: "testuser",
            password: "Password123"
          });

        expect(res.status).toBe(400);
        expect(res.error.text).toContain("Email is required");
        expect(register).not.toHaveBeenCalled();
      });
    });

    describe("Password Validation", () => {
      it("should return 400 when password is less than 8 characters", async () => {
        const res = await request(app)
          .post(sut).send({
            username: "testuser",
            email: "test@example.com",
            password: "Pass123"
          });

        expect(res.status).toBe(400);
        expect(res.error.text).toContain("Password must be at least 8 characters long");
        expect(register).not.toHaveBeenCalled();
      });

      it("should return 400 when password is missing", async () => {
        const res = await request(app)
          .post(sut).send({
            username: "testuser",
            email: "test@example.com"
          });

        expect(res.status).toBe(400);
        expect(res.error.text).toContain("Password is required");
        expect(register).not.toHaveBeenCalled();
      });

      it("should return 400 when password is more than 30 characters", async () => {
        const res = await request(app)
          .post(sut).send({
            username: "testuser",
            email: "test@example.com",
            password: "Password123".repeat(3)
          });

        expect(res.status).toBe(400);
        expect(res.error.text).toContain("Password cannot exceed 30 characters");
        expect(register).not.toHaveBeenCalled();
      });
      
      it("should return 400 when password has no uppercase letter", async () => {
        const res = await request(app)
          .post(sut).send({
            username: "testuser",
            email: "test@example.com",
            password: "password123"
          });

        expect(res.status).toBe(400);
        expect(res.error.text).toContain("Password must contain at least one uppercase letter, one lowercase letter, and one number");
        expect(register).not.toHaveBeenCalled();
      });

      it("should return 400 when password has no lowercase letter", async () => {
        const res = await request(app)
          .post(sut).send({
            username: "testuser",
            email: "test@example.com",
            password: "PASSWORD123"
          });

        expect(res.status).toBe(400);
        expect(res.error.text).toContain("Password must contain at least one uppercase letter, one lowercase letter, and one number");
        expect(register).not.toHaveBeenCalled();
      });
      
      it("should return 400 when password has no number", async () => {
        const res = await request(app)
          .post(sut).send({
            username: "testuser",
            email: "test@example.com",
            password: "Password"
          });

        expect(res.status).toBe(400);
        expect(res.error.text).toContain("Password must contain at least one uppercase letter, one lowercase letter, and one number");
        expect(register).not.toHaveBeenCalled();
      });
    });

    describe("Valid Registration Request", () => {
      it("should call register middleware when validation passes", async () => {
        // Setup mock to verify it was called with correct data
        register.mockImplementation((req, res) => {
          res.status(201).json({ message: "User registered successfully" });
        });

        const validUserData = {
          username: "testuser",
          email: "test@example.com",
          password: "Password123"
        };

        const res = await request(app)
          .post(sut)
          .send(validUserData);

        // Verify the response
        expect(res.status).toBe(201);
        expect(res.body.message).toBe("User registered successfully");

        // Verify register middleware was called with the correct request
        const registerCall = register.mock.calls[0];
        expect(registerCall[0].body).toEqual(validUserData);
        expect(registerCall[1]).toBeInstanceOf(Object);
      });
    });
  });

  describe("/login Route", () => {
    const sut = "/api/auth/login";

    describe("Email Validation", () => {
      it("should return 400 when email is invalid", async () => {
        const res = await request(app)
          .post(sut).send({
            email: "invalid-email",
            password: "Password123"
          });

        expect(res.status).toBe(400);
        expect(res.error.text).toContain("Invalid email address");
        expect(login).not.toHaveBeenCalled();
      });

      it("should return 400 when email is missing", async () => {
        const res = await request(app)
          .post(sut).send({
            password: "Password123"
          });

        expect(res.status).toBe(400);
        expect(res.error.text).toContain("Email is required");
        expect(login).not.toHaveBeenCalled();
      });
    });

    describe("Password Validation", () => {
      it("should return 400 when password is missing", async () => {
        const res = await request(app)
          .post(sut).send({
            email: "test@example.com"
          });

        expect(res.status).toBe(400);
        expect(res.error.text).toContain("Password is required");
        expect(login).not.toHaveBeenCalled();
      });

      it("should return 400 when password is more than 30 characters", async () => {
        const res = await request(app)
          .post(sut).send({
            email: "test@example.com",
            password: "Password123".repeat(3)
          });

        expect(res.status).toBe(400);
        expect(res.error.text).toContain("Password cannot exceed 30 characters");
        expect(login).not.toHaveBeenCalled();
      });
    });

    describe("Valid Login Request", () => {
      it("should call login middleware when validation passes", async () => {
        // Setup mock to verify it was called with correct data
        login.mockImplementation((req, res) => {
          res.status(200).json({ message: "User logged in successfully" });
        });

        const validUserData = {
          email: "test@example.com",
          password: "Password123"
        };

        const res = await request(app)
          .post(sut)
          .send(validUserData);

        // Verify the response
        expect(res.status).toBe(200);
        expect(res.body.message).toBe("User logged in successfully");

        // Verify login middleware was called with the correct request
        const loginCall = login.mock.calls[0];
        expect(loginCall[0].body).toEqual(validUserData);
        expect(loginCall[1]).toBeInstanceOf(Object);
      });
    });
  });
});
