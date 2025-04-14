import PaymentMethod from "../models/PaymentMethod.js";
import {Op} from "@sequelize/core";

export const getAllPaymentMethods = async (requestAnimationFrame,res) => {
    try{
        const paymentMethods = await PaymentMethod.findAll({
            where: {user_id: req.user.user_id},
            order: [["name", "ASC"]],
        });

        res.status(200).json({
            success:true,
            data:paymentMethods
        });
    } catch(error){
        console.error("Get payment methods error:", error);
        res.status(500).json({
            success:false,
            message:"Failed to retrieve payment methods",
            error:error.message
        });
    }
};

export const getPaymentMethodById = async(req,res)=> {
    try{
        const {id} = req.params;
        const paymentMethod = await PaymentMethod.findone({
            where: {
                payment_method_id: id,
                user_id: req.user.user_id
            }
        });
        if(!paymentMethod) {
            return res.status(404).json({
                success:false,
                message:"Payment method not found"
            });
        }
        res.status(200).json({
            success:true,
            data:paymentMethod
        });
    } catch(error) {
        console.error("Get payment method by id error:", error);
        res.status(500).json({
            success:false,
            message:"Failed to retrieve payment method",
            error:error.message
        });
    }
};

//Create new payment method
export const createPaymentmethod = async (req,res) => {
    try {
        const { name, type, bank_name} = req.body;
        if(!name | !type) {
            return res.status(400).json({
                success:false,
                message:"Name and type are required"
            });
        }

        const existingPayment = await PaymentMethod.findOne({
            where: {
                name,
                user_id: req.user.user_id
            }
        });
        if(existingPayment) {
            return res.status(400).json({
                success:false,
                message:"Payment method with this name already exists"
            });
        }

        const paymentMethod = await PaymentMethod.create({
            name,
            type,
            bank_name,
            user_id: req.user.user_id
        });
        res.status(201).json({
            success:true,
            message:"Payment method created successfully",
            data:paymentMethod
        });
    } catch (error) {
        console.error("Create payment method error:", error);
        res.status(500).json({
            success:false,
            message:"Failed to create payment method",
            error:error.message
        });
    }
};

//Update payment method
export const updatePaymentMethod = async (req,res) => {
    try {
        const {id} = req.params;
        const {name, type, bank_name} = req.body;

        const paymentMethod = await PaymentMethod.findOne({
            where: {
                payment_method_id: id,
                user_id: req.user.user_id
            }
        });
        if(!paymentMethod) {
            return res.status(404).json({
                success:false,
                message:"Payment method not found"
            });
        }
        //If name is being changed, check if the new name already exists
        if (name && name !== paymentMethod.name) {
            const existingPayment = await PaymentMethod.findOne({
                where: {
                    name,
                    user_id: req.user.user_id,
                    payment_method_id: {
                        [Op.ne]: id // Exclude the current payment method
                    }
                }
            });
            if (existingPayment) {
                return res.status(400).json({
                    success:false,
                    message:"Payment method with this name already exists"
                });
            }
        }
        //Update payment method fields
        if (name) paymentMethod.name = name;
        if (type) paymentMethod.type = type;
        if (bank_name !== undefined) paymentMethod.bank_name = bank_name;

       

        await paymentMethod.save();

        res.status(200).json({
            success:true,
            message:"Payment method updated successfully",
            data:paymentMethod
        });
    } catch (error) {
        console.error("Update payment method error:", error);
        res.status(500).json({
            success:false,
            message:"Failed to update payment method",
            error:error.message
        });
    }
};

export const deletePaymentMethod = async (req,res) => {
    try {
        const {id} = req.params;
        const paymentMethod = await PaymentMethod.findOne({
            where: {
                payment_method_id: id,
                user_id: req.user.user_id
            }
        });
        if(!paymentMethod) {
            return res.status(404).json({
                success:false,
                message:"Payment method not found"
            });
        }
        await paymentMethod.destroy();
        res.status(200).json({
            success:true,
            message:"Payment method deleted successfully"
        });
    } catch (error) {
        console.error("Delete payment method error:", error);
        res.status(500).json({
            success:false,
            message:"Failed to delete payment method",
            error:error.message
        });
    }
}