import Expense from '../models/Expense.js';
import Category from '../models/Category.js';
import PaymentMethod from '../models/PaymentMethod.js';

import {Op} from "@sequelize/core";

// Association setup

export const getAllExpenses = async(req, res) => {
    
    try {
        const user_id = req.user.user_id; // Make sure to use req.user.user_id
        
        const {
            start_date,
            end_date,
            category_id,
            min_amount,
            max_amount,
            is_recurring,
        } = req.query;

        

        const whereClause = {user_id: user_id};
        if(!start_date && !end_date) {
            const now = new Date();
            const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            
            whereClause.expense_date = {
                [Op.between]: [firstDayOfMonth, lastDayOfMonth]
            };
        }
        
        else if(start_date && end_date) {
            whereClause.expense_date = {
                [Op.between]: [new Date(start_date), new Date(end_date)]
            };   
        } else if (start_date) {
            whereClause.expense_date = {
                [Op.gte]: new Date(start_date) //greater than
            };   
        } else if (end_date) {
            whereClause.expense_date = {
                [Op.lte]: new Date(end_date) //lesser than
            };
        }

        if (category_id) {
            // If category_id is provided and it starts with the user's ID, use it directly
            if (category_id.startsWith(`${user_id}_cat_`)) {
                whereClause.category_id = category_id;
            }
        }

        if(min_amount || max_amount) {
            whereClause.amount = {};
            if (min_amount) whereClause.amount[Op.gte] = parseFloat(min_amount);
            if (max_amount) whereClause.amount[Op.lte] = parseFloat(max_amount);
        }

        if(is_recurring !== undefined) {
            whereClause.is_recurring = is_recurring === 'true';
        }

        const expenses = await Expense.findAll({
            where: whereClause,
            include: [{
                model: Category,
                as: 'expense_category', // This should match your association alias
                attributes: ['name', 'color', 'category_id'] // Specify which category fields you want
            },{
                model: PaymentMethod,
                as: 'Expense_payment_method', // This should match your association alias
                attributes: ['name', 'type', 'payment_method_id'] // Specify which payment method fields you want

            }
        ],
            
            order: [["expense_date", 'DESC']],
            logging: console.log // This will log the SQL query to your console
        });


        const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
        
        res.status(200).json({
            success: true,
            count: expenses.length,
            total_amount: totalAmount,
            data: expenses
        });
    } catch(error) {
        console.error("Get expenses error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to retrieve expenses",
            error: error.message
        });
    }
};

export const createExpense = async(req, res) => {
    console.log("Create expense request:", req.body); // Debugging line
    try {
        const user_id = req.user.user_id;
        console.log(req.body)
        
        const {
            category_id,
            payment_method_id,
            amount,
            description,
            expense_date,
            is_recurring,
            receipt,
            notes
        } = req.body 

        console.log(req.body)
    
        if (!category_id || !payment_method_id || !amount || !expense_date) {
            return res.status(400).json({
                success: false,
                message: "Category, payment method, amount, and date are required"
            });
        }
        console.log("Request body:", category_id, payment_method_id); // Debugging line
        // Verify that category exists and belongs to the user
        const categoryExists = await Category.findOne({
            where: {
                category_id: category_id,
                user_id: user_id
            }
        });
      
        if(!categoryExists) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        // Verify that payment method exists and belongs to the user
        const paymentMethodExists = await PaymentMethod.findOne({
            where: {
                payment_method_id,
                user_id: user_id
            }
        });

        if(!paymentMethodExists) {
            return res.status(404).json({
                success: false,
                message: "Payment method not found"
            });
        }

        // Generate a custom expense ID
        const timestamp = new Date().getTime();
        const expense_id = `${user_id}_exp_${timestamp}`;
        // Debugging line
        // Create the expense with custom ID
        const expense = await Expense.create({
            expense_id,
            user_id: user_id,
            category_id: category_id,
            payment_method_id,
            amount: parseFloat(amount),
            description,
            expense_date: new Date(expense_date),
            is_recurring: is_recurring || false,
            receipt,
            notes
        });

        res.status(201).json({
            success: true,  // Fixed: was "sucess"
            message: "Expense created successfully",
            data: expense
        });
    } catch(error) {
        console.error("Create expense error:", error); // Fixed: was "Expense cretaed Suucessfully"
        res.status(500).json({
            success: false,  // Fixed: was "sucess"
            message: "Failed to create expense",
            error: error.message
        });  
    }
};

export const updateExpense = async (req, res) => {
    try {
        const {id} = req.params;
        const user_id = req.user.user_id;
        
        // Security check for user-prefixed IDs
        if (!id.startsWith(`${user_id}_exp_`)) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized access to this expense"
            });
        }
        
        const {
            category,
            payment_method_id,
            amount,
            description,
            expense_date,
            is_recurring,
            receipt,
            notes
        } = req.body;

        const expense = await Expense.findOne({
            where: {
                expense_id: id,
                user_id: user_id
            }
        });

        if (!expense) {
            return res.status(404).json({
                success: false,
                message: "Expense not found"
            });
        }

        // If changing category, verify it exists and belongs to the user
        if (category && category !== expense.category) {
            const categoryExists = await Category.findOne({
                where: {
                    category_id: category,
                    user_id: user_id
                }
            });

            if(!categoryExists) {
                return res.status(404).json({
                    success: false, // Fixed: was "sucess"
                    message: "Category not found"
                });
            }
        }

        // If changing payment method, verify it exists and belongs to the user
        if (payment_method_id && payment_method_id !== expense.payment_method_id) { // Fixed: was "payement_method_id"
            const paymentMethodExists = await PaymentMethod.findOne({
                where: {
                    payment_method_id,
                    user_id: user_id
                }
            });

            if (!paymentMethodExists) {
                return res.status(404).json({
                    success: false, // Fixed: was "sucess"
                    message: "Payment method not found" // Fixed: was "Paymentmethod"
                });
            }
        }

        // Update expense fields
        if (category) expense.category = category;
        if (payment_method_id) expense.payment_method_id = payment_method_id;
        if (amount) expense.amount = parseFloat(amount);
        if (description !== undefined) expense.description = description;
        if (expense_date) expense.expense_date = new Date(expense_date);
        if (is_recurring !== undefined) expense.is_recurring = is_recurring;
        if (receipt !== undefined) expense.receipt = receipt;
        if (notes !== undefined) expense.notes = notes;

        expense.updated_at = new Date();

        await expense.save();

        res.status(200).json({
            success: true,
            message: "Expense updated successfully",
            data: expense
        });
    } catch (error) {
        console.error("Update expense error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update expense",
            error: error.message
        });
    }
};

export const deleteExpense = async (req, res) => {
    try {
        const {id} = req.params;
        const user_id = req.user.user_id;
        
        // Security check for user-prefixed IDs
        if (!id.startsWith(`${user_id}_exp_`)) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized access to this expense"
            });
        }

        const expense = await Expense.findOne({
            where: {
                expense_id: id,
                user_id: user_id
            }
        });

        if (!expense) {
            return res.status(404).json({
                success: false,
                message: "Expense not found"
            });
        }

        await expense.destroy();

        res.status(200).json({
            success: true,
            message: "Expense deleted successfully"
        });
    } catch (error) {
        console.error("Delete expense error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete expense",
            error: error.message
        });
    }
};