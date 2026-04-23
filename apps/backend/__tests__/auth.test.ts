import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { app } from '../src/server';
import { prisma } from '../src/infrastructure/prisma';

describe('Auth API', () => {
  beforeAll(async () => {
    // Clear users before tests
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  const testUser = {
    email: 'test@rodflix.com',
    name: 'Test Target',
    password: 'password123',
  };

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message');
      
      const userInDb = await prisma.user.findUnique({ where: { email: testUser.email } });
      expect(userInDb).not.toBeNull();
      // First user might be Admin, let's just assert existence
      expect(userInDb?.email).toBe(testUser.email);
    });

    it('should prevent duplicate email registration', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty('error', 'User already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should fail with incorrect password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: 'wrongpassword' });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Invalid credentials');
    });

    it('should succeed and return token for valid approved user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: testUser.password });

      // Because this is the very first user created during tests, our logic auto-approves them.
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('email', testUser.email);
    });

    it('should reject unapproved users', async () => {
      const unapprovedUser = {
        email: 'blocked@rodflix.com',
        name: 'Blocked User',
        password: 'password123',
      };
      
      await request(app).post('/api/auth/register').send(unapprovedUser);

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: unapprovedUser.email, password: unapprovedUser.password });

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error', 'User not yet approved by moderator');
    });
  });
});
