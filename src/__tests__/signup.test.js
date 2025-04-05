
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import Sequelize, {Op} from '@sequelize/core';
import request from 'supertest';
import express from 'express';
import bodyParser from 'body-parser';
import { SignUp } from '../controllers/authController';


//Mock dependencies
jest.mock('../models/User.js');
jest.mock('jsonwebtoken');
jest.mock('@sequelize/core', () => ({
    DataTypes: {
        STRING: 'STRING',
        DATE: 'DATE',
        NOW: 'NOW',
        INTEGER: 'INTEGER',
        
    },
    op: {
        or: Symbol('OR'),
    },
    Sequelize:jest.fn(),
}));

jest.mock('@sequelize/postgres',() =>({
    PostgresDialect: jest.fn(),
}))


const app = express();
app.use(bodyParser.json());
app.post('/api/auth/SignUp',SignUp);

describe('SignUp Endpoint',() => {
    beforeEach(() =>{
        jest.clearAllMocks();
    });


    test('')

    test('Should return 400 if all fields are not provided', async () => {
        const response = request(app)
        .post('/api/auth/SignUp')
        .send({
            username: 'testuser',
            first_name: 'Test',
        });
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            success: false,
            message: "All fields are required"
        });
    });

    test('Should return 400 if user already exists', async () => {

        const existingUser = {
            username : 'existinguser',
            email: 'existing@example.com'
            };

            User.findOne.mockResolvedValue(existingUser);
            const response = await request(app)
            .post('/api/auth/SignUp')
            .send({
                username: 'existinguser',
                first_name: 'Test',
                last_name: 'User',
                email: 'existing@example.com',
                password: 'password123'
            });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('User already exists');
            expect(User.findOne).toHaveBeenCalledWith({
                where: {
                    [Op.or]: [
                        { username: 'existinguser' },
                        { email: 'test@example.com'}
                    ]
                }
            });

            test('Should return 201 and create user if valid data',async () => {
                User.findOne.mockResolvedValue(null);

                //Mock new user
                const mockNewuser = {
                    user_id: 1,
                    username: 'testuser',
                    first_name: 'Test',
                    last_name: 'User',
                    email: 'test@example.com'
                };

                User.create = jest.fn().mockResolvedValue(mockNewuser);
                jwt.sign.mockReturnValue('mock_token');

                const response = await request(app)
                .post('/api/auth/SignUp')
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
                expect(response.body.token).toBe('mock_token');
                expect(response.body.user).toMatchObject({
                    username: 'testuser',
                    first_name: 'Test',
                    last_name: 'User', 
                    email: 'test@example.com',
                    token: 'mock_token'
                });
                expect(jwt.sign).toHaveBeenCalled();
            });

        test('Should return 500 if there is an error', async () => {
            User.findOne.mockRejectedValue(new Error('Database error'));
            const response = await request(app)
            .post('/api/auth/SignUp')
            .send({
                username: 'testuser',
                first_name: 'Test',
                last_name: 'User',
                email: 'test@example.com',
                password: 'password123'  
            });
            expect(response.status).toBe(500);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Internal server error');
        });
    });
});