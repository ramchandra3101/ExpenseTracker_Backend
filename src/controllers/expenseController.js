import Expense from '../models/Expense.js';
import Category from '../models/Category.js';
import PaymentMethod from '../models/PaymentMethod.js';
import {Op} from "@sequelize/core";


// At the top of your controller file, after importing the models
Expense.belongsTo(Category, {
    foreignKey: 'category',
    as: 'expense_category',
    targetKey: 'category_id',
});
Expense.belongsTo(PaymentMethod, {
    foreignKey: 'payment_method_id',
    as: 'payment_method',
    targetKey: 'payment_method_id',
});



export const getAllExpenses= async(req,res) =>{
    try{
        const {
            start_date,
            end_date,
            category_id,
            min_amount,
            max_amount,
            is_recurring,
        } = req.query;

        const whereClause = {user_id:req.user_id}
        if(start_date && end_date){
            whereClause.expense_date = {
                [Op.between]:[new Date(start_date), new Date(end_date)]
            };   
        } else if (start_date) {
            whereClause.expense_date = {
                [Op.gte]: new Date(start_date) //greater than
            };   
        }else if (end_date) {
            whereClause.expense_date = {
                [Op.lte]:new Date(end_date) //lesser than
            };
        }

        if (category_id) {
            whereClause.Category = category_id
        }

        if(min_amount || max_amount) {
            whereClause.amount = {};
            if (min_amount) whereClause.amount[Op.gte] = parseFloat(min_amount);
            if (max_amount) whereClause.amount[Op.lte] = parseFloat(max_amount);
        }

        if(is_recurring != undefined){
            whereClause.is_recurring = is_recurring == 'true';
        }

        const expenses = await Expense.findAll({
            where: whereClause,
            include:[
                {
                    model: Category,
                    as: 'expense_category',
                    attributes:['name', 'icon','color','is_income']  
                },
                {
                    model: PaymentMethod,
                    as: 'payment_method',
                    attributes: ['name', 'type','bank_name']
                }
            ],
            order : [["expense_date", 'DESC']],
        });

        const totalAmount = expenses.reduce((sum, expense)=> sum+ expense.amount,0);
        res.status(200).json({
            success:true,
            count:expenses.length,
            total_amount:totalAmount,
            data:expenses
        });
    }catch(error){
        console.error("Get expenses error:", error);
        res.status(500).json({
            success: false,
            message:"Failed to retrieve expenses",
            error: error.message
        })
    }
}



export const createExpense= async(req,res)=>{
    try{
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
    

        if (!category || !payment_method_id || !amount || !expense_date) {
            return res.status(400).json({
                success: false,
                message: "Category, payment method, amount, and date are required"
            })
        }
        //To check if category exists and belongs to user
        const categoryExists = await Category.findOne({
            where: {
                category_id: category,
                user_id: req.user.user_id
            }
        });

        if(!categoryExists) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            })
        }

        //To check if payment method exists for user
        const paymentMethodExists = await PaymentMethod.findOne({
            where:{
                payment_method_id,
                user_id: req.user.user_id
            }
        });

        if(!paymentMethodExists){
            return res.status(404).json({
                success: false,
                message: "Payment method not found"
            })
        }

        const expense = await Expense.create({
            user_id: req.user.user_id,
            category,
            payment_method_id,
            amount: parseFloat(amount),
            description,
            expense_date: new Date(expense_date),
            is_recurring: is_recurring || false,
            receipt,
            notes
        });

        


        //Fetch the expense with category and payment method details

        

  

        res.status(201).json({
            sucess: true,
            message: "Expense created successfully",
            data: expense
        });
    }catch(error){
        console.error("Expense cretaed Suucessfully",error);
        res.status(500).json({
            sucess: false,
            message: "Failed to create expense",
            error: error.message
        });  
    }
};


export const updateExpense = async (req,res) => {
    try {
        const {id} = req.params;
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
                user_id: req.user.user_id
            }
        });

        if (!expense) {
            return res.status(404).json({
                success: false,
                message: "Expense not found"
            })
        }

        if (category && category !== expense.category){
            const categoryExists = await Category.findOne({
                where: {
                    category_id: category,
                    user_id: req.user.user_id
                }
            });

            if(!categoryExists) {
                return res.status(404).json({
                    sucess: false,
                    message: "Category not found"
                })
            }
        }

        if (payment_method_id && payment_method_id != expense.payement_method_id) {
            const paymentMethodExists = await PaymentMethod.findOne({
                where: {
                    payment_method_id,
                    user_id: req.user.user_id
                }
            });

            if (!paymentMethodExists) {
                return res.status(404).json({
                    sucess: false,
                    message: "Paymentmethod not found"
                })
            }
        }

        if (category) expense.category = category;
        if (payment_method_id) expense.payment_method_id=payment_method_id;
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

        const expense = await Expense.findOne({
            where: {
                expense_id: id,
                user_id: req.user.user_id
            }
        });

        if (!expense) {
            return res.status(404).json({
                success: false,
                message: "Expense not found"
            })
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
}


