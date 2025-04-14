// tests/signup.test.js

import request from 'supertest';
import express from 'express';
import bodyParser, { json } from 'body-parser';
import { SignUp } from '../controllers/authController.js';
import jwt, { JsonWebTokenError } from 'jsonwebtoken';
import { Op } from '@sequelize/core';

// Mock the database modules
jest.mock('../config/db.config.js', () => ({
  sequelize: {
    authenticate: jest.fn().mockResolvedValue(true),
    sync: jest.fn().mockResolvedValue(true)
  },
  connectDB: jest.fn().mockResolvedValue(true)
}));

// Mock the User model
jest.mock('../models/User.js', () => {
  const mockModel = {
    findOne: jest.fn(),
    create: jest.fn()
  };
  return {
    __esModule: true,
    default: mockModel
  };
});

// Mock jwt
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('mocked-token')
}));


// Import the mocked User model
import User from '../models/User.js';

// Create express app for testing
const app = express();
app.use(bodyParser.json());
app.post('/api/auth/signup', SignUp);

describe('SignUp Endpoint', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  test('should return 400 if required fields are missing', async () => {
    const response = await request(app)
      .post('/api/auth/signup')
      .send({
        username: 'testuser',
        // Missing other required fields
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('All fields are required');
  });

  test('should return 400 if user already exists', async () => {
    // Mock User.findOne to return an existing user
    User.findOne.mockResolvedValue({
      username: 'existinguser',
      email: 'existing@example.com'
    });

    const response = await request(app)
      .post('/api/auth/signup')
      .send({
        username: 'existinguser',
        first_name: 'Existing',
        last_name: 'User',
        email: 'existing@example.com',
        password: 'password123'
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('User already exists');
    
    // Verify that findOne was called with the correct parameters
    expect(User.findOne).toHaveBeenCalledWith({
      where: {
        [Op.or]: [
          { username: 'existinguser' },
          { email: 'existing@example.com' }
        ]
      }
    });
  });

  test('should successfully create a new user', async () => {
    // Mock User.findOne to return null (user doesn't exist)
    User.findOne.mockResolvedValue(null);
    
    // Mock the created user
    const mockCreatedUser = {
      user_id: 1,
      username: 'testuser',
      first_name: 'Test',
      last_name: 'User',
      email: 'test@example.com',
      password_hash: 'hashed_password'
    };
    
    // Mock User.create to return the new user
    User.create.mockResolvedValue(mockCreatedUser);
    
    const response = await request(app)
      .post('/api/auth/signup')
      .send({
        username: 'testuser',
        first_name: 'Test',
        last_name: 'User',
        email: 'test@example.com',
        password: 'password123'
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('User created successfully');
    //expect(response.body.token).toBe('mocked-token');
    expect(response.body.user).toEqual(expect.objectContaining({
      user_id: 1,
      username: 'testuser',
      first_name: 'Test',
      last_name: 'User',
      email: 'test@example.com'
    }));
    
    // Verify that create was called with the correct parameters
    expect(User.create).toHaveBeenCalledWith({
      username: 'testuser',
      first_name: 'Test',
      last_name: 'User',
      email: 'test@example.com',
      password_hash: 'password123'
    });
    
    // Verify that jwt.sign was called correctly
    expect(jwt.sign).toHaveBeenCalledWith(
      { id: 1 },
      expect.any(String),
      { expiresIn: expect.any(String) }
    );
  });

  test('should return 500 if server error occurs', async () => {
    // Mock User.findOne to throw an error
    User.findOne.mockRejectedValue(new Error('SignUp error'));

    const response = await request(app)
      .post('/api/auth/signup')
      .send({
        username: 'testuser',
        first_name: 'Test',
        last_name: 'User',
        email: 'test@example.com',
        password: 'password123'
      });

    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Internal Server error');
  });
});