import {DataTypes} from '@sequelize/core';
import {sequelize} from '../config/db.config.js';
import Category from './Category.js';


const Expense = sequelize.define('expense', {
    expense_id :{
        type: DataTypes.STRING,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    category_id: {
        type: DataTypes.STRING,
        allowNull: false,
       
        
    },
    payment_method_id: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    amount: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    description:{
        type: DataTypes.STRING,
        allowNull: true,
    },
    expense_date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    is_recurring: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    receipt: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    notes: {
        type: DataTypes.STRING,
        allowNull: true,
    },


}, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    hooks: {
        beforeValidate: (expense) => {
            if (!expense.expense_id) {
                const timestamp = new Date().getTime();
                expense.expense_id = `${expense.user_id}_exp_${timestamp}`;
            }
        }
    },
  
    

});



Expense.belongsTo(Category, {
    foreignKey: 'category_id',
    as: 'expense_category',
    targetKey: 'category_id',
  });

// Define associations
Category.hasMany(Expense, {
    foreignKey: 'category_id',
    as: 'expenses_category',
    sourceKey: 'category_id',
  });



export default Expense;