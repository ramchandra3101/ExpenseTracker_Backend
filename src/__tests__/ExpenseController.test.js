import { getAllExpenses, createExpense, updateExpense, deleteExpense } from "../controllers/expenseController";
import Expense from "../models/Expense.js";
import Category from "../models/Category.js";
import PaymentMethod from "../models/PaymentMethod.js";

import {mockRequest, mockResponse} from "jest-mock-req-res";
import { describe } from "node:test";


jest.mock("../models/Expense.js");
jest.mock("../models/Category.js");
jest.mock("../models/PaymentMethod.js");

describe('Expense Controller', () => {
    let req,res;
    beforeEach(() => {
        req = mockRequest();
        res = mockResponse();
        jest.clearAllMocks();
        req.user = {user_id: 1};
    });

    describe('getAllExpenses', () => {
        it('should get All expenses', async () => {
            const mockExpenses = [
                {
                    expense_id: 1,
                    amount: 100,
                    description: 'Test Expense',
                    expense_date: new Date('2023-10-01'),
                    is_recurring: false,
                    user_id: 1,
                    category_id: 1,
                    payment_method_id: 1,
                },
                {
                    expense_id: 2,
                    amount: 200,
                    description: 'Test Expense 2',
                    expense_date: new Date('2023-10-02'),
                    is_recurring: true,
                    user_id: 1,
                    category_id: 2,
                    payment_method_id: 2,
                }
            ];

            Expense.findAll.mockResolvedValue(mockExpenses);
            await getAllExpenses(req, res);

            expect(Expense.findAll).toHaveBeenCalledWith({
                where: { user_id: 1 },
                include: [
                    {
                        model: Category,
                        as: 'expense_category',
                        attributes: ['name', 'icon', 'color', 'is_income']
                    },
                    {
                        model: PaymentMethod,
                        as: 'payment_method',
                        attributes: ['name', 'type', 'bank_name']
                    }
                ],
                order: [["expense_date", "DESC"]]
            });

            console.log(res.json)

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                count: 2,
                total_amount: 300,
                data: mockExpenses
            });

        })
    })

    describe('createExpense', ()=> {
        it('should create new expense successfully', async()=>{
            req.body ={
                category: 1,
                payment_method_id: 1,
                amount: 99.99,
                description: 'Test expense',
                expense_date: '2023-04-01',
                is_recurring: false
            };

            Category.findOne.mockResolvedValue({category_id:1});
            PaymentMethod.findOne.mockResolvedValue({payment_method_id:1});

            const createdExpense = {expense_id:1};
            Expense.create.mockResolvedValue(createdExpense);

            const fullExpense = {
                expense_id: 1,
                amount: 99.99,
                expense_category:{name:'Food'},
                payment_method_id:{name: 'Credit Card'}
            };
            Expense.findByPk.mockResolvedValue(fullExpense);
            await createExpense(req,res);

            expect(Category.findOne).toHaveBeenCalledWith({
                where:{
                    category_id:1,
                    user_id:1
                }
            });

            expect(PaymentMethod.findOne).toHaveBeenCalledWith({
                where: {
                    payment_method_id: 1,
                    user_id: 1
                }
            });

            expect(Expense.create).toHaveBeenCalledWith({
                user_id:1,
                category:1,
                payment_method_id:1,
                amount: 99.99,
                description: 'Test expense',
                expense_date: expect.any(Date),
                is_recurring: false,
                receipt: undefined,
                notes: undefined
            })

            expect(Expense.findByPk).toHaveBeenCalledWith(1, expect.any(Object));

            expect(res.status). toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                sucess: true,
                message: "Expense created successfully",
                data: fullExpense
            });
        })
        it('should return 400 if required fields are missing', async()=> {
            req.body={
                description: 'Test expense'
            };

            await createExpense(req,res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Category, payment method, amount, and date are required'
            });
            expect(Expense.create).not.toHaveBeenCalled();
        });

        it('should return 404 if category not found',async()=>{
            req.body={
                category: 999,
                payment_method_id: 1,
                amount: 99.99,
                expense_date: '2023-04-01'
            };

            Category.findOne.mockResolvedValue(null);

            await createExpense(req,res)
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                success:false,
                message: 'Category not found'
            });
            expect(Expense.create).not.toHaveBeenCalled();
        });

        it('should return 404 if payment method not found', async()=> {
            req.body = {
                category: 1,
                payment_method_id: 999,
                amount: 99.99,
                expense_date: '2023-04-01'

            };

            Category.findOne.mockResolvedValue({category_id:1});
            PaymentMethod.findOne.mockResolvedValue(null);

            await createExpense(req,res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                success:false,
                message: 'Payment method not found'
            });
            expect(Expense.create).not.toHaveBeenCalled()
        });
    })

    describe('updateExpense', () => {
        it('should update an expense successfully', async () => {
          // Setup params and body
          req.params = { id: 1 };
          req.body = {
            category: 2,
            amount: 149.99,
            description: 'Updated description'
        };
        const mockExpense = {
            expense_id: 1,
            category: 1,
            amount: 99.99,
            description: 'Old description',
            save: jest.fn().mockResolvedValue(true)
          };
        Expense.findOne.mockResolvedValue(mockExpense);
        Category.findOne.mockResolvedValue({ category_id: 2 });
        const updatedExpense = {
            expense_id: 1,
            category: 2,
            amount: 149.99,
            description: 'Updated description',
            expense_category: { name: 'Food' },
            payment_method: { name: 'Credit Card' }
        };
        Expense.findByPk.mockResolvedValue(updatedExpense);
        await updateExpense(req, res);
        expect(Expense.findOne).toHaveBeenCalledWith({
            where: {
              expense_id: 1,
              user_id: 1
            }
        });
          
        expect(Category.findOne).toHaveBeenCalledWith({
            where: {
              category_id: 2,
              user_id: 1
            }
        });
        expect(mockExpense.category).toBe(2);
        expect(mockExpense.amount).toBe(149.99);
        expect(mockExpense.description).toBe('Updated description');
        expect(mockExpense.save).toHaveBeenCalled();
        
        expect(Expense.findByPk).toHaveBeenCalledWith(1, expect.any(Object));
        
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Expense updated successfully',
                data: updatedExpense
            });
        });
        it('should return 404 if expense not found', async () => {
            // Setup params
            req.params = { id: 999 };
            req.body = { amount: 149.99 };
            
            // Mock expense not found
            Expense.findOne.mockResolvedValue(null);
            
            // Execute
            await updateExpense(req, res);
            
            // Assert
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
              success: false,
              message: 'Expense not found'
            });
        });
        it('should return 404 if new category not found', async () => {
            // Setup params and body
            req.params = { id: 1 };
            req.body = {
              category: 999
            };
            
            // Mock finding the expense
            const mockExpense = {
              expense_id: 1,
              category: 1,
              save: jest.fn()
            };
            Expense.findOne.mockResolvedValue(mockExpense);
            
            // Mock category not found
            Category.findOne.mockResolvedValue(null);
            
            // Execute
            await updateExpense(req, res);
            
            // Assert
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
              sucess: false,
              message: 'Category not found'
            });
            expect(mockExpense.save).not.toHaveBeenCalled();
        });
        it('should return 404 if new payment method not found', async () => {
            // Setup params and body
            req.params = { id: 1 };
            req.body = {
              payment_method_id: 999
            };
            
            // Mock finding the expense
            const mockExpense = {
              expense_id: 1,
              payment_method_id: 1,
              save: jest.fn()
            };
            Expense.findOne.mockResolvedValue(mockExpense);
            
            // Mock payment method not found
            PaymentMethod.findOne.mockResolvedValue(null);
            
            // Execute
            await updateExpense(req, res);
            
            // Assert
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
              sucess: false,
              message: 'Paymentmethod not found'
            });
            expect(mockExpense.save).not.toHaveBeenCalled();
        });
        it('should handle errors properly retur 500', async () => {
            // Setup params
            req.params = { id: 1 };
            req.body = { amount: 149.99 };
            
            // Mock finding the expense but error during update
            const mockExpense = {
              expense_id: 1,
              save: jest.fn().mockRejectedValue(new Error('Database error'))
            };
            Expense.findOne.mockResolvedValue(mockExpense);
            
            // Execute
            await updateExpense(req, res);
            
            // Assert
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
              success: false,
              message: 'Failed to update expense',
              error: 'Database error'
            });
        });

    describe('deleteExpense', () => {
        it('should delete an expense successfully', async () => {
              // Setup params
              req.params = { id: 1 };
              
              // Mock finding the expense
              const mockExpense = {
                expense_id: 1,
                destroy: jest.fn().mockResolvedValue(true)
              };
              Expense.findOne.mockResolvedValue(mockExpense);
              
              // Execute
              await deleteExpense(req, res);
              
              // Assert
              expect(Expense.findOne).toHaveBeenCalledWith({
                where: {
                  expense_id: 1,
                  user_id: 1
                }
              });
              
              expect(mockExpense.destroy).toHaveBeenCalled();
              
              expect(res.status).toHaveBeenCalledWith(200);
              expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Expense deleted successfully'
              });
            });
            
            it('should return 404 if expense not found', async () => {
              // Setup params
              req.params = { id: 999 };
              
              // Mock expense not found
              Expense.findOne.mockResolvedValue(null);
              
              // Execute
              await deleteExpense(req, res);
              
              // Assert
              expect(res.status).toHaveBeenCalledWith(404);
              expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Expense not found'
              });
            });
            
            it('should handle errors properly', async () => {
              // Setup params
              req.params = { id: 1 };
              
              // Mock finding the expense but error during deletion
              const mockExpense = {
                expense_id: 1,
                destroy: jest.fn().mockRejectedValue(new Error('Database error'))
              };
              Expense.findOne.mockResolvedValue(mockExpense);
              
              // Execute
              await deleteExpense(req, res);
              
              // Assert
              expect(res.status).toHaveBeenCalledWith(500);
              expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Failed to delete expense',
                error: 'Database error'
                });
            });
        })
    })   
})

           

