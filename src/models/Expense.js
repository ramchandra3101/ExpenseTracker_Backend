import {DataTypes} from '@sequelize/core';
import {sequelize} from '../config/db.config.js';


const Expense = sequelize.define('expense', {
    expense_id :{
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    category: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    payment_method_id: {
        type: DataTypes.INTEGER,
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

});


export default Expense;