import receiptScan from '../services/Gemini.js';
import Category from '../models/Category.js';
import PaymentMethod from '../models/PaymentMethod.js';

import {createExpense} from './expenseController.js';

export const scanReceipt = async (req, res) => {

    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: "No file uploaded"
        });
    }

    try {
        const user_id = req.user.user_id;
        const categories = await Category.findAll({
            where: {
                user_id: user_id
            }
        });

        const paymentMethods = await PaymentMethod.findAll({
            where: {
                user_id: user_id
            }
        });

        if (categories.length === 0 || paymentMethods.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Please set up categories and payment methods before scanning receipts"
            });
        }
        //Callimg the receipt scan service to use Gemini to scan receipts
        const extractedData = await receiptScan(
            req.file.path,
            categories,
            paymentMethods
        );

        

        const expenseRequest = {
            user : {user_id},
            body: extractedData,
        };
        

        const expenseResponse = {
            status: function(statusCode){
                this.statusCode = statusCode;
                return this;
            },
            json: function(data){
                this.data = data;
                return this;
            }
        }

      

        await createExpense(expenseRequest, expenseResponse); 
        if (expenseResponse .statusCode === 201 && expenseResponse.data.success){
            return res.status(201).json({
                success: true,
                message: "Receipt scanned and expense created successfully",
                data: {
                    extracted: extractedData,
                    created: expenseResponse.data.data
                }
            });
        } else
            {
            return res.status(expenseResponse.statusCode || 500).json(expenseResponse.data);
        }
    }catch(error){
        console.error('Receipt scanning error:',error);
        return res.status(500).json({
            success: false,
            message: "Error creating expense from scanned receipt",
            error: error.message
        })
    }
}
    
    

