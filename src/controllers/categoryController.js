import Category from '../models/Category.js';
import {Op} from "@sequelize/core"


//Create new category
export const createCategory = async (req, res) => {
    try{
        const user_id = req.user_id;
        const {name, icon, color, is_default,is_income} = req.body;

        if(!name) {
            return res.status(400).json({
                success: false,
                message: "Category name is required"
            });
        }
        //Check if Category
        const existingCategory = await Category.findOne({
            where: {
                name,
                user_id : user_id
            }
        });
        if(existingCategory) {
            return res.status(400).json({
                success: false,
                message: "A category with this name already exists"
            });
        }

        //Creating category
        const category = await Category.create({
            user_id : user_id,
            name,
            icon:icon || null,
            color:color || null,
            is_default:is_default || false,
            is_income:is_income || false

        });

        res.status(201).json({
            success: true,
            message: "Category created successfully",
            category
        });
    } catch(error) {
        console.error("Create category error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

export const getUserCategories = async (req,res) => {
    try{
        const user_id = req.user_id;
        const {is_income} = req.query;
        const where = {user_id: user_id};
        if (is_income !== undefined) {
            where.is_income = is_income === 'true';
        }
        const categories = await Category.findAll({
            where,
            order: [['name','ASC']]
        });

        res.status(200).json({
            success: true,
            count: categories.length,
            categories
        });
    }catch(error) {
        console.error("Get categories error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

//Update Categopry

export const updateCategory = async(req,res) => {
    try {
        const {id} = req.params;
        const { name, icon, color, is_default, is_income } = req.body;

        const category = await Category.findOne({
            where: {
                category_id: id,
                user_id: req.user_id
            }
        });
        if(!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        // if name is being changed, check if it would create a duplicate

        if (name && name  !== category.name) {
            const existingCategory = await Category.findOne({
                where: {
                    name,
                    user_id: req.user_id,
                    category_id: {
                        [Op.ne]: id // Exclude the current category
                    }
                }
            });
            if (existingCategory) {
                return res.status(400).json({
                    success: false,
                    message: "A category with this name already exists"
                });
            }
        }

        //Update category fields
        if (name) category.name = name;
        if (icon !== undefined) category.icon = icon;
        if (color !== undefined) category.color = color;
        if (is_default !== undefined) category.is_default = is_default;
        if (is_income !== undefined) category.is_income = is_income;
        await category.save();
        res.status(200).json({
            success: true,
            message: "Category updated successfully",
            category
        });
    }catch(error) {
        console.error("Update category error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update category",
            error: error.message
        });
    }
};

// Delete a category
export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await Category.findOne({
            where: {
                category_id: id,
                user_id: req.user_id
            }
        });

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        await category.destroy();

        res.status(200).json({
            success: true,
            message: "Category deleted successfully"
        });
    } catch (error) {
        console.error("Delete category error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete category",
            error: error.message
        });
    }
}