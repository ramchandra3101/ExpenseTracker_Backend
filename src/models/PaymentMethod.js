import {DataTypes} from '@sequelize/core';
import {sequelize} from '../config/db.config.js';

const PaymentMethod = sequelize.define('payment_method', {
    payment_method_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    type: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    bank_name: {
        type: DataTypes.STRING,
        allowNull: true,
    },  
},
{
    timestamps: true,

});

export default PaymentMethod;